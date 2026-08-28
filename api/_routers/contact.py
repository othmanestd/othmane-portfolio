"""Contact form and appointment booking."""
from __future__ import annotations

import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request

from _lib import mailer
from _lib.config import settings
from _lib.db import get_db
from _lib.schemas import AppointmentRequest, ContactRequest

router = APIRouter()

_WINDOW_SECONDS = 3600
_MAX_PER_WINDOW = 6
_hits: dict[str, deque[float]] = defaultdict(deque)

# Booking window: weekdays, 09:00–17:00 UTC, 30-minute slots.
_SLOT_MINUTES = 30
_DAY_START_HOUR = 9
_DAY_END_HOUR = 17
_LOOKAHEAD_DAYS = 21


def _rate_limited(key: str) -> bool:
    now = time.time()
    bucket = _hits[key]
    while bucket and now - bucket[0] > _WINDOW_SECONDS:
        bucket.popleft()
    if len(bucket) >= _MAX_PER_WINDOW:
        return True
    bucket.append(now)
    return False


async def _notify(kind: str, title: str, body: str, ref: str = "") -> None:
    try:
        await get_db().notifications.insert_one({
            "kind": kind,
            "title": title,
            "body": body[:400],
            "ref": ref,
            "read": False,
            "created_at": datetime.now(timezone.utc),
        })
    except Exception:
        pass


@router.post("/api/contact")
async def submit_contact(payload: ContactRequest, request: Request,
                         background: BackgroundTasks) -> dict:
    # Honeypot: a filled hidden field means a bot. Return success so it goes away.
    if payload.website:
        return {"ok": True, "queued": True}

    client_host = request.client.host if request.client else "anonymous"
    if _rate_limited(client_host):
        raise HTTPException(status_code=429,
                            detail="Too many messages sent. Please try again later.")

    doc = {
        "name": payload.name,
        "email": payload.email,
        "company": payload.company,
        "subject": payload.subject or "(no subject)",
        "message": payload.message,
        "locale": payload.locale,
        "read": False,
        "archived": False,
        "replied": False,
        "created_at": datetime.now(timezone.utc),
    }
    try:
        result = await get_db().messages.insert_one(dict(doc))
        doc_id = str(result.inserted_id)
    except Exception:
        doc_id = ""
        if not settings.has_smtp:
            raise HTTPException(status_code=503,
                                detail="Message could not be stored. Please email me directly.")

    await _notify("message", f"New message from {payload.name}",
                  payload.subject or payload.message, doc_id)

    # Email delivery happens after the response so the visitor never waits on SMTP.
    background.add_task(mailer.notify_new_message, doc)
    background.add_task(mailer.send_contact_ack, doc)
    return {"ok": True, "id": doc_id}


def _iter_slots(start: datetime, days: int):
    day = start.replace(hour=0, minute=0, second=0, microsecond=0)
    for offset in range(days):
        current = day + timedelta(days=offset)
        if current.weekday() >= 5:  # Saturday, Sunday
            continue
        cursor = current.replace(hour=_DAY_START_HOUR)
        end = current.replace(hour=_DAY_END_HOUR)
        while cursor < end:
            yield cursor
            cursor += timedelta(minutes=_SLOT_MINUTES)


@router.get("/api/appointments/availability")
async def availability() -> dict:
    """Free 30-minute slots over the next three weeks, in UTC."""
    now = datetime.now(timezone.utc)
    earliest = now + timedelta(hours=12)  # no same-hour bookings

    try:
        taken_docs = await get_db().appointments.find(
            {"slot_start": {"$gte": now}, "status": {"$in": ["pending", "confirmed"]}},
            {"_id": 0, "slot_start": 1},
        ).to_list(length=500)
        taken = {
            d["slot_start"].replace(tzinfo=timezone.utc).isoformat()
            if d["slot_start"].tzinfo is None else d["slot_start"].isoformat()
            for d in taken_docs
        }
    except Exception:
        taken = set()

    slots = []
    for slot in _iter_slots(now, _LOOKAHEAD_DAYS):
        if slot < earliest:
            continue
        iso = slot.isoformat()
        if iso in taken:
            continue
        slots.append(iso)
        if len(slots) >= 160:
            break

    return {
        "slots": slots,
        "duration_minutes": _SLOT_MINUTES,
        "timezone": "UTC",
        "working_hours": f"{_DAY_START_HOUR:02d}:00–{_DAY_END_HOUR:02d}:00 UTC, Mon–Fri",
    }


@router.post("/api/appointments")
async def book_appointment(payload: AppointmentRequest, request: Request,
                           background: BackgroundTasks) -> dict:
    if payload.website:
        return {"ok": True, "queued": True}

    client_host = request.client.host if request.client else "anonymous"
    if _rate_limited(client_host):
        raise HTTPException(status_code=429, detail="Too many booking attempts.")

    slot = payload.slot_start
    if slot.tzinfo is None:
        slot = slot.replace(tzinfo=timezone.utc)
    slot = slot.astimezone(timezone.utc)

    now = datetime.now(timezone.utc)
    if slot < now + timedelta(hours=1):
        raise HTTPException(status_code=400, detail="That slot is in the past.")
    if slot > now + timedelta(days=_LOOKAHEAD_DAYS + 1):
        raise HTTPException(status_code=400, detail="That slot is too far ahead.")
    if slot.weekday() >= 5 or not (_DAY_START_HOUR <= slot.hour < _DAY_END_HOUR):
        raise HTTPException(status_code=400, detail="That slot is outside working hours.")

    doc = {
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "topic": payload.topic,
        "notes": payload.notes,
        "slot_start": slot,
        "duration_minutes": payload.duration_minutes,
        "locale": payload.locale,
        "timezone": payload.timezone,
        "status": "pending",
        "created_at": now,
    }

    try:
        db = get_db()
        clash = await db.appointments.find_one(
            {"slot_start": slot, "status": {"$in": ["pending", "confirmed"]}}
        )
        if clash:
            raise HTTPException(status_code=409, detail="That slot was just taken.")
        result = await db.appointments.insert_one(dict(doc))
        doc_id = str(result.inserted_id)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503,
                            detail="Booking is unavailable right now. Please use the contact form.")

    await _notify("appointment", f"Appointment request — {payload.name}",
                  f"{slot.strftime('%d %b %Y %H:%M UTC')} · {payload.topic}", doc_id)

    background.add_task(mailer.notify_new_appointment, doc)
    background.add_task(mailer.send_appointment_ack, doc)
    return {"ok": True, "id": doc_id, "slot_start": slot.isoformat(), "status": "pending"}
