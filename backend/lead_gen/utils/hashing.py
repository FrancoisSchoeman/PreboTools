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

_EXT_RE = re.compile(
    r"(?i)(?:\s*(?:ext\.?|extension|x|#)\s*\d+)\s*$"
)
_E164_RE = re.compile(r"^\+[1-9]\d{6,14}$")


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


def _is_nanp_national(digits: str) -> bool:
    """10-digit NANP national: NXX NXXXXXX with N in 2–9."""
    return len(digits) == 10 and digits[0] in "23456789"


def normalize_phone_e164(phone: str, country_code: str = "") -> str:
    """
    Normalize a phone number to E.164 (+digits) for Enhanced Conversions.

    Returns "" when the input cannot be formed into a valid E.164 number.
    """
    if not phone:
        return ""

    cleaned = _EXT_RE.sub("", phone.strip())
    digits = re.sub(r"\D", "", cleaned)
    if not digits:
        return ""

    if digits.startswith("00"):
        digits = digits[2:]
        if not digits:
            return ""

    iso = (country_code or "").strip().upper()
    dial = _ISO_TO_DIAL.get(iso, "")

    if dial == "1":
        if _is_nanp_national(digits):
            digits = "1" + digits
        elif (
            len(digits) == 11
            and digits.startswith("1")
            and digits[1] in "23456789"
        ):
            pass
        elif (
            len(digits) > 11
            and digits.startswith("1")
            and digits[1] in "23456789"
            and _is_nanp_national(digits[1:11])
        ):
            digits = digits[:11]
        else:
            return ""
    elif dial:
        if digits.startswith("0"):
            digits = dial + digits[1:]
        elif digits.startswith(dial):
            pass
        elif len(digits) <= 10:
            digits = dial + digits
        # else: keep as-is and validate below
    # No ISO / unknown country: only accept if already E.164-shaped after +

    e164 = f"+{digits}"
    if not _E164_RE.match(e164):
        return ""
    return e164


def hash_phone_ec(
    phone: str,
    default_country_code: str = "27",
    country_code: str = "",
) -> str:
    """
    Enhanced Conversions phone hash: E.164 with leading '+' then SHA-256.

    Prefer ISO country_code. If empty, map legacy dial default_country_code
    ("27"→ZA, "1"→US) or an ISO string in default_country_code.
    """
    iso = (country_code or "").strip().upper()
    if not iso:
        dial = (default_country_code or "").strip()
        if dial.upper() in _ISO_TO_DIAL:
            iso = dial.upper()
        elif dial == "27":
            iso = "ZA"
        elif dial == "1":
            iso = "US"

    e164 = normalize_phone_e164(phone, country_code=iso)
    if not e164:
        return ""
    return sha256_hash(e164)
