import { useEffect, useRef, useState } from 'react'

/**
 * Adds `is-visible` once the element scrolls into view. One-shot.
 *
 * Reveal is a *progressive enhancement*: the content must never depend on this
 * hook to become readable. IntersectionObserver can silently fail to deliver —
 * a backgrounded or non-compositing tab, an aggressive throttler, a prerender
 * pass — and without a floor that would leave the whole page blank. So we arm a
 * fallback timer that reveals unconditionally, and let the observer win the race
 * in the normal case.
 */
const FALLBACK_MS = 900

export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) { setVisible(true); return }

    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return }

    let done = false
    const reveal = () => {
      if (done) return
      done = true
      setVisible(true)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(node)

    // Safety floor — guarantees the content is readable even if the observer
    // never delivers a callback.
    const timer = window.setTimeout(() => {
      reveal()
      observer.disconnect()
    }, FALLBACK_MS)

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [threshold])

  return { ref, visible }
}
