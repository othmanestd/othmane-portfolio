import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useI18n } from '@/i18n'
import { Button, PageLoader, Spinner } from '@/components/ui'
import { AdminHeader, BarChart, Panel } from './parts'
import type { AdminStats } from '@/lib/types'

export default function Dashboard() {
  const { tr } = useI18n()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [seedReport, setSeedReport] = useState('')

  const load = () => {
    adminApi.stats().then(setStats).catch((e) => setError(e.message))
  }

  useEffect(load, [])

  async function reseed() {
    setSeeding(true)
    setSeedReport('')
    try {
      const result = await adminApi.seed(false)
      setSeedReport(Object.entries(result.report).map(([k, v]) => `${k}: ${v}`).join('  ·  '))
      load()
    } catch (e) {
      setSeedReport(e instanceof Error ? e.message : 'failed')
    } finally {
      setSeeding(false)
    }
  }

  if (error) return <p className="label py-20 text-center">{error}</p>
  if (!stats) return <PageLoader label={tr('common.loading')} />

  const cards = [
    { label: tr('admin.messages'), value: stats.messages_total,
      sub: `${stats.messages_unread} ${tr('admin.unread')}`, to: '/admin/messages' },
    { label: tr('admin.appointments'), value: stats.appointments_total,
      sub: `${stats.appointments_pending} ${tr('admin.pending')}`, to: '/admin/appointments' },
    { label: tr('admin.projects'), value: stats.projects_total,
      sub: `${stats.projects_published} published`, to: '/admin/projects' },
    { label: 'Page views (7d)', value: stats.page_views_7d,
      sub: `${stats.chat_messages_7d} chat`, to: '/admin/analytics' },
  ]

  const health = [
    { label: 'Database', ok: stats.health.db },
    { label: 'SMTP email', ok: stats.health.smtp },
    { label: 'Gemini LLM', ok: stats.health.gemini },
    { label: 'LLM fallback', ok: stats.health.llm_fallback },
  ]

  return (
    <>
      <AdminHeader
        title={tr('admin.dashboard')}
        subtitle={`${stats.notifications_unread} ${tr('admin.unread')}`}
        action={
          <Button variant="outline" onClick={load} magnetic={false}>
            <RefreshCw size={13} strokeWidth={2.2} /> {tr('common.retry')}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.to}>
            <Panel className="h-full transition-colors hover:border-current">
              <p className="label mb-3">{card.label}</p>
              <p className="display mb-1.5 text-[2.6rem] leading-none">{card.value}</p>
              <p className="label-tight" style={{ color: 'var(--fg-faint)' }}>{card.sub}</p>
            </Panel>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <p className="label mb-5">Activity — last 8 days</p>
          <BarChart data={stats.events_by_day.map((d) => ({ label: d.date, value: d.count }))} />
          <div className="mt-3 flex justify-between">
            <span className="label-tight" style={{ color: 'var(--fg-faint)' }}>
              {stats.events_by_day[0]?.date}
            </span>
            <span className="label-tight" style={{ color: 'var(--fg-faint)' }}>
              {stats.events_by_day.at(-1)?.date}
            </span>
          </div>
        </Panel>

        <Panel>
          <p className="label mb-5">System health</p>
          <ul className="space-y-3">
            {health.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3">
                <span className="text-sm">{item.label}</span>
                {item.ok
                  ? <CheckCircle2 size={16} strokeWidth={2} />
                  : <AlertTriangle size={16} strokeWidth={2} className="opacity-60" />}
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--edge-soft)' }}>
            <Button variant="outline" onClick={reseed} disabled={seeding}
                    magnetic={false} className="w-full">
              {seeding ? <><Spinner /> …</> : 'Seed missing content'}
            </Button>
            {seedReport && (
              <p className="label-tight mt-3 leading-relaxed" style={{ color: 'var(--fg-faint)' }}>
                {seedReport}
              </p>
            )}
          </div>
        </Panel>
      </div>

      {stats.top_paths.length > 0 && (
        <Panel className="mt-4">
          <p className="label mb-4">Top pages (7d)</p>
          <ul className="space-y-2">
            {stats.top_paths.map((entry) => (
              <li key={entry.path} className="flex items-center justify-between gap-4">
                <span className="mono truncate text-sm">{entry.path}</span>
                <span className="label-tight">{entry.count}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  )
}
