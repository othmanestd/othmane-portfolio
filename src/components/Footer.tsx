import { Link } from 'react-router-dom'
import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useContent } from '@/hooks/useContent'
import { t } from '@/lib/utils'
import { Marquee } from './Marquee'
import { EmailLink } from './EmailLink'

export function Footer() {
  const { tr, locale } = useI18n()
  const { content } = useContent()
  const profile = content?.profile
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 mt-32 border-t-2" style={{ borderColor: 'var(--edge)' }}>
      <div className="border-b-2 py-6" style={{ borderColor: 'var(--edge)' }}>
        <Marquee
          items={['DATA ENGINEERING', 'SPARK', 'LAKEHOUSE', 'DELTA LAKE', 'AIRFLOW', 'CELONIS', 'AZURE']}
          duration={52}
          className="opacity-90"
        />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="display mb-4 text-[clamp(1.8rem,4vw,3rem)]">
              {tr('section.contact')}
            </p>
            <p className="mb-7 max-w-sm text-base leading-relaxed" style={{ color: 'var(--fg-dim)' }}>
              {profile ? t(profile.bio, locale) : ''}
            </p>
            <EmailLink
              email={profile?.email || ''}
              className="link-rule mono text-sm break-all"
            >
              {profile?.email}
            </EmailLink>
          </div>

          <nav className="md:col-span-3 md:col-start-7" aria-label="Footer">
            <p className="label mb-5">Navigation</p>
            <ul className="space-y-2.5">
              {[
                { to: '/work', key: 'nav.work' as const },
                { to: '/about', key: 'nav.about' as const },
                { to: '/contact', key: 'nav.contact' as const },
                { to: '/card', key: 'nav.card' as const },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="link-rule text-sm">{tr(item.key)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="label mb-5">Elsewhere</p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={content?.meta.linkedin || '#'}
                  target="_blank" rel="noreferrer noopener"
                  className="link-rule inline-flex items-center gap-2 text-sm"
                >
                  <Linkedin size={14} strokeWidth={2} /> LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={content?.meta.github || '#'}
                  target="_blank" rel="noreferrer noopener"
                  className="link-rule inline-flex items-center gap-2 text-sm"
                >
                  <Github size={14} strokeWidth={2} /> GitHub
                </a>
              </li>
              <li>
                <EmailLink
                  email={profile?.email || ''}
                  className="link-rule inline-flex items-center gap-2 text-sm"
                >
                  <Mail size={14} strokeWidth={2} /> Email
                </EmailLink>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-16 flex flex-col items-start justify-between gap-4 border-t pt-7 md:flex-row md:items-center"
          style={{ borderColor: 'var(--edge-soft)' }}
        >
          <div className="label-tight space-y-1.5" style={{ color: 'var(--fg-faint)' }}>
            <p>© {year} Othmane Sadiki — {tr('footer.rights')}</p>
            <p className="opacity-70">{tr('footer.stack')}</p>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="label-tight inline-flex items-center gap-2 border-2 px-4 py-2.5 transition-colors hover:invert-block"
            style={{ borderColor: 'var(--edge-soft)' }}
          >
            {tr('footer.top')} <ArrowUp size={13} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </footer>
  )
}
