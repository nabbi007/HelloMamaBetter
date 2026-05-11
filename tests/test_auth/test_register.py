"""
Auth flow tests: register → verify OTP → login → refresh → /me.

Each test function is isolated via the per-test transaction rollback in conftest.
OTP codes are extracted directly from the DB (no email needed in tests).
"""
from __future__ import annotations

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import OTPPurpose
from app.models.user import OTPCode, User
from tests.conftest import student_payload

BASE = "/api/v1/auth"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_latest_otp(db: AsyncSession, email: str, purpose: OTPPurpose) -> str:
    """Fetch the most recently created, unused OTP for a user."""
    result = await db.execute(
        select(OTPCode)
        .join(User, User.id == OTPCode.user_id)
        .where(
            User.email == email,
            OTPCode.purpose == purpose,
            OTPCode.is_used.is_(False),
        )
        .order_by(OTPCode.created_at.desc())
    )
    otp = result.scalars().first()
    assert otp is not None, f"No pending OTP found for {email!r}"
    return otp.code


async def _register_and_verify(client: AsyncClient, db: AsyncSession, email: str = "ama@uni.test") -> dict:
    """Register a fresh student and verify their OTP. Returns the token pair."""
    payload = student_payload(email=email)
    r = await client.post(f"{BASE}/register", json=payload)
    assert r.status_code == 201, r.text

    code = await _get_latest_otp(db, email, OTPPurpose.EMAIL_VERIFY)
    r = await client.post(f"{BASE}/verify-otp", json={
        "email": email, "code": code, "purpose": "email_verify"
    })
    assert r.status_code == 200, r.text
    return r.json()


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

async def test_register_returns_201_and_user_id(client: AsyncClient) -> None:
    r = await client.post(f"{BASE}/register", json=student_payload())
    assert r.status_code == 201
    body = r.json()
    assert "user_id" in body
    assert body["message"] == "Account created. Verification code sent."


async def test_register_creates_unverified_user(client: AsyncClient, db_session: AsyncSession) -> None:
    await client.post(f"{BASE}/register", json=student_payload())
    result = await db_session.execute(select(User).where(User.email == "ama@uni.test"))
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.is_verified is False
    assert user.is_active is True


async def test_register_creates_otp(client: AsyncClient, db_session: AsyncSession) -> None:
    await client.post(f"{BASE}/register", json=student_payload())
    code = await _get_latest_otp(db_session, "ama@uni.test", OTPPurpose.EMAIL_VERIFY)
    assert len(code) == 6
    assert code.isdigit()


async def test_register_duplicate_email_returns_409(client: AsyncClient) -> None:
    await client.post(f"{BASE}/register", json=student_payload())
    r = await client.post(f"{BASE}/register", json=student_payload())
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "email_already_registered"


async def test_register_short_password_returns_422(client: AsyncClient) -> None:
    r = await client.post(f"{BASE}/register", json=student_payload(password="short"))
    assert r.status_code == 422


async def test_register_password_with_spaces_returns_422(client: AsyncClient) -> None:
    r = await client.post(f"{BASE}/register", json=student_payload(password="Secure Pass123!"))
    assert r.status_code == 422


async def test_register_password_no_uppercase_returns_422(client: AsyncClient) -> None:
    r = await client.post(f"{BASE}/register", json=student_payload(password="securepass123!"))
    assert r.status_code == 422


async def test_register_password_no_number_returns_422(client: AsyncClient) -> None:
    r = await client.post(f"{BASE}/register", json=student_payload(password="SecurePass!!!"))
    assert r.status_code == 422


async def test_register_password_no_special_char_returns_422(client: AsyncClient) -> None:
    r = await client.post(f"{BASE}/register", json=student_payload(password="SecurePass123"))
    assert r.status_code == 422


async def test_register_invalid_email_returns_422(client: AsyncClient) -> None:
    r = await client.post(f"{BASE}/register", json=student_payload(email="not-an-email"))
    assert r.status_code == 422


async def test_register_missing_full_name_returns_422(client: AsyncClient) -> None:
    payload = student_payload()
    del payload["full_name"]
    r = await client.post(f"{BASE}/register", json=payload)
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# OTP verification
# ---------------------------------------------------------------------------

async def test_verify_otp_returns_token_pair(client: AsyncClient, db_session: AsyncSession) -> None:
    tokens = await _register_and_verify(client, db_session)
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"


async def test_verify_otp_marks_user_verified(client: AsyncClient, db_session: AsyncSession) -> None:
    await _register_and_verify(client, db_session)
    result = await db_session.execute(select(User).where(User.email == "ama@uni.test"))
    user = result.scalar_one()
    assert user.is_verified is True


async def test_verify_otp_wrong_code_returns_400(client: AsyncClient) -> None:
    await client.post(f"{BASE}/register", json=student_payload())
    r = await client.post(f"{BASE}/verify-otp", json={
        "email": "ama@uni.test", "code": "000000", "purpose": "email_verify"
    })
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "invalid_otp"


async def test_verify_otp_unknown_email_returns_400(client: AsyncClient) -> None:
    r = await client.post(f"{BASE}/verify-otp", json={
        "email": "ghost@uni.test", "code": "123456", "purpose": "email_verify"
    })
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "invalid_otp"


# ---------------------------------------------------------------------------
# Resend OTP
# ---------------------------------------------------------------------------

async def test_resend_otp_always_returns_200(client: AsyncClient) -> None:
    """Should return 200 even if the email doesn't exist (anti-enumeration)."""
    r = await client.post(f"{BASE}/resend-otp", json={
        "email": "nobody@nowhere.test", "purpose": "email_verify"
    })
    assert r.status_code == 200


async def test_resend_otp_invalidates_old_code(client: AsyncClient, db_session: AsyncSession) -> None:
    await client.post(f"{BASE}/register", json=student_payload())
    old_code = await _get_latest_otp(db_session, "ama@uni.test", OTPPurpose.EMAIL_VERIFY)

    await client.post(f"{BASE}/resend-otp", json={"email": "ama@uni.test", "purpose": "email_verify"})

    # Old code should now be used/invalid.
    r = await client.post(f"{BASE}/verify-otp", json={
        "email": "ama@uni.test", "code": old_code, "purpose": "email_verify"
    })
    assert r.status_code == 400


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

async def test_login_before_verification_returns_403(client: AsyncClient) -> None:
    await client.post(f"{BASE}/register", json=student_payload())
    r = await client.post(f"{BASE}/login", json={
        "email": "ama@uni.test", "password": "SecurePass123!"
    })
    assert r.status_code == 403
    assert r.json()["error"]["code"] == "account_not_verified"


async def test_login_returns_token_pair(client: AsyncClient, db_session: AsyncSession) -> None:
    await _register_and_verify(client, db_session)
    r = await client.post(f"{BASE}/login", json={
        "email": "ama@uni.test", "password": "SecurePass123!"
    })
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert "refresh_token" in body


async def test_login_wrong_password_returns_401(client: AsyncClient, db_session: AsyncSession) -> None:
    await _register_and_verify(client, db_session)
    r = await client.post(f"{BASE}/login", json={
        "email": "ama@uni.test", "password": "WrongPassword!"
    })
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "invalid_credentials"


async def test_login_unknown_email_returns_401(client: AsyncClient) -> None:
    r = await client.post(f"{BASE}/login", json={
        "email": "ghost@uni.test", "password": "SomePassword1"
    })
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "invalid_credentials"


# ---------------------------------------------------------------------------
# Token refresh
# ---------------------------------------------------------------------------

async def test_refresh_returns_new_access_token(client: AsyncClient, db_session: AsyncSession) -> None:
    tokens = await _register_and_verify(client, db_session)
    r = await client.post(f"{BASE}/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert "refresh_token" not in body  # refresh endpoint returns access token only


async def test_refresh_with_access_token_returns_401(client: AsyncClient, db_session: AsyncSession) -> None:
    tokens = await _register_and_verify(client, db_session)
    r = await client.post(f"{BASE}/refresh", json={"refresh_token": tokens["access_token"]})
    assert r.status_code == 401


async def test_refresh_with_garbage_returns_401(client: AsyncClient) -> None:
    r = await client.post(f"{BASE}/refresh", json={"refresh_token": "not.a.jwt"})
    assert r.status_code == 401


# ---------------------------------------------------------------------------
# /me
# ---------------------------------------------------------------------------

async def test_me_returns_current_user(client: AsyncClient, db_session: AsyncSession) -> None:
    tokens = await _register_and_verify(client, db_session)
    r = await client.get(f"{BASE}/me", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == "ama@uni.test"
    assert body["full_name"] == "Ama Asante"
    assert body["is_verified"] is True
    assert body["role"] == "student"


async def test_me_without_token_returns_401(client: AsyncClient) -> None:
    r = await client.get(f"{BASE}/me")
    assert r.status_code == 401


async def test_me_with_garbage_token_returns_401(client: AsyncClient) -> None:
    r = await client.get(f"{BASE}/me", headers={"Authorization": "Bearer garbage"})
    assert r.status_code == 401
