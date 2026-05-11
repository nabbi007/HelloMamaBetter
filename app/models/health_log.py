from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, DateTime, Enum as SAEnum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants import ENCRYPTED_FIELD_LENGTH, ReminderType
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User


class HealthLog(BaseModel):
    __tablename__ = "health_logs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    cycle_length: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes_encrypted: Mapped[Optional[str]] = mapped_column(
        String(ENCRYPTED_FIELD_LENGTH), nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="health_logs")


class Reminder(BaseModel):
    __tablename__ = "reminders"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type: Mapped[ReminderType] = mapped_column(
        SAEnum(
            ReminderType,
            name="reminder_type",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    schedule_cron: Mapped[str] = mapped_column(String(64), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    last_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="reminders")
