import { useEffect, useRef } from 'react'

/**
 * Two-part cursor: an instant dot and a ring that lags behind it.
 * Desktop pointers only — touch devices keep native behaviour.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return

    document.body.classList.add('cursor-host')

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ring = { ...target }
    let frame = 0

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
      }
      const interactive = (event.target as HTMLElement)?.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor]',
      )
      ringRef.current?.setAttribute('data-active', interactive ? 'true' : 'false')
    }

    const loop = () => {
      // Critically-damped-ish follow: enough lag to feel physical, not sluggish.
      ring.x += (target.x - ring.x) * 0.16
      ring.y += (target.y - ring.y) * 0.16
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`
      }
      frame = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    frame = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
      document.body.classList.remove('cursor-host')
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" data-active="false" aria-hidden />
    </>
  )
}
