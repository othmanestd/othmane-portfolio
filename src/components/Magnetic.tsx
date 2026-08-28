import { useRef, type ReactNode } from 'react'

/** Pulls its child toward the pointer. Subtle by design — 0.22 of the offset. */
export function Magnetic({ children, strength = 0.22 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  const onMove = (event: React.PointerEvent) => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = node.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    node.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`
  }

  const reset = () => {
    const node = ref.current
    if (node) node.style.transform = 'translate3d(0,0,0)'
  }

  return (
    <span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="inline-block transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)]"
    >
      {children}
    </span>
  )
}
