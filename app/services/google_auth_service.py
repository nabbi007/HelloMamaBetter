"""Google OAuth: verify an ID token from the frontend and issue a JWT pair.

Flow:
  1. Frontend obtains a Google ID token via the Google Identity Services JS SDK.
  2. Frontend POSTs the token to POST /auth/google.
  3. We verify it with Google's public keys (google-auth library).
  4. If the email matches an existing user → log them in.
     If not → create a new verified account (no OTP needed — Google already verified the email).
  5. Return our JWT access + refresh pair.
"""
from __future__ import annotations

import logging

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.constants import UserRole
from app.core.exceptions import AppException
from app.core.security import create_access_token, create_refresh_token
from app.models.user import User, UserProfile
from app.schemas.auth import TokenPair
from app.utils.encryption import encrypt_field

logger = logging.getLogger(__name__)


async def google_login(db: AsyncSession, *, credential: str) -> TokenPair:
    """Verify a Google ID token and return a HelloMama token pair."""
    if not settings.GOOGLE_CLIENT_ID:
        raise AppException("Google login is not configured.", code="oauth_not_configured")

    try:
        info = google_id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        logger.warning("google.token.invalid: %s", exc)
        raise AppException("Invalid Google credential.", code="invalid_google_token") from exc

    email: str = info["email"].strip().lower()
    full_name: str = info.get("name", "")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            email=email,
            hashed_password="",
            role=UserRole.STUDENT,
            is_active=True,
            is_verified=True,
            full_name_encrypted=encrypt_field(full_name) if full_name else None,
        )
        db.add(user)
        db.add(UserProfile(user=user))
        await db.flush()
        logger.info("google.signup email_hash=%s", hash(email))
    else:
        if not user.is_active:
            raise AppException("This account has been deactivated.", code="account_inactive")
        logger.info("google.login email_hash=%s", hash(email))

    return TokenPair(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id, user.role),
    )
