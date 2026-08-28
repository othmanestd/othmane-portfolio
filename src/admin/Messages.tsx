import { useEffect, useState } from 'react'
import { Archive, Check, Mail, Send, Trash2 } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useI18n } from '@/i18n'
import { Button, PageLoader, Spinner } from '@/components/ui'
import { AdminHeader, EmptyState, Panel, Pill } from './parts'
import { cn, formatDate } from '@/lib/utils'
import type { Message } from '@/lib/types'

export default function Messages() {
  const { tr, locale } = useI18n()
  const [items, setItems] = useState<Message[] | null>(null)
  const [archived, setArchived] = useState(false)
  const [active, setActive] = useState<Message | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const load = () => {
    setItems(null)
    adminApi.messages(archived).then((d) => setItems(d.items)).catch(() => setItems([]))
  }

  useEffect(load, [archived])

  async function open(message: Message) {
    setActive(message)
    setReply('')
    setSent(false)
    if (!message.read) {
      await adminApi.patchMessage(message.id, { read: true }).catch(() => undefined)
      setItems((prev) => prev?.map((m) => (m.id === message.id ? { ...m, read: true } : m)) ?? null)
    }
  }

  async function sendReply() {
    if (!active || !reply.trim()) return
    setSending(true)
    try {
      await adminApi.replyMessage(active.id, reply)
      setSent(true)
      setReply('')
      load()
    } finally {
      setSending(false)
    }
  }

  async function act(message: Message, action: 'archive' | 'delete') {
    if (action === 'delete') {
      if (!confirm(tr('admin.confirmDelete'))) return
      await adminApi.deleteMessage(message.id)
    } else {
      await adminApi.patchMessage(message.id, { archived: !message.archived })
    }
    if (active?.id === message.id) setActive(null)
    load()
  }

  return (
    <>
      <AdminHeader
        title={tr('admin.messages')}
        subtitle={items ? `${items.filter((m) => !m.read).length} ${tr('admin.unread')}` : ''}
        action={
          <div className="flex gap-2">
            {[false, true].map((flag) => (
              <button
                key={String(flag)}
                onClick={() => { setArchived(flag); setActive(null) }}
                className={cn('label-tight border-2 px-3 py-2',
                  archived === flag ? 'invert-block' : 'opacity-60')}
                style={{ borderColor: archived === flag ? 'var(--edge)' : 'var(--edge-soft)' }}
              >
                {flag ? tr('admin.archive') : 'Inbox'}
              </button>
            ))}
          </div>
        }
      />

      {!items ? <PageLoader label={tr('common.loading')} />
        : items.length === 0 ? <EmptyState label={tr('admin.empty')} />
        : (
          <div className="grid gap-4 lg:grid-cols-5">
            <ul className="space-y-2 lg:col-span-2">
              {items.map((message) => (
                <li key={message.id}>
                  <button
                    onClick={() => open(message)}
                    className={cn(
                      'glass w-full border-2 p-4 text-start transition-all',
                      active?.id === message.id && 'border-current',
                    )}
                    style={{ borderColor: active?.id === message.id ? 'var(--edge)' : 'var(--edge-soft)' }}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-bold">{message.name}</span>
                      {!message.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--fg)' }} />
                      )}
                    </div>
                    <p className="mb-2 truncate text-[0.85rem]" style={{ color: 'var(--fg-dim)' }}>
                      {message.subject}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="label-tight" style={{ color: 'var(--fg-faint)' }}>
                        {formatDate(message.created_at, locale)}
                      </span>
                      {message.replied && <Pill>replied</Pill>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <div className="lg:col-span-3">
              {active ? (
                <Panel>
                  <div className="mb-5 flex items-start justify-between gap-4 border-b pb-4"
                       style={{ borderColor: 'var(--edge-soft)' }}>
                    <div className="min-w-0">
                      <h2 className="display mb-1.5 text-lg">{active.subject}</h2>
                      <p className="text-sm" style={{ color: 'var(--fg-dim)' }}>
                        {active.name} · <a href={`mailto:${active.email}`} className="link-rule">{active.email}</a>
                      </p>
                      {active.company && (
                        <p className="label-tight mt-1" style={{ color: 'var(--fg-faint)' }}>
                          {active.company}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button onClick={() => act(active, 'archive')} aria-label={tr('admin.archive')}
                              className="flex h-8 w-8 items-center justify-center border-2"
                              style={{ borderColor: 'var(--edge-soft)' }}>
                        <Archive size={13} strokeWidth={2.2} />
                      </button>
                      <button onClick={() => act(active, 'delete')} aria-label={tr('admin.delete')}
                              className="flex h-8 w-8 items-center justify-center border-2"
                              style={{ borderColor: 'var(--edge-soft)' }}>
                        <Trash2 size={13} strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>

                  <p className="mb-7 whitespace-pre-wrap text-[0.95rem] leading-relaxed"
                     style={{ color: 'var(--fg-dim)' }}>
                    {active.message}
                  </p>

                  <div className="border-t pt-5" style={{ borderColor: 'var(--edge-soft)' }}>
                    <p className="label mb-3 flex items-center gap-2">
                      <Mail size={12} strokeWidth={2.2} /> {tr('admin.reply')}
                    </p>
                    {sent ? (
                      <p className="label-tight flex items-center gap-2 border-2 p-3"
                         style={{ borderColor: 'var(--edge)' }}>
                        <Check size={13} strokeWidth={2.4} /> {tr('admin.saved')}
                      </p>
                    ) : (
                      <>
                        <textarea
                          rows={5} value={reply} onChange={(e) => setReply(e.target.value)}
                          className="field-box mb-3 resize-none"
                          placeholder={`Re: ${active.subject}`}
                        />
                        <Button variant="solid" onClick={sendReply}
                                disabled={sending || !reply.trim()} magnetic={false}>
                          {sending ? <><Spinner /> …</> : <><Send size={13} strokeWidth={2.3} /> {tr('admin.reply')}</>}
                        </Button>
                      </>
                    )}
                  </div>
                </Panel>
              ) : (
                <Panel><EmptyState label="Select a message" /></Panel>
              )}
            </div>
          </div>
        )}
    </>
  )
}
