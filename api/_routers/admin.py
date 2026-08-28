"""Admin API. Every route below the login endpoint requires a valid bearer token."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from pydantic import BaseModel

from _lib import content as C
from _lib import mailer
from _lib.auth import create_access_token, require_admin, verify_admin_credentials
from _lib.config import settings
from _lib.db import ensure_indexes, get_db, serialize, serialize_many
from _lib.schemas import (
    AppointmentStatusUpdate,
    AwardPayload,
    ExperiencePayload,
    KbDocPayload,
    LinkPayload,
    LoginRequest,
    ProfilePayload,
    ProjectPayload,
    SkillGroupPayload,
    TokenResponse,
)

router = APIRouter(prefix="/api/admin")
guarded = APIRouter(prefix="/api/admin", dependencies=[Depends(require_admin)])


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Malformed id")


# --- auth -----------------------------------------------------------------
@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    if not verify_admin_credentials(str(payload.email), payload.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token, expires_in = create_access_token(str(payload.email).lower())
    return TokenResponse(access_token=token, expires_in=expires_in)


@guarded.get("/me")
async def me(admin: dict = Depends(require_admin)) -> dict:
    return {"email": admin.get("sub"), "role": admin.get("role")}


# --- dashboard ------------------------------------------------------------
@guarded.get("/stats")
async def stats() -> dict:
    db = get_db()
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    async def _count(collection: str, query: dict) -> int:
        try:
            return await db[collection].count_documents(query)
        except Exception:
            return 0

    try:
        recent = await db.analytics_events.find(
            {"created_at": {"$gte": week_ago}}, {"_id": 0, "name": 1, "created_at": 1, "path": 1}
        ).to_list(length=5000)
    except Exception:
        recent = []

    by_day: dict[str, int] = {}
    for offset in range(7, -1, -1):
        key = (now - timedelta(days=offset)).strftime("%Y-%m-%d")
        by_day[key] = 0
    page_views = 0
    chat_messages = 0
    top_paths: dict[str, int] = {}
    for event in recent:
        stamp = event.get("created_at")
        if isinstance(stamp, datetime):
            key = stamp.strftime("%Y-%m-%d")
            if key in by_day:
                by_day[key] += 1
        if event.get("name") == "page_view":
            page_views += 1
            path = event.get("path") or "/"
            top_paths[path] = top_paths.get(path, 0) + 1
        elif event.get("name") == "chat_message":
            chat_messages += 1

    return {
        "messages_total": await _count("messages", {}),
        "messages_unread": await _count("messages", {"read": False}),
        "appointments_total": await _count("appointments", {}),
        "appointments_pending": await _count("appointments", {"status": "pending"}),
        "appointments_upcoming": await _count(
            "appointments", {"slot_start": {"$gte": now}, "status": "confirmed"}
        ),
        "projects_total": await _count("projects", {}),
        "projects_published": await _count("projects", {"published": True}),
        "notifications_unread": await _count("notifications", {"read": False}),
        "page_views_7d": page_views,
        "chat_messages_7d": chat_messages,
        "events_by_day": [{"date": k, "count": v} for k, v in by_day.items()],
        "top_paths": sorted(
            [{"path": k, "count": v} for k, v in top_paths.items()],
            key=lambda item: item["count"], reverse=True,
        )[:8],
        "health": {
            "db": True,
            "smtp": settings.has_smtp,
            "gemini": settings.has_gemini,
            "llm_fallback": settings.has_llm_fallback,
        },
    }


@guarded.get("/analytics")
async def analytics(days: int = Query(30, ge=1, le=180)) -> dict:
    db = get_db()
    since = datetime.now(timezone.utc) - timedelta(days=days)
    try:
        events = await db.analytics_events.find(
            {"created_at": {"$gte": since}}, {"_id": 0}
        ).sort([("created_at", -1)]).to_list(length=4000)
    except Exception:
        events = []

    locales: dict[str, int] = {}
    names: dict[str, int] = {}
    visitors: set[str] = set()
    questions: list[dict] = []
    for event in events:
        locales[event.get("locale") or "?"] = locales.get(event.get("locale") or "?", 0) + 1
        names[event.get("name")] = names.get(event.get("name"), 0) + 1
        if event.get("visitor"):
            visitors.add(event["visitor"])
        if event.get("name") == "chat_message":
            meta = event.get("meta") or {}
            questions.append({
                "question": meta.get("question", ""),
                "provider": meta.get("provider", ""),
                "degraded": meta.get("degraded", False),
                "created_at": event.get("created_at").isoformat()
                if isinstance(event.get("created_at"), datetime) else "",
            })

    return {
        "range_days": days,
        "total_events": len(events),
        "unique_visitors": len(visitors),
        "by_locale": [{"locale": k, "count": v} for k, v in sorted(
            locales.items(), key=lambda i: i[1], reverse=True)],
        "by_event": [{"name": k, "count": v} for k, v in sorted(
            names.items(), key=lambda i: i[1], reverse=True)],
        "recent_questions": questions[:40],
    }


# --- notifications --------------------------------------------------------
@guarded.get("/notifications")
async def list_notifications(limit: int = Query(30, ge=1, le=100)) -> dict:
    try:
        docs = await get_db().notifications.find({}).sort(
            [("created_at", -1)]).to_list(length=limit)
        return {"items": serialize_many(docs)}
    except Exception:
        return {"items": []}


@guarded.post("/notifications/read-all")
async def mark_notifications_read() -> dict:
    result = await get_db().notifications.update_many({"read": False}, {"$set": {"read": True}})
    return {"ok": True, "updated": result.modified_count}


@guarded.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str) -> dict:
    await get_db().notifications.delete_one({"_id": _oid(notification_id)})
    return {"ok": True}


# --- messages -------------------------------------------------------------
@guarded.get("/messages")
async def list_messages(archived: bool = False,
                        limit: int = Query(100, ge=1, le=300)) -> dict:
    docs = await get_db().messages.find({"archived": archived}).sort(
        [("created_at", -1)]).to_list(length=limit)
    return {"items": serialize_many(docs)}


@guarded.patch("/messages/{message_id}")
async def update_message(message_id: str, patch: dict[str, Any]) -> dict:
    allowed = {k: v for k, v in patch.items() if k in {"read", "archived", "replied"}}
    if not allowed:
        raise HTTPException(status_code=400, detail="Nothing to update")
    await get_db().messages.update_one({"_id": _oid(message_id)}, {"$set": allowed})
    doc = await get_db().messages.find_one({"_id": _oid(message_id)})
    return {"ok": True, "item": serialize(doc)}


@guarded.post("/messages/{message_id}/reply")
async def reply_to_message(message_id: str, payload: dict[str, Any],
                           background: BackgroundTasks) -> dict:
    body = (payload.get("body") or "").strip()
    if not body:
        raise HTTPException(status_code=400, detail="Reply body is empty")
    db = get_db()
    doc = await db.messages.find_one({"_id": _oid(message_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Message not found")

    subject = payload.get("subject") or f"Re: {doc.get('subject', '')}".strip()
    html = mailer._shell(
        title=subject, kicker="Othmane Sadiki · Reply",
        rows=[], body_html=body.replace("\n", "<br>"),
        cta=("View portfolio", settings.site_url),
    )
    background.add_task(mailer.send_email, [doc.get("email", "")], subject, html, body)
    await db.messages.update_one(
        {"_id": _oid(message_id)},
        {"$set": {"replied": True, "read": True,
                  "reply_body": body, "replied_at": datetime.now(timezone.utc)}},
    )
    return {"ok": True}


@guarded.delete("/messages/{message_id}")
async def delete_message(message_id: str) -> dict:
    await get_db().messages.delete_one({"_id": _oid(message_id)})
    return {"ok": True}


# --- appointments ---------------------------------------------------------
@guarded.get("/appointments")
async def list_appointments(status: str = "", limit: int = Query(100, ge=1, le=300)) -> dict:
    query = {"status": status} if status else {}
    docs = await get_db().appointments.find(query).sort(
        [("slot_start", 1)]).to_list(length=limit)
    return {"items": serialize_many(docs)}


@guarded.patch("/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, payload: AppointmentStatusUpdate,
                             background: BackgroundTasks) -> dict:
    db = get_db()
    doc = await db.appointments.find_one({"_id": _oid(appointment_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Appointment not found")

    await db.appointments.update_one(
        {"_id": _oid(appointment_id)},
        {"$set": {"status": payload.status, "admin_note": payload.admin_note,
                  "updated_at": datetime.now(timezone.utc)}},
    )
    if payload.notify:
        background.add_task(mailer.send_appointment_decision, doc,
                            payload.status, payload.admin_note)
    updated = await db.appointments.find_one({"_id": _oid(appointment_id)})
    return {"ok": True, "item": serialize(updated)}


@guarded.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str) -> dict:
    await get_db().appointments.delete_one({"_id": _oid(appointment_id)})
    return {"ok": True}


# --- generic content CRUD -------------------------------------------------
def _crud(collection: str, model: type[BaseModel]) -> None:
    """Register list/create/update/delete for a content collection.

    The payload annotations are attached *after* the functions are defined and
    the routes registered explicitly, rather than written into the signatures.

    This module uses `from __future__ import annotations`, which turns every
    signature annotation into a string. A signature written `payload: model`
    therefore reaches FastAPI as the literal string "model", which it cannot
    resolve to a Pydantic class in the module globals — `model` is a local of
    this factory. FastAPI does not raise for that; it silently falls back to
    treating the parameter as a *query* argument, so every create and update
    rejects a perfectly valid JSON body with "field required". Assigning the
    real class object to __annotations__ before registration avoids the whole
    string-resolution path.
    """

    async def _list() -> dict:
        docs = await get_db()[collection].find({}).sort([("order", 1)]).to_list(length=300)
        return {"items": serialize_many(docs)}

    async def _create(payload):
        doc = payload.model_dump()
        doc["created_at"] = datetime.now(timezone.utc)
        result = await get_db()[collection].insert_one(doc)
        created = await get_db()[collection].find_one({"_id": result.inserted_id})
        return {"ok": True, "item": serialize(created)}

    async def _update(item_id, payload):
        doc = payload.model_dump()
        doc["updated_at"] = datetime.now(timezone.utc)
        result = await get_db()[collection].update_one({"_id": _oid(item_id)}, {"$set": doc})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        updated = await get_db()[collection].find_one({"_id": _oid(item_id)})
        return {"ok": True, "item": serialize(updated)}

    async def _delete(item_id):
        result = await get_db()[collection].delete_one({"_id": _oid(item_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        return {"ok": True}

    _create.__annotations__ = {"payload": model, "return": dict}
    _update.__annotations__ = {"item_id": str, "payload": model, "return": dict}
    _delete.__annotations__ = {"item_id": str, "return": dict}

    guarded.get(f"/{collection}", name=f"list_{collection}")(_list)
    guarded.post(f"/{collection}", name=f"create_{collection}")(_create)
    guarded.put(f"/{collection}/{{item_id}}", name=f"update_{collection}")(_update)
    guarded.delete(f"/{collection}/{{item_id}}", name=f"delete_{collection}")(_delete)


_crud("projects", ProjectPayload)
_crud("experiences", ExperiencePayload)
_crud("skills", SkillGroupPayload)
_crud("awards", AwardPayload)
_crud("links", LinkPayload)


# --- profile --------------------------------------------------------------
@guarded.get("/profile")
async def get_profile() -> dict:
    doc = await get_db().profile.find_one({"key": "main"}, {"_id": 0, "key": 0})
    return {"item": doc or C.PROFILE}


@guarded.put("/profile")
async def update_profile(payload: ProfilePayload) -> dict:
    doc = payload.model_dump()
    doc["updated_at"] = datetime.now(timezone.utc)
    await get_db().profile.update_one({"key": "main"}, {"$set": doc}, upsert=True)
    return {"ok": True, "item": doc}


# --- knowledge base -------------------------------------------------------
@guarded.get("/kb")
async def list_kb() -> dict:
    from _lib.rag import build_base_kb

    base = [{**c, "source": "content"} for c in build_base_kb()]
    try:
        custom = await get_db().kb_chunks.find({}).to_list(length=300)
    except Exception:
        custom = []
    return {
        "base": base,
        "custom": [{**(serialize(d) or {}), "source": "custom"} for d in custom],
    }


@guarded.post("/kb")
async def upsert_kb(payload: KbDocPayload) -> dict:
    doc = payload.model_dump()
    doc["updated_at"] = datetime.now(timezone.utc)
    await get_db().kb_chunks.update_one(
        {"chunk_id": payload.chunk_id}, {"$set": doc}, upsert=True
    )
    return {"ok": True}


@guarded.delete("/kb/{chunk_id}")
async def delete_kb(chunk_id: str) -> dict:
    await get_db().kb_chunks.delete_one({"chunk_id": chunk_id})
    return {"ok": True}


# --- maintenance ----------------------------------------------------------
@guarded.post("/seed")
async def reseed(force: bool = False) -> dict:
    """Populate empty collections from content.py. `force=true` overwrites."""
    from _lib.seed import run_seed

    report = await run_seed(force=force)
    await ensure_indexes()
    return {"ok": True, "report": report}
