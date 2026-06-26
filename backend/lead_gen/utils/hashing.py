import hashlib
import re


def sha256_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def hash_email(email: str) -> str:
    if not email:
        return ""
    normalized = email.strip().lower()
    return sha256_hash(normalized) if normalized else ""


def hash_phone(phone: str, default_country_code: str = "27") -> str:
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
