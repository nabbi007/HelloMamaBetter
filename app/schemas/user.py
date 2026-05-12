"""Schemas for user profile endpoints.

Privacy notes:
- `full_name` is always decrypted before being returned — only ever sent to
  the authenticated user themselves via /users/me/profile.
- `avatar_url` in responses is a pre-signed S3 URL (1-hour TTL) so the raw
  S3 key is never exposed to the client.
- `show_name` / `show_university` control visibility to *other* users (not
  implemented yet, but the flag is set here so the client can toggle it).
"""
from __future__ import annotations

import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    full_name: Optional[str] = None
    university: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    show_name: bool
    show_university: bool


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    university: Optional[str] = Field(default=None, max_length=255)
    bio: Optional[str] = Field(default=None, max_length=500)
    show_name: Optional[bool] = None
    show_university: Optional[bool] = None


class AvatarUploadResponse(BaseModel):
    avatar_url: str
    message: str = "Avatar updated successfully."
