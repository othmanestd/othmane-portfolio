import type { Locale, Localized } from './types'

/** Merge class names, dropping falsy values. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

/** Read a localised field with sensible fallback order. */
export function t(value: Localized | string | undefined, locale: Locale): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[locale] || value.en || value.fr || value.ar || ''
}

export function formatDate(iso: string, locale: Locale): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const tag = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB'
  return new Intl.DateTimeFormat(tag, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date)
}

export function formatDay(iso: string, locale: Locale): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const tag = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB'
  return new Intl.DateTimeFormat(tag, { weekday: 'short', day: '2-digit', month: 'short' }).format(date)
}

export function formatTime(iso: string, locale: Locale): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const tag = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB'
  return new Intl.DateTimeFormat(tag, { hour: '2-digit', minute: '2-digit' }).format(date)
}

export function relativeTime(iso: string, locale: Locale): string {
  const date = new Date(iso).getTime()
  if (Number.isNaN(date)) return ''
  const diff = date - Date.now()
  const tag = locale === 'ar' ? 'ar' : locale
  const rtf = new Intl.RelativeTimeFormat(tag, { numeric: 'auto' })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86400000], ['hour', 3600000], ['minute', 60000],
  ]
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms || unit === 'minute') {
      return rtf.format(Math.round(diff / ms), unit)
    }
  }
  return ''
}

/** Two-digit section index, e.g. "03". */
export function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Stable per-browser id used to group analytics events into sessions. */
export function sessionId(): string {
  const key = 'os.sid'
  try {
    let value = sessionStorage.getItem(key)
    if (!value) {
      value = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem(key, value)
    }
    return value
  } catch {
    return 'anonymous'
  }
}

/** Minimal markdown for case-study bodies: ## headings, - bullets, **bold**, `code`. */
export function renderMarkdown(source: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const inline = (s: string) =>
    escape(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>')

  const blocks: string[] = []
  let list: string[] = []

  const flush = () => {
    if (list.length) {
      blocks.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`)
      list = []
    }
  }

  for (const raw of source.split('\n')) {
    const line = raw.trim()
    if (!line) { flush(); continue }
    if (line.startsWith('## ')) { flush(); blocks.push(`<h2>${inline(line.slice(3))}</h2>`); continue }
    if (line.startsWith('- ')) { list.push(line.slice(2)); continue }
    flush()
    blocks.push(`<p>${inline(line)}</p>`)
  }
  flush()
  return blocks.join('')
}
