from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants import ENCRYPTED_FIELD_LENGTH, AppointmentStatus
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.chat import ChatSession
    from app.models.user import User


class Appointment(BaseModel):
    __tablename__ = "appointments"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    professional_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    status: Mapped[AppointmentStatus] = mapped_column(
        SAEnum(
            AppointmentStatus,
            name="appointment_status",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AppointmentStatus.PENDING,
        index=True,
    )
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    notes_encrypted: Mapped[Optional[str]] = mapped_column(
        String(ENCRYPTED_FIELD_LENGTH), nullable=True
    )

    student: Mapped["User"] = relationship(
        back_populates="appointments_as_student", foreign_keys=[student_id]
    )
    professional: Mapped["User"] = relationship(
        back_populates="appointments_as_professional", foreign_keys=[professional_id]
    )
    chat_session: Mapped[Optional["ChatSession"]] = relationship(
        back_populates="appointment", uselist=False
    )
