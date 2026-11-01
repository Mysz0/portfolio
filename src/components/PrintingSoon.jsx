import { useEffect, useId, useRef, useState } from 'react'

/* ── "3D model incoming" ───────────────────────────────────
   Print, lift, park and inspect. The finished case stays on the
   bed, then the illustration dissolves into the next iteration. */

const LAYERS = 34
const PRINT = 7.2
const PARK = 1.1
const HOLD = 2.2
const FADE = 0.65
const RESET = 0.9
const LOOP = PRINT + PARK + HOLD + FADE + RESET

const BED_Y = 188
const PUCK_W = 132
const PUCK_H = 48
const PUCK_X = 160 - PUCK_W / 2
const LAYER_H = PUCK_H / LAYERS

// Rounded shoulders and a softly curved base, like the printed teal shell.
const PROFILE = `M ${PUCK_X + 12} ${BED_Y} Q ${PUCK_X} ${BED_Y} ${PUCK_X} ${BED_Y - 12} L ${PUCK_X} ${BED_Y - PUCK_H + 18} Q ${PUCK_X} ${BED_Y - PUCK_H} ${PUCK_X + 18} ${BED_Y - PUCK_H} L ${PUCK_X + PUCK_W - 18} ${BED_Y - PUCK_H} Q ${PUCK_X + PUCK_W} ${BED_Y - PUCK_H} ${PUCK_X + PUCK_W} ${BED_Y - PUCK_H + 18} L ${PUCK_X + PUCK_W} ${BED_Y - 12} Q ${PUCK_X + PUCK_W} ${BED_Y} ${PUCK_X + PUCK_W - 12} ${BED_Y} Z`
const smooth = (t) => { const n = Math.max(0, Math.min(1, t)); return n * n * (3 - 2 * n) }

export default function PrintingSoon() {
  const wrap = useRef(null)
  const id = useId().replace(/:/g, '')
  const builtId = `${id}-built`
  const linesId = `${id}-lines`
  const freshId = `${id}-fresh`
  const [t, setT] = useState(PRINT * 0.64)
  const [version, setVersion] = useState(7)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let raf
    let last = 0
    let elapsed = PRINT * 0.64
    let lastLoop = 0
    let visible = false
    const tick = (now) => {
      elapsed += Math.min(64, now - last) / 1000
      last = now
      const loop = Math.floor(elapsed / LOOP)
      if (loop !== lastLoop) { lastLoop = loop; setVersion((v) => v + 1) }
      setT(elapsed % LOOP)
      raf = requestAnimationFrame(tick)
    }
    // Only runs while on screen
    const sync = () => {
      cancelAnimationFrame(raf)
      if (media.matches) setT(PRINT + PARK)
      else if (visible) { last = performance.now(); raf = requestAnimationFrame(tick) }
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      sync()
    })
    io.observe(wrap.current)
    media.addEventListener('change', sync)
    sync()
    return () => { io.disconnect(); media.removeEventListener('change', sync); cancelAnimationFrame(raf) }
  }, [])

  // Phase of the loop
  const printing = t < PRINT
  const parking = t >= PRINT && t < PRINT + PARK
  const fading = t >= PRINT + PARK + HOLD && t < PRINT + PARK + HOLD + FADE
  const resetting = t >= PRINT + PARK + HOLD + FADE
  const progress = printing ? t / PRINT : resetting ? 0 : 1
  const layersF = progress * LAYERS
  const layer = Math.min(LAYERS - 1, Math.floor(layersF))
  const inLayer = layersF - layer

  // Nozzle sweeps one layer per pass, alternating direction
  const left = PUCK_X + 2
  const right = PUCK_X + PUCK_W - 2
  const parkX = 258
  const parkY = BED_Y - PUCK_H - 42
  const forward = layer % 2 === 0
  let nozzleX = forward ? left + (right - left) * inLayer : right - (right - left) * inLayer
  const builtH = progress * PUCK_H
  let gantryY = BED_Y - builtH - 18
  if (!printing) {
    // Lift clear of the case before moving sideways. Nothing touches the print.
    const p = parking ? (t - PRINT) / PARK : 1
    const endX = (LAYERS - 1) % 2 === 0 ? right : left
    nozzleX = endX + (parkX - endX) * smooth((p - 0.3) / 0.7)
    gantryY = BED_Y - PUCK_H - 18 - 24 * smooth(p / 0.3)
  }
  if (resetting) {
    const r = (t - PRINT - PARK - HOLD - FADE) / RESET
    nozzleX = parkX + (left - parkX) * smooth(r / 0.6)
    gantryY = parkY + (BED_Y - 18 - parkY) * smooth((r - 0.6) / 0.4)
  }
  const fade = resetting ? 0 : fading ? 1 - smooth((t - PRINT - PARK - HOLD) / FADE) : 1
  const pct = Math.round(progress * 100)
  const status = resetting || fading ? 'next pass' : parking ? 'cooling' : printing ? `${pct}%` : '100% · done'

  return (
    <div ref={wrap} className="w-full min-w-0 max-w-md mx-auto">
      <svg viewBox="0 0 320 230" className="w-full h-auto" role="img" aria-label="A 3D printer builds the teal case layer by layer, then lifts and parks its nozzle. The finished case rests on the bed before the next iteration.">
        <defs>
          <clipPath id={builtId}>
            <rect x="0" y={BED_Y - builtH} width="320" height={builtH} />
          </clipPath>
          <pattern id={linesId} width="6" height={LAYER_H * 2} patternUnits="userSpaceOnUse">
            <rect width="6" height={LAYER_H * 2} fill="#174b44" />
            <rect width="6" height={LAYER_H * 0.7} fill="#27685c" />
          </pattern>
          <linearGradient id={freshId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#a3cbb4" stopOpacity="0.7" />
            <stop offset="1" stopColor="#a3cbb4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Frame */}
        <rect x="34" y="14" width="6" height={BED_Y + 10 - 14} rx="2" fill="#2e2b28" />
        <rect x="280" y="14" width="6" height={BED_Y + 10 - 14} rx="2" fill="#2e2b28" />
        <rect x="34" y="10" width="252" height="8" rx="3" fill="#33302c" />

        {/* Bed */}
        <rect x="58" y={BED_Y} width="204" height="7" rx="2" fill="#3a3733" />
        <rect x="58" y={BED_Y + 7} width="204" height="3" rx="1" fill="#1d1c1a" />

        {/* The print */}
        <path d={PROFILE} fill="none" stroke="rgba(237,232,223,0.08)" strokeDasharray="3 4" />
        <g opacity={fade} clipPath={`url(#${builtId})`}>
          <path d={PROFILE} fill={`url(#${linesId})`} />
          {printing && builtH > 1 && <rect x={forward ? left : nozzleX} y={BED_Y - builtH} width={Math.max(0, forward ? nozzleX - left : right - nozzleX)} height={LAYER_H + 1.5} fill={`url(#${freshId})`} />}
        </g>

        {/* Gantry and carriage */}
        <rect x="40" y={gantryY - 3} width="240" height="6" rx="2" fill="#34312d" />
        <g transform={`translate(${nozzleX} ${gantryY})`}>
          <rect x="-14" y="-16" width="28" height="20" rx="4" fill="#45413c" />
          <rect x="-10" y="-12" width="20" height="3" rx="1.5" fill="#4e8a76" opacity="0.8" />
          <path d="M -5 4 L 5 4 L 1.5 16 L -1.5 16 Z" fill="#8c867c" />
          {printing && (
            <circle cx="0" cy="18" r="1.8" fill="#a3cbb4" />
          )}
        </g>
      </svg>

      <div className="mt-4 font-mono text-[13px] text-[var(--text-muted)] flex items-center justify-between gap-3" aria-live="off">
        <span className="truncate">knob_v{version}.stl</span>
        <span className="flex items-center gap-3 shrink-0">
          <span className="block h-1 w-12 sm:w-20 bg-[var(--border-hover)]" aria-hidden="true">
            <span className="block h-full w-full bg-[var(--text-body)] origin-left" style={{ transform: `scaleX(${progress})` }} />
          </span>
          <span className="w-[6rem] text-right text-[var(--text-body)]">{status}</span>
        </span>
      </div>
    </div>
  )
}
