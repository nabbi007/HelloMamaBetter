from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants import ENCRYPTED_FIELD_LENGTH, OTPPurpose, UserRole
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.appointment import Appointment
    from app.models.chat import ChatMessage, ChatSession
    from app.models.content import ContentArticle
    from app.models.health_log import HealthLog
    from app.models.order import Order
    from app.models.health_log import Reminder


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(32), unique=True, nullable=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=UserRole.STUDENT,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    full_name_encrypted: Mapped[Optional[str]] = mapped_column(
        String(ENCRYPTED_FIELD_LENGTH), nullable=True
    )
    university: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    profile: Mapped[Optional["UserProfile"]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    otp_codes: Mapped[List["OTPCode"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    orders: Mapped[List["Order"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    appointments_as_student: Mapped[List["Appointment"]] = relationship(
        back_populates="student",
        foreign_keys="Appointment.student_id",
        cascade="all, delete-orphan",
    )
    appointments_as_professional: Mapped[List["Appointment"]] = relationship(
        back_populates="professional",
        foreign_keys="Appointment.professional_id",
    )
    chat_sessions_as_student: Mapped[List["ChatSession"]] = relationship(
        back_populates="student",
        foreign_keys="ChatSession.student_id",
    )
    chat_sessions_as_professional: Mapped[List["ChatSession"]] = relationship(
        back_populates="professional",
        foreign_keys="ChatSession.professional_id",
    )
    chat_messages: Mapped[List["ChatMessage"]] = relationship(back_populates="sender")
    health_logs: Mapped[List["HealthLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    reminders: Mapped[List["Reminder"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    articles: Mapped[List["ContentArticle"]] = relationship(back_populates="author")


class UserProfile(BaseModel):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    show_name: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    show_university: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped["User"] = relationship(back_populates="profile")


class OTPCode(BaseModel):
    __tablename__ = "otp_codes"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    code: Mapped[str] = mapped_column(String(12), nullable=False)
    purpose: Mapped[OTPPurpose] = mapped_column(
        SAEnum(OTPPurpose, name="otp_purpose", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    is_used: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship(back_populates="otp_codes")
