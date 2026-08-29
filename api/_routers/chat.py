"""RAG chat endpoint."""
from __future__ import annotations

import time
from collections import defaultdict, deque
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request

from _lib import rag
from _lib.config import settings
from _lib.db import db_healthy, get_db
from _lib.schemas import ChatRequest, ChatResponse

router = APIRouter()

# In-process rate limit. Serverless instances are short-lived so this is a
# best-effort speed bump against casual abuse, not a security boundary.
_WINDOW_SECONDS = 60
_MAX_PER_WINDOW = 12
_hits: dict[str, deque[float]] = defaultdict(deque)


def _rate_limited(key: str) -> bool:
    now = time.time()
    bucket = _hits[key]
    while bucket and now - bucket[0] > _WINDOW_SECONDS:
        bucket.popleft()
    if len(bucket) >= _MAX_PER_WINDOW:
        return True
    bucket.append(now)
    return False


async def load_chunks() -> list[dict]:
    """Base KB from content plus any admin-authored chunks in Mongo."""
    chunks = rag.build_base_kb()
    if not await db_healthy():
        return chunks
    try:
        extra = await get_db().kb_chunks.find({}, {"_id": 0}).to_list(length=300)
    except Exception:
        extra = []
    if extra:
        by_id = {c["chunk_id"]: c for c in chunks}
        for doc in extra:
            if doc.get("chunk_id") and doc.get("text"):
                by_id[doc["chunk_id"]] = {
                    "chunk_id": doc["chunk_id"],
                    "title": doc.get("title", doc["chunk_id"]),
                    "kind": doc.get("kind", "note"),
                    "text": doc["text"],
                }
        chunks = list(by_id.values())
    return chunks


@router.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    client_host = request.client.host if request.client else "anonymous"
    if _rate_limited(client_host):
        raise HTTPException(status_code=429, detail="Too many messages — give it a minute.")

    chunks = await load_chunks()
    history = [{"role": t.role, "content": t.content} for t in payload.history]
    result = await rag.answer(payload.message, payload.locale, history, chunks)

    # Log the exchange so the admin can see what visitors actually ask.
    # Skip entirely when the database is down so it never delays the reply.
    try:
        if not await db_healthy():
            raise RuntimeError("db down")
        await get_db().analytics_events.insert_one({
            "name": "chat_message",
            "path": "/chat",
            "locale": payload.locale,
            "meta": {
                "question": payload.message[:500],
                "provider": result["provider"],
                "degraded": result["degraded"],
                "top_source": (result["sources"][0]["title"] if result["sources"] else ""),
                "errors": result.get("_errors", [])[:3],
            },
            "session_id": payload.session_id[:64],
            "created_at": datetime.now(timezone.utc),
        })
    except Exception:
        pass

    return ChatResponse(
        reply=result["reply"],
        sources=result["sources"],
        cards=result.get("cards", []),
        provider=result["provider"],
        degraded=result["degraded"],
        notice=result["notice"],
    )


@router.get("/api/chat/health")
async def chat_health() -> dict:
    """Surfaces which generation provider is actually usable right now."""
    return {
        "gemini_configured": settings.has_gemini,
        "fallback_configured": settings.has_llm_fallback,
        "retrieval": "bm25",
        "kb_chunks": len(await load_chunks()),
    }
