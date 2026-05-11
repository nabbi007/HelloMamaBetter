"""Shared validators."""
from __future__ import annotations

import re

# E.164-ish: optional leading +, 8-15 digits.
_PHONE_RE = re.compile(r"^\+?[0-9]{8,15}$")


def normalize_email(email: str) -> str:
    return email.strip().lower()


def is_valid_phone(phone: str) -> bool:
    return bool(_PHONE_RE.match(phone.strip()))


def normalize_phone(phone: str) -> str:
    return phone.strip().replace(" ", "")
