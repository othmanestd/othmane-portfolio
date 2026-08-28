"""MongoDB access.

Uses PyMongo's native async client (4.9+). The client is created lazily and
cached at module scope so warm serverless invocations reuse the connection pool.
"""
from __future__ import annotations

import asyncio
from typing import Any

import certifi
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from _lib.config import settings

_client: AsyncMongoClient | None = None
_client_loop: asyncio.AbstractEventLoop | None = None

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
            serverSelectionTimeoutMS=8000,
            connectTimeoutMS=8000,
            socketTimeoutMS=20000,
            maxPoolSize=5,
            retryWrites=True,
            appname="othmane-portfolio",
        )
        _client_loop = loop
    return _client


def get_db() -> AsyncDatabase:
    return get_client()[settings.mongodb_db]


async def ping() -> bool:
    try:
        await get_client().admin.command("ping")
        return True
    except Exception:
        return False


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
