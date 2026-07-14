from __future__ import annotations

from uuid import UUID

from django.conf import settings
from django.core.cache import cache

RATE_WINDOW_SECONDS = 60


def get_client_ip(request) -> str:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR") or "unknown"


def check_rate_limits(api_key: UUID, ip: str) -> str | None:
    """Return an error message if rate limited, else None."""
    per_key = getattr(settings, "LEAD_GEN_RATE_LIMIT_PER_KEY", 300)
    per_ip = getattr(settings, "LEAD_GEN_RATE_LIMIT_PER_IP", 600)

    key_cache = f"lead_gen_rl:key:{api_key}"
    ip_cache = f"lead_gen_rl:ip:{ip}"

    key_count = cache.get(key_cache, 0)
    ip_count = cache.get(ip_cache, 0)

    if key_count >= per_key or ip_count >= per_ip:
        return "Too many requests."

    if cache.add(key_cache, 1, RATE_WINDOW_SECONDS):
        pass
    else:
        try:
            cache.incr(key_cache)
        except ValueError:
            cache.set(key_cache, 1, RATE_WINDOW_SECONDS)

    if cache.add(ip_cache, 1, RATE_WINDOW_SECONDS):
        pass
    else:
        try:
            cache.incr(ip_cache)
        except ValueError:
            cache.set(ip_cache, 1, RATE_WINDOW_SECONDS)

    return None
