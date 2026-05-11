"""FastAPI dependencies for auth + DB access."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.constants import UserRole
from app.core.exceptions import (
    AccountInactive,
    AccountNotVerified,
    InvalidToken,
    PermissionDenied,
)
from app.core.security import ACCESS_TYPE, JWTError, decode_token
from app.database import get_db
from app.models.user import User

# tokenUrl is used by Swagger UI's "Authorize" dialog only — the actual login
# endpoint accepts JSON via app/routers/auth.py.
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login",
    auto_error=False,
)


DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    db: DbSession,
    token: Annotated[str | None, Depends(oauth2_scheme)],
) -> User:
    if not token:
        raise InvalidToken("Missing bearer token.")
    try:
        payload = decode_token(token, expected_type=ACCESS_TYPE)
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
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def get_verified_user(user: CurrentUser) -> User:
    if not user.is_verified:
        raise AccountNotVerified()
    return user


VerifiedUser = Annotated[User, Depends(get_verified_user)]


def require_role(*roles: UserRole):
    """Dependency factory: enforces the current user has one of `roles`."""
    allowed = {r.value for r in roles}

    async def _checker(user: CurrentUser) -> User:
        # Compare on the enum's value so this works whether SQLAlchemy returned
        # the Enum member or the raw string.
        role_value = user.role.value if hasattr(user.role, "value") else user.role
        if role_value not in allowed:
            raise PermissionDenied()
        return user

    return _checker
