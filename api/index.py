"""FastAPI entrypoint.

Vercel's Python runtime discovers the module-level `app` object and serves it as
an ASGI application. Locally: `npm run api` (uvicorn with --app-dir api).
"""
from __future__ import annotations

import sys
from pathlib import Path

# Make `_lib` / `_routers` importable both locally and inside the Vercel bundle.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI, Request  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

from _lib.config import settings  # noqa: E402
from _lib.db import ping_detail  # noqa: E402
from _routers import admin, chat, contact, public  # noqa: E402

app = FastAPI(
    title="Othmane Sadiki — Portfolio API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None,
)

_allowed_origins = [
    settings.site_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in _allowed_origins if o],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(public.router)
app.include_router(chat.router)
app.include_router(contact.router)
app.include_router(admin.router)
app.include_router(admin.guarded)
app.include_router(admin.guarded_db)


@app.get("/api/health")
async def health() -> dict:
    db_ok, db_error = await ping_detail()
    return {
        "status": "ok",
        "database": db_ok,
        "database_error": db_error,
        "capabilities": {
            "smtp": settings.has_smtp,
            "gemini": settings.has_gemini,
            "llm_fallback": settings.has_llm_fallback,
            "any_llm": settings.has_any_llm,
        },
    }


@app.exception_handler(Exception)
async def unhandled_exception(request: Request, exc: Exception) -> JSONResponse:
    """Never leak a stack trace to the browser."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "path": str(request.url.path)},
    )
