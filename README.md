# Othmane Sadiki — Portfolio

Trilingual portfolio and content platform for a Data Engineer. React + Vite on the
front, FastAPI on Vercel serverless functions on the back, MongoDB Atlas for state.

**Live:** https://othmane-sadiki.vercel.app

---

## What is in here

| Area | Detail |
|------|--------|
| **Public site** | Home, work index, case studies, about, contact |
| **Digital card** | `/card` — NFC-tag landing page with vCard export and QR |
| **AI chatbot** | RAG over the CV and projects, answering in the first person |
| **Admin** | `/admin` — dashboard, inbox, bookings, content CRUD, KB editor, analytics |
| **Languages** | French, English and Arabic (full RTL) |
| **Email** | Contact + booking notifications and auto-replies over SMTP |

## Design language

Monochrome only — ink, paper, and the grey ramp between them. No accent colour anywhere.

Two idioms are given separate jobs rather than blended:

- **Neo-brutalism owns structure** — 2px hard edges, solid offset shadows, exposed
  metadata (`[01]`, mono labels), a visible hairline column grid.
- **Morphoglass owns surface** — frosted panels sitting inside those hard frames, lit
  by a slowly morphing monochrome mesh behind them.

A fixed SVG film-grain layer sits over everything. Both light and dark themes are
fully specified via CSS custom properties.

## Architecture

```
├── api/                    FastAPI application (Vercel Python runtime)
│   ├── index.py            ASGI entrypoint — Vercel discovers `app`
│   ├── _lib/
│   │   ├── config.py       env-backed settings + capability flags
│   │   ├── db.py           PyMongo async client, pooled per event loop
│   │   ├── auth.py         PBKDF2 hashing + JWT bearer tokens
│   │   ├── mailer.py       SMTP with monochrome HTML templates
│   │   ├── rag.py          BM25 retrieval + LLM provider chain
│   │   ├── content.py      canonical trilingual content (seed source)
│   │   └── seed.py         non-destructive database seeding
│   └── _routers/           public · chat · contact · admin
└── src/                    React 19 + TypeScript + Tailwind v4
    ├── styles/index.css    design tokens and primitives
    ├── i18n/               fr · en · ar dictionaries
    ├── components/         cursor, marquee, reveal, chatbot, …
    ├── pages/              public routes
    └── admin/              lazy-loaded admin bundle
```

Directories under `api/` are underscore-prefixed so Vercel treats them as library
code rather than as routable functions.

## The chatbot

Retrieval is a dependency-free **BM25** index built over chunks derived from the CV,
the projects and a hand-written persona FAQ. Two properties follow from that choice:

1. **No embedding API is required**, so retrieval keeps working when the language
   model is rate-limited, unfunded or down.
2. Each chunk carries its French, English *and* Arabic text in a single document, so
   a question in any of the three languages matches the same chunk lexically —
   cross-lingual retrieval without a multilingual embedding model.

Generation goes through a provider chain: Gemini first, then any OpenAI-compatible
endpoint (Groq, OpenRouter, Together, OpenAI). If every provider fails the answer
degrades to an **extractive** response composed from the retrieved passages, with a
notice, rather than an error.

To point it at a different provider, set:

```bash
LLM_FALLBACK_BASE_URL="https://api.groq.com/openai/v1"
LLM_FALLBACK_API_KEY="…"
LLM_FALLBACK_MODEL="llama-3.3-70b-versatile"
```

## Local development

```bash
npm install
uv venv .venv && uv pip install -r requirements.txt --python .venv/bin/python
cp .env.example .env   # then fill it in
```

Run the API and the front end in two terminals:

```bash
npm run api
```

```bash
npm run dev
```

Vite proxies `/api` to `127.0.0.1:8000`, so the app behaves exactly as it does on Vercel.

## Environment

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` / `MONGODB_DB` | Atlas connection |
| `JWT_SECRET` | admin session signing key |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | admin credentials |
| `OWNER_EMAIL` | where notifications are delivered |
| `GEMINI_API_KEY` / `GEMINI_CHAT_MODEL` | primary LLM |
| `LLM_FALLBACK_*` | any OpenAI-compatible fallback |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | transactional email |
| `SITE_URL` | absolute links in emails |

`.env` is gitignored. Secrets belong in the Vercel project settings, never in the repo.

## Notes

- Reveal animations and the hero text scramble are **progressive enhancements** with
  hard timeouts — if a timer or IntersectionObserver never fires, the content still
  renders. A portfolio that depends on animation to be readable is a broken portfolio.
- Analytics are first-party and privacy-preserving: visitor IPs are hashed, never
  stored raw. Google Tag Manager runs alongside for aggregate reporting.
- Contact and booking forms carry a honeypot field and per-IP rate limiting.
- Seeding is non-destructive by default, so admin edits survive a redeploy.

## Licence

Source is MIT. The written content, CV and photography are not — please do not reuse
them as your own.
