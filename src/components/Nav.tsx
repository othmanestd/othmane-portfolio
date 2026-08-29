import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowUpRight, Github, Linkedin, Mail, Menu, Moon, Sun, X } from 'lucide-react'
import { LOCALES, useI18n } from '@/i18n'
import { useTheme } from '@/hooks/useTheme'
import { useContent } from '@/hooks/useContent'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/types'

const routes = [
  { to: '/work', key: 'nav.work' },
  { to: '/about', key: 'nav.about' },
  { to: '/contact', key: 'nav.contact' },
  { to: '/card', key: 'nav.card' },
] as const

export function Nav() {
  const { tr, locale, setLocale } = useI18n()
  const { theme, toggle } = useTheme()
  const { content } = useContent()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <a
        href="#main"
        className="label-tight sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[200] focus:px-4 focus:py-3 focus:invert-block"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[120] transition-all duration-500',
          '[transition-timing-function:var(--ease-out-expo)]',
          scrolled ? 'py-2' : 'py-4 md:py-6',
        )}
      >
        <nav
          className={cn(
            'mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8',
            scrolled && 'glass glass-strong mx-3 rounded-none border-2 px-4 py-2 md:mx-6',
          )}
          style={scrolled ? { borderColor: 'var(--edge)' } : undefined}
        >
          <Link to="/" className="group flex items-baseline gap-2.5" aria-label="Othmane Sadiki — home">
            <span className="display text-lg leading-none md:text-xl">OTHMANE</span>
            <span className="serif-accent text-lg leading-none opacity-60 md:text-xl">Sadiki</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {routes.map((route) => (
              <NavLink
                key={route.to}
                to={route.to}
                className={({ isActive }) =>
                  cn(
                    'label-tight relative px-4 py-2.5 transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-55 hover:opacity-100',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {tr(route.key)}
                    {isActive && (
                      <span
                        className="absolute inset-x-3 bottom-1 h-px"
                        style={{ background: 'var(--fg)' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LangSwitch locale={locale} setLocale={setLocale} />

            <button
              onClick={toggle}
              aria-label={tr('theme.toggle')}
              className="flex h-9 w-9 items-center justify-center border-2 transition-colors hover:invert-block"
              style={{ borderColor: 'var(--edge-soft)' }}
            >
              {theme === 'dark'
                ? <Sun size={14} strokeWidth={2.2} />
                : <Moon size={14} strokeWidth={2.2} />}
            </button>

            <button
              onClick={() => setOpen(true)}
              aria-label={tr('nav.menu')}
              aria-expanded={open}
              className="flex h-9 w-9 items-center justify-center border-2 md:hidden"
              style={{ borderColor: 'var(--edge-soft)' }}
            >
              <Menu size={16} strokeWidth={2.2} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        className={cn(
          'fixed inset-0 z-[130] flex flex-col md:hidden',
          '[transition:opacity_0.4s_var(--ease-out-expo),visibility_0.4s]',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        style={{ background: 'var(--bg)' }}
        aria-hidden={!open}
      >
        <div className="mesh opacity-60" aria-hidden />

        {/* header row */}
        <div
          className="relative z-10 flex items-center justify-between border-b-2 px-5 py-4"
          style={{ borderColor: 'var(--edge)' }}
        >
          <Link to="/" onClick={() => setOpen(false)} className="flex items-baseline gap-2">
            <span className="display text-lg">OTHMANE</span>
            <span className="serif-accent text-lg opacity-60">Sadiki</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label={tr('nav.close')}
            className="flex h-10 w-10 items-center justify-center border-2"
            style={{ borderColor: 'var(--edge)' }}
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* big links */}
        <nav className="relative z-10 flex flex-1 flex-col justify-center px-5">
          <ul>
            {routes.map((route, index) => (
              <li key={route.to} className="border-b" style={{ borderColor: 'var(--edge-soft)' }}>
                <NavLink
                  to={route.to}
                  className={({ isActive }) =>
                    cn('flex items-center gap-4 py-4 transition-all duration-500',
                       '[transition-timing-function:var(--ease-out-expo)]',
                       open ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0',
                       isActive ? '' : 'opacity-80')
                  }
                  style={{ transitionDelay: open ? `${120 + index * 70}ms` : '0ms' }}
                >
                  <span className="label opacity-45">[{String(index + 1).padStart(2, '0')}]</span>
                  <span className="display text-[clamp(2.4rem,13vw,4rem)]">{tr(route.key)}</span>
                  <ArrowUpRight size={22} strokeWidth={1.8} className="ms-auto opacity-40" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* footer: status + controls + socials */}
        <div
          className="relative z-10 space-y-5 border-t-2 px-5 py-6"
          style={{ borderColor: 'var(--edge)' }}
        >
          <div className="flex items-center justify-between gap-4">
            <LangSwitch locale={locale} setLocale={setLocale} />
            <button
              onClick={toggle}
              aria-label={tr('theme.toggle')}
              className="flex h-10 items-center gap-2 border-2 px-3"
              style={{ borderColor: 'var(--edge-soft)' }}
            >
              {theme === 'dark' ? <Sun size={15} strokeWidth={2.2} /> : <Moon size={15} strokeWidth={2.2} />}
              <span className="label-tight">{theme === 'dark' ? tr('theme.light') : tr('theme.dark')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <a href={content?.meta.github || '#'} target="_blank" rel="noreferrer noopener"
               aria-label="GitHub"
               className="flex h-11 flex-1 items-center justify-center border-2 transition-colors hover:invert-block"
               style={{ borderColor: 'var(--edge-soft)' }}>
              <Github size={16} strokeWidth={2} />
            </a>
            <a href={content?.meta.linkedin || '#'} target="_blank" rel="noreferrer noopener"
               aria-label="LinkedIn"
               className="flex h-11 flex-1 items-center justify-center border-2 transition-colors hover:invert-block"
               style={{ borderColor: 'var(--edge-soft)' }}>
              <Linkedin size={16} strokeWidth={2} />
            </a>
            <a href={`mailto:${content?.profile.email || ''}`}
               aria-label="Email"
               className="flex h-11 flex-1 items-center justify-center border-2 transition-colors hover:invert-block"
               style={{ borderColor: 'var(--edge-soft)' }}>
              <Mail size={16} strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

function LangSwitch({
  locale, setLocale,
}: { locale: Locale; setLocale: (l: Locale) => void }) {
  return (
    <div
      className="flex items-center border-2"
      style={{ borderColor: 'var(--edge-soft)' }}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((entry) => (
        <button
          key={entry.code}
          onClick={() => setLocale(entry.code)}
          aria-label={entry.native}
          aria-pressed={locale === entry.code}
          className={cn(
            'label-tight px-2 py-2 transition-all',
            locale === entry.code ? 'invert-block' : 'opacity-50 hover:opacity-100',
          )}
        >
          {entry.label}
        </button>
      ))}
    </div>
  )
}
