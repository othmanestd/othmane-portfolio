"""Admin authentication: PBKDF2 password hashing + JWT bearer tokens.

PBKDF2-HMAC-SHA256 from the standard library is used deliberately — bcrypt/argon2
need native wheels that inflate the serverless bundle for a single-user admin.
"""
from __future__ import annotations

import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from _lib.config import settings

_ITERATIONS = 240_000
_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str, *, salt: bytes | None = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _ITERATIONS)
    return f"pbkdf2_sha256${_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = encoded.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        expected = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt_hex), int(iterations)
        )
        return hmac.compare_digest(expected.hex(), digest_hex)
    except Exception:
        return False


def verify_admin_credentials(email: str, password: str) -> bool:
    """Constant-time check against the credentials held in the environment."""
    if not settings.admin_email or not settings.admin_password:
        return False
    email_ok = hmac.compare_digest(email.strip().lower(), settings.admin_email)
    password_ok = hmac.compare_digest(password, settings.admin_password)
    return email_ok and password_ok


def create_access_token(subject: str) -> tuple[str, int]:
    expires_in = settings.jwt_ttl_hours * 3600
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "role": "admin",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=expires_in)).timestamp()),
        "jti": secrets.token_hex(8),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, expires_in


async def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Insufficient privileges")
    return payload
