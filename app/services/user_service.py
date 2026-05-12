"""User profile domain logic.

S3 strategy:
- Avatar keys are stored as `avatars/{user_id}/{uuid}.{ext}` in the bucket.
- In development (ENVIRONMENT=development) we skip AWS entirely and return a
  placeholder URL so the endpoint is testable without AWS credentials.
- In all other environments we upload to S3 (private bucket) and return a
  pre-signed URL with a 1-hour TTL.

Privacy:
- full_name is Fernet-encrypted on write; decrypted only when building the
  response — never stored plaintext, never logged.
- avatar_url stored in the DB is the raw S3 key, not the pre-signed URL.
  The pre-signed URL is generated fresh on every profile read.
"""
from __future__ import annotations

import asyncio
import logging
import mimetypes
import uuid
from typing import Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.config import settings
from app.core.exceptions import AppException, ResourceNotFound
from app.models.user import User, UserProfile
from app.schemas.user import AvatarUploadResponse, ProfileResponse, ProfileUpdateRequest
from app.utils.encryption import decrypt_field, encrypt_field

logger = logging.getLogger(__name__)

_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
_MAX_AVATAR_BYTES = 5 * 1024 * 1024  # 5 MB
_PRESIGN_EXPIRY = 3600  # 1 hour


def _is_dev() -> bool:
    return settings.ENVIRONMENT.lower() == "development"


def _s3_client():
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def _presign(key: str) -> str:
    """Generate a pre-signed GET URL for a private S3 object."""
    try:
        client = _s3_client()
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
            ExpiresIn=_PRESIGN_EXPIRY,
        )
    except (BotoCoreError, ClientError) as exc:
        logger.error("s3.presign.failed key=%s", key)
        raise AppException("Could not generate avatar URL.") from exc


async def _upload_to_s3(key: str, data: bytes, content_type: str) -> None:
    """Upload bytes to S3 in a thread pool (boto3 is sync)."""
    def _put():
        _s3_client().put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
    try:
        await asyncio.to_thread(_put)
    except (BotoCoreError, ClientError) as exc:
        logger.error("s3.upload.failed key=%s", key)
        raise AppException("Avatar upload failed. Please try again.") from exc


def _build_avatar_url(avatar_key: Optional[str]) -> Optional[str]:
    """Return a usable URL for the avatar, or None if not set."""
    if not avatar_key:
        return None
    if _is_dev():
        return f"http://localhost:8000/dev-avatar/{avatar_key}"
    return _presign(avatar_key)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def get_my_profile(db: AsyncSession, user: User) -> ProfileResponse:
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise ResourceNotFound("Profile not found.")

    return ProfileResponse(
        user_id=user.id,
        full_name=decrypt_field(user.full_name_encrypted),
        university=user.university,
        bio=profile.bio,
        avatar_url=_build_avatar_url(profile.avatar_url),
        show_name=profile.show_name,
        show_university=profile.show_university,
    )


async def update_my_profile(
    db: AsyncSession, user: User, data: ProfileUpdateRequest
) -> ProfileResponse:
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise ResourceNotFound("Profile not found.")

    if data.full_name is not None:
        user.full_name_encrypted = encrypt_field(data.full_name)
    if data.university is not None:
        user.university = data.university
    if data.bio is not None:
        profile.bio = data.bio
    if data.show_name is not None:
        profile.show_name = data.show_name
    if data.show_university is not None:
        profile.show_university = data.show_university

    return ProfileResponse(
        user_id=user.id,
        full_name=decrypt_field(user.full_name_encrypted),
        university=user.university,
        bio=profile.bio,
        avatar_url=_build_avatar_url(profile.avatar_url),
        show_name=profile.show_name,
        show_university=profile.show_university,
    )


async def upload_avatar(
    db: AsyncSession,
    user: User,
    *,
    file_data: bytes,
    filename: str,
    content_type: str,
) -> AvatarUploadResponse:
    if content_type not in _ALLOWED_CONTENT_TYPES:
        raise AppException(
            "Only JPEG, PNG, and WebP images are allowed.",
            code="invalid_file_type",
        )
    if len(file_data) > _MAX_AVATAR_BYTES:
        raise AppException(
            "Avatar must be smaller than 5 MB.",
            code="file_too_large",
        )

    ext = mimetypes.guess_extension(content_type) or ".jpg"
    # .jpe is the default guess for image/jpeg on some platforms — normalise it.
    if ext == ".jpe":
        ext = ".jpg"

    s3_key = f"avatars/{user.id}/{uuid.uuid4().hex}{ext}"

    if _is_dev():
        logger.info("[DEV] avatar upload skipped key=%s", s3_key)
    else:
        await _upload_to_s3(s3_key, file_data, content_type)

    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise ResourceNotFound("Profile not found.")

    profile.avatar_url = s3_key
    url = _build_avatar_url(s3_key)

    return AvatarUploadResponse(avatar_url=url)
