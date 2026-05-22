"""Pydantic schemas for the auth router.

Privacy notes:
- `full_name` is required at registration and stored Fernet-encrypted on User.
- Login response carries only access + refresh JWTs. No PII.
"""
from __future__ import annotations

import re
import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.constants import OTPPurpose


# --- Requests ---------------------------------------------------------------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=200)
    phone: Optional[str] = Field(default=None, max_length=32)
    university: Optional[str] = Field(default=None, max_length=255)
    username: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=30,
        pattern=r"^[A-Za-z0-9_]+$",
    )

    @field_validator("password")
    @classmethod
    def _password_complexity(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Password cannot be blank.")
        if re.search(r"\s", v):
            raise ValueError("Password must not contain spaces.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-]", v):
            raise ValueError("Password must contain at least one special character.")
        return v


class OTPVerifyRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=12)
    purpose: OTPPurpose = OTPPurpose.EMAIL_VERIFY


class OTPResendRequest(BaseModel):
    email: EmailStr
    purpose: OTPPurpose = OTPPurpose.EMAIL_VERIFY


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str


class GoogleAuthRequest(BaseModel):
    credential: str


class UserUpdateRequest(BaseModel):
    """Fields a logged-in user can change on themselves.

    Deliberately narrow: `username` only. Full name + email are not user-editable
    via this endpoint (full_name is encrypted PII; email change needs its own
    verify-email-change flow which is not built yet).
    """
    username: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=30,
        pattern=r"^[A-Za-z0-9_]+$",
    )


class PasswordResetRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=12)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def _password_complexity(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Password cannot be blank.")
        if re.search(r"\s", v):
            raise ValueError("Password must not contain spaces.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-]", v):
            raise ValueError("Password must contain at least one special character.")
        return v


# --- Responses --------------------------------------------------------------

class RegisterResponse(BaseModel):
    user_id: uuid.UUID
    message: str = "Account created. Verification code sent."


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentUserResponse(BaseModel):
    """A minimal, non-PII view of the authenticated user.

    `full_name` here is the decrypted plaintext — only returned to the user
    themselves via /auth/me. Never include in lists or logs.
    """
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    role: str
    is_verified: bool
    is_active: bool
    full_name: Optional[str] = None
    university: Optional[str] = None
    username: Optional[str] = None
