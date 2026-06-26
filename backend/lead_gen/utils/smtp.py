import smtplib
from typing import Any

from django.conf import settings
from django.core.mail import send_mail

from lead_gen.models import Client


def get_prebo_smtp_server() -> dict[str, Any]:
    client_count = Client.objects.filter(is_active=True).count()
    ok, detail = test_smtp_connection()

    return {
        "id": "prebo",
        "name": "Prebo SMTP",
        "host": settings.EMAIL_HOST or "",
        "port": int(settings.EMAIL_PORT or 465),
        "from_email": settings.DEFAULT_FROM_EMAIL or "",
        "is_default": True,
        "is_read_only": True,
        "client_count": client_count,
        "status_ok": ok,
        "status_detail": detail,
    }


def list_smtp_servers() -> list[dict[str, Any]]:
    return [get_prebo_smtp_server()]


def test_smtp_connection() -> tuple[bool, str]:
    host = settings.EMAIL_HOST
    port = int(settings.EMAIL_PORT or 465)
    user = settings.EMAIL_HOST_USER
    password = settings.EMAIL_HOST_PASSWORD

    if not all([host, user, password]):
        return False, "SMTP environment variables are not configured."

    try:
        with smtplib.SMTP_SSL(host, port, timeout=10) as server:
            server.login(user, password)
        return True, "SMTP connection successful."
    except Exception as exc:
        return False, str(exc)


def send_test_email(recipient: str) -> tuple[bool, str]:
    ok, detail = test_smtp_connection()
    if not ok:
        return False, detail

    try:
        send_mail(
            subject="PreboTools SMTP test",
            message="This is a test email from PreboTools Lead Gen.",
            from_email=None,
            recipient_list=[recipient],
            fail_silently=False,
        )
        return True, f"Test email sent to {recipient}."
    except Exception as exc:
        return False, str(exc)
