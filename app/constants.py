from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    DOCTOR = "doctor"
    NURSE = "nurse"
    ADMIN = "admin"


class OTPPurpose(str, Enum):
    EMAIL_VERIFY = "email_verify"
    PHONE_VERIFY = "phone_verify"
    PASSWORD_RESET = "password_reset"


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ReminderType(str, Enum):
    PILL = "pill"
    INJECTION = "injection"
    APPOINTMENT = "appointment"
    CYCLE_ALERT = "cycle_alert"


class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# Length to use for VARCHAR columns holding Fernet ciphertext.
# Fernet tokens are ~1.3x plaintext + 73 bytes of envelope, base64-encoded.
# 512 comfortably covers typical names/notes/short messages.
ENCRYPTED_FIELD_LENGTH = 512
