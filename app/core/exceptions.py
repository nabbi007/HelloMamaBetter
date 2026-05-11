"""Domain exceptions + global handlers.

Error responses are JSON objects of the form:
    {"error": {"code": "<machine_code>", "message": "<human-readable>"}}

Never include PII (email, name, phone) in `message`.
"""
from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base for all domain exceptions."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    code: str = "app_error"
    message: str = "Application error."

    def __init__(self, message: str | None = None, *, code: str | None = None) -> None:
        if message:
            self.message = message
        if code:
            self.code = code
        super().__init__(self.message)


class InvalidCredentials(AppException):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "invalid_credentials"
    message = "Invalid email or password."


class NotAuthenticated(AppException):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "not_authenticated"
    message = "Authentication required."


class AccountNotVerified(AppException):
    status_code = status.HTTP_403_FORBIDDEN
    code = "account_not_verified"
    message = "Account not verified. Please verify your email or phone."


class AccountInactive(AppException):
    status_code = status.HTTP_403_FORBIDDEN
    code = "account_inactive"
    message = "Account is inactive."


class PermissionDenied(AppException):
    status_code = status.HTTP_403_FORBIDDEN
    code = "permission_denied"
    message = "You do not have permission to perform this action."


class ResourceNotFound(AppException):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"
    message = "Resource not found."


class Conflict(AppException):
    status_code = status.HTTP_409_CONFLICT
    code = "conflict"
    message = "Conflict with current state."


class EmailAlreadyRegistered(Conflict):
    code = "email_already_registered"
    message = "An account with this contact already exists."


class InvalidOTP(AppException):
    status_code = status.HTTP_400_BAD_REQUEST
    code = "invalid_otp"
    message = "Invalid or expired verification code."


class InvalidToken(AppException):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "invalid_token"
    message = "Invalid or expired token."


# --- Response helpers -------------------------------------------------------

def _error_response(status_code: int, code: str, message: str, **extra: Any) -> JSONResponse:
    body: dict[str, Any] = {"error": {"code": code, "message": message}}
    if extra:
        body["error"].update(extra)
    return JSONResponse(status_code=status_code, content=body)


# --- Handlers ---------------------------------------------------------------

async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
    return _error_response(exc.status_code, exc.code, exc.message)


async def http_exception_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    # Map a couple of common HTTP statuses to stable machine codes.
    code_map = {
        401: "not_authenticated",
        403: "permission_denied",
        404: "not_found",
        405: "method_not_allowed",
        429: "rate_limited",
    }
    code = code_map.get(exc.status_code, "http_error")
    message = exc.detail if isinstance(exc.detail, str) else "Request failed."
    return _error_response(exc.status_code, code, message)


async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    # Strip the input echo — Pydantic includes the raw bad value, which can be PII.
    errors = [
        {"loc": list(err.get("loc", [])), "msg": err.get("msg", ""), "type": err.get("type", "")}
        for err in exc.errors()
    ]
    return _error_response(
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "validation_error",
        "Request payload failed validation.",
        details=errors,
    )


async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_exception", extra={"exc_type": type(exc).__name__})
    return _error_response(
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        "internal_error",
        "An unexpected error occurred.",
    )


def install_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
