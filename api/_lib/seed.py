"""Seed MongoDB from the canonical content module.

Non-destructive by default: a collection that already holds documents is left
alone, so admin edits survive redeploys. Pass `force=True` to rebuild.
"""
from __future__ import annotations

from datetime import datetime, timezone

from _lib import content as C
from _lib.db import ensure_indexes, get_db


async def _seed_collection(name: str, docs: list[dict], force: bool) -> str:
    db = get_db()
    existing = await db[name].count_documents({})
    if existing and not force:
        return f"skipped ({existing} existing)"
    if force:
        await db[name].delete_many({})
    if docs:
        stamped = [{**d, "created_at": datetime.now(timezone.utc)} for d in docs]
        await db[name].insert_many(stamped)
    return f"seeded ({len(docs)})"


async def run_seed(force: bool = False) -> dict[str, str]:
    db = get_db()
    report: dict[str, str] = {}

    existing_profile = await db.profile.count_documents({"key": "main"})
    if not existing_profile or force:
        await db.profile.update_one(
            {"key": "main"},
            {"$set": {**C.PROFILE, "key": "main",
                      "updated_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
        report["profile"] = "seeded"
    else:
        report["profile"] = "skipped (existing)"

    report["projects"] = await _seed_collection("projects", C.PROJECTS, force)
    report["experiences"] = await _seed_collection("experiences", C.EXPERIENCES, force)
    report["skills"] = await _seed_collection("skills", C.SKILLS, force)
    report["awards"] = await _seed_collection(
        "awards", C.AWARDS + C.CERTIFICATIONS, force
    )
    report["links"] = await _seed_collection("links", C.LINKS, force)

    await ensure_indexes()
    report["indexes"] = "ensured"
    return report
