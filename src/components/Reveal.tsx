import type { ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/utils'

/** Clip-path reveal. Wipes upward rather than the usual fade-and-slide. */
export function Reveal({
  children, delay = 0, className, as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article' | 'header'
}) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <Tag
      ref={ref as never}
      className={cn('reveal-mask', visible && 'is-visible', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
