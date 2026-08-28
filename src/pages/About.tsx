import { Award as AwardIcon, BadgeCheck, Download, Mail, MapPin, Phone } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useContent } from '@/hooks/useContent'
import { Reveal } from '@/components/Reveal'
import { ButtonLink, PageLoader, SectionHeader, StatusDot, Tag } from '@/components/ui'
import { pad, t } from '@/lib/utils'

const LANGUAGES = [
  { key: 'ar', level: { fr: 'Langue maternelle', en: 'Native', ar: 'لغة أم' }, bars: 5 },
  { key: 'fr', level: { fr: 'Courant', en: 'Fluent', ar: 'بطلاقة' }, bars: 5 },
  { key: 'en', level: { fr: 'Intermédiaire', en: 'Intermediate', ar: 'متوسط' }, bars: 3 },
] as const

const LANGUAGE_NAMES = {
  ar: { fr: 'Arabe', en: 'Arabic', ar: 'العربية' },
  fr: { fr: 'Français', en: 'French', ar: 'الفرنسية' },
  en: { fr: 'Anglais', en: 'English', ar: 'الإنجليزية' },
} as const

export default function About() {
  const { tr, locale } = useI18n()
  const { content, loading } = useContent()

  if (loading || !content) return <PageLoader label={tr('common.loading')} />

  const { profile, experiences, education, skills, awards, certifications } = content

  return (
    <>
      {/* ---------- intro ---------- */}
      <section className="relative overflow-hidden px-4 pb-20 pt-36 md:px-8 md:pt-44">
        <div className="mesh" aria-hidden />
        <div className="relative z-10 mx-auto max-w-[1400px]">
          <p className="label mb-7">[{pad(1)}] — {tr('section.about')}</p>

          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <h1 className="display mb-8 text-[clamp(2.4rem,8vw,6rem)]">{profile.name}</h1>
              <p className="serif-accent mb-9 text-[clamp(1.3rem,3vw,2.1rem)] leading-tight">
                {t(profile.headline, locale)}
              </p>

              <div className="space-y-5">
                {t(profile.long_bio, locale).split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-base leading-relaxed md:text-[1.05rem]"
                     style={{ color: 'var(--fg-dim)' }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                {profile.cv_url_fr && (
                  <ButtonLink href={profile.cv_url_fr} variant="solid" download>
                    <Download size={15} strokeWidth={2.2} /> CV — FR
                  </ButtonLink>
                )}
                <ButtonLink to="/contact" variant="outline">{tr('hero.cta.talk')}</ButtonLink>
              </div>
            </div>

            <div className="md:col-span-5 md:justify-self-end">
              <div className="w-full max-w-[340px] space-y-5">
                <figure
                  className="glass relative aspect-square overflow-hidden border-2"
                  style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard)' }}
                >
                  {profile.photo_url && (
                    <img
                      src={profile.photo_url}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                      style={{ filter: 'grayscale(1) contrast(1.12)' }}
                    />
                  )}
                </figure>

                <div className="glass border-2 p-5" style={{ borderColor: 'var(--edge-soft)' }}>
                  <StatusDot
                    label={profile.available ? tr('hero.available') : tr('hero.unavailable')}
                    active={profile.available}
                  />
                  <ul className="mt-5 space-y-3">
                    <li className="flex items-center gap-3 text-sm" style={{ color: 'var(--fg-dim)' }}>
                      <MapPin size={14} strokeWidth={2} className="shrink-0" />
                      {profile.location}
                    </li>
                    <li>
                      <a href={`mailto:${profile.email}`}
                         className="link-rule flex items-center gap-3 text-sm break-all"
                         style={{ color: 'var(--fg-dim)' }}>
                        <Mail size={14} strokeWidth={2} className="shrink-0" />
                        {profile.email}
                      </a>
                    </li>
                    <li>
                      <a href={`tel:${profile.phone}`}
                         className="link-rule flex items-center gap-3 text-sm"
                         style={{ color: 'var(--fg-dim)' }}>
                        <Phone size={14} strokeWidth={2} className="shrink-0" />
                        {profile.phone}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- experience ---------- */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-24 md:px-8">
        <Reveal>
          <SectionHeader index={2} title={tr('section.experience')} subtitle={tr('section.experience.sub')} />
        </Reveal>

        <div className="space-y-px" style={{ background: 'var(--edge-soft)' }}>
          {experiences.map((role, index) => (
            <Reveal key={`${role.company}-${index}`} delay={index * 60}>
              <div className="grid gap-6 py-9 md:grid-cols-12" style={{ background: 'var(--bg)' }}>
                <div className="md:col-span-3">
                  <p className="label mb-2">{t(role.period, locale)}</p>
                  <p className="label-tight" style={{ color: 'var(--fg-faint)' }}>{role.location}</p>
                </div>

                <div className="md:col-span-9">
                  <h3 className="display mb-1 text-[clamp(1.4rem,3vw,2.1rem)]">{role.company}</h3>
                  <p className="serif-accent mb-5 text-lg" style={{ color: 'var(--fg-dim)' }}>
                    {t(role.role, locale)}
                  </p>

                  <ul className="mb-5 space-y-2.5">
                    {role.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex gap-3">
                        <span className="shrink-0" style={{ color: 'var(--fg-faint)' }}>—</span>
                        <span className="text-[0.94rem] leading-relaxed" style={{ color: 'var(--fg-dim)' }}>
                          {t(bullet, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-1.5">
                    {role.stack.map((tech) => <Tag key={tech}>{tech}</Tag>)}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- education + languages ---------- */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-24 md:px-8">
        <div className="grid gap-14 md:grid-cols-2">
          <div>
            <Reveal>
              <SectionHeader index={3} title={tr('section.education')} className="mb-9" />
            </Reveal>
            <ul className="space-y-px" style={{ background: 'var(--edge-soft)' }}>
              {education.map((entry, index) => (
                <Reveal key={index} as="li" delay={index * 70}>
                  <div className="py-6" style={{ background: 'var(--bg)' }}>
                    <p className="label mb-2">{t(entry.period, locale)}</p>
                    <h3 className="mb-1 text-lg font-bold leading-snug">{t(entry.role, locale)}</h3>
                    <p className="text-sm" style={{ color: 'var(--fg-dim)' }}>{entry.company}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <div>
            <Reveal>
              <SectionHeader index={4} title={locale === 'fr' ? 'Langues' : locale === 'ar' ? 'اللغات' : 'Languages'} className="mb-9" />
            </Reveal>
            <ul className="space-y-6">
              {LANGUAGES.map((language, index) => (
                <Reveal key={language.key} as="li" delay={index * 70}>
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <p className="text-lg font-bold">{LANGUAGE_NAMES[language.key][locale]}</p>
                      <p className="label-tight" style={{ color: 'var(--fg-faint)' }}>
                        {language.level[locale]}
                      </p>
                    </div>
                    <div className="flex gap-1.5" aria-hidden>
                      {Array.from({ length: 5 }).map((_, barIndex) => (
                        <span
                          key={barIndex}
                          className="h-6 w-2.5 border"
                          style={{
                            borderColor: 'var(--edge-soft)',
                            background: barIndex < language.bars ? 'var(--fg)' : 'transparent',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- capabilities ---------- */}
      <section className="relative z-10 overflow-hidden">
        <div className="mesh opacity-60" aria-hidden />
        <div className="relative z-10 mx-auto max-w-[1400px] px-4 pb-24 md:px-8">
          <Reveal>
            <SectionHeader index={5} title={tr('section.capabilities')} subtitle={tr('section.capabilities.sub')} />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((group, index) => (
              <Reveal key={group.key} delay={index * 55}>
                <div className="glass h-full border-2 p-5" style={{ borderColor: 'var(--edge-soft)' }}>
                  <h3 className="label-tight mb-4" style={{ color: 'var(--fg)' }}>
                    {t(group.label, locale)}
                  </h3>
                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item} className="text-[0.875rem]" style={{ color: 'var(--fg-dim)' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- distinctions ---------- */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-28 md:px-8">
        <Reveal>
          <SectionHeader index={6} title={tr('section.awards')} subtitle={tr('section.awards.sub')} />
        </Reveal>

        <div className="grid gap-12 md:grid-cols-2">
          <ul className="space-y-px" style={{ background: 'var(--edge-soft)' }}>
            {awards.map((award, index) => (
              <Reveal key={index} as="li" delay={index * 45}>
                <div className="flex items-start gap-4 py-5" style={{ background: 'var(--bg)' }}>
                  <AwardIcon size={17} strokeWidth={1.9} className="mt-1 shrink-0 opacity-55" />
                  <div className="min-w-0">
                    <p className="font-bold leading-snug">{award.title}</p>
                    <p className="label-tight mt-1.5" style={{ color: 'var(--fg-faint)' }}>
                      {[award.rank, award.issuer, award.year].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>

          <div>
            <p className="label mb-6">{tr('section.certifications')}</p>
            <ul className="space-y-px" style={{ background: 'var(--edge-soft)' }}>
              {certifications.map((cert, index) => (
                <Reveal key={index} as="li" delay={index * 55}>
                  <div className="flex items-start gap-4 py-5" style={{ background: 'var(--bg)' }}>
                    <BadgeCheck size={17} strokeWidth={1.9} className="mt-1 shrink-0 opacity-55" />
                    <div className="min-w-0">
                      <p className="font-bold leading-snug">{cert.title}</p>
                      <p className="label-tight mt-1.5" style={{ color: 'var(--fg-faint)' }}>
                        {cert.issuer}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
