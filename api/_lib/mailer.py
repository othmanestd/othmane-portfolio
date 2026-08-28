"""Transactional email over SMTP.

smtplib is blocking, so every send is pushed onto a worker thread. Failures are
swallowed and reported through the return value: a contact form should still
succeed for the visitor even when the mail relay is having a bad day.
"""
from __future__ import annotations

import asyncio
import smtplib
import ssl
from datetime import datetime
from email.message import EmailMessage
from email.utils import formataddr, formatdate
from html import escape

import certifi

from _lib.config import settings

_BLACK = "#0b0b0c"
_PAPER = "#f4f4f2"
_MONO = "'JetBrains Mono','SFMono-Regular',Menlo,Consolas,monospace"
_SANS = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"


def _shell(title: str, kicker: str, rows: list[tuple[str, str]], body_html: str = "",
           cta: tuple[str, str] | None = None) -> str:
    """Brutalist monochrome email shell: hard borders, mono labels, no colour."""
    row_html = "".join(
        f"""
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #e2e2de;font-family:{_MONO};
                     font-size:11px;letter-spacing:0.08em;text-transform:uppercase;
                     color:#6b6b66;width:34%;vertical-align:top;">{escape(label)}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e2e2de;font-family:{_SANS};
                     font-size:14px;color:{_BLACK};vertical-align:top;">{value}</td>
        </tr>"""
        for label, value in rows
    )
    cta_html = ""
    if cta:
        cta_label, cta_url = cta
        cta_html = f"""
        <tr><td style="padding:24px 16px 4px;">
          <a href="{escape(cta_url)}" style="display:inline-block;background:{_BLACK};color:{_PAPER};
             font-family:{_MONO};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;
             padding:14px 22px;text-decoration:none;border:2px solid {_BLACK};
             box-shadow:4px 4px 0 0 #b9b9b3;">{escape(cta_label)}</a>
        </td></tr>"""

    return f"""<!doctype html>
<html><body style="margin:0;padding:0;background:{_PAPER};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background:{_PAPER};padding:32px 12px;">
 <tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="max-width:620px;background:#ffffff;border:2px solid {_BLACK};
                box-shadow:8px 8px 0 0 {_BLACK};">
   <tr><td style="background:{_BLACK};padding:18px 16px;">
     <div style="font-family:{_MONO};font-size:10px;letter-spacing:0.24em;
                 text-transform:uppercase;color:#8f8f88;">{escape(kicker)}</div>
     <div style="font-family:{_SANS};font-size:22px;font-weight:800;color:{_PAPER};
                 margin-top:6px;letter-spacing:-0.02em;">{escape(title)}</div>
   </td></tr>
   {f'<tr><td style="padding:20px 16px 0;font-family:{_SANS};font-size:15px;line-height:1.65;color:{_BLACK};">{body_html}</td></tr>' if body_html else ''}
   <tr><td style="padding:12px 0 0;">
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">{row_html}</table>
   </td></tr>
   {cta_html}
   <tr><td style="padding:22px 16px;font-family:{_MONO};font-size:10px;
                  letter-spacing:0.1em;color:#8f8f88;text-transform:uppercase;
                  border-top:1px solid #e2e2de;">
     Othmane Sadiki — Data Engineer · Casablanca ·
     <a href="{escape(settings.site_url)}" style="color:#8f8f88;">{escape(settings.site_url)}</a>
   </td></tr>
  </table>
 </td></tr>
</table>
</body></html>"""


def _send_sync(to: list[str], subject: str, html: str, text: str, reply_to: str = "") -> bool:
    if not settings.has_smtp:
        return False
    message = EmailMessage()
    message["From"] = formataddr(("Othmane Sadiki", settings.smtp_user))
    message["To"] = ", ".join(to)
    message["Subject"] = subject
    message["Date"] = formatdate(localtime=True)
    if reply_to:
        message["Reply-To"] = reply_to
    message.set_content(text)
    message.add_alternative(html, subtype="html")

    context = ssl.create_default_context(cafile=certifi.where())
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=25) as server:
            server.starttls(context=context)
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
        return True
    except Exception:
        return False


async def send_email(to: list[str], subject: str, html: str, text: str,
                     reply_to: str = "") -> bool:
    recipients = [address for address in to if address]
    if not recipients:
        return False
    return await asyncio.to_thread(_send_sync, recipients, subject, html, text, reply_to)


def _fmt_slot(value: datetime) -> str:
    return value.strftime("%A %d %B %Y — %H:%M UTC")


# --- concrete messages ----------------------------------------------------
async def notify_new_message(doc: dict) -> bool:
    subject_line = doc.get("subject") or "No subject"
    html = _shell(
        title="New message from the portfolio",
        kicker="Inbox · Contact form",
        rows=[
            ("Name", escape(doc.get("name", ""))),
            ("Email", f'<a href="mailto:{escape(doc.get("email",""))}" style="color:{_BLACK};">{escape(doc.get("email",""))}</a>'),
            ("Company", escape(doc.get("company") or "—")),
            ("Subject", escape(subject_line)),
            ("Language", escape((doc.get("locale") or "en").upper())),
            ("Message", escape(doc.get("message", "")).replace("\n", "<br>")),
        ],
        cta=("Open admin inbox", f"{settings.site_url}/admin/messages"),
    )
    text = (
        f"New message from {doc.get('name')} <{doc.get('email')}>\n"
        f"Subject: {subject_line}\n\n{doc.get('message','')}\n"
    )
    return await send_email([settings.owner_email], f"[Portfolio] {subject_line} — {doc.get('name')}",
                            html, text, reply_to=doc.get("email", ""))


async def send_contact_ack(doc: dict) -> bool:
    locale = (doc.get("locale") or "en").lower()
    copy = {
        "fr": ("Merci pour votre message", "Bonjour {name}, j'ai bien reçu votre message et je vous réponds sous 24 à 48 heures. Voici une copie de ce que vous m'avez envoyé."),
        "en": ("Thanks for reaching out", "Hi {name}, your message reached me and I'll reply within 24–48 hours. Here's a copy of what you sent."),
        "ar": ("شكرًا على رسالتك", "مرحبًا {name}، لقد وصلتني رسالتك وسأرد عليك خلال 24 إلى 48 ساعة. هذه نسخة مما أرسلته."),
    }.get(locale, ("Thanks for reaching out", "Hi {name}, your message reached me and I'll reply within 24–48 hours."))
    html = _shell(
        title=copy[0],
        kicker="Othmane Sadiki · Auto-reply",
        rows=[
            ("Subject", escape(doc.get("subject") or "—")),
            ("Your message", escape(doc.get("message", "")).replace("\n", "<br>")),
        ],
        body_html=escape(copy[1].format(name=doc.get("name", ""))),
        cta=("View portfolio", settings.site_url),
    )
    text = f"{copy[1].format(name=doc.get('name',''))}\n\n{doc.get('message','')}"
    return await send_email([doc.get("email", "")], copy[0], html, text)


async def notify_new_appointment(doc: dict) -> bool:
    slot = doc.get("slot_start")
    slot_text = _fmt_slot(slot) if isinstance(slot, datetime) else str(slot)
    html = _shell(
        title="New appointment request",
        kicker="Calendar · Booking",
        rows=[
            ("Name", escape(doc.get("name", ""))),
            ("Email", escape(doc.get("email", ""))),
            ("Phone", escape(doc.get("phone") or "—")),
            ("Slot", escape(slot_text)),
            ("Duration", f'{doc.get("duration_minutes", 30)} min'),
            ("Timezone", escape(doc.get("timezone") or "—")),
            ("Topic", escape(doc.get("topic") or "—")),
            ("Notes", escape(doc.get("notes") or "—").replace("\n", "<br>")),
        ],
        cta=("Manage in admin", f"{settings.site_url}/admin/appointments"),
    )
    text = f"Appointment request from {doc.get('name')} at {slot_text}\nTopic: {doc.get('topic')}"
    return await send_email([settings.owner_email],
                            f"[Portfolio] Appointment — {doc.get('name')} · {slot_text}",
                            html, text, reply_to=doc.get("email", ""))


async def send_appointment_ack(doc: dict) -> bool:
    locale = (doc.get("locale") or "en").lower()
    slot = doc.get("slot_start")
    slot_text = _fmt_slot(slot) if isinstance(slot, datetime) else str(slot)
    copy = {
        "fr": ("Demande de rendez-vous reçue", "Merci {name}. Votre créneau est réservé et en attente de confirmation. Je vous confirme très vite par email."),
        "en": ("Appointment request received", "Thanks {name}. Your slot is on hold and pending confirmation — I'll confirm by email shortly."),
        "ar": ("تم استلام طلب الموعد", "شكرًا {name}. تم حجز موعدك مؤقتًا في انتظار التأكيد، وسأؤكده لك عبر البريد قريبًا."),
    }.get(locale, ("Appointment request received", "Thanks {name}, your slot is pending confirmation."))
    html = _shell(
        title=copy[0], kicker="Othmane Sadiki · Booking",
        rows=[("Slot", escape(slot_text)),
              ("Duration", f'{doc.get("duration_minutes", 30)} min'),
              ("Topic", escape(doc.get("topic") or "—"))],
        body_html=escape(copy[1].format(name=doc.get("name", ""))),
        cta=("View portfolio", settings.site_url),
    )
    return await send_email([doc.get("email", "")], copy[0], html,
                            copy[1].format(name=doc.get("name", "")))


async def send_appointment_decision(doc: dict, status: str, note: str = "") -> bool:
    slot = doc.get("slot_start")
    slot_text = _fmt_slot(slot) if isinstance(slot, datetime) else str(slot)
    titles = {
        "confirmed": "Your appointment is confirmed",
        "declined": "About your appointment request",
        "completed": "Thanks for your time",
        "pending": "Your appointment is back to pending",
    }
    title = titles.get(status, "Appointment update")
    rows = [("Status", escape(status.upper())), ("Slot", escape(slot_text))]
    if note:
        rows.append(("Note", escape(note).replace("\n", "<br>")))
    html = _shell(title=title, kicker="Othmane Sadiki · Booking", rows=rows,
                  cta=("View portfolio", settings.site_url))
    return await send_email([doc.get("email", "")], title, html, f"{title}\nSlot: {slot_text}\n{note}")
