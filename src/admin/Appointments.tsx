import { useEffect, useState } from 'react'
import { Check, Trash2, X } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useI18n } from '@/i18n'
import { PageLoader } from '@/components/ui'
import { AdminHeader, EmptyState, Panel, Pill } from './parts'
import { cn, formatDate } from '@/lib/utils'
import type { Appointment } from '@/lib/types'

const FILTERS = ['', 'pending', 'confirmed', 'declined', 'completed'] as const

export default function Appointments() {
  const { tr, locale } = useI18n()
  const [items, setItems] = useState<Appointment[] | null>(null)
  const [filter, setFilter] = useState<string>('')
  const [busyId, setBusyId] = useState('')

  const load = () => {
    setItems(null)
    adminApi.appointments(filter).then((d) => setItems(d.items)).catch(() => setItems([]))
  }

  useEffect(load, [filter])

  async function setStatus(item: Appointment, status: string) {
    setBusyId(item.id)
    try {
      await adminApi.updateAppointment(item.id, status, '', true)
      load()
    } finally {
      setBusyId('')
    }
  }

  async function remove(item: Appointment) {
    if (!confirm(tr('admin.confirmDelete'))) return
    await adminApi.deleteAppointment(item.id)
    load()
  }

  return (
    <>
      <AdminHeader
        title={tr('admin.appointments')}
        action={
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((entry) => (
              <button
                key={entry || 'all'}
                onClick={() => setFilter(entry)}
                className={cn('label-tight border-2 px-3 py-2',
                  filter === entry ? 'invert-block' : 'opacity-60')}
                style={{ borderColor: filter === entry ? 'var(--edge)' : 'var(--edge-soft)' }}
              >
                {entry || tr('common.all')}
              </button>
            ))}
          </div>
        }
      />

      {!items ? <PageLoader label={tr('common.loading')} />
        : items.length === 0 ? <EmptyState label={tr('admin.empty')} />
        : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <Panel>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <span className="display text-lg">{item.name}</span>
                        <Pill active={item.status === 'confirmed'}>{item.status}</Pill>
                      </div>
                      <p className="mb-1.5 text-sm" style={{ color: 'var(--fg-dim)' }}>
                        <a href={`mailto:${item.email}`} className="link-rule">{item.email}</a>
                        {item.phone && ` · ${item.phone}`}
                      </p>
                      <p className="label mb-2">
                        {formatDate(item.slot_start, locale)} · {item.duration_minutes} min · {item.timezone}
                      </p>
                      {item.topic && <p className="text-sm font-bold">{item.topic}</p>}
                      {item.notes && (
                        <p className="mt-1.5 text-sm" style={{ color: 'var(--fg-dim)' }}>{item.notes}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {item.status !== 'confirmed' && (
                        <button onClick={() => setStatus(item, 'confirmed')} disabled={busyId === item.id}
                                className="label-tight flex items-center gap-1.5 border-2 px-3 py-2 transition-colors hover:invert-block"
                                style={{ borderColor: 'var(--edge-soft)' }}>
                          <Check size={12} strokeWidth={2.4} /> {tr('admin.confirm')}
                        </button>
                      )}
                      {item.status !== 'declined' && (
                        <button onClick={() => setStatus(item, 'declined')} disabled={busyId === item.id}
                                className="label-tight flex items-center gap-1.5 border-2 px-3 py-2 transition-colors hover:invert-block"
                                style={{ borderColor: 'var(--edge-soft)' }}>
                          <X size={12} strokeWidth={2.4} /> {tr('admin.decline')}
                        </button>
                      )}
                      <button onClick={() => remove(item)} aria-label={tr('admin.delete')}
                              className="flex h-[34px] w-[34px] items-center justify-center border-2"
                              style={{ borderColor: 'var(--edge-soft)' }}>
                        <Trash2 size={13} strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        )}
    </>
  )
}
