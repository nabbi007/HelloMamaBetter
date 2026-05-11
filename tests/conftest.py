"""
Async test fixtures.

Strategy:
- Engine points at TEST_DATABASE_URL (the db_test container, port 5435).
- Tables are created once per session and dropped after (fast — DDL only runs once).
- Each test gets a fresh AsyncSession from the pool.
- After every test, all tables are truncated so each test starts with a clean DB.
  This is simpler and more reliable with asyncpg than the shared-connection
  savepoint approach (which breaks when the app's router calls commit()).
"""
from __future__ import annotations

import os
from typing import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# All credentials must come from the environment (.env.test loaded by pytest.ini).
_TEST_DB_URL = os.environ.get("TEST_DATABASE_URL") or os.environ.get("DATABASE_URL")
if not _TEST_DB_URL:
    raise RuntimeError(
        "TEST_DATABASE_URL is not set. Copy .env.test (see .env.example) and "
        "make sure 'docker compose up -d db_test' is running on port 5435."
    )

import app.models  # noqa: E402 — registers all model metadata on Base before create_all
from app.database import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.base import Base  # noqa: E402

_engine = create_async_engine(_TEST_DB_URL, echo=False)
_TestSessionLocal = async_sessionmaker(_engine, expire_on_commit=False, autoflush=False)

# Truncation order: most-dependent tables first, so FK constraints don't block.
_TRUNCATE_ORDER = [
    "chat_messages",
    "chat_sessions",
    "order_items",
    "payments",
    "orders",
    "otp_codes",
    "user_profiles",
    "appointments",
    "health_logs",
    "reminders",
    "content_articles",
    "users",
    "products",
]


# --- Schema lifecycle (once per session) ------------------------------------

@pytest_asyncio.fixture(scope="session", autouse=True)
async def _create_tables():
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await _engine.dispose()


# --- Per-test cleanup -------------------------------------------------------

@pytest_asyncio.fixture(autouse=True)
async def _clean_db():
    """Truncate every table after each test so tests are fully isolated."""
    yield
    async with _engine.begin() as conn:
        tables = ", ".join(f'"{t}"' for t in _TRUNCATE_ORDER)
        await conn.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))


# --- Session + client fixtures ----------------------------------------------

@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Fresh session per test — commits work normally against the test DB."""
    async with _TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """AsyncClient with the DB dependency overridden to the per-test session."""

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c
    app.dependency_overrides.clear()


# --- Shared test data -------------------------------------------------------

def student_payload(**overrides) -> dict:
    base = {
        "email": "ama@uni.test",
        "password": "SecurePass123!",
        "full_name": "Ama Asante",
        "university": "University of Ghana",
    }
    base.update(overrides)
    return base
