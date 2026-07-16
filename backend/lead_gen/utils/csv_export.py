import csv
import json
from datetime import datetime
from io import StringIO
from typing import Any
from zoneinfo import ZoneInfo

from django.utils import timezone

from lead_gen.models import Client, FormSubmission
from lead_gen.utils.field_extraction import FIELD_ALIASES, _normalize_key

CSV_COLUMNS = [
    "Google Click ID",
    "GBRAID",
    "WBRAID",
    "Conversion Name",
    "Conversion Time",
    "Conversion Value",
    "Conversion Currency",
    "Order ID",
    "Email (Hashed SHA-256)",
    "Phone (Hashed SHA-256)",
    "First Name (Hashed)",
    "Last Name (Hashed)",
    "Country Code",
    "Postal Code",
    "Lead Status",
    "Imported",
    "Original Form Submission Date",
    "Landing Page",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
    "UTM Term",
    "UTM Content",
]


def _format_conversion_time(submission: FormSubmission, client: Client) -> str:
    try:
        tz = ZoneInfo(client.timezone)
    except Exception:
        tz = ZoneInfo("Africa/Johannesburg")
    local_time = timezone.localtime(submission.submitted_at, timezone=tz)
    return local_time.strftime("%Y-%m-%d %H:%M:%S %z")


def _conversion_value(submission: FormSubmission, client: Client) -> str:
    if submission.conversion_value is not None:
        return str(submission.conversion_value)
    if client.default_conversion_value is not None:
        return str(client.default_conversion_value)
    return ""


def _conversion_currency(submission: FormSubmission, client: Client) -> str:
    return submission.conversion_currency or client.currency or ""


def submission_to_row(submission: FormSubmission, client: Client) -> list[str]:
    return [
        submission.gclid,
        submission.gbraid,
        submission.wbraid,
        client.conversion_name,
        _format_conversion_time(submission, client),
        _conversion_value(submission, client),
        _conversion_currency(submission, client),
        str(submission.submission_uuid),
        submission.email_hashed,
        submission.phone_hashed,
        submission.first_name_hashed,
        submission.last_name_hashed,
        submission.country_code,
        submission.postal_code,
        submission.lead_status,
        "Yes" if submission.imported else "No",
        submission.submitted_at.isoformat(),
        submission.landing_page,
        submission.utm_source,
        submission.utm_medium,
        submission.utm_campaign,
        submission.utm_term,
        submission.utm_content,
    ]


def generate_offline_conversions_csv(client: Client) -> str:
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(CSV_COLUMNS)

    submissions = FormSubmission.objects.filter(client=client).order_by("submitted_at")
    for submission in submissions:
        writer.writerow(submission_to_row(submission, client))

    return buffer.getvalue()


LEADS_CSV_COLUMNS = [
    "Submission ID",
    "Submission UUID",
    "Submitted At",
    "Email",
    "Phone",
    "First Name",
    "Last Name",
    "Lead Score",
    "Lead Status",
    "Email Sent",
    "Imported",
    "GCLID",
    "GBRAID",
    "WBRAID",
    "Landing Page",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
    "UTM Term",
    "UTM Content",
    "Conversion Value",
    "Conversion Currency",
    "Country Code",
    "Postal Code",
]


def _lead_score_display(submission: FormSubmission) -> str:
    if submission.lead_score and submission.lead_score != "not_set":
        return submission.get_lead_score_display()
    return ""


def _known_payload_keys() -> set[str]:
    """Normalized keys already covered by fixed LEADS_CSV_COLUMNS."""
    known: set[str] = set()
    for field, aliases in FIELD_ALIASES.items():
        known.add(_normalize_key(field))
        for alias in aliases:
            known.add(_normalize_key(alias))
    return known


_KNOWN_PAYLOAD_KEYS = _known_payload_keys()


def _serialize_payload_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return json.dumps(value, separators=(",", ":"), ensure_ascii=False)
    if isinstance(value, bool):
        return "true" if value else "false"
    return str(value)


def _collect_extra_payload_keys(submissions: list[FormSubmission]) -> list[str]:
    """
    Union of top-level raw_payload keys not mapped to fixed columns.
    Prefer first-seen casing when keys only differ by case.
    """
    first_seen: dict[str, str] = {}
    for submission in submissions:
        payload = submission.raw_payload or {}
        if not isinstance(payload, dict):
            continue
        for key in payload:
            if not isinstance(key, str) or not key:
                continue
            normalized = _normalize_key(key)
            if normalized in _KNOWN_PAYLOAD_KEYS:
                continue
            if normalized not in first_seen:
                first_seen[normalized] = key
    return [first_seen[k] for k in sorted(first_seen.keys())]


def _payload_lookup(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        _normalize_key(k): v
        for k, v in payload.items()
        if isinstance(k, str)
    }


def leads_submission_to_row(
    submission: FormSubmission,
    client: Client,
    extra_keys: list[str] | None = None,
) -> list[str]:
    row = [
        str(submission.id),
        str(submission.submission_uuid),
        _format_conversion_time(submission, client),
        submission.email,
        submission.phone,
        submission.first_name,
        submission.last_name,
        _lead_score_display(submission),
        submission.lead_status,
        "Yes" if submission.email_sent else "No",
        "Yes" if submission.imported else "No",
        submission.gclid,
        submission.gbraid,
        submission.wbraid,
        submission.landing_page,
        submission.utm_source,
        submission.utm_medium,
        submission.utm_campaign,
        submission.utm_term,
        submission.utm_content,
        _conversion_value(submission, client),
        _conversion_currency(submission, client),
        submission.country_code,
        submission.postal_code,
    ]

    if extra_keys:
        payload = submission.raw_payload if isinstance(submission.raw_payload, dict) else {}
        lookup = _payload_lookup(payload)
        for key in extra_keys:
            value = lookup.get(_normalize_key(key))
            row.append(_serialize_payload_value(value) if value is not None else "")

    return row


def generate_leads_csv(client: Client, since: datetime | None = None) -> str:
    qs = FormSubmission.objects.filter(client=client).order_by("submitted_at")
    if since is not None:
        qs = qs.filter(submitted_at__gte=since)

    submissions = list(qs)
    extra_keys = _collect_extra_payload_keys(submissions)
    headers = list(LEADS_CSV_COLUMNS) + extra_keys

    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(headers)

    for submission in submissions:
        writer.writerow(leads_submission_to_row(submission, client, extra_keys))

    return buffer.getvalue()
