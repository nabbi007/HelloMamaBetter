"""Startup/shutdown hooks for the FastAPI app."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import engine

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("app.startup")
    try:
        yield
    finally:
        logger.info("app.shutdown")
        await engine.dispose()
