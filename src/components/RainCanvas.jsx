import { useRef, useEffect } from 'react'
import { wind } from './wind'

/* ── RainCanvas ─────────────────────────────────────────────
   Faint background drizzle between the shader and content.

   Fixed pool of thin slanted streaks recycled from the top,
   no allocation per frame. Drops near the moon catch its light
   (moon position mirrors ShaderBackground). Fast scrolls raise
   the shared wind and the drops lean, speed up and stretch with
   it, then ease back upright. Skips on reduced motion.        */

const DROP_COLOR = '237, 232, 223'  // --text
const DROPS_PER_MPX = 70  // density per million CSS pixels
const SLANT = 0.18  // horizontal px per vertical px, calm
const GUST_SLANT = 2.4  // extra slant at full gust
const GUST_RISE = 120  // ms, how fast the rain leans into a gust
const GUST_FALL = 900  // ms, how slowly it straightens back
const GUST_DECAY = 350  // ms half-life of the gust itself
const GLINT_RADIUS = 240  // px around the moon where drops light up

export default function RainCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let drops = []
    let w = 0
    let h = 0
    let rafId = null
    let last = performance.now()

    let slant = SLANT

    function makeDrop(fromTop) {
      const depth = Math.random()  // 0 = far, 1 = near
      return {
        x: Math.random() * (w + h * slant) - h * slant,
        y: fromTop ? -Math.random() * h * 0.3 : Math.random() * h,
        len: 10 + depth * 22,
        speed: 0.45 + depth * 0.6,  // px/ms
        alpha: 0.035 + depth * 0.075,
        width: depth > 0.8 ? 1 : 0.6,
        // Near drops get pushed harder, so a gust shears the layers
        drag: 0.7 + depth * 0.5 + Math.random() * 0.2,
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round((w * h) / 1e6 * DROPS_PER_MPX)
      drops = Array.from({ length: count }, () => makeDrop(false))
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    function draw(now) {
      const dt = Math.min(now - last, 50)
      last = now

      // Gust decays on its own; rain eases toward it, fast in, slow out
      wind.target *= Math.pow(0.5, dt / GUST_DECAY)
      const rate = wind.target > wind.current ? GUST_RISE : GUST_FALL
      wind.current += (wind.target - wind.current) * (1 - Math.exp(-dt / rate))
      const g = wind.current
      slant = SLANT + g * GUST_SLANT
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'

      // Same placement as the shader: x at 80%, sinks slightly with scroll
      const max = document.documentElement.scrollHeight - h
      const progress = max > 0 ? window.scrollY / max : 0
      const moonX = w * 0.8
      const moonY = h * (1 - (0.78 - progress * 0.16))
      const inv2r2 = 1 / (2 * GLINT_RADIUS * GLINT_RADIUS)

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]
        const s = SLANT + g * GUST_SLANT * d.drag
        const v = d.speed * (1 + g * 0.6)
        d.y += v * dt
        d.x += v * dt * s
        if (d.y - d.len > h || d.x - d.len > w) {
          drops[i] = makeDrop(true)
          continue
        }
        const dx = d.x - moonX
        const dy = d.y - moonY
        const glint = 1 + 4 * Math.exp(-(dx * dx + dy * dy) * inv2r2)
        ctx.strokeStyle = `rgba(${DROP_COLOR}, ${Math.min(d.alpha * glint, 0.5)})`
        ctx.lineWidth = d.width
        ctx.beginPath()
        // Streak along the drop's own velocity, stretched by the gust
        const len = d.len * (1 + g * 0.8)
        const n = 1 / Math.sqrt(1 + s * s)
        ctx.moveTo(d.x - len * s * n, d.y - len * n)
        ctx.lineTo(d.x, d.y)
        ctx.stroke()
      }

      rafId = requestAnimationFrame(draw)
    }
    rafId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
