"""User profile router.

Endpoints:
  GET  /users/me/profile        — fetch own profile
  PATCH /users/me/profile       — update bio, name, privacy flags
  POST  /users/me/avatar        — upload a new avatar image

All endpoints require a verified, active JWT (VerifiedUser dependency).
Avatar upload accepts multipart/form-data with a single `file` field.
"""
from __future__ import annotations

from fastapi import APIRouter, File, UploadFile, status

from app.dependencies import DbSession, VerifiedUser
from app.schemas.user import AvatarUploadResponse, ProfileResponse, ProfileUpdateRequest
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/profile")
async def get_profile(user: VerifiedUser, db: DbSession) -> ProfileResponse:
    return await user_service.get_my_profile(db, user)


@router.patch("/me/profile")
async def update_profile(
    payload: ProfileUpdateRequest,
    user: VerifiedUser,
    db: DbSession,
) -> ProfileResponse:
    result = await user_service.update_my_profile(db, user, payload)
    await db.commit()
    return result


@router.post("/me/avatar", status_code=status.HTTP_200_OK)
async def upload_avatar(
    user: VerifiedUser,
    db: DbSession,
    file: UploadFile = File(...),
) -> AvatarUploadResponse:
    data = await file.read()
    result = await user_service.upload_avatar(
        db,
        user,
        file_data=data,
        filename=file.filename or "avatar",
        content_type=file.content_type or "application/octet-stream",
    )
    await db.commit()
    return result
