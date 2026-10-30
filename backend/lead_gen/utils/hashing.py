import hashlib
import re

# ISO 3166-1 alpha-2 → dialing code digits (EC phone path).
_ISO_TO_DIAL = {
    "ZA": "27",
    "US": "1",
    "CA": "1",
    "GB": "44",
    "AU": "61",
    "NZ": "64",
    "IE": "353",
    "DE": "49",
    "FR": "33",
    "NL": "31",
    "BE": "32",
    "NA": "264",
    "BW": "267",
    "ZW": "263",
    "MZ": "258",
    "LS": "266",
    "SZ": "268",
}


def sha256_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def hash_email(email: str) -> str:
    """Legacy email hash: trim + lowercase only (existing Sheet compatibility)."""
    if not email:
        return ""
    normalized = email.strip().lower()
    return sha256_hash(normalized) if normalized else ""


def hash_phone(phone: str, default_country_code: str = "27") -> str:
    """Legacy phone hash: digits only; leading 0 → country digits; no leading +."""
    if not phone:
        return ""
    digits = re.sub(r"\D", "", phone.strip())
    if not digits:
        return ""
    if digits.startswith("0"):
        digits = default_country_code + digits[1:]
    normalized = digits
    return sha256_hash(normalized)


def hash_name(name: str) -> str:
    if not name:
        return ""
    normalized = name.strip().lower()
    return sha256_hash(normalized) if normalized else ""


def hash_email_ec(email: str) -> str:
    """
    Enhanced Conversions email hash (Google Ads rules).
    Lowercase, strip whitespace; for gmail.com / googlemail.com remove '.' and
    '+tag' from the local part; normalize googlemail.com → gmail.com.
    """
    if not email:
        return ""
    normalized = re.sub(r"\s+", "", email.strip().lower())
    if "@" not in normalized:
        return sha256_hash(normalized) if normalized else ""

    local, domain = normalized.rsplit("@", 1)
    if domain in ("gmail.com", "googlemail.com"):
        local = local.replace(".", "")
        plus_idx = local.find("+")
        if plus_idx != -1:
            local = local[:plus_idx]
        domain = "gmail.com"
    normalized = f"{local}@{domain}"
    return sha256_hash(normalized)


def hash_phone_ec(
    phone: str,
    default_country_code: str = "27",
    country_code: str = "",
) -> str:
    """
    Enhanced Conversions phone hash: E.164 with leading '+' then SHA-256.

    ZA: leading 0 → dial code 27.
    US/CA (NANP, dial 1): 10-digit national → prepend 1; 11-digit starting with 1 unchanged.
    """
    if not phone:
        return ""
    digits = re.sub(r"\D", "", phone.strip())
    if not digits:
        return ""

    dial = default_country_code
    iso = (country_code or "").strip().upper()
    if iso in _ISO_TO_DIAL:
        dial = _ISO_TO_DIAL[iso]

    if dial == "1":
        # NANP (US/CA): no SA-style leading-0 trunk rewrite.
        if len(digits) == 10:
            digits = "1" + digits
        # 11 digits starting with 1: already country + national
    else:
        if digits.startswith("0"):
            digits = dial + digits[1:]
        elif iso and not digits.startswith(dial) and len(digits) <= 10:
            digits = dial + digits

    e164 = f"+{digits}"
    return sha256_hash(e164)
