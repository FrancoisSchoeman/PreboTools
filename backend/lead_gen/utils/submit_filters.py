from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

from django.http import HttpRequest

GTM_MSR_HOST = "gtm-msr.appspot.com"

_URL_PAYLOAD_KEYS = {
    "landing_page",
    "landingpage",
    "page_url",
    "url",
    "referrer",
}


def _normalize_key(key: str) -> str:
    return key.strip().lower().replace("-", "_").replace(" ", "_")


def _hostname_is_gtm_msr(value: str | None) -> bool:
    if not value or not isinstance(value, str):
        return False
    raw = value.strip()
    if not raw:
        return False
    # Origin headers are often scheme+host only; urlparse still works.
    parsed = urlparse(raw if "://" in raw else f"https://{raw}")
    host = (parsed.hostname or "").lower()
    return host == GTM_MSR_HOST or host.endswith(f".{GTM_MSR_HOST}")


def is_gtm_msr_traffic(
    payload: dict[str, Any],
    request: HttpRequest,
    landing_page: str = "",
) -> bool:
    """True when the submission is from GTM MSR preview (should not be stored)."""
    if _hostname_is_gtm_msr(landing_page):
        return True

    for key, value in payload.items():
        if _normalize_key(str(key)) not in _URL_PAYLOAD_KEYS:
            continue
        if isinstance(value, str) and _hostname_is_gtm_msr(value):
            return True

    if _hostname_is_gtm_msr(request.headers.get("Origin")):
        return True
    if _hostname_is_gtm_msr(request.headers.get("Referer")):
        return True

    return False
