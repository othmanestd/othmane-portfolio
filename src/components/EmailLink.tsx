import { useState, type ReactNode } from 'react'
import { useI18n } from '@/i18n'

/**
 * Email link that always does something useful.
 *
 * `mailto:` is the correct semantic href — it opens the mail app on mobile and
 * on desktops that have one configured. But on a desktop with no mail handler
 * (very common in Chrome) it silently does nothing, which reads as "the button
 * is broken". So on click we also copy the address to the clipboard and show a
 * brief confirmation toast — the button then works everywhere.
 */
export function EmailLink({
  email, className, children, ariaLabel, subject, style,
}: {
  email: string
  className?: string
  children: ReactNode
  ariaLabel?: string
  subject?: string
  style?: React.CSSProperties
}) {
  const { tr } = useI18n()
  const [copied, setCopied] = useState(false)

  const href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`

  const onClick = () => {
    try {
      navigator.clipboard?.writeText(email)
        .then(() => {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 2200)
        })
        .catch(() => { /* clipboard blocked — mailto still fires */ })
    } catch {
      /* no clipboard API */
    }
  }

  return (
    <>
      <a href={href} onClick={onClick} className={className} style={style}
         aria-label={ariaLabel || `Email ${email}`} title={email}>
        {children}
      </a>

      {copied && (
        <div
          className="fixed inset-x-0 bottom-6 z-[200] mx-auto flex w-max max-w-[92vw] items-center gap-2 border-2 px-4 py-2.5 invert-block"
          style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard-sm)' }}
          role="status"
        >
          <span className="label-tight">{tr('email.copied')}</span>
          <span className="mono text-xs">{email}</span>
        </div>
      )}
    </>
  )
}
