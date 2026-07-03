from uuid import UUID

from datetime import datetime
from typing import Optional

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router

from lead_gen.models import Client, FormSubmission
from lead_gen.schemas import Error, FormSubmitOutSchema
from lead_gen.utils.activity import log_activity
from lead_gen.utils.csv_export import generate_leads_csv, generate_offline_conversions_csv
from lead_gen.utils.email import send_lead_notification
from lead_gen.utils.field_extraction import extract_submission_fields
from lead_gen.utils.payload import parse_form_payload

router = Router()


def _get_active_client(api_key: UUID) -> Client | None:
    try:
        client = Client.objects.get(api_key=api_key, is_active=True)
        return client
    except Client.DoesNotExist:
        return None


@router.post(
    "/forms/{api_key}",
    response={200: FormSubmitOutSchema, 400: Error, 404: Error},
)
def submit_form(request: HttpRequest, api_key: UUID):
    client = _get_active_client(api_key)
    if not client:
        return 404, {"message": "Not found."}

    payload, error = parse_form_payload(request.body)
    if error:
        return 400, {"message": error}

    extracted = extract_submission_fields(payload)

    if not extracted.get("conversion_currency") and client.currency:
        extracted["conversion_currency"] = client.currency

    submission = FormSubmission.objects.create(
        client=client,
        raw_payload=payload,
        **extracted,
    )

    now = timezone.now()
    client.last_submission_at = now
    client.save(update_fields=["last_submission_at"])

    if client.auto_email_enabled:
        email_sent, _ = send_lead_notification(client, submission)
        email_skipped = False
    else:
        email_sent = False
        email_skipped = True

    log_activity(
        "submission_received",
        f"New form submission received for '{client.company_name}'.",
        client=client,
        metadata={
            "submission_id": submission.id,
            "email_sent": email_sent,
            "email_skipped": email_skipped,
        },
    )

    return {
        "success": True,
        "submission_id": submission.id,
        "submission_uuid": submission.submission_uuid,
        "email_sent": email_sent,
        "email_skipped": email_skipped,
    }


@router.get("/google/{api_key}/offline-conversions.csv")
def offline_conversions_csv(request, api_key: UUID):
    client = get_object_or_404(Client, api_key=api_key, is_active=True)

    if not client.google_offline_enabled:
        return HttpResponse("Not found.", status=404, content_type="text/plain")

    csv_content = generate_offline_conversions_csv(client)

    now = timezone.now()
    client.last_csv_export_at = now
    client.save(update_fields=["last_csv_export_at"])

    log_activity(
        "csv_exported",
        f"Google offline conversions CSV exported for '{client.company_name}'.",
        client=client,
    )

    response = HttpResponse(csv_content, content_type="text/csv")
    response["Content-Disposition"] = (
        f'attachment; filename="offline_conversions_{client.company_name.replace(" ", "_")}.csv"'
    )
    return response


@router.get("/leads/{api_key}/submissions.csv")
def leads_submissions_csv(request, api_key: UUID, since: Optional[datetime] = None):
    client = get_object_or_404(Client, api_key=api_key, is_active=True)

    if not client.leads_csv_enabled:
        return HttpResponse("Not found.", status=404, content_type="text/plain")

    csv_content = generate_leads_csv(client, since=since)

    now = timezone.now()
    client.last_leads_csv_export_at = now
    client.save(update_fields=["last_leads_csv_export_at"])

    log_activity(
        "leads_csv_exported",
        f"Leads CSV exported for '{client.company_name}'.",
        client=client,
        metadata={"since": since.isoformat() if since else None},
    )

    response = HttpResponse(csv_content, content_type="text/csv")
    response["Content-Disposition"] = (
        f'attachment; filename="leads_{client.company_name.replace(" ", "_")}.csv"'
    )
    return response
