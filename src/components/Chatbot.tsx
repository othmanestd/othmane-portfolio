import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Eraser, MessageSquare, X } from 'lucide-react'
import { useI18n } from '@/i18n'
import { api } from '@/lib/api'
import { track } from '@/lib/analytics'
import { cn, sessionId } from '@/lib/utils'
import type { ChatSource } from '@/lib/types'
import { Spinner } from './ui'

interface Turn {
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
  degraded?: boolean
  notice?: string
}

export function Chatbot() {
  const { tr, locale, isRtl } = useI18n()
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const suggestions = [tr('chat.s1'), tr('chat.s2'), tr('chat.s3'), tr('chat.s4')]

  useEffect(() => {
    if (open) {
      track('chat_open')
      setTimeout(() => inputRef.current?.focus(), 380)
    }
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, busy])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function send(text: string) {
    const question = text.trim()
    if (!question || busy) return

    setError('')
    setInput('')
    const history = turns.map((turn) => ({ role: turn.role, content: turn.content }))
    setTurns((prev) => [...prev, { role: 'user', content: question }])
    setBusy(true)

    try {
      const reply = await api.chat({
        message: question,
        locale,
        history: history.slice(-8),
        session_id: sessionId(),
      })
      setTurns((prev) => [...prev, {
        role: 'assistant',
        content: reply.reply,
        sources: reply.sources,
        degraded: reply.degraded,
        notice: reply.notice,
      }])
      track('chat_reply', { provider: reply.provider, degraded: reply.degraded })
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen(true)}
        aria-label={tr('chat.open')}
        className={cn(
          'fixed bottom-5 z-[140] flex items-center gap-3 border-2 px-5 py-3.5 transition-all duration-500',
          '[transition-timing-function:var(--ease-out-expo)] invert-block',
          isRtl ? 'start-5' : 'end-5',
          open ? 'pointer-events-none translate-y-6 opacity-0' : 'opacity-100',
        )}
        style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard-sm)' }}
      >
        <MessageSquare size={15} strokeWidth={2.3} />
        <span className="label-tight hidden sm:inline">{tr('chat.open')}</span>
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      </button>

      {/* Panel */}
      <div
        className={cn(
          'fixed inset-0 z-[150] flex items-end justify-center p-0 sm:items-end sm:p-5',
          isRtl ? 'sm:justify-start' : 'sm:justify-end',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={tr('chat.title')}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 backdrop-blur-sm transition-opacity duration-400 sm:hidden',
            open ? 'opacity-100' : 'opacity-0',
          )}
          style={{ background: 'color-mix(in srgb, var(--bg) 70%, transparent)' }}
        />

        <div
          className={cn(
            'glass glass-strong relative flex h-[86dvh] w-full flex-col border-2 transition-all duration-500 sm:h-[620px] sm:max-h-[80dvh] sm:w-[440px]',
            '[transition-timing-function:var(--ease-out-expo)]',
            open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
          style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between gap-3 border-b-2 px-4 py-3"
            style={{ borderColor: 'var(--edge)' }}
          >
            <div className="min-w-0">
              <p className="display text-base leading-tight">{tr('chat.title')}</p>
              <p className="label-tight mt-1 truncate" style={{ color: 'var(--fg-faint)' }}>
                {tr('chat.sub')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {turns.length > 0 && (
                <button
                  onClick={() => { setTurns([]); setError('') }}
                  aria-label={tr('chat.clear')}
                  className="flex h-8 w-8 items-center justify-center border-2 transition-colors hover:invert-block"
                  style={{ borderColor: 'var(--edge-soft)' }}
                >
                  <Eraser size={13} strokeWidth={2.2} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label={tr('common.close')}
                className="flex h-8 w-8 items-center justify-center border-2 transition-colors hover:invert-block"
                style={{ borderColor: 'var(--edge-soft)' }}
              >
                <X size={14} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* Transcript */}
          <div ref={scrollRef} className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {turns.length === 0 && (
              <>
                <Bubble role="assistant">{tr('chat.greeting')}</Bubble>
                <div className="space-y-2 pt-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => send(suggestion)}
                      className="w-full border-2 px-3.5 py-2.5 text-start text-[0.8rem] leading-snug transition-colors hover:invert-block"
                      style={{ borderColor: 'var(--edge-soft)' }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </>
            )}

            {turns.map((turn, index) => (
              <div key={index} className="space-y-2">
                <Bubble role={turn.role}>{turn.content}</Bubble>

                {turn.notice && (
                  <p
                    className="label-tight border-s-2 ps-2.5 leading-relaxed"
                    style={{ borderColor: 'var(--edge-soft)', color: 'var(--fg-faint)' }}
                  >
                    {turn.notice}
                  </p>
                )}

                {turn.role === 'assistant' && !!turn.sources?.length && (
                  <details className="group">
                    <summary className="label-tight cursor-pointer list-none opacity-55 hover:opacity-100">
                      {tr('chat.sources')} ({turn.sources.length})
                    </summary>
                    <ul className="mt-2 space-y-1.5">
                      {turn.sources.map((source) => (
                        <li
                          key={source.title}
                          className="label-tight border-s-2 ps-2.5 leading-relaxed"
                          style={{ borderColor: 'var(--edge-soft)', color: 'var(--fg-faint)' }}
                        >
                          {source.title}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}

            {busy && (
              <div className="label-tight flex items-center gap-2.5 opacity-65">
                <Spinner /> {tr('chat.thinking')}…
              </div>
            )}

            {error && (
              <p className="label-tight border-2 p-2.5" style={{ borderColor: 'var(--edge)' }}>
                {error}
              </p>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(event) => { event.preventDefault(); send(input) }}
            className="flex items-end gap-2 border-t-2 p-3"
            style={{ borderColor: 'var(--edge)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  send(input)
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder={tr('chat.placeholder')}
              className="field-box max-h-28 min-h-[42px] flex-1 resize-none"
              style={{ fontFamily: 'inherit' }}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label={tr('chat.send')}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center border-2 transition-all invert-block disabled:opacity-35"
              style={{ borderColor: 'var(--edge)' }}
            >
              <ArrowUp size={16} strokeWidth={2.4} />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

function Bubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[88%] whitespace-pre-wrap border-2 px-3.5 py-2.5 text-[0.875rem] leading-relaxed',
          isUser && 'invert-block',
        )}
        style={{ borderColor: isUser ? 'var(--edge)' : 'var(--edge-soft)' }}
      >
        {children}
      </div>
    </div>
  )
}
