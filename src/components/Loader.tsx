import { cn } from '@/lib/utils'

/**
 * Branded loading state in the site's own language: a hard-framed glass plate,
 * the OS monogram, and a sweeping indeterminate bar. Used for the first paint
 * and for the lazy admin chunk. Repeat visits skip it entirely because content
 * is served from the client cache (see useContent).
 */
export function Loader({ label = 'Loading', fullscreen = true }: {
  label?: string
  fullscreen?: boolean
}) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        fullscreen ? 'min-h-[100svh]' : 'min-h-[60vh]',
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mesh" aria-hidden />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div
          className="glass glass-strong relative flex h-24 w-24 items-center justify-center border-2"
          style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard)' }}
        >
          <span className="display animate-pulse text-3xl leading-none">OS</span>
          {/* corner ticks — the brutalist register mark */}
          <span className="absolute -left-1 -top-1 h-2.5 w-2.5 border-l-2 border-t-2"
                style={{ borderColor: 'var(--edge)' }} aria-hidden />
          <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 border-b-2 border-r-2"
                style={{ borderColor: 'var(--edge)' }} aria-hidden />
        </div>

        <div className="flex flex-col items-center gap-3">
          {/* indeterminate sweep */}
          <div className="relative h-0.5 w-40 overflow-hidden"
               style={{ background: 'var(--edge-soft)' }}>
            <div className="loader-sweep absolute inset-y-0 w-1/3"
                 style={{ background: 'var(--fg)' }} />
          </div>
          <span className="label">{label}…</span>
        </div>
      </div>
    </div>
  )
}
