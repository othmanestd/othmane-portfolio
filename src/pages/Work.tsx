import { useMemo, useState } from 'react'
import { useI18n } from '@/i18n'
import { useContent } from '@/hooks/useContent'
import { Reveal } from '@/components/Reveal'
import { ProjectCard } from '@/components/ProjectCard'
import { PageLoader, SectionHeader } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function Work() {
  const { tr } = useI18n()
  const { content, loading } = useContent()
  const [category, setCategory] = useState('all')

  const categories = useMemo(() => {
    if (!content) return []
    return ['all', ...Array.from(new Set(content.projects.map((p) => p.category)))]
  }, [content])

  if (loading || !content) return <PageLoader label={tr('common.loading')} />

  const visible = category === 'all'
    ? content.projects
    : content.projects.filter((p) => p.category === category)

  return (
    <section className="relative mx-auto max-w-[1400px] px-4 pb-24 pt-36 md:px-8 md:pb-32 md:pt-44">
      <Reveal>
        <SectionHeader index={1} title={tr('section.work')} subtitle={tr('section.work.sub')} />
      </Reveal>

      <Reveal className="mb-10">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label={tr('common.filter')}>
          {categories.map((entry) => (
            <button
              key={entry}
              onClick={() => setCategory(entry)}
              aria-pressed={category === entry}
              className={cn(
                'label-tight shrink-0 border-2 px-4 py-2.5 transition-all',
                category === entry ? 'invert-block' : 'opacity-60 hover:opacity-100',
              )}
              style={{ borderColor: category === entry ? 'var(--edge)' : 'var(--edge-soft)' }}
            >
              {entry === 'all' ? tr('common.all') : entry.replace(/-/g, ' ')}
              <span className="ms-2 opacity-55">
                {entry === 'all'
                  ? content.projects.length
                  : content.projects.filter((p) => p.category === entry).length}
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        {visible.map((project, index) => (
          <Reveal key={project.slug} delay={index * 70}>
            <ProjectCard project={project} index={index + 1} />
          </Reveal>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="label py-20 text-center">{tr('common.notFound')}</p>
      )}
    </section>
  )
}
