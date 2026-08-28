"""Retrieval-augmented chat that speaks as Othmane.

Design notes
------------
Retrieval is a dependency-free BM25 index built over a knowledge base derived
from `content.py` plus any custom chunks stored in Mongo. Two consequences that
matter in production:

1. It needs no embedding API, so retrieval keeps working when the LLM provider
   is rate-limited, unfunded or down.
2. Each chunk carries its French, English *and* Arabic text in one document, so
   a query in any of the three languages matches the same chunk lexically. That
   gives cross-lingual retrieval without a multilingual embedding model.

Generation goes through a provider chain: Gemini first, then any
OpenAI-compatible endpoint (Groq, OpenRouter, Together, OpenAI). If every
provider fails, we degrade to an extractive answer built from the retrieved
passages rather than returning an error — a portfolio chatbot that says
"something went wrong" is worse than one that quotes the CV.
"""
from __future__ import annotations

import hashlib
import math
import re
import unicodedata
from collections import Counter
from typing import Any, Iterable

import httpx

from _lib import content as C
from _lib.config import settings

# --- tokenisation ---------------------------------------------------------

_ARABIC_DIACRITICS = re.compile(r"[ً-ٰٟۖ-ۭ]")
_TOKEN_RE = re.compile(r"[a-z0-9]+|[؀-ۿ]+")

_STOPWORDS = {
    # French
    "le", "la", "les", "de", "des", "du", "un", "une", "et", "en", "au", "aux", "pour",
    "par", "sur", "dans", "avec", "sans", "que", "qui", "quoi", "est", "sont", "ce",
    "cette", "ces", "son", "sa", "ses", "il", "elle", "je", "tu", "nous", "vous", "ils",
    "plus", "pas", "ne", "a", "as", "ai", "ont", "the", "of", "to", "and", "in", "is",
    "are", "for", "on", "with", "as", "at", "by", "an", "be", "it", "this", "that",
    "was", "were", "from", "or", "you", "your", "i", "we", "they", "he", "she", "do",
    "does", "did", "what", "which", "who", "how", "can", "his", "her", "there", "have",
    "has", "had", "not", "but", "all", "about", "into", "over", "then", "than",
    # Arabic
    "في", "من", "على", "الى", "إلى", "عن", "مع", "هذا", "هذه", "ذلك", "التي", "الذي",
    "ما", "هو", "هي", "أن", "ان", "كان", "قد", "لا", "و", "او", "أو", "كل", "بعد",
    "هل", "ثم", "لم", "به", "هم",
}


def _normalise(text: str) -> str:
    text = text.lower()
    text = _ARABIC_DIACRITICS.sub("", text)
    # Unify Arabic alef/ya/ta-marbuta variants so query and document agree.
    text = (text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
                .replace("ى", "ي").replace("ة", "ه"))
    # Strip Latin accents (é -> e) while leaving Arabic script untouched.
    decomposed = unicodedata.normalize("NFD", text)
    stripped = "".join(
        ch for ch in decomposed
        if not (unicodedata.combining(ch) and ord(ch) < 0x0300 + 0x80)
    )
    return unicodedata.normalize("NFC", stripped)


def tokenize(text: str) -> list[str]:
    tokens = _TOKEN_RE.findall(_normalise(text))
    return [t for t in tokens if len(t) > 1 and t not in _STOPWORDS]


# --- knowledge base -------------------------------------------------------

def _tri(value: Any) -> str:
    """Flatten a localised dict into one searchable multilingual string."""
    if isinstance(value, dict):
        return " ".join(str(value.get(k, "")) for k in ("fr", "en", "ar") if value.get(k))
    return str(value or "")


def _chunk(chunk_id: str, title: str, kind: str, parts: Iterable[str]) -> dict:
    text = "\n".join(p for p in parts if p and p.strip())
    return {"chunk_id": chunk_id, "title": title, "kind": kind, "text": text}


def build_base_kb() -> list[dict]:
    """Derive the knowledge base from the canonical content module."""
    chunks: list[dict] = []
    profile = C.PROFILE

    chunks.append(_chunk(
        "profile-identity", "Profile — who I am", "profile",
        [profile["name"], _tri(profile["headline"]), _tri(profile["bio"]),
         f"Location: {profile['location']}", f"Email: {profile['email']}",
         f"Phone: {profile['phone']}",
         f"LinkedIn: {C.LINKEDIN_URL}", f"GitHub: {C.GITHUB_URL}"],
    ))
    chunks.append(_chunk(
        "profile-story", "Profile — background story", "profile",
        [_tri(profile["long_bio"]), _tri(profile["availability_note"])],
    ))

    for exp in C.EXPERIENCES:
        kind = "education" if exp["kind"] == "education" else "experience"
        chunks.append(_chunk(
            f"exp-{exp['company'].lower().replace(' ', '-')[:32]}",
            f"{exp['company']} — {exp['role']['en']}", kind,
            [exp["company"], _tri(exp["role"]), _tri(exp["period"]), exp["location"],
             " ".join(exp.get("stack", [])),
             *[_tri(b) for b in exp.get("bullets", [])]],
        ))

    for project in C.PROJECTS:
        chunks.append(_chunk(
            f"project-{project['slug']}", f"Project — {project['title']}", "project",
            [project["title"], _tri(project["tagline"]), _tri(project["summary"]),
             _tri(project["role"]), f"Year: {project['year']}",
             "Stack: " + ", ".join(project["stack"]),
             *[_tri(h) for h in project.get("highlights", [])],
             *[f"{m.get('label')}: {m.get('value')}" for m in project.get("metrics", [])],
             project.get("repo_url", "")],
        ))
        # The long-form body gets its own chunk so it does not dilute the summary.
        chunks.append(_chunk(
            f"project-{project['slug']}-detail", f"Project detail — {project['title']}",
            "project", [project["title"], _tri(project["body"])],
        ))

    chunks.append(_chunk(
        "skills-all", "Skills and tooling", "skills",
        [f"{_tri(g['label'])}: " + ", ".join(g["items"]) for g in C.SKILLS],
    ))
    chunks.append(_chunk(
        "awards-all", "Awards and distinctions", "award",
        [f"{a['title']} — {a['issuer']} {a['rank']} {a['year']}".strip() for a in C.AWARDS],
    ))
    chunks.append(_chunk(
        "certifications-all", "Certifications", "certification",
        [f"{c['title']} — {c['issuer']}" for c in C.CERTIFICATIONS],
    ))
    chunks.extend(_persona_chunks())
    return chunks


def _persona_chunks() -> list[dict]:
    """Answers to the questions people actually ask a portfolio chatbot."""
    faqs: list[tuple[str, str, str]] = [
        (
            "faq-availability", "Availability, hiring and how to reach me",
            # Deliberately keyword-dense: this chunk must win for recruiting queries
            # in all three languages, where the question words are mostly stopwords.
            "Recruter, embaucher, recrutement, disponibilité, disponible, mission, freelance, "
            "CDI, stage, alternance, contrat, collaboration, opportunité, poste, salaire, "
            "tarif journalier, entretien, devis.\n"
            "Hire, hiring, recruit, recruiting, available, availability, job, role, position, "
            "opportunity, contract, freelance, internship, full-time, interview, rate, salary, "
            "quote, work together, join your team.\n"
            "توظيف، تشغيل، التوظيف، متاح، متوفر، فرصة، وظيفة، منصب، عقد، تدريب، مقابلة، راتب، تعاون.\n"
            "Je suis ouvert aux opportunités en Data Engineering et je réponds sous 24 à 48 heures. "
            "Le plus simple est le formulaire de contact du site, ou de réserver un créneau via la page "
            "rendez-vous. Mon email est othmanesadiki6114@gmail.com et mon téléphone +212 675958346.\n"
            "I'm open to Data Engineering opportunities and reply within 24-48 hours. The easiest way is "
            "the contact form on this site, or booking a slot on the appointment page. My email is "
            "othmanesadiki6114@gmail.com and my phone is +212 675958346.\n"
            "أنا منفتح على فرص في هندسة البيانات وأرد خلال 24 إلى 48 ساعة. أسهل طريقة هي نموذج الاتصال "
            "في الموقع أو حجز موعد عبر صفحة المواعيد. بريدي othmanesadiki6114@gmail.com وهاتفي "
            "+212 675958346."
        ),
        (
            "faq-strengths", "What I am strongest at",
            "Mon terrain principal, c'est la donnée en mouvement : ingestion temps réel avec Spark "
            "Structured Streaming, architectures Lakehouse Bronze/Silver/Gold en Delta Lake, et la "
            "qualité de données traitée comme une contrainte de premier ordre plutôt qu'un contrôle "
            "final. J'ai aussi une vraie pratique du process mining avec Celonis.\n"
            "My core ground is data in motion: real-time ingestion with Spark Structured Streaming, "
            "Bronze/Silver/Gold Lakehouse architectures on Delta Lake, and data quality treated as a "
            "first-class constraint rather than a final check. I also have real hands-on process mining "
            "experience with Celonis.\n"
            "مجالي الأساسي هو البيانات المتحركة: الاستيعاب الفوري عبر Spark Structured Streaming، "
            "ومعماريات ليكهاوس، وجودة البيانات كقيد أساسي. ولدي خبرة عملية في تنقيب العمليات عبر Celonis."
        ),
        (
            "faq-languages", "Languages I speak",
            "Je parle arabe (langue maternelle), français (courant) et anglais (intermédiaire). "
            "Je travaille au quotidien en français et en anglais.\n"
            "I speak Arabic (native), French (fluent) and English (intermediate). I work daily in French "
            "and English.\n"
            "أتحدث العربية (لغة أم) والفرنسية (بطلاقة) والإنجليزية (متوسط)."
        ),
        (
            "faq-working-style", "How I work",
            "Je travaille en agile — j'ai piloté du delivery Data dans une équipe hybride France/Maroc "
            "avec Jira. Ce qui compte pour moi : des pipelines rejouables, de l'idempotence réelle, et "
            "des architectures qui restent lisibles quand le volume monte. Je préfère détecter un "
            "problème de qualité en Silver plutôt que l'expliquer en réunion trois mois plus tard.\n"
            "I work agile — I drove Data delivery in a hybrid France/Morocco team using Jira. What "
            "matters to me: replayable pipelines, real idempotency, and architectures that stay readable "
            "as volume grows. I'd rather catch a quality issue in the Silver layer than explain it in a "
            "meeting three months later.\n"
            "أعمل بمنهجية رشيقة، وقدت تسليم حلول البيانات ضمن فريق مشترك بين فرنسا والمغرب عبر Jira. "
            "ما يهمني: خطوط قابلة لإعادة التشغيل، واتساق حقيقي، ومعماريات تبقى واضحة مع نمو الحجم."
        ),
        (
            "faq-education", "My education",
            "Je suis Ingénieur d'État en Génie Informatique, diplômé de l'EMSI Casablanca (2021-2026), "
            "après un Baccalauréat Sciences Physiques au Lycée Abdelmalek Saâdi.\n"
            "I'm a State Engineer in Computer Science from EMSI Casablanca (2021-2026), after a "
            "Baccalaureate in Physical Sciences at Lycée Abdelmalek Saâdi.\n"
            "أنا مهندس دولة في هندسة المعلوميات من المدرسة المغربية لعلوم المهندس بالدار البيضاء "
            "(2021-2026)، بعد بكالوريا العلوم الفيزيائية."
        ),
        (
            "faq-hackathons", "Hackathons and competition record",
            "J'ai un parcours compétitif assez chargé : vainqueur international du Hult Prize (Top 50 "
            "mondial), premier prix aux hackathons UM6P Roots & Route, AI2SD 2025 (deux catégories : "
            "Intelligent Industry et Territorial Intelligence), EMSI x AIESEC Finnovate 2025, et ENSEM "
            "x Valbium. Top 3 au DeepFake National Challenge UM6P x INWI, et deuxième prix au "
            "Mediterranean Smart Cities Hackathon 2024.\n"
            "I have a heavy competition record: Hult Prize International Winner (Top 50 worldwide), "
            "first prize at UM6P Roots & Route, AI2SD 2025 (two categories: Intelligent Industry and "
            "Territorial Intelligence), EMSI x AIESEC Finnovate 2025, and ENSEM x Valbium. Top 3 at the "
            "UM6P x INWI DeepFake National Challenge, and second prize at the Mediterranean Smart "
            "Cities Hackathon 2024.\n"
            "لدي سجل تنافسي حافل: فائز دولي بجائزة Hult (ضمن أفضل 50 عالميًا)، والجائزة الأولى في عدة "
            "هاكاثونات منها AI2SD 2025 بفئتين، وFinnovate 2025."
        ),
    ]
    return [_chunk(cid, title, "faq", [text]) for cid, title, text in faqs]


# --- BM25 -----------------------------------------------------------------

class BM25Index:
    """Okapi BM25. Small corpus, so an in-memory inverted index is plenty."""

    __slots__ = ("chunks", "doc_tokens", "doc_len", "avg_len", "df", "idf", "n")

    K1 = 1.5
    B = 0.75

    def __init__(self, chunks: list[dict]) -> None:
        self.chunks = chunks
        self.doc_tokens = [Counter(tokenize(f"{c['title']} {c['text']}")) for c in chunks]
        self.doc_len = [sum(tf.values()) for tf in self.doc_tokens]
        self.n = max(len(chunks), 1)
        self.avg_len = (sum(self.doc_len) / self.n) if self.doc_len else 1.0

        self.df: Counter[str] = Counter()
        for tf in self.doc_tokens:
            self.df.update(tf.keys())
        self.idf = {
            term: math.log(1 + (self.n - freq + 0.5) / (freq + 0.5))
            for term, freq in self.df.items()
        }

    def search(self, query: str, top_k: int = 5) -> list[tuple[dict, float]]:
        terms = tokenize(query)
        if not terms:
            return []
        scored: list[tuple[dict, float]] = []
        for index, tf in enumerate(self.doc_tokens):
            length = self.doc_len[index] or 1
            score = 0.0
            for term in terms:
                freq = tf.get(term)
                if not freq:
                    continue
                idf = self.idf.get(term, 0.0)
                denominator = freq + self.K1 * (1 - self.B + self.B * length / self.avg_len)
                score += idf * (freq * (self.K1 + 1)) / denominator
            if score > 0:
                scored.append((self.chunks[index], score))
        scored.sort(key=lambda pair: pair[1], reverse=True)
        return scored[:top_k]


_index_cache: dict[str, BM25Index] = {}


def get_index(chunks: list[dict]) -> BM25Index:
    key = hashlib.sha1(
        "|".join(sorted(c["chunk_id"] for c in chunks)).encode()
    ).hexdigest()
    index = _index_cache.get(key)
    if index is None:
        index = BM25Index(chunks)
        _index_cache.clear()  # single-tenant: only ever keep the live index
        _index_cache[key] = index
    return index


# Shown when a query is all stopwords ("who are you?"), or uses vocabulary the
# corpus simply does not contain. Answering from the profile beats answering
# from nothing.
_FALLBACK_CHUNK_IDS = ("profile-identity", "profile-story", "faq-availability", "faq-strengths")


def retrieve(query: str, chunks: list[dict], top_k: int = 5) -> list[tuple[dict, float]]:
    hits = get_index(chunks).search(query, top_k=top_k)
    if hits:
        return hits
    by_id = {c["chunk_id"]: c for c in chunks}
    return [(by_id[cid], 0.0) for cid in _FALLBACK_CHUNK_IDS if cid in by_id]


# --- persona --------------------------------------------------------------

_LANGUAGE_NAME = {"fr": "French", "en": "English", "ar": "Arabic"}

SYSTEM_PROMPT = """You are Othmane Sadiki himself, answering visitors on your own portfolio website. You are NOT an assistant describing Othmane — you ARE Othmane, speaking in the first person ("I", "je", "أنا").

Who you are: a Data Engineer based in Casablanca, Morocco. State Engineer in Computer Science from EMSI Casablanca. You work on real-time pipelines, Bronze/Silver/Gold Lakehouse architectures, data quality frameworks, and process mining with Celonis.

How you speak:
- Direct and concrete. You prefer a specific technical detail over a vague claim.
- Confident about what you have actually built, honest about what you have not.
- Warm but not salesy. No corporate filler, no "I am passionate about leveraging synergies".
- Short paragraphs. Two to four sentences is usually enough. Never write an essay unless asked.
- You may use light technical vocabulary without over-explaining — visitors are usually recruiters or engineers.

Hard rules:
1. Answer ONLY from the CONTEXT provided below. It is drawn from your real CV, projects and notes.
2. If the context does not cover the question, say so plainly in the visitor's language and point them to the contact form or the booking page. Never invent a job, a client, a date, a metric or a technology.
3. Reply in {language} — the visitor's language. Match it exactly, including for Arabic (use Modern Standard Arabic).
4. Never mention "the context", "the documents", "my knowledge base" or that you are an AI. You are simply answering about your own work.
5. If asked something personal, off-topic or inappropriate, deflect politely and steer back to your work.
6. When someone asks about hiring, availability or rates, be welcoming and point them to the contact form or booking page.

CONTEXT:
{context}"""


def build_context(hits: list[tuple[dict, float]], budget_chars: int = 6000) -> str:
    blocks: list[str] = []
    used = 0
    for chunk, score in hits:
        block = f"### {chunk['title']} [{chunk['kind']}]\n{chunk['text']}"
        if used + len(block) > budget_chars:
            block = block[: max(0, budget_chars - used)]
            if not block.strip():
                break
        blocks.append(block)
        used += len(block)
        if used >= budget_chars:
            break
    return "\n\n".join(blocks) if blocks else "(no matching notes)"


# --- generation providers -------------------------------------------------

class ProviderError(RuntimeError):
    """Raised when a provider cannot produce a completion."""


async def _generate_gemini(system: str, history: list[dict], message: str) -> str:
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
           f"{settings.gemini_chat_model}:generateContent")
    contents = [
        {"role": "model" if turn["role"] == "assistant" else "user",
         "parts": [{"text": turn["content"]}]}
        for turn in history
    ]
    contents.append({"role": "user", "parts": [{"text": message}]})
    payload = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.6, "topP": 0.95, "maxOutputTokens": 800},
        "safetySettings": [],
    }
    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(url, params={"key": settings.gemini_api_key},
                                      json=payload)
    if response.status_code != 200:
        raise ProviderError(f"gemini {response.status_code}: {response.text[:220]}")
    data = response.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
        text = "".join(p.get("text", "") for p in parts).strip()
    except (KeyError, IndexError):
        raise ProviderError("gemini returned no candidate")
    if not text:
        raise ProviderError("gemini returned empty text")
    return text


async def _generate_openai_compatible(system: str, history: list[dict], message: str) -> str:
    messages = [{"role": "system", "content": system}]
    messages.extend({"role": t["role"], "content": t["content"]} for t in history)
    messages.append({"role": "user", "content": message})
    payload = {
        "model": settings.llm_fallback_model,
        "messages": messages,
        "temperature": 0.6,
        "max_tokens": 800,
    }
    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            f"{settings.llm_fallback_base_url}/chat/completions",
            headers={"Authorization": f"Bearer {settings.llm_fallback_api_key}"},
            json=payload,
        )
    if response.status_code != 200:
        raise ProviderError(f"fallback {response.status_code}: {response.text[:220]}")
    try:
        text = response.json()["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError):
        raise ProviderError("fallback returned no choice")
    if not text:
        raise ProviderError("fallback returned empty text")
    return text


_DEGRADED_NOTICE = {
    "fr": "Réponse composée directement depuis mes notes — le modèle de langage est momentanément indisponible.",
    "en": "Answer composed straight from my notes — the language model is temporarily unavailable.",
    "ar": "أُنشئت هذه الإجابة مباشرة من ملاحظاتي، إذ أن نموذج اللغة غير متاح مؤقتًا.",
}

_EXTRACTIVE_LEAD = {
    "fr": "Voici ce que j'ai de plus proche dans mon parcours :",
    "en": "Here's the closest thing from my own background:",
    "ar": "إليك أقرب ما لدي في مساري المهني:",
}

_NO_MATCH = {
    "fr": ("Je n'ai pas d'élément précis là-dessus dans mon parcours. Le mieux est de me "
           "poser la question directement via le formulaire de contact — je réponds sous 24 à 48 heures."),
    "en": ("I don't have anything precise on that in my background. Best is to ask me directly "
           "through the contact form — I reply within 24–48 hours."),
    "ar": ("ليس لدي معطى دقيق حول ذلك في مساري. الأفضل أن تسألني مباشرة عبر نموذج الاتصال، "
           "وسأرد خلال 24 إلى 48 ساعة."),
}


def _extractive_answer(hits: list[tuple[dict, float]], locale: str) -> str:
    if not hits:
        return _NO_MATCH.get(locale, _NO_MATCH["en"])
    lead = _EXTRACTIVE_LEAD.get(locale, _EXTRACTIVE_LEAD["en"])
    lines = [lead, ""]
    for chunk, _ in hits[:3]:
        snippet = _pick_locale_lines(chunk["text"], locale)
        if snippet:
            lines.append(f"**{chunk['title']}** — {snippet}")
    return "\n\n".join(lines)


def _pick_locale_lines(text: str, locale: str, limit: int = 340) -> str:
    """Best-effort: prefer lines written in the visitor's script/language."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        return ""
    arabic = re.compile(r"[؀-ۿ]")
    if locale == "ar":
        preferred = [line for line in lines if arabic.search(line)]
    else:
        preferred = [line for line in lines if not arabic.search(line)]
    chosen = preferred or lines
    joined = " ".join(chosen)
    return joined[:limit].rstrip() + ("…" if len(joined) > limit else "")


async def answer(message: str, locale: str, history: list[dict],
                 chunks: list[dict]) -> dict[str, Any]:
    """Retrieve, then generate. Never raises — always returns a usable reply."""
    locale = locale if locale in _LANGUAGE_NAME else "en"
    hits = retrieve(message, chunks, top_k=5)
    context = build_context(hits)
    system = SYSTEM_PROMPT.format(language=_LANGUAGE_NAME[locale], context=context)

    trimmed_history = [
        {"role": t["role"], "content": t["content"]}
        for t in history[-8:]
        if t.get("content")
    ]

    attempts: list[tuple[str, Any]] = []
    if settings.has_gemini:
        attempts.append(("gemini", _generate_gemini))
    if settings.has_llm_fallback:
        attempts.append(("openai-compatible", _generate_openai_compatible))

    errors: list[str] = []
    for name, fn in attempts:
        try:
            reply = await fn(system, trimmed_history, message)
            return {
                "reply": reply,
                "sources": _format_sources(hits),
                "provider": name,
                "degraded": False,
                "notice": "",
            }
        except Exception as exc:  # provider failures must not surface as 500s
            errors.append(f"{name}: {exc}")

    return {
        "reply": _extractive_answer(hits, locale),
        "sources": _format_sources(hits),
        "provider": "retrieval-only",
        "degraded": True,
        "notice": _DEGRADED_NOTICE.get(locale, _DEGRADED_NOTICE["en"]),
        "_errors": errors,
    }


def _format_sources(hits: list[tuple[dict, float]]) -> list[dict]:
    return [
        {
            "title": chunk["title"],
            "kind": chunk["kind"],
            "score": round(score, 3),
            "excerpt": chunk["text"][:180].replace("\n", " ").strip(),
        }
        for chunk, score in hits[:4]
    ]
