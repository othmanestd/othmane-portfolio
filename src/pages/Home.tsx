import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUpRight, Github, Linkedin } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useContent } from '@/hooks/useContent'
import { Reveal } from '@/components/Reveal'
import { Marquee } from '@/components/Marquee'
import { ProjectCard } from '@/components/ProjectCard'
import { ScrambleText } from '@/components/ScrambleText'
import { Button, ButtonLink, PageLoader, SectionHeader, StatusDot } from '@/components/ui'
import { pad, t } from '@/lib/utils'

export default function Home() {
  const { tr, locale } = useI18n()
  const { content, loading } = useContent()

  if (loading || !content) return <PageLoader label={tr('common.loading')} />

  const { profile, projects, skills, experiences, awards, certifications } = content
  const featured = projects.filter((p) => p.featured).slice(0, 4)
  const rest = projects.filter((p) => !p.featured)

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-4 pb-16 pt-32 md:px-8">
        <div className="mesh" aria-hidden />

        <div className="relative z-10 mx-auto w-full max-w-[1400px]">
          <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <StatusDot
              label={profile.available ? tr('hero.available') : tr('hero.unavailable')}
              active={profile.available}
            />
            <span className="label">{tr('hero.based')}</span>
            <span className="label hidden sm:inline">— {new Date().getFullYear()}</span>
          </div>

          <h1 className="display mb-8 text-[clamp(3.2rem,13vw,11rem)]">
            <span className="block">
              <ScrambleText text="OTHMANE" speed={30} />
            </span>
            <span className="block">
              <ScrambleText text="SADIKI" speed={30} startDelay={280} />
            </span>
          </h1>

          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="serif-accent mb-6 text-[clamp(1.4rem,3.2vw,2.4rem)] leading-tight">
                {t(profile.headline, locale)}
              </p>
              <p
                className="mb-9 max-w-xl text-base leading-relaxed md:text-lg"
                style={{ color: 'var(--fg-dim)' }}
              >
                {t(profile.bio, locale)}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink to="/work" variant="solid">
                  {tr('hero.cta.work')} <ArrowUpRight size={15} strokeWidth={2.4} />
                </ButtonLink>
                <ButtonLink to="/contact" variant="outline">
                  {tr('hero.cta.talk')}
                </ButtonLink>
                <div className="flex items-center gap-2 ps-1">
                  <a
                    href={content.meta.github}
                    target="_blank" rel="noreferrer noopener"
                    aria-label="GitHub"
                    className="flex h-11 w-11 items-center justify-center border-2 transition-colors hover:invert-block"
                    style={{ borderColor: 'var(--edge-soft)' }}
                  >
                    <Github size={16} strokeWidth={2} />
                  </a>
                  <a
                    href={content.meta.linkedin}
                    target="_blank" rel="noreferrer noopener"
                    aria-label="LinkedIn"
                    className="flex h-11 w-11 items-center justify-center border-2 transition-colors hover:invert-block"
                    style={{ borderColor: 'var(--edge-soft)' }}
                  >
                    <Linkedin size={16} strokeWidth={2} />
                  </a>
                </div>
              </div>
            </div>

            {/* Portrait: hard frame, glass plate, duotone treatment */}
            <div className="md:col-span-5 md:justify-self-end">
              <figure className="relative w-full max-w-[320px]">
                <div
                  className="glass relative aspect-[4/5] overflow-hidden border-2"
                  style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard)' }}
                >
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.name}
                      loading="eager"
                      className="h-full w-full object-cover object-center transition-all duration-700 hover:scale-[1.03]"
                      style={{ filter: 'grayscale(1) contrast(1.12) brightness(0.97)' }}
                    />
                  ) : (
                    <div className="stripe h-full w-full" />
                  )}
                </div>
                <figcaption
                  className="label-tight mt-3 flex items-center justify-between"
                  style={{ color: 'var(--fg-faint)' }}
                >
                  <span>{profile.name}</span>
                  <span>{profile.location}</span>
                </figcaption>
              </figure>
            </div>
          </div>

          <div className="mt-16 flex items-center gap-3 md:mt-20">
            <ArrowDown size={14} strokeWidth={2.2} className="animate-bounce" />
            <span className="label">{tr('hero.scroll')}</span>
            <span className="h-px flex-1 max-w-[220px]" style={{ background: 'var(--edge-soft)' }} />
          </div>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <section
        className="relative z-10 border-y-2 py-5 invert-block"
        style={{ borderColor: 'var(--edge)' }}
        aria-hidden
      >
        <Marquee
          items={['SPARK STRUCTURED STREAMING', 'DELTA LAKE', 'AIRFLOW', 'CELONIS',
                  'AZURE DATA FACTORY', 'DATABRICKS', 'DATA QUALITY', 'POWER BI']}
          duration={48}
        />
      </section>

      {/* ================= STATS ================= */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        <div className="grid grid-cols-2 gap-px md:grid-cols-4"
             style={{ background: 'var(--edge-soft)' }}>
          {[
            { value: String(projects.length), label: tr('common.projects') },
            { value: String(experiences.length), label: tr('section.experience') },
            { value: String(awards.length), label: tr('section.awards') },
            { value: String(certifications.length), label: tr('section.certifications') },
          ].map((stat, index) => (
            <Reveal key={stat.label} delay={index * 70}>
              <div className="p-6 md:p-8" style={{ background: 'var(--bg)' }}>
                <p className="display mb-2 text-[clamp(2.4rem,6vw,4.5rem)]">{stat.value}</p>
                <p className="label">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= SELECTED WORK ================= */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-24 md:px-8 md:pb-32">
        <Reveal>
          <SectionHeader
            index={1}
            title={tr('section.work')}
            subtitle={tr('section.work.sub')}
            action={
              <Link to="/work" className="label-tight link-rule hidden items-center gap-2 sm:inline-flex">
                {tr('common.viewAll')} <ArrowUpRight size={13} strokeWidth={2.2} />
              </Link>
            }
          />
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((project, index) => (
            <Reveal key={project.slug} delay={index * 90}>
              <ProjectCard project={project} index={index + 1} />
            </Reveal>
          ))}
        </div>

        {rest.length > 0 && (
          <Reveal className="mt-12">
            <ul className="border-t-2" style={{ borderColor: 'var(--edge)' }}>
              {rest.map((project, index) => (
                <li key={project.slug} className="border-b" style={{ borderColor: 'var(--edge-soft)' }}>
                  <Link
                    to={`/work/${project.slug}`}
                    className="group flex flex-wrap items-baseline gap-x-5 gap-y-2 py-5 transition-opacity hover:opacity-100 md:opacity-75"
                  >
                    <span className="label w-10 shrink-0">[{pad(featured.length + index + 1)}]</span>
                    <span className="display text-[clamp(1.2rem,2.6vw,1.9rem)]">{project.title}</span>
                    <span className="serif-accent text-base" style={{ color: 'var(--fg-dim)' }}>
                      {t(project.tagline, locale)}
                    </span>
                    <ArrowUpRight
                      size={17} strokeWidth={2}
                      className="ms-auto shrink-0 transition-transform duration-400 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </section>

      {/* ================= CAPABILITIES ================= */}
      <section className="relative z-10 overflow-hidden">
        <div className="mesh opacity-60" aria-hidden />
        <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
          <Reveal>
            <SectionHeader
              index={2}
              title={tr('section.capabilities')}
              subtitle={tr('section.capabilities.sub')}
            />
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((group, index) => (
              <Reveal key={group.key} delay={index * 60}>
                <div className="glass h-full border-2 p-5" style={{ borderColor: 'var(--edge-soft)' }}>
                  <div className="mb-4 flex items-baseline gap-2.5">
                    <span className="label">[{pad(index + 1)}]</span>
                    <h3 className="label-tight leading-snug" style={{ color: 'var(--fg)' }}>
                      {t(group.label, locale)}
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item} className="text-[0.875rem]" style={{ color: 'var(--fg-dim)' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= EXPERIENCE ================= */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-24 md:px-8 md:pb-32">
        <Reveal>
          <SectionHeader
            index={3}
            title={tr('section.experience')}
            subtitle={tr('section.experience.sub')}
            action={
              <Link to="/about" className="label-tight link-rule hidden items-center gap-2 sm:inline-flex">
                {tr('nav.about')} <ArrowUpRight size={13} strokeWidth={2.2} />
              </Link>
            }
          />
        </Reveal>

        <ul className="border-t-2" style={{ borderColor: 'var(--edge)' }}>
          {experiences.map((role, index) => (
            <Reveal key={`${role.company}-${index}`} as="li" delay={index * 60}>
              <div className="grid gap-3 border-b py-7 md:grid-cols-12 md:gap-6"
                   style={{ borderColor: 'var(--edge-soft)' }}>
                <div className="md:col-span-3">
                  <p className="label">{t(role.period, locale)}</p>
                </div>
                <div className="md:col-span-4">
                  <h3 className="display text-[clamp(1.2rem,2.4vw,1.75rem)]">{role.company}</h3>
                  <p className="serif-accent text-lg" style={{ color: 'var(--fg-dim)' }}>
                    {t(role.role, locale)}
                  </p>
                </div>
                <div className="md:col-span-5">
                  <div className="flex flex-wrap gap-1.5">
                    {role.stack.slice(0, 6).map((tech) => (
                      <span key={tech} className="label-tight border px-2 py-1"
                            style={{ borderColor: 'var(--edge-soft)', color: 'var(--fg-faint)' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-8 md:px-8">
        <Reveal>
          <div
            className="glass glass-strong relative overflow-hidden border-2 px-6 py-16 text-center md:px-16 md:py-24"
            style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard)' }}
          >
            <div className="mesh" aria-hidden />
            <div className="relative z-10">
              <p className="label mb-6">[{pad(4)}] — {tr('section.contact')}</p>
              <h2 className="display mx-auto mb-7 max-w-3xl text-[clamp(2rem,7vw,5rem)]">
                {tr('contact.title')}
              </h2>
              <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed"
                 style={{ color: 'var(--fg-dim)' }}>
                {tr('contact.sub')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ButtonLink to="/contact" variant="solid">
                  {tr('contact.send')} <ArrowUpRight size={15} strokeWidth={2.4} />
                </ButtonLink>
                <ButtonLink to="/card" variant="outline">
                  {tr('card.title')}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
