"""Notification delivery (email via SES, SMS via SNS).

In `development` we don't call AWS at all — we log the OTP at INFO level so
flows can be exercised without infra. In every other environment, dispatching
is delegated to Celery so we don't block the request thread.

Logging policy: never log the recipient email/phone or the OTP code together
in production. The dev path is intentionally chatty because it's *only* the
dev path.
"""
from __future__ import annotations

import logging
from typing import Final

from app.config import settings
from app.constants import OTPPurpose

logger = logging.getLogger(__name__)

_DEV_ENV: Final[str] = "development"


def _is_dev() -> bool:
    return settings.ENVIRONMENT.lower() == _DEV_ENV


async def send_otp_email(*, email: str, code: str, purpose: OTPPurpose) -> None:
    """Send an OTP via email.

    Dev: log code + purpose. Other envs: enqueue Celery task to call SES.
    """
    if _is_dev():
        logger.info("[DEV] OTP %s for %s purpose=%s", code, email, purpose.value)
        return

    # In non-dev, enqueue a Celery task so request latency stays low.
    # The actual SES call lives in app/tasks/email_tasks.py.
    from app.tasks.email_tasks import send_otp_email_task

    send_otp_email_task.delay(email=email, code=code, purpose=purpose.value)
    logger.info("otp.email.enqueued purpose=%s", purpose.value)


async def send_otp_sms(*, phone: str, code: str, purpose: OTPPurpose) -> None:
    """Send an OTP via SMS.

    Dev: log code + purpose. Other envs: enqueue Celery task to call SNS.
    """
    if _is_dev():
        logger.info("[DEV] OTP %s for %s purpose=%s", code, phone, purpose.value)
        return

    # SMS dispatch task is not implemented yet — log and skip so we don't
    # crash the request. Replace with celery enqueue once SNS task lands.
    logger.warning("otp.sms.unimplemented purpose=%s", purpose.value)
