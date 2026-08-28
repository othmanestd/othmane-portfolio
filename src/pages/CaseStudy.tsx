import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, Github } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useContent } from '@/hooks/useContent'
import { api } from '@/lib/api'
import { Reveal } from '@/components/Reveal'
import { ButtonLink, PageLoader, Tag } from '@/components/ui'
import { pad, renderMarkdown, t } from '@/lib/utils'
import type { Project } from '@/lib/types'

export default function CaseStudy() {
  const { slug = '' } = useParams()
  const { tr, locale, isRtl } = useI18n()
  const { content, loading } = useContent()
  const [fallback, setFallback] = useState<Project | null>(null)
  const [missing, setMissing] = useState(false)

  const project = useMemo(
    () => content?.projects.find((p) => p.slug === slug) ?? fallback,
    [content, slug, fallback],
  )

  // Deep links can outrun the aggregate content payload — fetch directly if so.
  useEffect(() => {
    if (loading || project) return
    let cancelled = false
    api.project(slug)
      .then((result) => {
        if (cancelled) return
        if (result.item) setFallback(result.item)
        else setMissing(true)
      })
      .catch(() => { if (!cancelled) setMissing(true) })
    return () => { cancelled = true }
  }, [slug, loading, project])

  useEffect(() => {
    if (project) document.title = `${project.title} — Othmane Sadiki`
    return () => { document.title = 'Othmane Sadiki — Data Engineer' }
  }, [project])

  if (loading && !project) return <PageLoader label={tr('common.loading')} />

  if (missing && !project) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 pb-24 pt-40 md:px-8">
        <p className="label mb-5">404</p>
        <h1 className="display mb-8 text-[clamp(2rem,7vw,4.5rem)]">{tr('common.notFound')}</h1>
        <ButtonLink to="/work" variant="solid">{tr('common.backToWork')}</ButtonLink>
      </section>
    )
  }

  if (!project) return <PageLoader label={tr('common.loading')} />

  const list = content?.projects ?? []
  const position = list.findIndex((p) => p.slug === project.slug)
  const next = position >= 0 && list.length > 1 ? list[(position + 1) % list.length] : null

  const BackIcon = isRtl ? ArrowRight : ArrowLeft
  const NextIcon = isRtl ? ArrowLeft : ArrowRight

  return (
    <article className="relative">
      {/* ---------- header ---------- */}
      <header className="relative overflow-hidden px-4 pb-16 pt-32 md:px-8 md:pt-44">
        <div className="mesh" aria-hidden />
        <div className="relative z-10 mx-auto max-w-[1400px]">
          <Link
            to="/work"
            className="label-tight mb-10 inline-flex items-center gap-2 opacity-65 transition-opacity hover:opacity-100"
          >
            <BackIcon size={13} strokeWidth={2.2} /> {tr('common.backToWork')}
          </Link>

          <div className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="label">[{pad(position >= 0 ? position + 1 : 1)}]</span>
            <span className="label">{project.year}</span>
            <span className="label">{project.category.replace(/-/g, ' ')}</span>
          </div>

          <h1 className="display mb-6 text-[clamp(2.4rem,10vw,8rem)]">{project.title}</h1>

          <p className="serif-accent mb-10 max-w-3xl text-[clamp(1.3rem,3.2vw,2.3rem)] leading-tight">
            {t(project.tagline, locale)}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {project.repo_url && (
              <ButtonLink href={project.repo_url} variant="solid" target="_blank" rel="noreferrer noopener">
                <Github size={15} strokeWidth={2.2} /> {tr('common.code')}
              </ButtonLink>
            )}
            {project.live_url && (
              <ButtonLink href={project.live_url} variant="outline" target="_blank" rel="noreferrer noopener">
                <ExternalLink size={15} strokeWidth={2.2} /> {tr('common.live')}
              </ButtonLink>
            )}
          </div>
        </div>
      </header>

      {/* ---------- metrics ---------- */}
      {project.metrics.length > 0 && (
        <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-16 md:px-8">
          <Reveal>
            <div className="grid gap-px sm:grid-cols-3" style={{ background: 'var(--edge-soft)' }}>
              {project.metrics.map((metric) => (
                <div key={metric.label} className="p-6 md:p-8" style={{ background: 'var(--bg)' }}>
                  <p className="label mb-2.5">{metric.label}</p>
                  <p className="display text-[clamp(1.4rem,3.4vw,2.4rem)]">{metric.value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ---------- body + sidebar ---------- */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-24 md:px-8">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7 lg:col-span-8">
            <Reveal>
              <div
                className="prose-mono"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(t(project.body, locale)) }}
              />
            </Reveal>
          </div>

          <aside className="md:col-span-5 lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              <Reveal>
                <div className="glass border-2 p-6" style={{ borderColor: 'var(--edge-soft)' }}>
                  <p className="label mb-3">{tr('common.role')}</p>
                  <p className="mb-7 text-[0.95rem] leading-relaxed" style={{ color: 'var(--fg-dim)' }}>
                    {t(project.role, locale)}
                  </p>

                  <p className="label mb-3">{tr('common.stack')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => <Tag key={tech}>{tech}</Tag>)}
                  </div>
                </div>
              </Reveal>

              {project.highlights.length > 0 && (
                <Reveal delay={90}>
                  <div>
                    <p className="label mb-4">{tr('common.highlights')}</p>
                    <ul className="space-y-3.5">
                      {project.highlights.map((highlight, index) => (
                        <li key={index} className="flex gap-3.5">
                          <span className="label shrink-0 pt-1">{pad(index + 1)}</span>
                          <span className="text-[0.9rem] leading-relaxed" style={{ color: 'var(--fg-dim)' }}>
                            {t(highlight, locale)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- next ---------- */}
      {next && (
        <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-16 md:px-8">
          <Link
            to={`/work/${next.slug}`}
            className="group block border-t-2 pt-8"
            style={{ borderColor: 'var(--edge)' }}
          >
            <div className="flex items-end justify-between gap-6">
              <div className="min-w-0">
                <p className="label mb-3">Next</p>
                <p className="display text-[clamp(1.6rem,5vw,3.5rem)]">{next.title}</p>
                <p className="serif-accent mt-1 text-lg" style={{ color: 'var(--fg-dim)' }}>
                  {t(next.tagline, locale)}
                </p>
              </div>
              <NextIcon
                size={30} strokeWidth={1.6}
                className="mb-2 shrink-0 transition-transform duration-500 group-hover:translate-x-2 rtl:group-hover:-translate-x-2"
              />
            </div>
          </Link>
        </section>
      )}
    </article>
  )
}
