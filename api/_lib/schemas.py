"""Request/response models."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

Locale = Literal["fr", "en", "ar"]


class Localized(BaseModel):
    fr: str = ""
    en: str = ""
    ar: str = ""

    def get(self, locale: str) -> str:
        return getattr(self, locale, "") or self.en or self.fr or self.ar


# --- auth -----------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


# --- contact --------------------------------------------------------------
class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(default="", max_length=200)
    message: str = Field(min_length=1, max_length=5000)
    locale: Locale = "en"
    company: str = Field(default="", max_length=160)
    # Honeypot: bots fill hidden fields, humans never see them.
    website: str = Field(default="", max_length=200)

    @field_validator("name", "subject", "message", "company")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()


# --- appointments ---------------------------------------------------------
class AppointmentRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    topic: str = Field(default="", max_length=200)
    notes: str = Field(default="", max_length=2000)
    slot_start: datetime
    duration_minutes: int = Field(default=30, ge=15, le=120)
    locale: Locale = "en"
    timezone: str = Field(default="Africa/Casablanca", max_length=64)
    website: str = Field(default="", max_length=200)


class AppointmentStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "declined", "completed"]
    admin_note: str = Field(default="", max_length=2000)
    notify: bool = True


# --- chat -----------------------------------------------------------------
class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    locale: Locale = "en"
    history: list[ChatTurn] = Field(default_factory=list, max_length=12)
    session_id: str = Field(default="", max_length=64)


class ChatSource(BaseModel):
    title: str
    kind: str
    score: float
    excerpt: str


class ChatCard(BaseModel):
    type: str  # "project" | "experience"
    title: str
    subtitle: str = ""
    year: str = ""
    slug: str = ""
    url: str = ""
    repo_url: str = ""
    tags: list[str] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    sources: list[ChatSource] = Field(default_factory=list)
    cards: list[ChatCard] = Field(default_factory=list)
    provider: str
    degraded: bool = False
    notice: str = ""


# --- analytics ------------------------------------------------------------
class TrackEvent(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    path: str = Field(default="", max_length=300)
    locale: str = Field(default="", max_length=8)
    referrer: str = Field(default="", max_length=400)
    meta: dict[str, Any] = Field(default_factory=dict)
    session_id: str = Field(default="", max_length=64)


# --- admin CRUD -----------------------------------------------------------
class ProjectPayload(BaseModel):
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9][a-z0-9-]*$")
    title: str = Field(min_length=1, max_length=160)
    tagline: Localized = Field(default_factory=Localized)
    summary: Localized = Field(default_factory=Localized)
    body: Localized = Field(default_factory=Localized)
    role: Localized = Field(default_factory=Localized)
    year: str = Field(default="", max_length=20)
    category: str = Field(default="data-engineering", max_length=60)
    stack: list[str] = Field(default_factory=list)
    highlights: list[Localized] = Field(default_factory=list)
    metrics: list[dict[str, str]] = Field(default_factory=list)
    repo_url: str = Field(default="", max_length=400)
    live_url: str = Field(default="", max_length=400)
    featured: bool = False
    published: bool = True
    order: int = 0


class ExperiencePayload(BaseModel):
    company: str = Field(min_length=1, max_length=120)
    role: Localized = Field(default_factory=Localized)
    location: str = Field(default="", max_length=120)
    period: Localized = Field(default_factory=Localized)
    start: str = Field(default="", max_length=20)
    end: str = Field(default="", max_length=20)
    bullets: list[Localized] = Field(default_factory=list)
    stack: list[str] = Field(default_factory=list)
    kind: Literal["work", "education"] = "work"
    order: int = 0


class SkillGroupPayload(BaseModel):
    key: str = Field(min_length=1, max_length=60)
    label: Localized = Field(default_factory=Localized)
    items: list[str] = Field(default_factory=list)
    order: int = 0


class AwardPayload(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    issuer: str = Field(default="", max_length=160)
    year: str = Field(default="", max_length=20)
    rank: str = Field(default="", max_length=60)
    kind: Literal["award", "certification"] = "award"
    url: str = Field(default="", max_length=400)
    order: int = 0


class LinkPayload(BaseModel):
    label: str = Field(min_length=1, max_length=80)
    url: str = Field(min_length=1, max_length=500)
    icon: str = Field(default="link", max_length=40)
    description: str = Field(default="", max_length=200)
    primary: bool = False
    order: int = 0


class ProfilePayload(BaseModel):
    name: str = Field(default="", max_length=120)
    headline: Localized = Field(default_factory=Localized)
    bio: Localized = Field(default_factory=Localized)
    long_bio: Localized = Field(default_factory=Localized)
    location: str = Field(default="", max_length=120)
    email: str = Field(default="", max_length=200)
    phone: str = Field(default="", max_length=40)
    photo_url: str = Field(default="", max_length=600)
    cv_url_fr: str = Field(default="", max_length=600)
    cv_url_en: str = Field(default="", max_length=600)
    available: bool = True
    availability_note: Localized = Field(default_factory=Localized)


class KbDocPayload(BaseModel):
    chunk_id: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=200)
    kind: str = Field(default="note", max_length=40)
    text: str = Field(min_length=1, max_length=8000)
    locale: str = Field(default="all", max_length=8)
