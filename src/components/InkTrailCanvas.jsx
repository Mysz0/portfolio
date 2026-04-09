import { useRef, useEffect } from 'react'

/* ── InkTrailCanvas ─────────────────────────────────────────
   Site-wide calligraphy brush cursor trail.
   
   Physics: velocity-based stroke width (slow = thick, fast = thin).
   Visual: vermillion ink with bleed on slow strokes, squared alpha
           falloff for natural drying effect.
   
   Self-pausing rAF loop — stops when no points remain.
   Skips on touch devices and reduced motion.                    */

const INK_COLOR = [183, 55, 46]  // --accent / vermillion
const MAX_WIDTH = 3
const POINT_LIFETIME = 1800  // ms
const MAX_ALPHA = 0.22

export default function InkTrailCanvas() {
  const canvasRef = useRef(null)
  const pointsRef = useRef([])
  const rafRef = useRef(null)
  const isDrawing = useRef(false)

  useEffect(() => {
    // Skip on touch devices or reduced motion
    const isTouch = window.matchMedia('(hover: none)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Handle resize
    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    // Track mouse
    let lastX = null
    let lastY = null

    function handleMouseMove(e) {
      const now = performance.now()
      const px = e.clientX
      const py = e.clientY

      let velocity = 0
      if (lastX !== null) {
        const dx = px - lastX
        const dy = py - lastY
        velocity = Math.sqrt(dx * dx + dy * dy)
      }
      lastX = px
      lastY = py

      pointsRef.current.push({ x: px, y: py, time: now, velocity })

      // Start rAF loop if not running
      if (!isDrawing.current) {
        isDrawing.current = true
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    function handleMouseLeave() {
      lastX = null
      lastY = null
    }

    function draw(now) {
      const points = pointsRef.current

      // Prune expired points via index (O(1) splice at end)
      let startIdx = 0
      while (startIdx < points.length && now - points[startIdx].time > POINT_LIFETIME) {
        startIdx++
      }
      if (startIdx > 0) points.splice(0, startIdx)

      // Stop loop if no points
      if (points.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        isDrawing.current = false
        rafRef.current = null
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Draw trail segments — batched, no shadowBlur
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1]
        const p1 = points[i]
        const life = 1 - (now - p1.time) / POINT_LIFETIME
        if (life <= 0) continue

        const alpha = life * life * MAX_ALPHA  // squared falloff
        const speed = Math.min(p1.velocity, 3)
        const width = MAX_WIDTH * (1 - speed / 3) + 0.3

        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.strokeStyle = `rgba(${INK_COLOR[0]}, ${INK_COLOR[1]}, ${INK_COLOR[2]}, ${alpha})`
        ctx.lineWidth = width
        ctx.stroke()

        // Soft ink bleed — draw a wider faint stroke instead of shadowBlur
        if (width > 1.8) {
          ctx.beginPath()
          ctx.moveTo(p0.x, p0.y)
          ctx.lineTo(p1.x, p1.y)
          ctx.strokeStyle = `rgba(${INK_COLOR[0]}, ${INK_COLOR[1]}, ${INK_COLOR[2]}, ${alpha * 0.15})`
          ctx.lineWidth = width * 3
          ctx.stroke()
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top, 0px)',
        right: 'env(safe-area-inset-right, 0px)',
        bottom: 'env(safe-area-inset-bottom, 0px)',
        left: 'env(safe-area-inset-left, 0px)',
        zIndex: 50,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
