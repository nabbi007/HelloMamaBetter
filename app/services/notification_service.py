"""Notification delivery (email via SMTP, SMS via SNS).

When SMTP_USER and SMTP_PASSWORD are configured, OTPs are sent as real emails
via SMTP (Gmail or any provider). Without credentials, we fall back to logging
the code so dev flows still work without infra.

Logging policy: never log the OTP code in production.
"""
from __future__ import annotations

import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Final

import aiosmtplib

from app.config import settings
from app.constants import OTPPurpose

logger = logging.getLogger(__name__)

_DEV_ENV: Final[str] = "development"

_PURPOSE_LABEL: dict[OTPPurpose, str] = {
    OTPPurpose.EMAIL_VERIFY: "Email Verification",
    OTPPurpose.PASSWORD_RESET: "Password Reset",
}


def _smtp_configured() -> bool:
    # Host alone is enough — Mailpit (and other dev catchers) accept anonymous SMTP.
    # Real providers will additionally need SMTP_USER + SMTP_PASSWORD.
    return bool(settings.SMTP_HOST)


def _build_otp_email(to: str, code: str, purpose: OTPPurpose) -> MIMEMultipart:
    label = _PURPOSE_LABEL.get(purpose, "Verification")
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"HelloMama — Your {label} Code"
    msg["From"]    = settings.SMTP_FROM or settings.SMTP_USER
    msg["To"]      = to

    plain = f"Your HelloMama {label.lower()} code is: {code}\n\nThis code expires in {settings.OTP_EXPIRE_MINUTES} minutes.\nIf you did not request this, please ignore this email."

    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#16a34a;border-radius:12px;padding:12px 16px;">
          <span style="color:white;font-size:22px;font-weight:700;">HelloMama</span>
        </div>
      </div>
      <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">{label} Code</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Use the code below to continue. It expires in <strong>{settings.OTP_EXPIRE_MINUTES} minutes</strong>.</p>
        <div style="background:#f0fdf4;border:2px dashed #86efac;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#15803d;">{code}</span>
        </div>
        <p style="margin:0;font-size:12px;color:#9ca3af;">If you did not request this, you can safely ignore this email.</p>
      </div>
      <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">© 2025 HelloMama. All rights reserved.</p>
    </div>
    """
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))
    return msg


async def send_otp_email(*, email: str, code: str, purpose: OTPPurpose) -> None:
    if not _smtp_configured():
        logger.info("[DEV] OTP %s for %s purpose=%s", code, email, purpose.value)
        return

    msg = _build_otp_email(email, code, purpose)
    send_kwargs: dict = {
        "hostname": settings.SMTP_HOST,
        "port": settings.SMTP_PORT,
        "start_tls": settings.SMTP_STARTTLS,
    }
    if settings.SMTP_USER:
        send_kwargs["username"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        send_kwargs["password"] = settings.SMTP_PASSWORD
    try:
        await aiosmtplib.send(msg, **send_kwargs)
        logger.info("otp.email.sent purpose=%s", purpose.value)
    except Exception:
        logger.exception("otp.email.failed purpose=%s", purpose.value)
        if settings.ENVIRONMENT.lower() == _DEV_ENV:
            logger.warning("[DEV] SMTP failed — OTP %s for %s purpose=%s", code, email, purpose.value)
            return
        raise


def send_otp_sms(*, phone: str, code: str, purpose: OTPPurpose) -> None:
    if settings.ENVIRONMENT.lower() == _DEV_ENV:
        logger.info("[DEV] OTP %s for %s purpose=%s", code, phone, purpose.value)
        return

    logger.warning("otp.sms.unimplemented purpose=%s", purpose.value)
