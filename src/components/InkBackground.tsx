import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'

/**
 * Octopus-ink background: a canvas that trails soft, diffusing ink behind the
 * pointer. Each pointer move injects a few particles that drift with a little
 * curl noise, swell, and fade — reading as ink blooming in water. Monochrome,
 * so it sits under the content without fighting the design.
 *
 * Kept cheap on purpose: a hard particle cap, a single translucent "fade" fill
 * per frame for the trail, and it disables itself for reduced-motion or coarse
 * pointers (touch), where a follow effect makes no sense.
 */
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  life: number
  maxLife: number
  seed: number
}

const MAX_PARTICLES = 140

export function InkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    // Ink colour follows the theme: dark ink on paper, light ink on ink-black.
    const inkRgb = theme === 'light' ? '10, 10, 11' : '244, 244, 240'

    const particles: Particle[] = []
    const pointer = { x: width / 2, y: height / 2, px: width / 2, py: height / 2, moved: false }
    let frame = 0

    const spawn = (x: number, y: number, vx: number, vy: number) => {
      const speed = Math.hypot(vx, vy)
      const count = Math.min(4, 1 + Math.floor(speed / 8))
      for (let i = 0; i < count; i += 1) {
        if (particles.length >= MAX_PARTICLES) particles.shift()
        const spread = 0.6
        particles.push({
          x,
          y,
          vx: vx * 0.18 + (Math.random() - 0.5) * spread,
          vy: vy * 0.18 + (Math.random() - 0.5) * spread,
          r: 2 + Math.random() * 4,
          life: 0,
          maxLife: 60 + Math.random() * 70,
          seed: Math.random() * 1000,
        })
      }
    }

    const onMove = (e: PointerEvent) => {
      pointer.px = pointer.x
      pointer.py = pointer.y
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.moved = true
      spawn(pointer.x, pointer.y, pointer.x - pointer.px, pointer.y - pointer.py)
    }

    let raf = 0
    const tick = () => {
      frame += 1
      // Fade the previous frame slightly instead of clearing — this is what
      // leaves the smoky trail rather than discrete dots.
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.045)'
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'source-over'

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]
        p.life += 1
        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
          continue
        }
        // Curl-ish drift so the ink curls like it's in water.
        const t = (frame + p.seed) * 0.01
        p.vx += Math.cos(t + p.y * 0.01) * 0.02
        p.vy += Math.sin(t + p.x * 0.01) * 0.02
        p.vx *= 0.96
        p.vy *= 0.96
        p.x += p.vx
        p.y += p.vy
        p.r += 0.35 // swell as it diffuses

        const k = p.life / p.maxLife
        const alpha = Math.sin(k * Math.PI) * 0.16 // ease in and out
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
        grad.addColorStop(0, `rgba(${inkRgb}, ${alpha})`)
        grad.addColorStop(1, `rgba(${inkRgb}, 0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.9 }}
    />
  )
}
