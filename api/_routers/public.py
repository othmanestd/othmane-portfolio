"""Public read endpoints.

Everything here degrades to the canonical content module when Mongo is empty or
unreachable, so the site renders even during a database incident.
"""
from __future__ import annotations

import hashlib
from datetime import datetime, timezone

from fastapi import APIRouter, Request, Response

from _lib import content as C
from _lib.db import get_db, serialize_many
from _lib.schemas import TrackEvent

router = APIRouter()

_PUBLIC_PROJECT_FIELDS = {"_id": 0}


async def _collection(name: str, fallback: list[dict], *, query: dict | None = None,
                      sort: list | None = None) -> list[dict]:
    try:
        cursor = get_db()[name].find(query or {}, _PUBLIC_PROJECT_FIELDS)
        if sort:
            cursor = cursor.sort(sort)
        docs = await cursor.to_list(length=500)
        return docs if docs else fallback
    except Exception:
        return fallback


@router.get("/api/content")
async def get_content() -> dict:
    """One aggregated payload — the site boots from a single request."""
    try:
        db = get_db()
        profile = await db.profile.find_one({"key": "main"}, _PUBLIC_PROJECT_FIELDS)
    except Exception:
        profile = None

    projects = await _collection(
        "projects", C.PROJECTS, query={"published": True}, sort=[("order", 1)]
    )
    experiences = await _collection("experiences", C.EXPERIENCES, sort=[("order", 1)])
    skills = await _collection("skills", C.SKILLS, sort=[("order", 1)])
    awards = await _collection("awards", C.AWARDS + C.CERTIFICATIONS, sort=[("order", 1)])
    links = await _collection("links", C.LINKS, sort=[("order", 1)])

    if profile:
        profile.pop("key", None)
    else:
        profile = C.PROFILE

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
        },
    }


@router.get("/api/projects")
async def list_projects() -> dict:
    projects = await _collection(
        "projects", C.PROJECTS, query={"published": True}, sort=[("order", 1)]
    )
    return {"items": projects}


@router.get("/api/projects/{slug}")
async def get_project(slug: str) -> dict:
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
