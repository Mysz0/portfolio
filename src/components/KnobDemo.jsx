import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PACKS, PALETTES, FONT } from './fidgetSprites'

/* ── Live Fidget Knob ──────────────────────────────────────
   The knob's round 240×240 screen, drawn the way the firmware
   draws it (firmware/src/render/field.cpp): 9×9 sprites on an
   11 px lattice filling a diamond whose size is the value.
   Twist by dragging around the puck or scrolling over it, click
   to tap, and the shake button does what a shake does.        */

const W = 240
const PITCH = 11
const HALF = 11
const LATTICE = HALF * 2 + 1
const CLIP = 114
const MIN_R = 14
const MAX_R = 220
const FRAY = 0.28
const HEAVY_UNTIL = 0.45
const MEDIUM_UNTIL = 0.78
const TIER_JITTER = 0.3
const ACCENT_CENTRE = 0.1
const ACCENT_EDGE = 0.55
const UPSCALE = 3

const DETENT_DEG = 12 // one twist step per 12° of drag
const DICE = [
  { short: 'D6', faces: 6 },
  { short: 'D20', faces: 20 },
  { short: 'COIN', faces: 2, text: (r) => (r === 1 ? 'HEADS' : 'TAILS') },
  { short: 'Y/N', faces: 2, text: (r) => (r === 1 ? 'YES' : 'NO') },
  { short: 'D100', faces: 100 },
]

export const MODES = [
  { id: 'lights', label: 'Lights' },
  { id: 'timer', label: 'Timer' },
  { id: 'dice', label: 'Dice' },
]
export const EFFECTS = ['Still', 'Twinkle', 'Drift']

function hash32(x) {
  x ^= x >>> 16
  x = Math.imul(x, 0x7feb352d)
  x ^= x >>> 15
  x = Math.imul(x, 0x846ca68b)
  x ^= x >>> 16
  return x >>> 0
}

function hsv(h, s, v) {
  h = ((h % 360) + 360) % 360
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255]
}

// Four fixed random bytes per lattice cell, exactly as the firmware hashes them
const CELLS = []
for (let j = -HALF; j <= HALF; j++) {
  for (let i = -HALF; i <= HALF; i++) {
    const dx = i * PITCH
    const dy = j * PITCH
    if (dx * dx + dy * dy > CLIP * CLIP) continue
    const h = hash32(Math.imul(i + 64, 0x9e3779b1) ^ Math.imul(j + 64, 0x85ebca77))
    CELLS.push({
      i, j, dx, dy, h,
      fray: (h & 0xff) / 255,
      jitter: ((h >>> 8) & 0xff) / 255 - 0.5,
      accentRoll: ((h >>> 16) & 0xff) / 255,
      pick: h >>> 24,
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    })
  }
}

// The pack's boldest heavy mark draws text, like the firmware's g_textSprite
const boldest = (pack) => pack.heavy.reduce((best, s) => (count(s) > count(best) ? s : best))
const count = (rows) => rows.reduce((n, r) => n + r.toString(2).split('1').length - 1, 0)

function layoutText(text) {
  const dots = []
  let col = 0
  for (const ch of text.toUpperCase()) {
    if (ch === ' ') { col += 2; continue }
    const g = FONT[ch]
    if (!g) continue
    g.forEach((row, r) => [...row].forEach((c, k) => c === '#' && dots.push({ col: col + k, row: r })))
    col += g[0].length + 1
  }
  const width = Math.max(0, col - 1)
  return dots.map((d) => ({ i: d.col - Math.floor(width / 2), j: d.row - 2, col: d.col }))
}

const ease = (cur, target, a) => cur + (target - cur) * a
const easeHue = (cur, target, a) => {
  const diff = ((((target - cur) % 360) + 540) % 360) - 180
  return cur + diff * a
}
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function KnobDemo({ mode, pack, palette, effect, onGesture, autoplay = true, paused = false }) {
  const canvasRef = useRef(null)
  const puckRef = useRef(null)
  const look = useRef({ mode, pack, palette, effect })
  look.current = { mode, pack, palette, effect }

  // Everything the frame loop reads lives in refs, so twisting never re-renders React
  const s = useRef({
    lights: { value: 0.55, hue: 32, sat: 0, on: true, colourMode: false },
    timer: { total: 25 * 60, left: 25 * 60, running: false, endsAt: 0, done: false },
    dice: { kind: 0, result: 0, rollingUntil: 0, flicker: 0 },
    shown: { radius: 0, hue: 32, sat: 0, dim: 1, wheel: 0 },
    text: { str: '', dots: [] },
    twistCarry: 0,
    userTouched: false,
    lastTouch: 0,
  })
  const [hint, setHint] = useState(true)

  /* ── haptics, made visible ── */
  const buzz = useCallback((kind) => {
    const el = puckRef.current
    if (!el || !el.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (kind === 'detent') {
      el.animate([{ transform: 'translateX(0.7px)' }, { transform: 'none' }], { duration: 60 })
    } else if (kind === 'shake') {
      el.animate(
        [0, -9, 8, -6, 5, -2, 0].map((x, k) => ({ transform: `translateX(${x}px) rotate(${x * 0.5}deg)`, offset: k / 6 })),
        { duration: 460, easing: 'ease-out' }
      )
    } else if (kind === 'alarm') {
      el.animate([0, 2, -2, 2, -2, 2, -2, 0].map((x) => ({ transform: `translate(${x}px, ${-x * 0.5}px)` })), { duration: 380 })
    } else {
      el.animate([{ transform: 'scale(0.985)' }, { transform: 'none' }], { duration: 140, easing: 'ease-out' })
    }
  }, [])

  /* ── gestures, per mode, as the firmware maps them ── */
  const twist = useCallback((steps) => {
    const st = s.current
    const m = look.current.mode
    if (m === 'lights') {
      const L = st.lights
      if (!L.on) return // off-light rule: twisting a dark lamp does nothing
      if (L.colourMode) {
        L.hue = (L.hue + steps * 8 + 360) % 360
        if (L.sat < 0.08) L.sat = 0.85
      } else {
        L.value = Math.min(1, Math.max(0.02, L.value + steps / 36))
      }
    } else if (m === 'timer') {
      const T = st.timer
      if (T.running) return // a knock can't change a running timer
      const mins = Math.min(90, Math.max(1, Math.round(T.total / 60) + steps))
      T.total = T.left = mins * 60
      T.done = false
    } else if (m === 'dice') {
      const D = st.dice
      if (D.rollingUntil > performance.now()) return
      st.twistCarry += steps
      if (Math.abs(st.twistCarry) < 3) { buzz('detent'); return }
      D.kind = (D.kind + Math.sign(st.twistCarry) + DICE.length) % DICE.length
      D.result = 0
      st.twistCarry = 0
    }
    buzz('detent')
  }, [buzz])

  const tap = useCallback(() => {
    const st = s.current
    const m = look.current.mode
    const now = performance.now()
    if (m === 'lights') {
      st.lights.on = !st.lights.on
      if (!st.lights.on) st.lights.colourMode = false
    } else if (m === 'timer') {
      const T = st.timer
      if (T.done) { T.done = false; T.left = T.total } else if (T.running) {
        T.left = Math.max(0, (T.endsAt - now) / 1000); T.running = false
      } else { T.running = true; T.endsAt = now + T.left * 1000 }
    } else if (m === 'dice') {
      roll()
    }
    buzz('confirm')
    function roll() {
      const D = st.dice
      if (D.rollingUntil > now) return
      D.rollingUntil = now + 900
      D.result = 1 + Math.floor(Math.random() * DICE[D.kind].faces)
    }
  }, [buzz])

  const shake = useCallback(() => {
    const st = s.current
    const m = look.current.mode
    const now = performance.now()
    if (m === 'lights') {
      if (st.lights.on) st.lights.colourMode = !st.lights.colourMode
    } else if (m === 'timer') {
      Object.assign(st.timer, { running: false, done: false, left: st.timer.total })
    } else if (m === 'dice' && st.dice.rollingUntil <= now) {
      st.dice.rollingUntil = now + 900
      st.dice.result = 1 + Math.floor(Math.random() * DICE[st.dice.kind].faces)
    }
    buzz('shake')
  }, [buzz])

  const touched = useCallback(() => {
    s.current.userTouched = true
    s.current.lastTouch = performance.now()
    setHint(false)
  }, [])

  // Let the page's buttons fire gestures too
  useEffect(() => {
    if (!onGesture) return
    onGesture.current = {
      tap: () => { touched(); tap() },
      shake: () => { touched(); shake() },
      twist: (n) => { touched(); twist(n) },
    }
  }, [onGesture, tap, shake, twist, touched])

  /* ── input: drag around the puck, wheel, keys ── */
  useEffect(() => {
    const el = puckRef.current
    if (!el) return
    let drag = null
    const angleAt = (e) => {
      const r = el.getBoundingClientRect()
      return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI
    }
    const down = (e) => {
      touched()
      el.setPointerCapture?.(e.pointerId)
      drag = { a: angleAt(e), moved: 0, t: performance.now(), carry: 0 }
    }
    const move = (e) => {
      if (!drag) return
      const a = angleAt(e)
      let d = a - drag.a
      if (d > 180) d -= 360
      if (d < -180) d += 360
      drag.a = a
      drag.moved += Math.abs(d)
      drag.carry += d
      while (Math.abs(drag.carry) >= DETENT_DEG) {
        const dir = Math.sign(drag.carry)
        drag.carry -= dir * DETENT_DEG
        twist(dir)
      }
    }
    const up = () => {
      if (drag && drag.moved < 6 && performance.now() - drag.t < 400) tap()
      drag = null
    }
    let wheelCarry = 0
    const wheel = (e) => {
      e.preventDefault()
      touched()
      wheelCarry += e.deltaY
      while (Math.abs(wheelCarry) >= 40) {
        const dir = Math.sign(wheelCarry)
        wheelCarry -= dir * 40
        twist(-dir)
      }
    }
    const key = (e) => {
      const map = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }
      if (map[e.key]) { e.preventDefault(); touched(); twist(map[e.key]) }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); touched(); tap() }
      else if (e.key === 's' || e.key === 'S') { touched(); shake() }
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    el.addEventListener('keydown', key)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('keydown', key)
    }
  }, [twist, tap, shake, touched])

  /* ── the frame loop ── */
  useEffect(() => {
    if (paused) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const off = document.createElement('canvas')
    off.width = off.height = W
    const octx = off.getContext('2d')
    const img = octx.createImageData(W, W)
    const px = new Uint32Array(img.data.buffer)
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const sprite = (cx, cy, rows, r, g, b) => {
      const col = (255 << 24) | (Math.min(255, b) << 16) | (Math.min(255, g) << 8) | Math.min(255, r)
      const x0 = cx - 4
      const y0 = cy - 4
      for (let y = 0; y < 9; y++) {
        const bits = rows[y]
        if (!bits) continue
        const base = (y0 + y) * W + x0
        for (let x = 0; x < 9; x++) if (bits & (1 << x)) px[base + x] = col
      }
    }

    // A scripted twist-and-shake until someone touches it
    let script = 0
    const autoplayStep = (dt) => {
      const st = s.current
      if (!autoplay || motionQuery.matches || st.userTouched || look.current.mode !== 'lights') return
      script += dt / 1000
      const t = script % 15
      const L = st.lights
      const at = (x) => t >= x && t - dt / 1000 < x
      if (t < 2.6) L.value = 0.08 + (0.9 - 0.08) * (t / 2.6)
      if (at(3.2)) { L.colourMode = true; buzz('shake') }
      if (t > 3.6 && t < 7.4) { L.hue = (32 + (t - 3.6) * 70) % 360; L.sat = 0.85 }
      if (at(8)) { L.colourMode = false; buzz('shake') }
      if (t > 8.6 && t < 10) L.value = 0.9 - (t - 8.6) * 0.4
      if (at(11)) { L.on = false; buzz('confirm') }
      if (at(12.4)) { L.on = true; L.sat = 0; L.hue = 32; buzz('confirm') }
      if (t > 12.4) L.value = 0.08
    }

    let raf
    let last = performance.now()
    let lastBuzzSecond = -1
    const frame = (now) => {
      const dt = Math.max(0, Math.min(64, now - last))
      last = now
      const reduce = motionQuery.matches
      autoplayStep(dt)
      const st = s.current
      const { mode: m, pack: pi, palette: pal, effect: fx } = look.current
      const P = PACKS[pi]
      const PAL = PALETTES[pal]

      // Where the picture should end up
      let target = { radius: 0, hue: st.lights.hue, sat: st.lights.sat, dim: 1, wheel: 0 }
      let text = ''
      let ring = -1
      if (m === 'lights') {
        const L = st.lights
        target.radius = L.on ? MIN_R + (MAX_R - MIN_R) * Math.sqrt(L.value) : 0
        target.wheel = L.colourMode ? 1 : 0
      } else if (m === 'timer') {
        const T = st.timer
        let left = T.left
        if (T.running) {
          left = Math.max(0, (T.endsAt - now) / 1000)
          if (left === 0) { T.running = false; T.done = true; T.left = 0 }
        }
        if (T.done) {
          const sec = Math.floor(now / 700)
          if (sec !== lastBuzzSecond) { lastBuzzSecond = sec; buzz('alarm') }
        }
        const frac = T.total ? left / T.total : 0
        target.radius = MIN_R + (MAX_R - MIN_R) * Math.sqrt(Math.max(0.02, frac))
        target.dim = T.done ? (reduce ? 0.6 : 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(now / 110))) : T.running ? 0.42 : reduce ? 0.34 : 0.3 + 0.08 * Math.sin(now / 600)
        target.sat = 0
        text = T.done ? '0:00' : fmt(Math.ceil(left))
        ring = frac
      } else if (m === 'dice') {
        const D = st.dice
        const kind = DICE[D.kind]
        const rolling = D.rollingUntil > now
        target.radius = MIN_R + (MAX_R - MIN_R) * Math.sqrt(rolling && !reduce ? 0.35 + 0.3 * Math.abs(Math.sin(now / 90)) : 0.55)
        target.dim = 0.32
        target.sat = 0
        if (rolling && !reduce) {
          if (now - D.flicker > 75) { D.flicker = now; D.face = 1 + Math.floor(Math.random() * kind.faces) }
          text = kind.text ? kind.text(D.face) : String(D.face)
        } else if (D.result) {
          text = kind.text ? kind.text(D.result) : String(D.result)
        } else {
          text = kind.short
        }
      }

      // Ease toward it, frame-rate independent
      const a = reduce ? 1 : 1 - Math.exp(-dt / 110)
      const sh = st.shown
      sh.radius = ease(sh.radius, target.radius, a)
      sh.hue = easeHue(sh.hue, target.hue, a)
      sh.sat = ease(sh.sat, target.sat, a)
      sh.dim = ease(sh.dim, target.dim, reduce ? 1 : 1 - Math.exp(-dt / 200))
      sh.wheel = ease(sh.wheel, target.wheel, reduce ? 1 : 1 - Math.exp(-dt / 160))

      // Dots already lit keep their place; only new ones sweep in, left to right
      if (text !== st.text.str) {
        const prev = new Map(st.text.dots.map((d) => [`${d.i},${d.j}`, d.born]))
        const dots = text ? layoutText(text) : []
        for (const d of dots) d.born = prev.get(`${d.i},${d.j}`) ?? now + (reduce ? 0 : d.col * 14)
        st.text = { str: text, dots }
      }
      const textCells = new Set(st.text.dots.map((d) => `${d.i},${d.j}`))

      px.fill(0xff120b08)
      const [accR, accG, accB] = PAL.accent
      if (sh.radius < MIN_R * 0.5 && !text) {
        const med = P.medium[5 % P.medium.length]
        sprite(120, 120, med, accR * 0.6 * sh.dim, accG * 0.6 * sh.dim, accB * 0.6 * sh.dim)
      } else if (sh.radius >= MIN_R * 0.5) {
        const white = sh.sat < 0.08
        const [bR, bG, bB] = hsv(white ? PAL.hue : sh.hue, white ? PAL.sat : sh.sat, 1)
        for (const c of CELLS) {
          if (textCells.has(`${c.i},${c.j}`)) continue
          const d = (Math.abs(c.dx) + Math.abs(c.dy)) / sh.radius
          if (d >= 1 - FRAY * c.fray) continue
          const t = d + c.jitter * TIER_JITTER
          const weight = t < HEAVY_UNTIL ? 'heavy' : t < MEDIUM_UNTIL ? 'medium' : 'light'
          let step = 0
          let sparkle = 1
          if (!reduce && fx === 2) {
            const cycle = 2600 + (c.h & 0x7ff)
            step = Math.floor((now + ((c.h >>> 12) % cycle)) / cycle)
          } else if (!reduce && fx === 1 && ((c.h >>> 5) & 0x7) < 3) {
            const period = 1800 + ((c.h >>> 9) & 0x3ff) * 2.35
            const phase = ((c.h >>> 19) & 0xff) / 255
            sparkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (now / period + phase)))
          }
          const list = P[weight]
          const rows = list[(c.pick + step) % list.length]
          const accent = (c.i | c.j) !== 0 && c.accentRoll < ACCENT_CENTRE + (ACCENT_EDGE - ACCENT_CENTRE) * d
          let r, g, b
          if (accent) {
            const v = (0.9 - 0.25 * d) * sh.dim
            r = accR * v; g = accG * v; b = accB * v
            if (sh.wheel > 0.001) {
              const [wr, wg, wb] = hsv(c.angle, 0.8, v * 1.1)
              r += (wr - r) * sh.wheel; g += (wg - g) * sh.wheel; b += (wb - b) * sh.wheel
            }
          } else {
            const v = (1 - 0.3 * d) * sh.dim
            r = bR * v; g = bG * v; b = bB * v
          }
          sprite(120 + c.dx, 120 + c.dy, rows, r * sparkle, g * sparkle, b * sparkle)
        }
      }

      // Text: each dot is one bold sprite, revealed left to right
      if (st.text.dots.length) {
        const bold = boldest(P)
        const [tR, tG, tB] = hsv(PAL.hue, PAL.sat * 0.6, 1)
        for (const d of st.text.dots) {
          if (now < d.born) continue
          sprite(120 + d.i * PITCH, 120 + d.j * PITCH, bold, tR, tG, tB)
        }
      }

      // Progress ring at the rim, clockwise from 12 o'clock
      if (ring >= 0) {
        const n = 60
        for (let k = 0; k < n; k++) {
          const ang = (k / n) * Math.PI * 2 - Math.PI / 2
          const x = Math.round(120 + Math.cos(ang) * 116)
          const y = Math.round(120 + Math.sin(ang) * 116)
          const lit = k / n < ring
          const col = lit ? (255 << 24) | (accB << 16) | (accG << 8) | accR : 0xff2a2a2a
          for (let yy = -1; yy <= 1; yy++) for (let xx = -1; xx <= 1; xx++) px[(y + yy) * W + x + xx] = col
        }
      }

      octx.putImageData(img, 0, 0)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(off, 0, 0, W * UPSCALE, W * UPSCALE)

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [paused, autoplay, buzz])

  return (
    <div className="knob-scene relative mx-auto">
      <div className="knob-body">
        <div
          ref={puckRef}
          tabIndex={0}
          role="slider"
          aria-label="Fidget Knob. Drag around it or scroll to twist, click to tap, press S to shake."
          aria-valuemin={0}
          aria-valuemax={100}
          className="knob-puck relative w-full h-full rounded-full cursor-grab active:cursor-grabbing touch-none select-none outline-none"
        >
          <div className="knob-face absolute rounded-full" />
          <div className="knob-screen absolute rounded-full overflow-hidden">
            <canvas ref={canvasRef} width={W * UPSCALE} height={W * UPSCALE} className="block w-full h-full" />
            <div aria-hidden="true" className="knob-glass absolute inset-0 rounded-full" />
          </div>
        </div>
      </div>
      {hint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="pointer-events-none absolute left-1/2 -bottom-10 -translate-x-1/2 whitespace-nowrap text-sm text-[var(--text-muted)]"
        >
          Drag around it to twist · click to tap
        </motion.p>
      )}
    </div>
  )
}
