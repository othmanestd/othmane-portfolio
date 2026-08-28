import { useEffect, useRef, useState } from 'react'

const GLYPHS = '█▓▒░#@$%&*+=<>/\\|'

/**
 * Decodes text character by character on mount.
 *
 * Two guarantees, because this renders a person's *name*:
 *  - A hard duration cap. `setInterval` is clamped to ~1s in background or
 *    non-compositing tabs, which would otherwise leave the heading showing
 *    glyphs indefinitely. Each tick checks elapsed wall-clock time, so a
 *    throttled tick snaps straight to the finished text.
 *  - The real string is always exposed to assistive tech and crawlers via
 *    aria-label; the animated glyphs are aria-hidden.
 */
const MAX_DURATION_MS = 1400

export function ScrambleText({
  text, className, speed = 34, startDelay = 0,
}: { text: string; className?: string; speed?: number; startDelay?: number }) {
  const [output, setOutput] = useState(text)
  const frameRef = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOutput(text)
      return
    }

    let revealed = 0
    let interval = 0
    const startedAt = performance.now() + startDelay

    const finish = () => {
      window.clearInterval(interval)
      setOutput(text)
    }

    const tick = () => {
      // Throttled environments land here late; bail out to the real text.
      if (performance.now() - startedAt > MAX_DURATION_MS) {
        finish()
        return
      }
      frameRef.current += 1
      const chars = text.split('').map((char, index) => {
        if (char === ' ' || char === '\n') return char
        if (index < revealed) return char
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      })
      setOutput(chars.join(''))
      if (frameRef.current % 2 === 0) revealed += 1
      if (revealed > text.length) finish()
    }

    const timer = window.setTimeout(() => {
      interval = window.setInterval(tick, speed)
    }, startDelay)

    return () => {
      window.clearTimeout(timer)
      window.clearInterval(interval)
    }
  }, [text, speed, startDelay])

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{output}</span>
    </span>
  )
}
