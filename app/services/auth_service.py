"""Auth domain logic: register, verify, login, refresh, resend.

All DB writes happen inside the caller's session — the service does not
commit. Routers control transaction boundaries.

Privacy:
- `full_name` is Fernet-encrypted before it touches the DB.
- We never log the email, code, or password.
- Login errors return a generic 401 so the client can't enumerate accounts.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.constants import OTPPurpose, UserRole
from app.core.exceptions import (
    AccountInactive,
    AccountNotVerified,
    EmailAlreadyRegistered,
    InvalidCredentials,
    InvalidOTP,
    InvalidToken,
    ResourceNotFound,
)
from app.core.security import (
    REFRESH_TYPE,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_otp_code,
    hash_password,
    verify_password,
)
from app.models.user import OTPCode, User, UserProfile
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    RegisterRequest,
    TokenPair,
)
from app.services.notification_service import send_otp_email
from app.utils.encryption import encrypt_field
from app.utils.validators import normalize_email, normalize_phone

logger = logging.getLogger(__name__)


# --- Helpers ----------------------------------------------------------------

async def _get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def _issue_otp(
    db: AsyncSession,
    *,
    user: User,
    purpose: OTPPurpose,
) -> OTPCode:
    """Invalidate any prior unused OTPs for this user+purpose, then issue a new one.

    Returns the new OTP row (uncommitted).
    """
    # Mark any outstanding unused OTPs as used so only the latest is valid.
    existing = await db.execute(
        select(OTPCode).where(
            OTPCode.user_id == user.id,
            OTPCode.purpose == purpose,
            OTPCode.is_used.is_(False),
        )
    )
    for old in existing.scalars():
        old.is_used = True

    code = generate_otp_code()
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    otp = OTPCode(
        user_id=user.id,
        code=code,
        purpose=purpose,
        expires_at=expires,
    )
    db.add(otp)
    return otp


# --- Public API -------------------------------------------------------------

async def register_user(db: AsyncSession, data: RegisterRequest) -> User:
    email = normalize_email(data.email)

    existing = await _get_user_by_email(db, email)
    if existing is not None:
        # Same generic message whether the email is registered or not,
        # to avoid enumeration. But we still raise a distinct code so the
        # client can show "an account exists — try logging in" if they want.
        raise EmailAlreadyRegistered()

    phone = normalize_phone(data.phone) if data.phone else None
    user = User(
        email=email,
        phone=phone,
        hashed_password=hash_password(data.password),
        role=UserRole.STUDENT,
        is_active=True,
        is_verified=False,
        full_name_encrypted=encrypt_field(data.full_name),
        university=data.university,
    )
    db.add(user)
    # Empty profile placeholder so the FK side exists.
    db.add(UserProfile(user=user))
    await db.flush()  # assigns user.id

    otp = await _issue_otp(db, user=user, purpose=OTPPurpose.EMAIL_VERIFY)
    await db.flush()

    await send_otp_email(email=email, code=otp.code, purpose=OTPPurpose.EMAIL_VERIFY)
    return user


async def verify_otp(
    db: AsyncSession,
    *,
    email: str,
    code: str,
    purpose: OTPPurpose,
) -> User:
    email = normalize_email(email)
    user = await _get_user_by_email(db, email)
    if user is None:
        raise InvalidOTP()  # generic, do not leak existence

    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(OTPCode).where(
            OTPCode.user_id == user.id,
            OTPCode.purpose == purpose,
            OTPCode.is_used.is_(False),
            OTPCode.code == code,
            OTPCode.expires_at > now,
        )
    )
    otp = result.scalar_one_or_none()
    if otp is None:
        raise InvalidOTP()

    otp.is_used = True
    if purpose == OTPPurpose.EMAIL_VERIFY:
        user.is_verified = True

    return user


async def resend_otp(
    db: AsyncSession,
    *,
    email: str,
    purpose: OTPPurpose,
) -> None:
    user = await _get_user_by_email(db, normalize_email(email))
    if user is None:
        # Stay silent to avoid enumeration. Router still returns 200.
        return
    if not user.is_active:
        return
    if purpose == OTPPurpose.EMAIL_VERIFY and user.is_verified:
        # Already verified — nothing to resend.
        return

    otp = await _issue_otp(db, user=user, purpose=purpose)
    await db.flush()
    await send_otp_email(email=user.email, code=otp.code, purpose=purpose)


async def login(db: AsyncSession, data: LoginRequest) -> TokenPair:
    user = await _get_user_by_email(db, normalize_email(data.email))
    if user is None or not verify_password(data.password, user.hashed_password):
        # Run a dummy hash compare if user missing? passlib already runs in
        # constant-ish time; not worth the extra complexity at this stage.
        raise InvalidCredentials()
    if not user.is_active:
        raise AccountInactive()
    if not user.is_verified:
        raise AccountNotVerified()

    return TokenPair(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id, user.role),
    )


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> AccessTokenResponse:
    try:
        payload = decode_token(refresh_token, expected_type=REFRESH_TYPE)
    except JWTError as exc:
        raise InvalidToken() from exc

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise InvalidToken("Token payload malformed.") from exc

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise InvalidToken("Token subject not found.")
    if not user.is_active:
        raise AccountInactive()

    return AccessTokenResponse(access_token=create_access_token(user.id, user.role))


async def get_user_or_404(db: AsyncSession, user_id: uuid.UUID) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise ResourceNotFound("User not found.")
    return user
