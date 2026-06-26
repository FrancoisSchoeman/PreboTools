import json
from typing import Any

# Guardrails for public form submissions (arbitrary fields allowed, within limits).
MAX_BODY_BYTES = 256 * 1024  # 256 KB
MAX_FIELD_COUNT = 100
MAX_STRING_LENGTH = 10_000


def parse_form_payload(body: bytes) -> tuple[dict[str, Any] | None, str | None]:
    """
    Parse and validate a public form submission JSON body.

    Accepts any top-level keys (landing pages send different fields).
    Returns (payload, None) on success or (None, error_message) on failure.
    """
    if len(body) > MAX_BODY_BYTES:
        return None, "Request body too large."

    if not body.strip():
        return None, "Request body is empty."

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return None, "Invalid JSON."

    if not isinstance(data, dict):
        return None, "JSON body must be an object."

    if len(data) > MAX_FIELD_COUNT:
        return None, f"Too many fields (max {MAX_FIELD_COUNT})."

    for key, value in data.items():
        if not isinstance(key, str):
            return None, "All field names must be strings."
        if isinstance(value, str) and len(value) > MAX_STRING_LENGTH:
            return None, f"Field '{key}' exceeds maximum length."

    return data, None
