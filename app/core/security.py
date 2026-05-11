"""Password hashing + JWT issuance / verification.

Tokens carry only `sub` (user_id), `role`, `type`, `exp`, `iat`. Never PII.
"""
from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.constants import UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- Passwords --------------------------------------------------------------

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except ValueError:
        # bcrypt raises on malformed hashes — treat as a mismatch.
        return False


# --- OTP codes --------------------------------------------------------------

def generate_otp_code(length: Optional[int] = None) -> str:
    """Generate a numeric OTP using a CSPRNG. Avoids leaking via timing."""
    n = length or settings.OTP_LENGTH
    upper = 10 ** n
    return f"{secrets.randbelow(upper):0{n}d}"


# --- JWT --------------------------------------------------------------------

ACCESS_TYPE = "access"
REFRESH_TYPE = "refresh"


def _encode(payload: dict[str, Any]) -> str:
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def _decode(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


def create_access_token(user_id: uuid.UUID, role: UserRole) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _encode({
        "sub": str(user_id),
        "role": role.value,
        "type": ACCESS_TYPE,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    })


def create_refresh_token(user_id: uuid.UUID, role: UserRole) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return _encode({
        "sub": str(user_id),
        "role": role.value,
        "type": REFRESH_TYPE,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    })


def decode_token(token: str, expected_type: str) -> dict[str, Any]:
    """Decode and validate token. Raises JWTError on any failure."""
    payload = _decode(token)
    if payload.get("type") != expected_type:
        raise JWTError(f"Expected token type {expected_type!r}, got {payload.get('type')!r}")
    return payload


__all__ = [
    "hash_password",
    "verify_password",
    "generate_otp_code",
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "ACCESS_TYPE",
    "REFRESH_TYPE",
    "JWTError",
]
