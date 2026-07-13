import os
from typing import List, Optional
from uuid import UUID

import requests
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router

from lead_gen.models import ActivityLog, Client, FormSubmission
from lead_gen.schemas import (
    ActivityLogSchema,
    BulkDeleteSubmissionsInSchema,
    BulkDeleteSubmissionsOutSchema,
    ClientDetailSchema,
    ClientHealthSchema,
    ClientInSchema,
    ClientOutSchema,
    ClientStatsSchema,
    ClientUpdateSchema,
    Error,
    FormSubmissionDetailSchema,
    FormSubmissionOutSchema,
    FormSubmissionUpdateSchema,
    HealthCheckItemSchema,
    ResendEmailOutSchema,
    SmtpServerOutSchema,
    SuccessMessage,
)
from lead_gen.utils.activity import log_activity
from lead_gen.utils.email import send_lead_notification
from lead_gen.utils.health import get_client_health, get_client_stats
from lead_gen.utils.smtp import list_smtp_servers, send_test_email, test_smtp_connection

router = Router()


def _base_url() -> str:
    return os.environ.get("BASE_URL", "https://tools.prebodigital.co.za").rstrip("/")


def _client_detail(client: Client) -> ClientDetailSchema:
    base = _base_url()
    return ClientDetailSchema(
        id=client.id,
        api_key=client.api_key,
        company_name=client.company_name,
        website_url=client.website_url,
        contact_email=client.contact_email,
        timezone=client.timezone,
        internal_notes=client.internal_notes,
        is_active=client.is_active,
        auto_email_enabled=client.auto_email_enabled,
        google_offline_enabled=client.google_offline_enabled,
        leads_csv_enabled=client.leads_csv_enabled,
        conversion_name=client.conversion_name,
        conversion_action_id=client.conversion_action_id,
        currency=client.currency,
        default_conversion_value=client.default_conversion_value,
        last_submission_at=client.last_submission_at,
        last_csv_export_at=client.last_csv_export_at,
        last_leads_csv_export_at=client.last_leads_csv_export_at,
        date_created=client.date_created,
        date_modified=client.date_modified,
        form_endpoint=f"{base}/api/forms/{client.api_key}",
        csv_endpoint=f"{base}/api/google/{client.api_key}/offline-conversions.csv",
        leads_csv_endpoint=f"{base}/api/leads/{client.api_key}/submissions.csv",
    )


def _submission_out(submission: FormSubmission) -> FormSubmissionOutSchema:
    return FormSubmissionOutSchema(
        id=submission.id,
        client_id=submission.client_id,
        submission_uuid=submission.submission_uuid,
        gclid=submission.gclid,
        gbraid=submission.gbraid,
        wbraid=submission.wbraid,
        email=submission.email,
        phone=submission.phone,
        first_name=submission.first_name,
        last_name=submission.last_name,
        landing_page=submission.landing_page,
        utm_source=submission.utm_source,
        utm_medium=submission.utm_medium,
        utm_campaign=submission.utm_campaign,
        utm_term=submission.utm_term,
        utm_content=submission.utm_content,
        email_sent=submission.email_sent,
        email_error=submission.email_error,
        imported=submission.imported,
        lead_status=submission.lead_status,
        lead_score=submission.lead_score,
        submitted_at=submission.submitted_at,
    )


def _submission_detail(submission: FormSubmission) -> FormSubmissionDetailSchema:
    base = _submission_out(submission)
    return FormSubmissionDetailSchema(
        **base.model_dump(),
        raw_payload=submission.raw_payload,
        conversion_value=submission.conversion_value,
        conversion_currency=submission.conversion_currency,
        country_code=submission.country_code,
        postal_code=submission.postal_code,
        email_sent_at=submission.email_sent_at,
        notification_email=submission.client.contact_email,
    )


@router.get("/clients", response={200: List[ClientOutSchema]})
def list_clients(request):
    return Client.objects.all()


@router.post("/clients", response={201: ClientDetailSchema})
def create_client(request, payload: ClientInSchema):
    client = Client.objects.create(**payload.model_dump())
    log_activity(
        "client_created",
        f"Client '{client.company_name}' was created.",
        client=client,
    )
    return 201, _client_detail(client)


@router.get("/clients/{client_id}", response={200: ClientDetailSchema, 404: Error})
def get_client(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    return _client_detail(client)


@router.patch("/clients/{client_id}", response={200: ClientDetailSchema, 404: Error})
def update_client(request, client_id: int, payload: ClientUpdateSchema):
    client = get_object_or_404(Client, pk=client_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(client, field, value)
    client.save()
    log_activity(
        "client_updated",
        f"Client '{client.company_name}' was updated.",
        client=client,
    )
    return _client_detail(client)


@router.delete("/clients/{client_id}", response={200: SuccessMessage, 404: Error})
def delete_client(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    name = client.company_name
    client.delete()
    log_activity("client_deleted", f"Client '{name}' was deleted.")
    return {"success": True, "message": f"Client '{name}' deleted."}


@router.post(
    "/clients/{client_id}/regenerate-key",
    response={200: ClientDetailSchema, 404: Error},
)
def regenerate_client_key(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    client.regenerate_api_key()
    log_activity(
        "api_key_regenerated",
        f"API key regenerated for '{client.company_name}'.",
        client=client,
    )
    return _client_detail(client)


@router.get(
    "/clients/{client_id}/stats",
    response={200: ClientStatsSchema, 404: Error},
)
def client_stats(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    return get_client_stats(client)


@router.get(
    "/clients/{client_id}/health",
    response={200: ClientHealthSchema, 404: Error},
)
def client_health(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    checks = [HealthCheckItemSchema(**item) for item in get_client_health(client)]
    return {"checks": checks}


@router.get(
    "/clients/{client_id}/submissions",
    response={200: List[FormSubmissionOutSchema], 404: Error},
)
def list_submissions(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    return [_submission_out(s) for s in client.submissions.all()]


# Static path must be registered before /submissions/{submission_id} or
# "bulk-delete" is captured as submission_id and POST returns 405.
@router.post(
    "/clients/{client_id}/submissions/bulk-delete",
    response={200: BulkDeleteSubmissionsOutSchema, 400: Error, 404: Error},
)
def bulk_delete_submissions(
    request, client_id: int, payload: BulkDeleteSubmissionsInSchema
):
    client = get_object_or_404(Client, pk=client_id)
    ids = list(dict.fromkeys(payload.ids))
    if not ids:
        return 400, {"message": "No submission ids provided."}

    qs = FormSubmission.objects.filter(client_id=client_id, id__in=ids)
    deleted_ids = list(qs.values_list("id", flat=True))
    deleted_count = len(deleted_ids)
    qs.delete()

    log_activity(
        "submissions_bulk_deleted",
        f"Deleted {deleted_count} submission(s) for '{client.company_name}'.",
        client=client,
        metadata={"submission_ids": deleted_ids, "deleted_count": deleted_count},
    )
    return {
        "success": True,
        "message": f"Deleted {deleted_count} submission(s).",
        "deleted_count": deleted_count,
    }


@router.get(
    "/clients/{client_id}/submissions/{submission_id}",
    response={200: FormSubmissionDetailSchema, 404: Error},
)
def get_submission(request, client_id: int, submission_id: int):
    submission = get_object_or_404(
        FormSubmission.objects.select_related("client"),
        pk=submission_id,
        client_id=client_id,
    )
    return _submission_detail(submission)


@router.patch(
    "/clients/{client_id}/submissions/{submission_id}",
    response={200: FormSubmissionDetailSchema, 404: Error},
)
def update_submission(
    request, client_id: int, submission_id: int, payload: FormSubmissionUpdateSchema
):
    submission = get_object_or_404(
        FormSubmission.objects.select_related("client"),
        pk=submission_id,
        client_id=client_id,
    )
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(submission, field, value)
    submission.save()
    log_activity(
        "submission_updated",
        f"Submission #{submission.id} updated for '{submission.client.company_name}'.",
        client=submission.client,
        metadata={"submission_id": submission.id},
    )
    return _submission_detail(submission)


@router.delete(
    "/clients/{client_id}/submissions/{submission_id}",
    response={200: SuccessMessage, 404: Error},
)
def delete_submission(request, client_id: int, submission_id: int):
    submission = get_object_or_404(
        FormSubmission.objects.select_related("client"),
        pk=submission_id,
        client_id=client_id,
    )
    client = submission.client
    submission_pk = submission.id
    company_name = client.company_name
    submission.delete()
    log_activity(
        "submission_deleted",
        f"Submission #{submission_pk} deleted for '{company_name}'.",
        client=client,
        metadata={"submission_id": submission_pk},
    )
    return {"success": True, "message": f"Submission #{submission_pk} deleted."}


@router.post(
    "/clients/{client_id}/submissions/{submission_id}/resend-email",
    response={200: ResendEmailOutSchema, 404: Error},
)
def resend_submission_email(request, client_id: int, submission_id: int):
    submission = get_object_or_404(
        FormSubmission.objects.select_related("client"),
        pk=submission_id,
        client_id=client_id,
    )
    client = submission.client
    email_sent, email_error = send_lead_notification(client, submission)

    if email_sent:
        message = f"Notification email resent to {client.contact_email}."
    else:
        message = f"Failed to resend notification email: {email_error}"

    log_activity(
        "email_resent",
        message,
        client=client,
        metadata={
            "submission_id": submission.id,
            "email_sent": email_sent,
            "email_error": email_error,
        },
    )
    return {
        "success": email_sent,
        "message": message,
        "email_sent": email_sent,
    }


@router.get("/submissions", response={200: List[FormSubmissionOutSchema]})
def list_all_submissions(request, client_id: Optional[int] = None):
    qs = FormSubmission.objects.select_related("client").all()
    if client_id:
        qs = qs.filter(client_id=client_id)
    return [_submission_out(s) for s in qs]


@router.get(
    "/clients/{client_id}/activity",
    response={200: List[ActivityLogSchema], 404: Error},
)
def client_activity(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    logs = ActivityLog.objects.filter(client=client)[:100]
    return [
        ActivityLogSchema(
            id=log.id,
            client_id=log.client_id,
            event_type=log.event_type,
            message=log.message,
            metadata=log.metadata,
            created_at=log.created_at,
        )
        for log in logs
    ]


@router.post(
    "/clients/{client_id}/test-smtp",
    response={200: SuccessMessage, 404: Error},
)
def test_client_smtp(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    ok, message = send_test_email(client.contact_email)
    log_activity(
        "smtp_tested",
        message,
        client=client,
        metadata={"success": ok},
    )
    return {"success": ok, "message": message}


@router.post(
    "/clients/{client_id}/test-endpoint",
    response={200: SuccessMessage, 404: Error},
)
def test_client_endpoint(request, client_id: int):
    client = get_object_or_404(Client, pk=client_id)
    if not client.is_active:
        return {"success": False, "message": "Client is inactive."}

    base = _base_url()
    url = f"{base}/api/forms/{client.api_key}"
    payload = {
        "first_name": "Test",
        "last_name": "Endpoint",
        "email": "test-endpoint@prebotools.local",
        "phone": "0000000000",
        "message": "PreboTools endpoint test",
        "landing_page": f"{base}/lead-gen/clients/{client.id}/api",
    }

    try:
        response = requests.post(url, json=payload, timeout=15)
        if response.status_code != 200:
            ok = False
            message = f"Test failed with status {response.status_code}."
        else:
            data = response.json()
            email_sent = data.get("email_sent", False)
            email_skipped = data.get("email_skipped", False)
            if email_skipped:
                ok = True
                message = "Test lead saved (automatic emails disabled)."
            elif email_sent:
                ok = True
                message = (
                    f"Test lead saved and notification sent to {client.contact_email}."
                )
            else:
                ok = False
                message = "Form accepted but notification email failed."
    except Exception as exc:
        ok = False
        message = str(exc)

    log_activity(
        "endpoint_tested",
        message,
        client=client,
        metadata={"success": ok},
    )
    return {"success": ok, "message": message}


@router.get("/smtp-servers", response={200: List[SmtpServerOutSchema]})
def smtp_servers(request):
    return [SmtpServerOutSchema(**item) for item in list_smtp_servers()]


@router.post("/smtp-servers/test", response={200: SuccessMessage})
def test_smtp_servers(request):
    ok, message = test_smtp_connection()
    log_activity("smtp_tested", message, metadata={"success": ok})
    return {"success": ok, "message": message}
