import { useRef, useEffect } from 'react'

/*  ── KanjiVG stroke data — CC BY-SA 3.0, Ulrich Apel ───
    http://kanjivg.tagaini.net
    Paths follow correct calligraphic stroke order.          */
const KANJI = [
  {
    char: '枯',
    strokes: [
      'M14.78,42.22c1.97,0.53,5.18,0.32,6.63,0.08c5.77-0.96,16.32-3.18,22.13-4.34c1.26-0.25,3.08-0.58,4.47-0.34',
      'M33.11,15c1.07,1.07,1.54,2.5,1.54,4.92c0,6.52,0.03,45.84,0.04,68.7c0,3.26,0,6.18,0,8.62',
      'M33.19,41.53c0,1.47-0.87,3.69-1.62,5.35C26.52,57.98,21.75,66,14.11,75.09',
      'M37.88,48c2.76,1.82,7.3,7.72,9.62,11.25',
      'M48.05,45.03c2.95,0.59,5.17,0.39,7.58,0.14c9.03-0.93,24.87-3.04,35.26-4.16c2.66-0.29,5.15-0.37,7.86,0.21',
      'M70.65,17.25c1.11,1.11,1.83,2.75,1.83,4.78c0,6.1-0.04,32.22-0.04,42.08',
      'M53.54,65.89c0.97,0.97,1.31,2.26,1.54,3.74c0.65,4.17,1.65,11.37,2.51,17.89c0.24,1.82,0.46,3.59,0.67,5.23',
      'M56.31,67.44C64.14,66.6,79,65,86.24,64.43c3.7-0.29,4.96,1.22,4.35,4.84c-0.83,4.93-2.11,11.04-3.21,16.9',
      'M58.95,88.97c5.63-0.3,16.94-0.87,25.55-1.33c2-0.11,3.85-0.21,5.42-0.3',
    ],
  },
  {
    char: '山',
    strokes: [
      'M52.49,15.5c1.38,1.38,2.26,3.5,2.26,5.75c0,0.75-0.22,58.3-0.25,59.25',
      'M21.49,54.5c0.88,0.88,1.39,2.25,1.26,3.75c-0.58,6.99-1,16-2.5,23c-0.7,3.26,0.11,4,2,3.75c17-2.25,47.12-5.12,65.5-6',
      'M89.24,49c0.94,0.94,1.64,2.38,1.51,4.25c-0.25,3.68-1.83,20.3-2.55,28.77c-0.22,2.64-0.39,4.51-0.45,4.98',
    ],
  },
  {
    char: '水',
    strokes: [
      'M52.77,15.08c1.08,1.08,1.67,2.49,1.76,5.52c0.4,14.55-0.26,62.16-0.26,67.12c0,9.78-7.52,0.03-9.02-1.22',
      'M17.5,45.75c1.75,0.62,3.73,0.43,5.25,0C25.88,44.88,36.09,41,38.59,40s4.47,1.24,3.75,3.5C39,54,28.25,69,19,74.75',
      'M81.22,27.5c-0.22,1.25-0.72,2.25-1.52,2.97c-5.64,5.1-12.45,9.78-22.45,13.78',
      'M57,46c8.82,10.73,19.23,21.46,28.42,27.42c2.16,1.4,4.52,3,7.08,3.58',
    ],
  },
]

/*  ── Cycle timing (seconds) ─────────────────────────────
    Shared with WindText via rhythmRef.
    Total cycle: 33s (11 beats × 3s per beat).

    0-8s    Drawing — strokes appear sequentially
    8-20s   Rest — fully visible
    20-28s  Evaporation — fade in reverse order
    28-33s  Empty pause                                      */
const CYCLE_DURATION = 33
const DRAW_END = 8
const REST_END = 20
const EVAP_END = 28

/* Character render size (px) */
const CHAR_SIZE = 22

/*  ── Pre-compute per-stroke timings ─────────────────────
    Drawing: each character starts at a staggered time,
    strokes within a character stagger evenly.
    Evaporation: reverse global order (水 last stroke first,
    枯 first stroke last).                                   */
const STROKE_TIMINGS = (() => {
  const timings = []
  let globalIdx = 0
  const totalStrokes = KANJI.reduce((s, k) => s + k.strokes.length, 0)

  /* Per-character drawing config */
  const configs = [
    { t0: 0.3, gap: 0.4, dur: 0.7 },
    { t0: 4.0, gap: 0.5, dur: 0.85 },
    { t0: 5.5, gap: 0.4, dur: 0.75 },
  ]

  KANJI.forEach((kanji, ci) => {
    const cfg = configs[ci]
    kanji.strokes.forEach((_, si) => {
      const drawStart = cfg.t0 + si * cfg.gap
      const drawEnd = drawStart + cfg.dur

      /* Evaporation: reverse global order */
      const reverseIdx = totalStrokes - 1 - globalIdx
      const evapGap = (EVAP_END - REST_END) / (totalStrokes + 2)
      const evapStart = REST_END + reverseIdx * evapGap
      const evapEnd = evapStart + 1.5

      timings.push({ ci, si, drawStart, drawEnd, evapStart, evapEnd })
      globalIdx++
    })
  })

  return timings
})()

/* Smoothstep easing */
function smoothstep(t) {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

export default function KanjiStrokes({ rhythmRef, className = '' }) {
  const containerRef = useRef(null)
  const animRef = useRef(null)
  const pathLengths = useRef([])
  const prefersReduced = useRef(false)

  /* Detect reduced motion */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReduced.current = mq.matches
    const handler = (e) => { prefersReduced.current = e.matches }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  /* Measure path lengths, initialize, start animation */
  useEffect(() => {
    if (!containerRef.current) return

    const paths = containerRef.current.querySelectorAll('[data-stroke]')
    pathLengths.current = Array.from(paths).map(p => p.getTotalLength())

    /* Initialize all strokes as hidden */
    paths.forEach((p, i) => {
      const len = pathLengths.current[i]
      p.style.strokeDasharray = String(len)
      p.style.strokeDashoffset = String(len)
      p.style.opacity = '0'
    })

    /* Reduced motion: show all strokes immediately */
    if (prefersReduced.current) {
      paths.forEach((p) => {
        p.style.strokeDashoffset = '0'
        p.style.opacity = '1'
      })
      return
    }

    // Visibility observer — pause rAF when offscreen
    const isVisibleRef = { current: true }
    let pollId = null
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting },
      { threshold: 0, rootMargin: '200px' },
    )
    observer.observe(containerRef.current)

    // Cache querySelectorAll result (stable after mount)
    const cachedPaths = paths

    function tick(now) {
      if (!isVisibleRef.current) {
        // Offscreen: stop rAF, poll via setTimeout
        animRef.current = null
        pollId = setTimeout(() => {
          animRef.current = requestAnimationFrame(tick)
        }, 500)
        return
      }

      animRef.current = requestAnimationFrame(tick)

      if (!containerRef.current || !rhythmRef?.current) return

      const elapsed = (now - rhythmRef.current.origin) / 1000
      const ct = ((elapsed % CYCLE_DURATION) + CYCLE_DURATION) % CYCLE_DURATION

      for (let i = 0; i < STROKE_TIMINGS.length; i++) {
        const st = STROKE_TIMINGS[i]
        const path = cachedPaths[i]
        if (!path) continue
        const len = pathLengths.current[i]
        if (!len) continue

        if (ct >= st.drawStart && ct < st.drawEnd) {
          /* ── Drawing phase ── */
          const progress = smoothstep((ct - st.drawStart) / (st.drawEnd - st.drawStart))
          path.style.strokeDashoffset = String(len * (1 - progress))
          path.style.opacity = '1'
          path.style.transform = ''
        } else if (ct >= st.drawEnd && ct < st.evapStart) {
          /* ── Rest phase — fully visible ── */
          path.style.strokeDashoffset = '0'
          path.style.opacity = '1'
          path.style.transform = ''
        } else if (ct >= st.evapStart && ct < st.evapEnd) {
          /* ── Evaporation phase ── */
          const progress = (ct - st.evapStart) / (st.evapEnd - st.evapStart)
          const easeIn = progress * progress
          path.style.strokeDashoffset = '0'
          path.style.opacity = String(1 - easeIn)
          /* Slight upward drift as ink evaporates */
          const drift = easeIn * -3
          path.style.transform = `translateY(${drift}px)`
        } else {
          /* ── Hidden (before draw or after evaporation) ── */
          path.style.strokeDashoffset = String(len)
          path.style.opacity = '0'
          path.style.transform = ''
        }
      }
    }

    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (pollId) clearTimeout(pollId)
      observer.disconnect()
    }
  }, [rhythmRef])

  /* Flat stroke index for querySelectorAll ordering */
  let flatIdx = 0

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      aria-label="枯山水"
      role="img"
    >
      {KANJI.map((kanji, ci) => (
        <svg
          key={ci}
          viewBox="0 0 109 109"
          width={CHAR_SIZE}
          height={CHAR_SIZE}
          fill="none"
          style={{ overflow: 'visible' }}
          shapeRendering="geometricPrecision"
        >
          {kanji.strokes.map((d, si) => {
            const idx = flatIdx++
            return (
              <path
                key={si}
                data-stroke={idx}
                d={d}
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  opacity: 0,
                  willChange: 'opacity, transform',
                }}
              />
            )
          })}
        </svg>
      ))}
    </div>
  )
}
