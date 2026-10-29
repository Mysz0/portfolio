import { useRef, useEffect } from 'react'
import { gust } from './wind'

/* ── WindGust ───────────────────────────────────────────────
   Thin wind streaks that kick up only when you scroll fast.

   Scroll velocity (px/ms) above GUST_THRESHOLD spawns streaks,
   more the harder you fling. Streaks blow sideways and against
   the scroll direction, curl a little, then thin out.

   Self-pausing rAF loop — stops when no streaks remain.
   Skips on reduced motion.                                   */

const PAPER = [237, 232, 223]
const INK = [183, 55, 46]  // --accent
const GUST_THRESHOLD = 2.2  // px/ms
const MAX_STREAKS = 220

export default function WindGust() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const streaks = []
    let rafId = null
    let lastY = window.scrollY
    let lastT = performance.now()
    let velocity = 0  // smoothed, px/ms, + = scrolling down

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    function spawn(count, v) {
      const w = window.innerWidth
      const h = window.innerHeight
      const dir = Math.sign(v)
      const force = Math.min(Math.abs(v), 12)
      for (let i = 0; i < count && streaks.length < MAX_STREAKS; i++) {
        streaks.push({
          x: Math.random() * w * 1.2 - w * 0.2,
          y: Math.random() * h,
          vx: 6 + Math.random() * 5 + force * 1.4,
          vy: -dir * force * (0.2 + Math.random() * 0.35),
          len: 0.35 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
          curl: 0.4 + Math.random() * 1.2,
          life: 0,
          maxLife: 380 + Math.random() * 420,
          width: Math.random() < 0.15 ? 1.5 : 0.75,
          color: Math.random() < 0.08 ? INK : PAPER,
          alpha: 0.18 + Math.random() * 0.32,
        })
      }
    }

    function onScroll() {
      const now = performance.now()
      const dt = Math.max(now - lastT, 1)
      const dy = window.scrollY - lastY
      lastY = window.scrollY
      lastT = now
      velocity = velocity * 0.6 + (dy / dt) * 0.4

      const speed = Math.abs(velocity)
      // Rain starts leaning before streaks appear, so the shift reads as a transition
      gust((speed - 0.8) / 5)
      if (speed > GUST_THRESHOLD) {
        spawn(Math.ceil((speed - GUST_THRESHOLD) * 4), velocity)
        if (!rafId) {
          frameT = now
          rafId = requestAnimationFrame(draw)
        }
      }
    }

    let frameT = performance.now()
    function draw(now) {
      const dt = Math.min(now - frameT, 50)
      frameT = now
      const step = dt / 16.67

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineCap = 'round'

      for (let i = streaks.length - 1; i >= 0; i--) {
        const p = streaks[i]
        p.life += dt
        if (p.life >= p.maxLife) {
          streaks.splice(i, 1)
          continue
        }
        const k = p.life / p.maxLife
        // Curl: sideways wobble that grows as the gust loses steam
        const wobble = Math.sin(p.phase + p.life * 0.012) * p.curl * (0.3 + k) * 2
        p.x += p.vx * step
        p.y += (p.vy * (1 - k * 0.6) + wobble) * step

        // Fade in fast, out slow
        const a = p.alpha * Math.min(k * 6, 1) * (1 - k) * (1 - k)
        const tailX = p.x - p.vx * p.len * 6
        const tailY = p.y - p.vy * p.len * 6

        const grad = ctx.createLinearGradient(tailX, tailY, p.x, p.y)
        grad.addColorStop(0, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, 0)`)
        grad.addColorStop(1, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${a})`)
        ctx.strokeStyle = grad
        ctx.lineWidth = p.width
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.quadraticCurveTo((tailX + p.x) / 2, (tailY + p.y) / 2 + wobble * 4, p.x, p.y)
        ctx.stroke()
      }

      if (streaks.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        rafId = null
        return
      }
      rafId = requestAnimationFrame(draw)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
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
        zIndex: 40,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
