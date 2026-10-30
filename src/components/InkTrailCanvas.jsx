import { useRef, useEffect } from 'react'

/* ── InkTrailCanvas ─────────────────────────────────────────
   Site-wide brush-stroke cursor trail.

   A pen tip eases after the cursor every frame, so the trail is
   sampled evenly (raw mousemove points are sparse and jittery).
   The last few tip positions are run through a Catmull-Rom
   spline and filled as one ribbon that tapers from a round head
   to a fine tail. When the cursor rests, the tail retracts into
   the head instead of popping out.

   Self-pausing rAF loop — stops once the stroke has retracted.
   Skips on touch devices and reduced motion.                    */

const INK = 'rgba(237, 232, 223, 0.9)'  // --text
const HEAD_WIDTH = 2.6  // px, at the tip
const MAX_POINTS = 26   // frames of history = trail length
const FOLLOW_MS = 22    // tip ease time constant; lower = tighter
const SUBDIV = 4        // spline samples between history points

export default function InkTrailCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const points = []
    const mouse = { x: 0, y: 0 }
    const tip = { x: 0, y: 0 }
    let active = false
    let rafId = null
    let last = 0

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

    function handleMouseMove(e) {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (!active) {
        // Start the stroke where the cursor is, not from the corner
        active = true
        tip.x = mouse.x
        tip.y = mouse.y
      }
      if (!rafId) {
        last = performance.now()
        rafId = requestAnimationFrame(draw)
      }
    }

    function handleMouseLeave() {
      active = false
      points.length = 0
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    // Catmull-Rom through the history for an even, kink-free path
    function spline(pts) {
      const out = []
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(i - 1, 0)]
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const p3 = pts[Math.min(i + 2, pts.length - 1)]
        for (let s = 0; s < SUBDIV; s++) {
          const t = s / SUBDIV
          const t2 = t * t
          const t3 = t2 * t
          out.push({
            x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
            y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
          })
        }
      }
      out.push(pts[pts.length - 1])
      return out
    }

    function draw(now) {
      const dt = Math.min(now - last, 50)
      last = now

      // Ease the tip toward the cursor, frame-rate independent
      const k = 1 - Math.exp(-dt / FOLLOW_MS)
      tip.x += (mouse.x - tip.x) * k
      tip.y += (mouse.y - tip.y) * k

      const head = points[points.length - 1]
      const moved = !head || Math.hypot(tip.x - head.x, tip.y - head.y) > 0.35
      if (moved) points.push({ x: tip.x, y: tip.y })
      // Retract: drop from the tail every frame, faster when resting
      const drop = moved ? Math.max(points.length - MAX_POINTS, 0) : 2
      if (drop) points.splice(0, Math.min(drop, points.length))

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (points.length < 2) {
        if (!moved) {
          rafId = null
          return
        }
        rafId = requestAnimationFrame(draw)
        return
      }

      const path = spline(points)
      const n = path.length
      const left = []
      const right = []
      for (let i = 0; i < n; i++) {
        const a = path[Math.max(i - 1, 0)]
        const b = path[Math.min(i + 1, n - 1)]
        let dx = b.x - a.x
        let dy = b.y - a.y
        const len = Math.hypot(dx, dy) || 1
        dx /= len
        dy /= len
        // 0 at tail → 1 at head, eased so most of the length stays slim
        const t = i / (n - 1)
        const half = (HEAD_WIDTH / 2) * Math.pow(t, 1.4)
        left.push(path[i].x - dy * half, path[i].y + dx * half)
        right.push(path[i].x + dy * half, path[i].y - dx * half)
      }

      ctx.beginPath()
      ctx.moveTo(left[0], left[1])
      for (let i = 2; i < left.length; i += 2) ctx.lineTo(left[i], left[i + 1])
      for (let i = right.length - 2; i >= 0; i -= 2) ctx.lineTo(right[i], right[i + 1])
      ctx.closePath()
      ctx.fillStyle = INK
      ctx.fill()

      // Round head so the stroke ends in a nib, not a cut
      const tipPt = path[n - 1]
      ctx.beginPath()
      ctx.arc(tipPt.x, tipPt.y, HEAD_WIDTH / 2, 0, Math.PI * 2)
      ctx.fill()

      rafId = requestAnimationFrame(draw)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
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
        zIndex: 50,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
