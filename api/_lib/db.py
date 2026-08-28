"""MongoDB access.

Uses PyMongo's native async client (4.9+). The client is created lazily and
cached at module scope so warm serverless invocations reuse the connection pool.
"""
from __future__ import annotations

import asyncio
import time
from typing import Any

import certifi
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from _lib.config import settings

_client: AsyncMongoClient | None = None
_client_loop: asyncio.AbstractEventLoop | None = None

# --- circuit breaker state -------------------------------------------------
# Trust a healthy verdict briefly; skip the database for longer after a failure
# so an unreachable cluster stops costing a timeout on every single request.
_BREAKER_TTL_OK = 15.0
_BREAKER_TTL_FAIL = 30.0
_breaker_checked_at = 0.0
_breaker_healthy = False
_breaker_has_result = False

COLLECTIONS = (
    "profile",
    "projects",
    "experiences",
    "skills",
    "awards",
    "certifications",
    "links",
    "messages",
    "appointments",
    "kb_chunks",
    "analytics_events",
    "notifications",
    "settings",
)


def get_client() -> AsyncMongoClient:
    """Return a pooled client bound to the running event loop.

    Serverless runtimes can hand us a fresh event loop between invocations; a
    client pinned to a dead loop raises obscure errors, so we rebuild when the
    loop identity changes.
    """
    global _client, _client_loop
    if not settings.mongodb_uri:
        raise RuntimeError("MONGODB_URI is not configured")

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if _client is None or (loop is not None and _client_loop is not loop):
        _client = AsyncMongoClient(
            settings.mongodb_uri,
            tlsCAFile=certifi.where(),
            # Fail fast: on an unreachable cluster this is the ceiling on how
            # long a single query can stall before we fall back to bundled data.
            serverSelectionTimeoutMS=2500,
            connectTimeoutMS=2500,
            socketTimeoutMS=8000,
            maxPoolSize=5,
            retryWrites=True,
            appname="othmane-portfolio",
        )
        _client_loop = loop
    return _client


def get_db() -> AsyncDatabase:
    return get_client()[settings.mongodb_db]


async def ping() -> bool:
    ok, _ = await ping_detail()
    return ok


async def db_healthy() -> bool:
    """Circuit breaker around server selection.

    A cold serverless invocation against an unreachable cluster otherwise pays
    the full server-selection timeout on *every* query — six of them in
    `/api/content` turned one request into ~50s. We ping once, cache the
    verdict, and let callers skip the database entirely while it is known-down,
    collapsing that to a single sub-3s check (and to ~0ms for the following
    requests within the cooldown window).
    """
    global _breaker_checked_at, _breaker_healthy, _breaker_has_result
    if not settings.mongodb_uri:
        return False

    now = time.monotonic()
    if _breaker_has_result:
        age = now - _breaker_checked_at
        if _breaker_healthy and age < _BREAKER_TTL_OK:
            return True
        if not _breaker_healthy and age < _BREAKER_TTL_FAIL:
            return False

    ok, _ = await ping_detail()
    _breaker_checked_at = time.monotonic()
    _breaker_healthy = ok
    _breaker_has_result = True
    return ok


async def ping_detail() -> tuple[bool, str]:
    """Ping the cluster, returning a short reason on failure.

    Surfacing the reason matters in serverless: the most common cause of a
    dead connection here is an Atlas IP access list that does not include
    the platform's egress ranges, which otherwise looks like a silent hang.
    """
    try:
        await get_client().admin.command("ping")
        return True, ""
    except Exception as exc:
        detail = f"{type(exc).__name__}: {exc}"
        return False, detail[:300]


def serialize(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    """Convert a Mongo document into something JSON-encodable."""
    if doc is None:
        return None
    out = dict(doc)
    if "_id" in out:
        out["id"] = str(out.pop("_id"))
    for key, value in list(out.items()):
        if hasattr(value, "isoformat"):
            out[key] = value.isoformat()
    return out


def serialize_many(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [d for d in (serialize(doc) for doc in docs) if d is not None]


async def ensure_indexes() -> None:
    """Idempotent index creation. Safe to call repeatedly."""
    db = get_db()
    await db.projects.create_index("slug", unique=True)
    await db.projects.create_index([("order", 1)])
    await db.experiences.create_index([("order", 1)])
    await db.skills.create_index([("order", 1)])
    await db.awards.create_index([("order", 1)])
    await db.links.create_index([("order", 1)])
    await db.messages.create_index([("created_at", -1)])
    await db.appointments.create_index([("slot_start", 1)])
    await db.notifications.create_index([("created_at", -1)])
    await db.analytics_events.create_index([("created_at", -1)])
    await db.analytics_events.create_index([("name", 1), ("created_at", -1)])
    await db.kb_chunks.create_index("chunk_id", unique=True)
