import { useEffect, useRef } from 'react'

/**
 * Pixel-art cursor. A crisp 16px pixel arrow follows the pointer 1:1, with a
 * pixel "ink drop" that lags behind it. `mix-blend-difference` keeps both
 * visible on either theme. Fine pointers only — touch keeps native behaviour.
 *
 * The sprite is an inline SVG with shape-rendering:crispEdges + an upscale, so
 * it stays hard-edged and pixelated at any DPI.
 */
const ARROW = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges' viewBox='0 0 16 16'>
    <g fill='#fff'>
      <rect x='2' y='1' width='2' height='2'/>
      <rect x='2' y='3' width='2' height='2'/>
      <rect x='2' y='5' width='2' height='2'/>
      <rect x='2' y='7' width='2' height='2'/>
      <rect x='2' y='9' width='2' height='2'/>
      <rect x='2' y='11' width='2' height='2'/>
      <rect x='4' y='3' width='2' height='2'/>
      <rect x='4' y='5' width='2' height='2'/>
      <rect x='4' y='7' width='2' height='2'/>
      <rect x='4' y='9' width='2' height='2'/>
      <rect x='6' y='5' width='2' height='2'/>
      <rect x='6' y='7' width='2' height='2'/>
      <rect x='6' y='9' width='2' height='2'/>
      <rect x='8' y='7' width='2' height='2'/>
      <rect x='8' y='9' width='2' height='2'/>
      <rect x='6' y='11' width='2' height='2'/>
      <rect x='8' y='11' width='2' height='2'/>
      <rect x='8' y='13' width='2' height='2'/>
      <rect x='10' y='13' width='2' height='2'/>
    </g>
  </svg>`,
)}`

export function Cursor() {
  const arrowRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches) return

    document.body.classList.add('cursor-host')

    const target = { x: innerWidth / 2, y: innerHeight / 2 }
    const drop = { ...target }
    let raf = 0
    let pressed = false

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (arrowRef.current) {
        arrowRef.current.style.transform =
          `translate3d(${target.x}px, ${target.y}px, 0) scale(${pressed ? 0.8 : 1})`
      }
      const interactive = (e.target as HTMLElement)?.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor]',
      )
      arrowRef.current?.setAttribute('data-active', interactive ? 'true' : 'false')
    }

    const onDown = () => { pressed = true }
    const onUp = () => { pressed = false }

    const loop = () => {
      if (reduced.matches) {
        drop.x = target.x
        drop.y = target.y
      } else {
        drop.x += (target.x - drop.x) * 0.14
        drop.y += (target.y - drop.y) * 0.14
      }
      if (dropRef.current) {
        dropRef.current.style.transform = `translate3d(${drop.x}px, ${drop.y}px, 0)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      cancelAnimationFrame(raf)
      document.body.classList.remove('cursor-host')
    }
  }, [])

  return (
    <>
      <div ref={dropRef} className="pixel-ink-drop" aria-hidden />
      <div
        ref={arrowRef}
        className="pixel-cursor"
        data-active="false"
        style={{ backgroundImage: `url("${ARROW}")` }}
        aria-hidden
      />
    </>
  )
}
