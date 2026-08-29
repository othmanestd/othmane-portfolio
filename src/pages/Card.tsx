import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight, Calendar, Check, Download, Github, Globe, Linkedin,
  Mail, MapPin, MessageCircle, Moon, Phone, QrCode, Share2, Sun,
} from 'lucide-react'
import { LOCALES, useI18n } from '@/i18n'
import { useTheme } from '@/hooks/useTheme'
import { useContent } from '@/hooks/useContent'
import { track } from '@/lib/analytics'
import { cn, t } from '@/lib/utils'
import { PageLoader, StatusDot } from '@/components/ui'
import { EmailLink } from '@/components/EmailLink'

/**
 * Landing page for the physical NFC tag. Optimised for a phone held in one
 * hand: single column, large tap targets, everything above two scrolls.
 */
export default function Card() {
  const { tr, locale, setLocale } = useI18n()
  const { theme, toggle } = useTheme()
  const { content, loading } = useContent()
  const [qr, setQr] = useState('')
  const [showQr, setShowQr] = useState(false)
  const [shared, setShared] = useState(false)

  const profile = content?.profile

  useEffect(() => {
    document.title = 'Othmane Sadiki — Digital Card'
    track('card_view')
    return () => { document.title = 'Othmane Sadiki — Data Engineer' }
  }, [])

  useEffect(() => {
    const dark = theme === 'dark'
    // Dynamic import keeps the ~50 kB QR library out of the main bundle.
    void import('qrcode').then(({ default: QRCode }) => QRCode.toDataURL(window.location.href, {
      width: 520,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: dark ? '#f4f4f0ff' : '#0a0a0bff',
        light: '#00000000',
      },
    }))
      .then(setQr)
      .catch(() => setQr(''))
  }, [theme])

  async function share() {
    const url = window.location.href
    const payload = {
      title: 'Othmane Sadiki — Data Engineer',
      text: profile ? t(profile.headline, locale) : '',
      url,
    }
    try {
      if (navigator.share) {
        await navigator.share(payload)
        track('card_share', { method: 'native' })
        return
      }
      await navigator.clipboard.writeText(url)
      setShared(true)
      track('card_share', { method: 'clipboard' })
      setTimeout(() => setShared(false), 2200)
    } catch {
      /* user dismissed the share sheet */
    }
  }

  if (loading || !profile || !content) return <PageLoader label={tr('common.loading')} />

  const phoneDigits = profile.phone.replace(/[^\d]/g, '')

  const actions = [
    { icon: Download, label: tr('card.save'), href: '/api/card/vcard',
      primary: true, event: 'card_vcard', download: true },
    { icon: Phone, label: tr('card.call'), href: `tel:${profile.phone}`, event: 'card_call' },
    { icon: MessageCircle, label: tr('card.whatsapp'), href: `https://wa.me/${phoneDigits}`,
      external: true, event: 'card_whatsapp' },
    { icon: Mail, label: tr('card.email'), href: `mailto:${profile.email}`, event: 'card_email', email: true },
    { icon: Calendar, label: tr('card.book'), to: '/contact', event: 'card_book' },
  ]

  const links = [
    { icon: Linkedin, label: 'LinkedIn', sub: 'sadiki-othmane', href: content.meta.linkedin, external: true },
    { icon: Github, label: 'GitHub', sub: 'othmanestd', href: content.meta.github, external: true },
    { icon: Globe, label: tr('nav.work'), sub: `${content.projects.length} ${tr('common.projects')}`, to: '/work' },
    { icon: Mail, label: tr('nav.contact'), sub: tr('contact.send'), to: '/contact' },
  ]

  return (
    <div className="relative min-h-[100svh] overflow-hidden px-4 py-8">
      <div className="mesh" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-[440px]">
        {/* --- top chrome --- */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center border-2" style={{ borderColor: 'var(--edge-soft)' }}>
            {LOCALES.map((entry) => (
              <button
                key={entry.code}
                onClick={() => setLocale(entry.code)}
                aria-label={entry.native}
                aria-pressed={locale === entry.code}
                className={cn(
                  'label-tight px-2.5 py-2 transition-all',
                  locale === entry.code ? 'invert-block' : 'opacity-50',
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQr((v) => !v)}
              aria-label={tr('card.scan')}
              aria-pressed={showQr}
              className={cn(
                'flex h-9 w-9 items-center justify-center border-2 transition-colors',
                showQr && 'invert-block',
              )}
              style={{ borderColor: 'var(--edge-soft)' }}
            >
              <QrCode size={14} strokeWidth={2.2} />
            </button>
            <button
              onClick={toggle}
              aria-label={tr('theme.toggle')}
              className="flex h-9 w-9 items-center justify-center border-2"
              style={{ borderColor: 'var(--edge-soft)' }}
            >
              {theme === 'dark'
                ? <Sun size={14} strokeWidth={2.2} />
                : <Moon size={14} strokeWidth={2.2} />}
            </button>
            <button
              onClick={share}
              aria-label={tr('card.share')}
              className="flex h-9 w-9 items-center justify-center border-2"
              style={{ borderColor: 'var(--edge-soft)' }}
            >
              {shared
                ? <Check size={14} strokeWidth={2.4} />
                : <Share2 size={14} strokeWidth={2.2} />}
            </button>
          </div>
        </div>

        {/* --- identity --- */}
        <section
          className="glass glass-strong mb-4 border-2 p-6"
          style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard)' }}
        >
          <div className="mb-5 flex items-start gap-5">
            <div
              className="h-24 w-24 shrink-0 overflow-hidden border-2"
              style={{ borderColor: 'var(--edge)' }}
            >
              {profile.photo_url && (
                <img
                  src={profile.photo_url}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                  style={{ filter: 'grayscale(1) contrast(1.12)' }}
                />
              )}
            </div>

            <div className="min-w-0 pt-1">
              <h1 className="display mb-1.5 text-[1.9rem] leading-[0.92]">
                OTHMANE<br />SADIKI
              </h1>
              <p className="label-tight" style={{ color: 'var(--fg-faint)' }}>
                {tr('hero.role')}
              </p>
            </div>
          </div>

          <p className="serif-accent mb-4 text-[1.05rem] leading-snug">
            {t(profile.headline, locale)}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
            <StatusDot
              label={profile.available ? tr('hero.available') : tr('hero.unavailable')}
              active={profile.available}
            />
            <span className="label-tight inline-flex items-center gap-1.5"
                  style={{ color: 'var(--fg-faint)' }}>
              <MapPin size={11} strokeWidth={2.2} /> {profile.location}
            </span>
          </div>
        </section>

        {/* --- QR --- */}
        {showQr && qr && (
          <section
            className="glass mb-4 flex flex-col items-center border-2 p-6"
            style={{ borderColor: 'var(--edge)' }}
          >
            <img src={qr} alt={tr('card.scan')} className="mb-3 h-44 w-44" />
            <p className="label-tight" style={{ color: 'var(--fg-faint)' }}>{tr('card.scan')}</p>
          </section>
        )}

        {/* --- primary actions --- */}
        <section className="mb-4 grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const classes = cn(
              'brut-press flex flex-col items-start justify-between gap-5 border-2 p-4',
              action.primary ? 'invert-block col-span-2' : 'glass',
            )
            const style = { borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard-sm)' }
            const body = (
              <>
                <action.icon size={19} strokeWidth={2} />
                <span className="label-tight">{action.label}</span>
              </>
            )
            if (action.to) {
              return (
                <Link key={action.label} to={action.to} onClick={() => track(action.event)}
                      className={classes} style={style}>
                  {body}
                </Link>
              )
            }
            if (action.email) {
              return (
                <span key={action.label} onClick={() => track(action.event)} className="contents">
                  <EmailLink email={profile.email} className={classes} style={style}
                             ariaLabel={action.label}>
                    {body}
                  </EmailLink>
                </span>
              )
            }
            return (
              <a
                key={action.label}
                href={action.href}
                {...(action.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                {...(action.download ? { download: '' } : {})}
                onClick={() => track(action.event)}
                className={classes} style={style}
              >
                {body}
              </a>
            )
          })}
        </section>

        {/* --- quick links --- */}
        <section
          className="glass mb-4 border-2"
          style={{ borderColor: 'var(--edge)' }}
        >
          <p className="label border-b-2 px-4 py-3" style={{ borderColor: 'var(--edge)' }}>
            {tr('card.links')}
          </p>
          <ul>
            {links.map((link, index) => {
              const inner = (
                <>
                  <link.icon size={17} strokeWidth={2} className="shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.95rem] font-bold leading-tight">{link.label}</span>
                    <span className="label-tight block truncate" style={{ color: 'var(--fg-faint)' }}>
                      {link.sub}
                    </span>
                  </span>
                  <ArrowUpRight size={15} strokeWidth={2} className="shrink-0 opacity-50" />
                </>
              )
              const classes = cn(
                'flex items-center gap-4 px-4 py-4 transition-colors hover:invert-block',
                index < links.length - 1 && 'border-b',
              )
              return (
                <li key={link.label}>
                  {link.to ? (
                    <Link to={link.to} className={classes} style={{ borderColor: 'var(--edge-soft)' }}>
                      {inner}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank" rel="noreferrer noopener"
                      className={classes}
                      style={{ borderColor: 'var(--edge-soft)' }}
                    >
                      {inner}
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {/* --- footer --- */}
        <footer className="pb-6 pt-2 text-center">
          <p className="label-tight mb-4" style={{ color: 'var(--fg-faint)' }}>
            {tr('card.tapNfc')}
          </p>
          <Link to="/" className="label-tight link-rule inline-flex items-center gap-1.5 whitespace-nowrap">
            {tr('card.portfolio')} <ArrowUpRight size={12} strokeWidth={2.2} />
          </Link>
        </footer>
      </div>
    </div>
  )
}
