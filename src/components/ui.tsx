import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn, pad } from '@/lib/utils'
import { Magnetic } from './Magnetic'

/* --- section header -------------------------------------------------------
   The bracketed index + hairline is the recurring structural motif. */
export function SectionHeader({
  index, title, subtitle, action, className,
}: {
  index: number
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('mb-12 md:mb-16', className)}>
      <div className="flex items-end justify-between gap-6 border-b-2 pb-5"
           style={{ borderColor: 'var(--edge)' }}>
        <div className="min-w-0">
          <div className="label mb-3 flex items-center gap-3">
            <span>[{pad(index)}]</span>
            <span className="h-px w-8" style={{ background: 'var(--edge-soft)' }} />
            {subtitle && <span className="truncate normal-case tracking-[0.12em]">{subtitle}</span>}
          </div>
          <h2 className="display text-[clamp(2rem,6vw,4.5rem)]">{title}</h2>
        </div>
        {action && <div className="shrink-0 pb-2">{action}</div>}
      </div>
    </header>
  )
}

/* --- buttons -------------------------------------------------------------- */
type ButtonVariant = 'solid' | 'outline' | 'ghost'

const variantClass: Record<ButtonVariant, string> = {
  solid: 'invert-block brut-flat brut-press',
  outline: 'brut-flat brut-press',
  ghost: 'border-2 border-transparent hover:border-current',
}

const baseClass =
  'label-tight inline-flex items-center justify-center gap-2.5 px-6 py-3.5 ' +
  'font-medium transition-colors disabled:pointer-events-none disabled:opacity-45'

export function Button({
  children, variant = 'outline', className, magnetic = true, ...rest
}: {
  children: ReactNode
  variant?: ButtonVariant
  magnetic?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const button = (
    <button className={cn(baseClass, variantClass[variant], className)} {...rest}>
      {children}
    </button>
  )
  return magnetic ? <Magnetic>{button}</Magnetic> : button
}

export function ButtonLink({
  to, href, children, variant = 'outline', className, magnetic = true, ...rest
}: {
  to?: string
  href?: string
  children: ReactNode
  variant?: ButtonVariant
  magnetic?: boolean
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const classes = cn(baseClass, variantClass[variant], className)
  const inner = to
    ? <Link to={to} className={classes}>{children}</Link>
    : <a href={href} className={classes} {...rest}>{children}</a>
  return magnetic ? <Magnetic>{inner}</Magnetic> : inner
}

/* --- misc ----------------------------------------------------------------- */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="label-tight border px-2.5 py-1.5 whitespace-nowrap"
          style={{ borderColor: 'var(--edge-soft)', color: 'var(--fg-dim)' }}>
      {children}
    </span>
  )
}

export function GlassCard({ children, className, strong = false }: {
  children: ReactNode; className?: string; strong?: boolean
}) {
  return (
    <div className={cn('glass', strong && 'glass-strong', className)}>{children}</div>
  )
}

/** Status pill with a pulsing dot — used for availability. */
export function StatusDot({ label, active = true }: { label: string; active?: boolean }) {
  return (
    <span className="label-tight inline-flex items-center gap-2.5">
      <span className="relative flex h-2 w-2">
        {active && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: 'var(--fg)' }} />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: active ? 'var(--fg)' : 'var(--fg-faint)' }} />
      </span>
      {label}
    </span>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      aria-hidden
    />
  )
}

/** Full-bleed loading state used while the site content request is in flight. */
export function PageLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="label flex items-center gap-3">
        <Spinner />
        {label}…
      </div>
    </div>
  )
}
