import { sessionId } from './utils'

declare global {
  interface Window { dataLayer?: unknown[] }
}

/** Push to Google Tag Manager and to our own first-party store. */
export function track(name: string, meta: Record<string, unknown> = {}): void {
  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: name, ...meta })
  } catch {
    /* GTM blocked — first-party tracking below still runs. */
  }

  const body = JSON.stringify({
    name,
    path: location.pathname,
    locale: document.documentElement.lang || 'en',
    referrer: document.referrer || '',
    meta,
    session_id: sessionId(),
  })

  try {
    // sendBeacon survives page unload; fetch is the fallback.
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
    } else {
      void fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      })
    }
  } catch {
    /* analytics must never break the page */
  }
}

export function trackPageView(path: string, locale: string): void {
  track('page_view', { page_path: path, page_locale: locale })
}
