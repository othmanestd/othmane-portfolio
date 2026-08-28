import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Localized } from '@/lib/types'

export function AdminHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: ReactNode
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 pb-5"
            style={{ borderColor: 'var(--edge)' }}>
      <div>
        <h1 className="display text-[clamp(1.6rem,4vw,2.6rem)]">{title}</h1>
        {subtitle && <p className="label mt-2">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('glass border-2 p-5', className)} style={{ borderColor: 'var(--edge-soft)' }}>
      {children}
    </div>
  )
}

export function EmptyState({ label }: { label: string }) {
  return <p className="label py-20 text-center">{label}</p>
}

export function Pill({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={cn('label-tight border px-2 py-1', active && 'invert-block')}
      style={{ borderColor: active ? 'var(--edge)' : 'var(--edge-soft)' }}
    >
      {children}
    </span>
  )
}

export function AdminField({ label, children, hint }: {
  label: string; children: ReactNode; hint?: string
}) {
  return (
    <label className="block">
      <span className="label mb-1.5 flex items-baseline gap-2">
        {label}
        {hint && <span className="normal-case opacity-55">({hint})</span>}
      </span>
      {children}
    </label>
  )
}

/** Compact monochrome bar chart — no charting dependency needed. */
export function BarChart({ data, height = 90 }: {
  data: { label: string; value: number }[]; height?: number
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex items-stretch gap-1.5" style={{ height }}>
      {data.map((point) => (
        <div key={point.label} className="group relative flex flex-1 flex-col justify-end">
          <div
            className="w-full transition-opacity group-hover:opacity-70"
            style={{
              height: `${Math.max(3, (point.value / max) * 100)}%`,
              background: 'var(--fg)',
            }}
            title={`${point.label}: ${point.value}`}
          />
        </div>
      ))}
    </div>
  )
}

/** Three-tab editor for a localized string — keeps admin forms compact. */
export function LocalizedInput({
  value, onChange, rows = 2,
}: { value: Localized; onChange: (next: Localized) => void; rows?: number }) {
  const [tab, setTab] = useState<keyof Localized>('en')
  return (
    <div>
      <div className="mb-1.5 flex gap-1">
        {(['en', 'fr', 'ar'] as const).map((code) => (
          <button
            key={code} type="button" onClick={() => setTab(code)}
            className={cn('label-tight border px-2 py-1', tab === code ? 'invert-block' : 'opacity-55')}
            style={{ borderColor: tab === code ? 'var(--edge)' : 'var(--edge-soft)' }}
          >
            {code.toUpperCase()}{value[code] ? '' : ' \u00b7'}
          </button>
        ))}
      </div>
      <textarea
        rows={rows}
        value={value[tab]}
        dir={tab === 'ar' ? 'rtl' : 'ltr'}
        onChange={(event) => onChange({ ...value, [tab]: event.target.value })}
        className="field-box resize-y"
      />
    </div>
  )
}
