from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.core.validators import EmailValidator
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.timezone import localtime

from lead_gen.models import Client, FormSubmission

BLOCKED_REPLY_TO_DOMAINS = {
    "example.com",
    "example.net",
    "example.org",
    "example.test",
    "test",
    "invalid",
    "localhost",
}

BLOCKED_REPLY_TO_SUFFIXES = (".local", ".invalid", ".localhost", ".test")


def _safe_reply_to(email: str) -> list[str] | None:
    email = email.strip()
    if not email:
        return None

    try:
        EmailValidator()(email)
    except ValidationError:
        return None

    domain = email.rsplit("@", 1)[-1].lower()
    if domain in BLOCKED_REPLY_TO_DOMAINS:
        return None
    if any(domain.endswith(suffix) for suffix in BLOCKED_REPLY_TO_SUFFIXES):
        return None

    return [email]

ATTRIBUTION_KEYS = {
    "gclid": "Google Click ID (GCLID)",
    "gbraid": "GBRAID",
    "wbraid": "WBRAID",
    "utm_source": "UTM Source",
    "utm_medium": "UTM Medium",
    "utm_campaign": "UTM Campaign",
    "utm_term": "UTM Term",
    "utm_content": "UTM Content",
}


def _humanize_field_name(key: str) -> str:
    return key.replace("_", " ").strip().title()


def _format_field_value(value) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return str(value)
    return str(value).strip()


def _build_field_groups(submission: FormSubmission) -> tuple[list[tuple[str, str]], list[tuple[str, str]]]:
    attribution = []
    form_fields = []

    for key, value in submission.raw_payload.items():
        formatted_value = _format_field_value(value)
        if not formatted_value:
            continue
        label = ATTRIBUTION_KEYS.get(key, _humanize_field_name(key))
        if key in ATTRIBUTION_KEYS:
            attribution.append((label, formatted_value))
        else:
            form_fields.append((label, formatted_value))

    return form_fields, attribution


def build_lead_email_body(client: Client, submission: FormSubmission) -> str:
    submitted_at = localtime(submission.submitted_at).strftime("%d %B %Y at %H:%M %Z")
    form_fields, attribution_fields = _build_field_groups(submission)

    lines = [
        f"New lead for {client.company_name}",
        f"Received: {submitted_at}",
        "",
    ]

    if submission.landing_page:
        lines.append(f"Landing page: {submission.landing_page}")
        lines.append("")

    if form_fields:
        lines.append("Form details:")
        for label, value in form_fields:
            lines.append(f"  {label}: {value}")
        lines.append("")

    if attribution_fields:
        lines.append("Campaign attribution:")
        for label, value in attribution_fields:
            lines.append(f"  {label}: {value}")

    lines.append("")
    lines.append("—")
    lines.append(f"Sent by PreboTools on behalf of {client.company_name}.")

    return "\n".join(lines)


def build_lead_email_html(client: Client, submission: FormSubmission) -> str:
    form_fields, attribution_fields = _build_field_groups(submission)
    submitted_at = localtime(submission.submitted_at).strftime("%d %B %Y at %H:%M %Z")

    return render_to_string(
        "lead_gen/emails/lead_notification.html",
        {
            "client": client,
            "submission": submission,
            "submitted_at": submitted_at,
            "fields": form_fields,
            "attribution_fields": attribution_fields,
        },
    )


def send_lead_notification(client: Client, submission: FormSubmission) -> tuple[bool, str]:
    subject = f"New lead enquiry — {client.company_name}"
    text_body = build_lead_email_body(client, submission)
    html_body = build_lead_email_html(client, submission)

    try:
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[client.contact_email],
        )
        message.attach_alternative(html_body, "text/html")

        reply_to = _safe_reply_to(submission.email)
        if reply_to:
            message.reply_to = reply_to

        message.send(fail_silently=False)

        submission.email_sent = True
        submission.email_sent_at = timezone.now()
        submission.email_error = ""
        submission.save(update_fields=["email_sent", "email_sent_at", "email_error"])
        return True, ""
    except Exception as exc:
        submission.email_sent = False
        submission.email_error = str(exc)
        submission.save(update_fields=["email_sent", "email_error"])
        return False, str(exc)
