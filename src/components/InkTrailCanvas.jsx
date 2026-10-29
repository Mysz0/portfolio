import { useRef, useEffect } from 'react'

/* ── InkTrailCanvas ─────────────────────────────────────────
   Site-wide quill-pen cursor trail.

   Geometry: a broad nib held at a fixed angle swept along the
   path — thick when moving across the nib, hairline when moving
   along it, like a real pióro. The ribbon tapers to a point as
   the ink dries.

   Self-pausing rAF loop — stops when no points remain.
   Skips on touch devices and reduced motion.                    */

const INK = 'rgba(237, 232, 223, 0.88)'  // --text
const NIB_ANGLE = -0.6  // radians, nib tilted up-right
const NIB_HALF = 2.1    // px, half the nib width
const HAIRLINE = 0.5    // px, so strokes along the nib never vanish
const POINT_LIFETIME = 520  // ms
const MIN_STEP = 2  // px between recorded points

export default function InkTrailCanvas() {
  const canvasRef = useRef(null)
  const pointsRef = useRef([])
  const rafRef = useRef(null)
  const isDrawing = useRef(false)

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const nx = Math.cos(NIB_ANGLE)
    const ny = Math.sin(NIB_ANGLE)

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
      const points = pointsRef.current
      const last = points[points.length - 1]
      if (last && Math.hypot(e.clientX - last.x, e.clientY - last.y) < MIN_STEP) return
      points.push({ x: e.clientX, y: e.clientY, time: performance.now() })

      if (!isDrawing.current) {
        isDrawing.current = true
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    function handleMouseLeave() {
      pointsRef.current.length = 0
    }

    function draw(now) {
      const points = pointsRef.current

      let startIdx = 0
      while (startIdx < points.length && now - points[startIdx].time > POINT_LIFETIME) startIdx++
      if (startIdx > 0) points.splice(0, startIdx)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (points.length < 2) {
        if (points.length === 0) {
          isDrawing.current = false
          rafRef.current = null
          return
        }
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      // Nib offsets per point, shrinking as the ink dries
      const left = []
      const right = []
      for (const p of points) {
        const life = Math.max(0, 1 - (now - p.time) / POINT_LIFETIME)
        const h = NIB_HALF * Math.pow(life, 0.7)
        left.push([p.x + nx * h, p.y + ny * h])
        right.push([p.x - nx * h, p.y - ny * h])
      }

      // Ribbon: out along one edge, back along the other, smoothed through midpoints
      ctx.beginPath()
      ctx.moveTo(left[0][0], left[0][1])
      for (let i = 1; i < left.length - 1; i++) {
        ctx.quadraticCurveTo(left[i][0], left[i][1], (left[i][0] + left[i + 1][0]) / 2, (left[i][1] + left[i + 1][1]) / 2)
      }
      ctx.lineTo(left[left.length - 1][0], left[left.length - 1][1])
      ctx.lineTo(right[right.length - 1][0], right[right.length - 1][1])
      for (let i = right.length - 2; i > 0; i--) {
        ctx.quadraticCurveTo(right[i][0], right[i][1], (right[i][0] + right[i - 1][0]) / 2, (right[i][1] + right[i - 1][1]) / 2)
      }
      ctx.lineTo(right[0][0], right[0][1])
      ctx.closePath()
      ctx.fillStyle = INK
      ctx.fill()

      // Hairline spine
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length - 1; i++) {
        ctx.quadraticCurveTo(points[i].x, points[i].y, (points[i].x + points[i + 1].x) / 2, (points[i].y + points[i + 1].y) / 2)
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
      ctx.strokeStyle = INK
      ctx.lineWidth = HAIRLINE
      ctx.lineCap = 'round'
      ctx.stroke()

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
        inset: 0,
        zIndex: 50,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
