import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { useI18n } from '@/i18n'
import { PageLoader } from '@/components/ui'
import { AdminHeader, EmptyState, Panel, Pill } from './parts'
import { cn, formatDate } from '@/lib/utils'

interface Analytics {
  range_days: number
  total_events: number
  unique_visitors: number
  by_locale: { locale: string; count: number }[]
  by_event: { name: string; count: number }[]
  recent_questions: { question: string; provider: string; degraded: boolean; created_at: string }[]
}

const RANGES = [7, 30, 90] as const

export default function AnalyticsAdmin() {
  const { tr, locale } = useI18n()
  const [days, setDays] = useState<number>(30)
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    setData(null)
    adminApi.analytics(days).then(setData).catch(() => setData(null))
  }, [days])

  if (!data) return <PageLoader label={tr('common.loading')} />

  const maxEvent = Math.max(1, ...data.by_event.map((e) => e.count))

  return (
    <>
      <AdminHeader
        title={tr('admin.analytics')}
        subtitle={`${data.total_events} events · ${data.unique_visitors} visitors`}
        action={
          <div className="flex gap-2">
            {RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setDays(range)}
                className={cn('label-tight border-2 px-3 py-2',
                  days === range ? 'invert-block' : 'opacity-60')}
                style={{ borderColor: days === range ? 'var(--edge)' : 'var(--edge-soft)' }}
              >
                {range}d
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Panel>
          <p className="label mb-3">Total events</p>
          <p className="display text-[2.6rem] leading-none">{data.total_events}</p>
        </Panel>
        <Panel>
          <p className="label mb-3">Unique visitors</p>
          <p className="display text-[2.6rem] leading-none">{data.unique_visitors}</p>
        </Panel>
        <Panel>
          <p className="label mb-4">By language</p>
          <ul className="space-y-2">
            {data.by_locale.slice(0, 4).map((entry) => (
              <li key={entry.locale} className="flex items-center justify-between">
                <span className="label-tight">{entry.locale.toUpperCase()}</span>
                <span className="text-sm font-bold">{entry.count}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mb-4">
        <p className="label mb-4">Events</p>
        <ul className="space-y-2.5">
          {data.by_event.map((entry) => (
            <li key={entry.name}>
              <div className="mb-1 flex items-center justify-between gap-4">
                <span className="mono text-sm">{entry.name}</span>
                <span className="label-tight">{entry.count}</span>
              </div>
              <div className="h-1.5" style={{ background: 'var(--edge-soft)' }}>
                <div className="h-full" style={{
                  width: `${(entry.count / maxEvent) * 100}%`, background: 'var(--fg)',
                }} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <p className="label mb-4">What visitors asked the chatbot</p>
        {data.recent_questions.length === 0 ? (
          <EmptyState label={tr('admin.empty')} />
        ) : (
          <ul className="space-y-3">
            {data.recent_questions.map((entry, index) => (
              <li key={index} className="border-b pb-3" style={{ borderColor: 'var(--edge-soft)' }}>
                <p className="mb-1.5 text-sm">{entry.question}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>{entry.provider}</Pill>
                  {entry.degraded && <Pill>degraded</Pill>}
                  <span className="label-tight" style={{ color: 'var(--fg-faint)' }}>
                    {formatDate(entry.created_at, locale)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}
