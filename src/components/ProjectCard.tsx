import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { cn, pad, t } from '@/lib/utils'
import type { Project } from '@/lib/types'

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { locale, tr } = useI18n()

  return (
    <Link
      to={`/work/${project.slug}`}
      className="group relative block"
      aria-label={`${project.title} — ${tr('common.viewProject')}`}
    >
      <article
        className="glass relative h-full overflow-hidden border-2 p-6 transition-all duration-500 md:p-8"
        style={{
          borderColor: 'var(--edge)',
          transitionTimingFunction: 'var(--ease-out-expo)',
        }}
      >
        {/* Hover wash — the glass brightening under the pointer */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: 'var(--glass-bg-strong)' }}
          aria-hidden
        />

        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-6 flex items-start justify-between gap-4">
            <span className="label">[{pad(index)}]</span>
            <div className="flex items-center gap-3">
              {project.featured && (
                <span className="label-tight border px-2 py-1"
                      style={{ borderColor: 'var(--edge-soft)' }}>
                  Featured
                </span>
              )}
              <span className="label">{project.year}</span>
            </div>
          </div>

          <h3 className="display mb-3 text-[clamp(1.5rem,3.2vw,2.35rem)] leading-[0.95]">
            {project.title}
          </h3>

          <p className="serif-accent mb-5 text-lg leading-snug" style={{ color: 'var(--fg-dim)' }}>
            {t(project.tagline, locale)}
          </p>

          <p className="mb-7 line-clamp-3 text-[0.94rem] leading-relaxed"
             style={{ color: 'var(--fg-dim)' }}>
            {t(project.summary, locale)}
          </p>

          <div className="mt-auto">
            <div className="mb-5 flex flex-wrap gap-1.5">
              {project.stack.slice(0, 4).map((tech) => (
                <span key={tech} className="label-tight border px-2 py-1"
                      style={{ borderColor: 'var(--edge-soft)', color: 'var(--fg-faint)' }}>
                  {tech}
                </span>
              ))}
              {project.stack.length > 4 && (
                <span className="label-tight px-1 py-1" style={{ color: 'var(--fg-faint)' }}>
                  +{project.stack.length - 4}
                </span>
              )}
            </div>

            <div
              className="flex items-center justify-between border-t pt-4"
              style={{ borderColor: 'var(--edge-soft)' }}
            >
              <span className="label-tight">{tr('common.viewProject')}</span>
              <ArrowUpRight
                size={18}
                strokeWidth={2}
                className={cn(
                  'transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1',
                  'rtl:group-hover:-translate-x-1',
                )}
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
