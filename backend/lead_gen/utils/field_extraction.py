from decimal import Decimal, InvalidOperation
from typing import Any

from lead_gen.utils.hashing import hash_email, hash_name, hash_phone

FIELD_ALIASES: dict[str, list[str]] = {
    "gclid": ["gclid", "google_click_id", "Google Click ID"],
    "gbraid": ["gbraid", "GBRAID"],
    "wbraid": ["wbraid", "WBRAID"],
    "email": ["email", "e-mail", "email_address"],
    "phone": ["phone", "phone_number", "tel", "mobile", "cell"],
    "first_name": ["first_name", "firstname", "fname", "given_name"],
    "last_name": ["last_name", "lastname", "lname", "surname", "family_name"],
    "landing_page": ["landing_page", "landingpage", "page_url", "url", "referrer"],
    "utm_source": ["utm_source"],
    "utm_medium": ["utm_medium"],
    "utm_campaign": ["utm_campaign"],
    "utm_term": ["utm_term"],
    "utm_content": ["utm_content"],
    "conversion_value": ["conversion_value", "value", "lead_value"],
    "conversion_currency": ["conversion_currency", "currency"],
    "country_code": ["country_code", "country"],
    "postal_code": ["postal_code", "zip", "zip_code", "postcode"],
    "lead_status": ["lead_status", "status"],
}


def _normalize_key(key: str) -> str:
    return key.strip().lower().replace("-", "_").replace(" ", "_")


def _build_lookup(payload: dict[str, Any]) -> dict[str, Any]:
    return {_normalize_key(k): v for k, v in payload.items() if v is not None and v != ""}


def _get_value(lookup: dict[str, Any], field: str) -> Any:
    for alias in FIELD_ALIASES.get(field, [field]):
        value = lookup.get(_normalize_key(alias))
        if value is not None and value != "":
            return value
    return None


def _parse_decimal(value: Any) -> Decimal | None:
    if value is None or value == "":
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None


def extract_submission_fields(payload: dict[str, Any]) -> dict[str, Any]:
    lookup = _build_lookup(payload)

    email = str(_get_value(lookup, "email") or "")
    phone = str(_get_value(lookup, "phone") or "")
    first_name = str(_get_value(lookup, "first_name") or "")
    last_name = str(_get_value(lookup, "last_name") or "")

    conversion_value = _parse_decimal(_get_value(lookup, "conversion_value"))
    conversion_currency = _get_value(lookup, "conversion_currency")

    return {
        "gclid": str(_get_value(lookup, "gclid") or ""),
        "gbraid": str(_get_value(lookup, "gbraid") or ""),
        "wbraid": str(_get_value(lookup, "wbraid") or ""),
        "email": email,
        "phone": phone,
        "first_name": first_name,
        "last_name": last_name,
        "landing_page": str(_get_value(lookup, "landing_page") or ""),
        "utm_source": str(_get_value(lookup, "utm_source") or ""),
        "utm_medium": str(_get_value(lookup, "utm_medium") or ""),
        "utm_campaign": str(_get_value(lookup, "utm_campaign") or ""),
        "utm_term": str(_get_value(lookup, "utm_term") or ""),
        "utm_content": str(_get_value(lookup, "utm_content") or ""),
        "conversion_value": conversion_value,
        "conversion_currency": str(conversion_currency or "").upper(),
        "country_code": str(_get_value(lookup, "country_code") or "").upper(),
        "postal_code": str(_get_value(lookup, "postal_code") or ""),
        "lead_status": str(_get_value(lookup, "lead_status") or ""),
        "email_hashed": hash_email(email),
        "phone_hashed": hash_phone(phone),
        "first_name_hashed": hash_name(first_name),
        "last_name_hashed": hash_name(last_name),
    }
