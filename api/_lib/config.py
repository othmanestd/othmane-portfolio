"""Runtime configuration.

Reads from the process environment. In local development we additionally parse a
`.env` file at the repo root, so no extra dependency (python-dotenv) is needed.
On Vercel the variables are injected by the platform and the file is absent.
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path


def _load_dotenv() -> None:
    root = Path(__file__).resolve().parents[2]
    env_file = root / ".env"
    if not env_file.exists():
        return
    for raw in env_file.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        # Never let a .env file override a real platform variable.
        os.environ.setdefault(key, value)


_load_dotenv()


def _env(key: str, default: str = "") -> str:
    return (os.environ.get(key) or default).strip()


class Settings:
    """Immutable view over the environment."""

    def __init__(self) -> None:
        self.mongodb_uri: str = _env("MONGODB_URI")
        self.mongodb_db: str = _env("MONGODB_DB", "othmane_portfolio")

        self.jwt_secret: str = _env("JWT_SECRET", "insecure-dev-secret")
        self.jwt_algorithm: str = "HS256"
        self.jwt_ttl_hours: int = int(_env("JWT_TTL_HOURS", "12") or 12)

        self.admin_email: str = _env("ADMIN_EMAIL").lower()
        self.admin_password: str = _env("ADMIN_PASSWORD")
        self.owner_email: str = _env("OWNER_EMAIL") or self.admin_email

        self.gemini_api_key: str = _env("GEMINI_API_KEY")
        self.gemini_chat_model: str = _env("GEMINI_CHAT_MODEL", "gemini-3.5-flash")
        self.gemini_embed_model: str = _env("GEMINI_EMBED_MODEL", "gemini-embedding-001")

        # Any OpenAI-compatible endpoint: Groq, OpenRouter, Together, OpenAI...
        self.llm_fallback_base_url: str = _env("LLM_FALLBACK_BASE_URL").rstrip("/")
        self.llm_fallback_api_key: str = _env("LLM_FALLBACK_API_KEY")
        self.llm_fallback_model: str = _env("LLM_FALLBACK_MODEL")

        self.smtp_host: str = _env("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port: int = int(_env("SMTP_PORT", "587") or 587)
        self.smtp_user: str = _env("SMTP_USER")
        self.smtp_password: str = _env("SMTP_PASSWORD")

        self.site_url: str = _env("SITE_URL", "http://localhost:5173").rstrip("/")

    # -- capability flags -------------------------------------------------
    @property
    def has_db(self) -> bool:
        return bool(self.mongodb_uri)

    @property
    def has_smtp(self) -> bool:
        return bool(self.smtp_host and self.smtp_user and self.smtp_password)

    @property
    def has_gemini(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def has_llm_fallback(self) -> bool:
        return bool(self.llm_fallback_base_url and self.llm_fallback_api_key and self.llm_fallback_model)

    @property
    def has_any_llm(self) -> bool:
        return self.has_gemini or self.has_llm_fallback


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
