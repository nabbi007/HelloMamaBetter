"""Auth router: register → verify-OTP → login → refresh → me.

The router owns transactions: commit on success, the DB session dependency
rolls back on exception.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Query, status

from app.dependencies import CurrentUser, DbSession
from app.schemas.auth import (
    AccessTokenResponse,
    CurrentUserResponse,
    GoogleAuthRequest,
    LoginRequest,
    OTPResendRequest,
    OTPVerifyRequest,
    PasswordResetRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenPair,
    UserUpdateRequest,
)
from app.schemas.common import MessageResponse
from app.services import auth_service
from app.services import google_auth_service
from app.utils.encryption import decrypt_field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/username-available")
async def username_available(
    db: DbSession,
    username: str = Query(min_length=3, max_length=30, pattern=r"^[A-Za-z0-9_]+$"),
) -> dict[str, bool]:
    """Public lookup: is this username free to claim right now?"""
    taken = await auth_service.is_username_taken(db, username)
    return {"available": not taken}


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: DbSession) -> RegisterResponse:
    user = await auth_service.register_user(db, payload)
    await db.commit()
    return RegisterResponse(user_id=user.id)


@router.post("/verify-otp")
async def verify_otp(payload: OTPVerifyRequest, db: DbSession) -> TokenPair:
    user = await auth_service.verify_otp(
        db, email=payload.email, code=payload.code, purpose=payload.purpose
    )
    await db.commit()
    # Verifying with EMAIL_VERIFY is the equivalent of completing signup —
    # issue tokens immediately so the client doesn't need a second login round-trip.
    from app.core.security import create_access_token, create_refresh_token
    return TokenPair(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id, user.role),
    )


@router.post("/resend-otp")
async def resend_otp(payload: OTPResendRequest, db: DbSession) -> MessageResponse:
    await auth_service.resend_otp(db, email=payload.email, purpose=payload.purpose)
    await db.commit()
    # Always return the same response shape regardless of whether the email
    # actually exists — see auth_service.resend_otp for the rationale.
    return MessageResponse(message="If the account exists, a code has been sent.")


@router.post("/login")
async def login(payload: LoginRequest, db: DbSession) -> TokenPair:
    return await auth_service.login(db, payload)


@router.post("/google")
async def google_login(payload: GoogleAuthRequest, db: DbSession) -> TokenPair:
    tokens = await google_auth_service.google_login(db, credential=payload.credential)
    await db.commit()
    return tokens


@router.post("/refresh")
async def refresh(payload: RefreshRequest, db: DbSession) -> AccessTokenResponse:
    return await auth_service.refresh_access_token(db, payload.refresh_token)


@router.post("/reset-password")
async def reset_password(
    payload: PasswordResetRequest, db: DbSession
) -> MessageResponse:
    await auth_service.reset_password(db, payload)
    await db.commit()
    return MessageResponse(message="Password reset successful. Please log in.")


@router.get("/me")
async def me(user: CurrentUser) -> CurrentUserResponse:
    return CurrentUserResponse(
        id=user.id,
        email=user.email,
        role=user.role.value if hasattr(user.role, "value") else user.role,
        is_verified=user.is_verified,
        is_active=user.is_active,
        full_name=decrypt_field(user.full_name_encrypted),
        university=user.university,
        username=user.username,
    )


@router.patch("/me")
async def update_me(
    payload: UserUpdateRequest, db: DbSession, user: CurrentUser
) -> CurrentUserResponse:
    updated = await auth_service.update_user(db, user, payload)
    await db.commit()
    return CurrentUserResponse(
        id=updated.id,
        email=updated.email,
        role=updated.role.value if hasattr(updated.role, "value") else updated.role,
        is_verified=updated.is_verified,
        is_active=updated.is_active,
        full_name=decrypt_field(updated.full_name_encrypted),
        university=updated.university,
        username=updated.username,
    )
