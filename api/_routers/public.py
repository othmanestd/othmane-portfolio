"""Public read endpoints.

Everything here degrades to the canonical content module when Mongo is empty or
unreachable, so the site renders even during a database incident.
"""
from __future__ import annotations

import asyncio
import hashlib
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Request, Response

from _lib import content as C
from _lib.db import db_healthy, get_db, serialize_many
from _lib.schemas import TrackEvent

router = APIRouter()

_PUBLIC_PROJECT_FIELDS = {"_id": 0}

# In-process cache of the aggregated content payload. Warm invocations return it
# without touching the database at all; admin edits surface within the TTL.
_CONTENT_TTL = 30.0
_content_cache: dict | None = None
_content_cache_at = 0.0


def _bundled_content() -> dict:
    """The canonical, always-available payload built from the content module."""
    experiences = C.EXPERIENCES
    awards = C.AWARDS + C.CERTIFICATIONS
    return {
        "profile": C.PROFILE,
        "projects": [p for p in C.PROJECTS if p.get("published", True)],
        "experiences": [e for e in experiences if e.get("kind") != "education"],
        "education": [e for e in experiences if e.get("kind") == "education"],
        "skills": C.SKILLS,
        "awards": [a for a in awards if a.get("kind") != "certification"],
        "certifications": [a for a in awards if a.get("kind") == "certification"],
        "links": C.LINKS,
        "meta": {
            "github": C.GITHUB_URL,
            "linkedin": C.LINKEDIN_URL,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": "bundled",
        },
    }


async def _fetch(name: str, fallback: list[dict], *, query: dict | None = None,
                 sort: list | None = None) -> list[dict]:
    try:
        cursor = get_db()[name].find(query or {}, _PUBLIC_PROJECT_FIELDS)
        if sort:
            cursor = cursor.sort(sort)
        docs = await cursor.to_list(length=500)
        return docs if docs else fallback
    except Exception:
        return fallback


async def _assemble_content() -> dict:
    # One breaker check gates the whole request. When the database is down this
    # returns immediately instead of paying a timeout per collection.
    if not await db_healthy():
        return _bundled_content()

    async def _profile() -> dict:
        try:
            doc = await get_db().profile.find_one({"key": "main"}, _PUBLIC_PROJECT_FIELDS)
            if doc:
                doc.pop("key", None)
                return doc
        except Exception:
            pass
        return C.PROFILE

    # Fan the reads out concurrently — one round-trip window, not six in series.
    profile, projects, experiences, skills, awards, links = await asyncio.gather(
        _profile(),
        _fetch("projects", C.PROJECTS, query={"published": True}, sort=[("order", 1)]),
        _fetch("experiences", C.EXPERIENCES, sort=[("order", 1)]),
        _fetch("skills", C.SKILLS, sort=[("order", 1)]),
        _fetch("awards", C.AWARDS + C.CERTIFICATIONS, sort=[("order", 1)]),
        _fetch("links", C.LINKS, sort=[("order", 1)]),
    )

    return {
        "profile": profile,
        "projects": projects,
        "experiences": [e for e in experiences if e.get("kind") != "education"],
        "education": [e for e in experiences if e.get("kind") == "education"],
        "skills": skills,
        "awards": [a for a in awards if a.get("kind") != "certification"],
        "certifications": [a for a in awards if a.get("kind") == "certification"],
        "links": links,
        "meta": {
            "github": C.GITHUB_URL,
            "linkedin": C.LINKEDIN_URL,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": "db",
        },
    }


@router.get("/api/content")
async def get_content(response: Response) -> dict:
    """One aggregated payload — the site boots from a single request."""
    global _content_cache, _content_cache_at
    now = time.monotonic()
    if _content_cache is not None and now - _content_cache_at < _CONTENT_TTL:
        response.headers["X-Content-Cache"] = "hit"
        return _content_cache

    payload = await _assemble_content()
    _content_cache = payload
    _content_cache_at = now
    response.headers["X-Content-Cache"] = "miss"
    # Let the CDN and browser serve it for a short window too.
    response.headers["Cache-Control"] = "public, max-age=30, stale-while-revalidate=120"
    return payload


@router.get("/api/projects")
async def list_projects() -> dict:
    if not await db_healthy():
        return {"items": [p for p in C.PROJECTS if p.get("published", True)]}
    projects = await _fetch(
        "projects", C.PROJECTS, query={"published": True}, sort=[("order", 1)]
    )
    return {"items": projects}


@router.get("/api/projects/{slug}")
async def get_project(slug: str) -> dict:
    doc = None
    if await db_healthy():
        try:
            doc = await get_db().projects.find_one(
                {"slug": slug, "published": True}, _PUBLIC_PROJECT_FIELDS
            )
        except Exception:
            doc = None
    if not doc:
        doc = next((p for p in C.PROJECTS if p["slug"] == slug), None)
    if not doc:
        return {"item": None, "found": False}
    return {"item": doc, "found": True}


@router.get("/api/card/vcard")
async def vcard() -> Response:
    """vCard 3.0 for the NFC tag — imports cleanly on iOS and Android."""
    profile = C.PROFILE
    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Sadiki;Othmane;;;",
        f"FN:{profile['name']}",
        "TITLE:Data Engineer",
        "ORG:Data Engineering",
        f"EMAIL;type=INTERNET;type=WORK:{profile['email']}",
        f"TEL;type=CELL:{profile['phone']}",
        f"ADR;type=WORK:;;;{profile['location']};;;Morocco",
        f"URL:{C.LINKEDIN_URL}",
        f"X-SOCIALPROFILE;type=linkedin:{C.LINKEDIN_URL}",
        f"X-SOCIALPROFILE;type=github:{C.GITHUB_URL}",
        f"NOTE:{profile['headline']['en']}",
        f"REV:{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}",
        "END:VCARD",
    ]
    body = "\r\n".join(lines) + "\r\n"
    return Response(
        content=body,
        media_type="text/vcard; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="othmane-sadiki.vcf"',
            "Cache-Control": "public, max-age=3600",
        },
    )


@router.post("/api/track")
async def track(event: TrackEvent, request: Request) -> dict:
    """Lightweight first-party analytics. IPs are hashed, never stored raw."""
    client_host = request.client.host if request.client else ""
    visitor = hashlib.sha256(
        f"{client_host}|{request.headers.get('user-agent', '')}".encode()
    ).hexdigest()[:16]
    if not await db_healthy():
        return {"ok": False}
    try:
        await get_db().analytics_events.insert_one({
            "name": event.name,
            "path": event.path[:300],
            "locale": event.locale[:8],
            "referrer": event.referrer[:400],
            "meta": event.meta,
            "session_id": event.session_id[:64],
            "visitor": visitor,
            "created_at": datetime.now(timezone.utc),
        })
    except Exception:
        # Analytics must never break a page view.
        return {"ok": False}
    return {"ok": True}
