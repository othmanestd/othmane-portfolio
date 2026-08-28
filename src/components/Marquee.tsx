import { cn } from '@/lib/utils'

/** Infinite ticker. Content is duplicated once so the -50% loop is seamless. */
export function Marquee({
  items, duration = 44, reverse = false, className, separator = '◆',
}: {
  items: string[]
  duration?: number
  reverse?: boolean
  className?: string
  separator?: string
}) {
  if (!items.length) return null
  const doubled = [...items, ...items]

  return (
    <div className={cn('marquee-host relative overflow-hidden', className)}>
      <div
        className={cn('marquee', reverse && 'marquee-reverse')}
        style={{ ['--marquee-duration' as string]: `${duration}s` }}
      >
        {doubled.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex shrink-0 items-center whitespace-nowrap"
            aria-hidden={index >= items.length}
          >
            <span className="display px-5 text-[clamp(1.6rem,4.6vw,3.4rem)]">{item}</span>
            <span className="px-1 text-[0.7em] opacity-35">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
