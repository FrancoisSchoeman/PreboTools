from uuid import UUID

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from ninja import Router

from lead_gen.models import Client, FormSubmission
from lead_gen.schemas import Error, FormSubmitOutSchema
from lead_gen.utils.csv_export import generate_offline_conversions_csv
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

    email_sent, _ = send_lead_notification(client, submission)

    return {
        "success": True,
        "submission_id": submission.id,
        "submission_uuid": submission.submission_uuid,
        "email_sent": email_sent,
    }


@router.get("/google/{api_key}/offline-conversions.csv")
def offline_conversions_csv(request, api_key: UUID):
    client = get_object_or_404(Client, api_key=api_key, is_active=True)

    if not client.google_offline_enabled:
        return HttpResponse("Not found.", status=404, content_type="text/plain")

    csv_content = generate_offline_conversions_csv(client)

    response = HttpResponse(csv_content, content_type="text/csv")
    response["Content-Disposition"] = (
        f'attachment; filename="offline_conversions_{client.company_name.replace(" ", "_")}.csv"'
    )
    return response
