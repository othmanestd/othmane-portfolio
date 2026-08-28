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

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.content()
      .then((data) => { if (!cancelled) { setContent(data); setError('') } })
      .catch((err) => { if (!cancelled) setError(err?.message || 'Failed to load') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
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
