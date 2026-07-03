import smtplib
from datetime import datetime, time
from typing import Any

from django.conf import settings
from django.utils import timezone

from lead_gen.models import Client


def _check_smtp_connection() -> tuple[bool, str]:
    host = settings.EMAIL_HOST
    port = int(settings.EMAIL_PORT or 465)
    user = settings.EMAIL_HOST_USER
    password = settings.EMAIL_HOST_PASSWORD

    if not all([host, user, password]):
        return False, "SMTP is not configured."

    try:
        with smtplib.SMTP_SSL(host, port, timeout=10) as server:
            server.login(user, password)
        return True, "Connected"
    except Exception as exc:
        return False, str(exc)


def get_client_health(client: Client) -> list[dict[str, Any]]:
    smtp_ok, smtp_detail = _check_smtp_connection()

    checks = [
        {
            "key": "smtp_connected",
            "label": "SMTP Connected",
            "ok": smtp_ok,
            "detail": smtp_detail,
        },
        {
            "key": "api_endpoint_active",
            "label": "API Endpoint Active",
            "ok": client.is_active,
            "detail": "Active" if client.is_active else "Client is inactive",
        },
        {
            "key": "auto_email_enabled",
            "label": "Automatic Email Notifications",
            "ok": client.auto_email_enabled,
            "detail": (
                "Enabled"
                if client.auto_email_enabled
                else "Disabled — submissions saved without email"
            ),
        },
        {
            "key": "google_offline_enabled",
            "label": "Google Offline Imports Enabled",
            "ok": client.google_offline_enabled,
            "detail": "Enabled" if client.google_offline_enabled else "Disabled",
        },
        {
            "key": "csv_feed_available",
            "label": "CSV Feed Available",
            "ok": client.google_offline_enabled and bool(client.conversion_name),
            "detail": (
                "Ready"
                if client.google_offline_enabled and client.conversion_name
                else "Requires Google offline + conversion name"
            ),
        },
        {
            "key": "last_form_received",
            "label": "Last Form Received",
            "ok": client.last_submission_at is not None,
            "detail": (
                client.last_submission_at.isoformat()
                if client.last_submission_at
                else "No submissions yet"
            ),
        },
        {
            "key": "last_csv_generated",
            "label": "Last CSV Generated",
            "ok": client.last_csv_export_at is not None,
            "detail": (
                client.last_csv_export_at.isoformat()
                if client.last_csv_export_at
                else "No CSV exports yet"
            ),
        },
        {
            "key": "leads_csv_enabled",
            "label": "Leads CSV Export Enabled",
            "ok": client.leads_csv_enabled,
            "detail": "Enabled" if client.leads_csv_enabled else "Disabled",
        },
        {
            "key": "last_leads_csv_export",
            "label": "Last Leads CSV Export",
            "ok": client.last_leads_csv_export_at is not None,
            "detail": (
                client.last_leads_csv_export_at.isoformat()
                if client.last_leads_csv_export_at
                else "No leads CSV exports yet"
            ),
        },
        {
            "key": "client_active",
            "label": "Client Active",
            "ok": client.is_active,
            "detail": "Active" if client.is_active else "Inactive",
        },
    ]
    return checks


def get_client_stats(client: Client) -> dict[str, Any]:
    now = timezone.localtime()
    start_of_day = timezone.make_aware(datetime.combine(now.date(), time.min))

    submissions = client.submissions.all()
    todays_leads = submissions.filter(submitted_at__gte=start_of_day).count()
    total_leads = submissions.count()

    return {
        "todays_leads": todays_leads,
        "total_leads": total_leads,
        "last_submission_at": client.last_submission_at,
        "last_csv_export_at": client.last_csv_export_at,
        "last_leads_csv_export_at": client.last_leads_csv_export_at,
    }
