import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from 'react'
import { api } from '@/lib/api'
import type { SiteContent } from '@/lib/types'

interface ContentValue {
  content: SiteContent | null
  loading: boolean
  error: string
  reload: () => void
}

const ContentContext = createContext<ContentValue | null>(null)

// Stale-while-revalidate: the last good payload is persisted so the next visit
// (or a full reload) paints instantly from cache while a fresh copy is fetched
// in the background. Versioned so a shape change invalidates old caches.
const CACHE_KEY = 'os.content.v1'
const CACHE_TTL_MS = 10 * 60 * 1000

interface Cached { at: number; data: SiteContent }

function readCache(): SiteContent | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Cached
    if (!parsed?.data || Date.now() - parsed.at > CACHE_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(data: SiteContent): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }))
  } catch {
    /* private mode / quota — cache is best-effort */
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  // Seed synchronously from cache so first render already has data.
  const [content, setContent] = useState<SiteContent | null>(() => readCache())
  const [loading, setLoading] = useState(() => readCache() === null)
  const [error, setError] = useState('')
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    const hadCache = content !== null

    // With a cache hit we revalidate silently; only a cold start shows a loader.
    if (!hadCache) setLoading(true)

    api.content()
      .then((data) => {
        if (cancelled) return
        setContent(data)
        setError('')
        writeCache(data)
      })
      .catch((err) => {
        if (cancelled) return
        // Keep showing cached content on a failed refresh; only surface an
        // error when we have nothing at all to render.
        if (!content) setError(err?.message || 'Failed to load')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce])

  return (
    <ContentContext.Provider
      value={{ content, loading, error, reload: () => setNonce((n) => n + 1) }}
    >
      {children}
    </ContentContext.Provider>
  )
}

export function useContent(): ContentValue {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside ContentProvider')
  return ctx
}
