import { useEffect, useMemo, useState } from 'react'
import { Calendar, Check, Github, Linkedin, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useContent } from '@/hooks/useContent'
import { api } from '@/lib/api'
import { track } from '@/lib/analytics'
import { Reveal } from '@/components/Reveal'
import { Button, SectionHeader, Spinner } from '@/components/ui'
import { cn, formatDay, formatTime, pad } from '@/lib/utils'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Contact() {
  const { tr } = useI18n()
  const { content } = useContent()
  const profile = content?.profile

  return (
    <>
      <section className="relative overflow-hidden px-4 pb-16 pt-36 md:px-8 md:pt-44">
        <div className="mesh" aria-hidden />
        <div className="relative z-10 mx-auto max-w-[1400px]">
          <p className="label mb-7">[{pad(1)}] — {tr('nav.contact')}</p>
          <h1 className="display mb-7 text-[clamp(2.4rem,9vw,7rem)]">{tr('contact.title')}</h1>
          <p className="max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: 'var(--fg-dim)' }}>
            {tr('contact.sub')}
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-20 md:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal><ContactForm /></Reveal>
          <Reveal delay={90}><BookingPanel /></Reveal>
        </div>
      </section>

      {/* direct channels */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 pb-28 md:px-8">
        <Reveal>
          <SectionHeader index={2} title={tr('contact.direct')} />
        </Reveal>
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: 'var(--edge-soft)' }}>
          {[
            { icon: Mail, label: 'Email', value: profile?.email ?? '', href: `mailto:${profile?.email ?? ''}` },
            { icon: Phone, label: 'Phone', value: profile?.phone ?? '', href: `tel:${profile?.phone ?? ''}` },
            { icon: Linkedin, label: 'LinkedIn', value: 'sadiki-othmane', href: content?.meta.linkedin ?? '#' },
            { icon: Github, label: 'GitHub', value: 'othmanestd', href: content?.meta.github ?? '#' },
          ].map((channel, index) => (
            <Reveal key={channel.label} delay={index * 55}>
              <a
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer noopener"
                className="group flex h-full flex-col justify-between gap-8 p-6 transition-colors hover:invert-block md:p-7"
                style={{ background: 'var(--bg)' }}
              >
                <channel.icon size={19} strokeWidth={1.8} />
                <div className="min-w-0">
                  <p className="label mb-1.5 group-hover:opacity-70">{channel.label}</p>
                  <p className="mono truncate text-sm">{channel.value}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        {profile?.location && (
          <p className="label mt-8 inline-flex items-center gap-2.5">
            <MapPin size={13} strokeWidth={2} /> {profile.location}
          </p>
        )}
      </section>
    </>
  )
}

/* ========================= contact form ========================= */
function ContactForm() {
  const { tr, locale } = useI18n()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', company: '', subject: '', message: '', website: '',
  })

  const update = (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }))

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setError('')
    try {
      await api.contact({ ...form, locale })
      setStatus('sent')
      track('contact_submit')
      setForm({ name: '', email: '', company: '', subject: '', message: '', website: '' })
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : tr('contact.error'))
    }
  }

  return (
    <div
      className="glass flex h-full flex-col border-2 p-6 md:p-9"
      style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard)' }}
    >
      <div className="mb-8 flex items-center gap-3">
        <Send size={16} strokeWidth={2} />
        <h2 className="display text-xl">{tr('contact.send')}</h2>
      </div>

      {status === 'sent' ? (
        <div className="flex flex-1 flex-col items-center justify-center py-14 text-center">
          <div
            className="mb-6 flex h-14 w-14 items-center justify-center border-2 invert-block"
            style={{ borderColor: 'var(--edge)' }}
          >
            <Check size={22} strokeWidth={2.4} />
          </div>
          <p className="mb-6 max-w-xs text-base leading-relaxed">{tr('contact.success')}</p>
          <Button variant="outline" onClick={() => setStatus('idle')}>
            {tr('contact.send')}
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-1 flex-col gap-6" noValidate>
          {/* Honeypot — visually hidden, never focusable by a human. */}
          <input
            type="text" name="website" tabIndex={-1} autoComplete="off"
            value={form.website} onChange={update('website')}
            aria-hidden className="absolute h-0 w-0 opacity-0" style={{ left: '-9999px' }}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={tr('contact.name')} required>
              <input required value={form.name} onChange={update('name')}
                     className="field" maxLength={120} autoComplete="name" />
            </Field>
            <Field label={tr('contact.email')} required>
              <input required type="email" value={form.email} onChange={update('email')}
                     className="field" maxLength={200} autoComplete="email" />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={tr('contact.company')} hint={tr('common.optional')}>
              <input value={form.company} onChange={update('company')}
                     className="field" maxLength={160} autoComplete="organization" />
            </Field>
            <Field label={tr('contact.subject')} hint={tr('common.optional')}>
              <input value={form.subject} onChange={update('subject')}
                     className="field" maxLength={200} />
            </Field>
          </div>

          <Field label={tr('contact.message')} required>
            <textarea
              required rows={6} value={form.message} onChange={update('message')}
              className="field resize-none" maxLength={5000}
            />
          </Field>

          {status === 'error' && (
            <p className="label-tight border-2 p-3" style={{ borderColor: 'var(--edge)' }}>
              {error || tr('contact.error')}
            </p>
          )}

          <div className="mt-auto pt-2">
            <Button type="submit" variant="solid" disabled={status === 'sending'} className="w-full">
              {status === 'sending'
                ? <><Spinner /> {tr('contact.sending')}…</>
                : <>{tr('contact.send')} <Send size={14} strokeWidth={2.3} /></>}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

/* ========================= booking ========================= */
function BookingPanel() {
  const { tr, locale } = useI18n()
  const [slots, setSlots] = useState<string[]>([])
  const [hours, setHours] = useState('')
  const [selected, setSelected] = useState('')
  const [visibleDays, setVisibleDays] = useState(4)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', topic: '', notes: '', website: '',
  })

  useEffect(() => {
    let cancelled = false
    api.availability()
      .then((data) => {
        if (cancelled) return
        setSlots(data.slots)
        setHours(data.working_hours)
      })
      .catch(() => { if (!cancelled) setSlots([]) })
    return () => { cancelled = true }
  }, [])

  // Group into local calendar days so the visitor never reasons about UTC.
  const days = useMemo(() => {
    const grouped = new Map<string, string[]>()
    for (const slot of slots) {
      const key = new Date(slot).toDateString()
      const bucket = grouped.get(key)
      if (bucket) bucket.push(slot)
      else grouped.set(key, [slot])
    }
    return Array.from(grouped.entries())
  }, [slots])

  const update = (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }))

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!selected || status === 'sending') return
    setStatus('sending')
    setError('')
    try {
      await api.book({
        ...form,
        slot_start: selected,
        duration_minutes: 30,
        locale,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      })
      setStatus('sent')
      track('appointment_request')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : tr('booking.error'))
    }
  }

  return (
    <div
      className="glass flex h-full flex-col border-2 p-6 md:p-9"
      style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard)' }}
    >
      <div className="mb-3 flex items-center gap-3">
        <Calendar size={16} strokeWidth={2} />
        <h2 className="display text-xl">{tr('booking.title')}</h2>
      </div>
      <p className="mb-7 text-sm leading-relaxed" style={{ color: 'var(--fg-dim)' }}>
        {tr('booking.sub')}
      </p>

      {status === 'sent' ? (
        <div className="flex flex-1 flex-col items-center justify-center py-14 text-center">
          <div
            className="mb-6 flex h-14 w-14 items-center justify-center border-2 invert-block"
            style={{ borderColor: 'var(--edge)' }}
          >
            <Check size={22} strokeWidth={2.4} />
          </div>
          <p className="mb-3 max-w-xs text-base leading-relaxed">{tr('booking.success')}</p>
          <p className="label-tight" style={{ color: 'var(--fg-faint)' }}>
            {formatDay(selected, locale)} · {formatTime(selected, locale)}
          </p>
        </div>
      ) : days.length === 0 ? (
        <p className="label py-14 text-center">{tr('booking.noSlots')}</p>
      ) : (
        <form onSubmit={submit} className="flex flex-1 flex-col gap-6">
          <input
            type="text" name="website" tabIndex={-1} autoComplete="off"
            value={form.website} onChange={update('website')}
            aria-hidden className="absolute h-0 w-0 opacity-0" style={{ left: '-9999px' }}
          />

          <div>
            <p className="label mb-4">{tr('booking.pick')}</p>
            <div className="space-y-5">
              {days.slice(0, visibleDays).map(([day, daySlots]) => (
                <div key={day}>
                  <p className="label-tight mb-2.5" style={{ color: 'var(--fg-faint)' }}>
                    {formatDay(daySlots[0], locale)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {daySlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelected(slot)}
                        aria-pressed={selected === slot}
                        className={cn(
                          'label-tight border-2 px-2.5 py-2 transition-all',
                          selected === slot ? 'invert-block' : 'opacity-70 hover:opacity-100',
                        )}
                        style={{ borderColor: selected === slot ? 'var(--edge)' : 'var(--edge-soft)' }}
                      >
                        {formatTime(slot, locale)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {visibleDays < days.length && (
              <button
                type="button"
                onClick={() => setVisibleDays((n) => n + 4)}
                className="label-tight link-rule mt-5"
              >
                {tr('booking.more')} →
              </button>
            )}

            {hours && (
              <p className="label-tight mt-5" style={{ color: 'var(--fg-faint)' }}>
                {tr('booking.hours')}: {hours}
              </p>
            )}
          </div>

          {selected && (
            <>
              <div className="rule" />
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label={tr('contact.name')} required>
                  <input required value={form.name} onChange={update('name')}
                         className="field" maxLength={120} autoComplete="name" />
                </Field>
                <Field label={tr('contact.email')} required>
                  <input required type="email" value={form.email} onChange={update('email')}
                         className="field" maxLength={200} autoComplete="email" />
                </Field>
              </div>

              <Field label={tr('booking.phone')} hint={tr('common.optional')}>
                <input value={form.phone} onChange={update('phone')}
                       className="field" maxLength={40} autoComplete="tel" />
              </Field>

              <Field label={tr('booking.topic')} hint={tr('common.optional')}>
                <input value={form.topic} onChange={update('topic')} className="field" maxLength={200} />
              </Field>

              <Field label={tr('booking.notes')} hint={tr('common.optional')}>
                <textarea rows={3} value={form.notes} onChange={update('notes')}
                          className="field resize-none" maxLength={2000} />
              </Field>

              {status === 'error' && (
                <p className="label-tight border-2 p-3" style={{ borderColor: 'var(--edge)' }}>
                  {error}
                </p>
              )}

              <div className="mt-auto pt-2">
                <Button type="submit" variant="solid" disabled={status === 'sending'} className="w-full">
                  {status === 'sending'
                    ? <><Spinner /> {tr('booking.booking')}…</>
                    : <>{tr('booking.confirm')} — {formatTime(selected, locale)}</>}
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  )
}

/* ========================= shared field ========================= */
function Field({
  label, children, required, hint,
}: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <label className="block">
      <span className="label mb-1.5 flex items-baseline gap-2">
        {label}
        {required && <span aria-hidden>*</span>}
        {hint && <span className="normal-case opacity-55">({hint})</span>}
      </span>
      {children}
    </label>
  )
}
