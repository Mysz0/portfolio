import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  House, Sparkles, FileText, Play, Pause, SkipBack, SkipForward,
  FileArchive, Image as ImageIcon, Radio, XCircle, ArrowUp,
} from 'lucide-react'

/* ── PeekDemo ───────────────────────────────────────────────
   A web replica of Peek's notch, built from the SwiftUI source
   (NotchView, NowPlayingView, CalendarWidget, CompanionEyesView,
   NotchAssistantWidget): same point sizes, opacities, corner
   radii and spring values. A scripted timeline plays the app's
   real flows on a mock MacBook screen with a moving cursor:
   music peek → compact → open → assistant chat → file shelf.

   Track, calendar and chat content are made up for the demo.  */

// SwiftUI .spring(response:dampingFraction:) → framer-motion physics (mass 1)
const spring = (response, damping) => ({
  type: 'spring',
  stiffness: (2 * Math.PI / response) ** 2,
  damping: (4 * Math.PI * damping) / response,
  mass: 1,
})

// Sizes from NotchViewModel / NotchView
const SCREEN_W = 820
const SCREEN_H = 430
const NOTCH_W = 200
const NOTCH_H = 32
const PANEL_W = 610           // notchWidth * 3.05
const PANEL_H = { home: 220, shelf: 210, ai: 340 }
const ISLAND_W = { idle: NOTCH_W, peek: NOTCH_W + 280, compact: NOTCH_W + 100 }
const PANEL_X = (SCREEN_W - PANEL_W) / 2

const TRACK = { title: 'Rain on Stone', artist: 'Hyruki', duration: 214 }
const QUESTION = "What's on my calendar today?"
const REPLY = 'Two things: design review at 10:00 and the gym at 18:30. Want me to move anything?'

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif'

/* Album art stand-in: a soft gradient, no real cover */
function Art({ size, radius }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        background: 'radial-gradient(circle at 30% 25%, #e8c39a 0%, #b7372e 38%, #3a1f3d 75%, #141022 100%)',
        boxShadow: size > 40 ? '0 3px 6px rgba(0,0,0,0.4)' : 'none',
      }}
    />
  )
}

/* WaveformBars: 4 bars, 2.5pt wide, 3–15pt tall, sin(t*5 + i*1.8) */
function Waveform({ playing }) {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setT(performance.now() / 1000), 120)
    return () => clearInterval(id)
  }, [playing])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, width: 18, height: 16, flexShrink: 0 }}>
      {[0, 1, 2, 3].map((i) => {
        const h = playing ? 3 + (Math.sin(t * 5 + i * 1.8) * 0.5 + 0.5) * 12 : 3
        return (
          <div
            key={i}
            style={{
              width: 2.5, height: h, borderRadius: 1,
              background: `rgba(255,255,255,${playing ? 0.9 : 0.3})`,
              transition: 'height 120ms ease-in-out',
            }}
          />
        )
      })}
    </div>
  )
}

/* CompanionEyesView: two rounded rects that wobble, breathe and blink.
   style: popOut (20pt wide, spacing 8) or hero (36pt, spacing 12, glow) */
const EYE = {
  popOut: { w: 20, gap: 8, h: { idle: 12, listening: 14, thinking: 10, speaking: 13 } },
  hero: { w: 36, gap: 12, h: { idle: 22, listening: 26, thinking: 18, speaking: 24 } },
}
const WOBBLE = { idle: 0.08, listening: 0.34, thinking: 0.28, speaking: 0.4 }
const ALPHA = { idle: 0.78, listening: 0.95, thinking: 0.7, speaking: 0.88 }

function Eyes({ state = 'idle', variant = 'popOut', happy = false }) {
  const refs = [useRef(null), useRef(null)]
  const blink = useRef({ amount: 0, next: performance.now() + 1500 })

  useEffect(() => {
    let id
    const cfg = EYE[variant]
    const tick = (now) => {
      id = requestAnimationFrame(tick)
      const t = now / 1000
      // Blink: quick close and open every few seconds
      const b = blink.current
      if (now > b.next) {
        const k = (now - b.next) / 160
        b.amount = k < 1 ? Math.sin(k * Math.PI) : 0
        if (k >= 1) b.next = now + 2200 + Math.random() * 2600
      }
      const intensity = WOBBLE[state]
      refs.forEach((r, i) => {
        if (!r.current) return
        const phase = t * 4.2 + i * 1.45
        const wobX = Math.sin(phase) * intensity * 0.35
        const wobY = Math.cos(phase * 1.08 + 0.35) * intensity * 0.3
        const breathe = Math.sin(t * 1.6 + i * 0.7) * 0.08
        const blinkScale = Math.max(0.16, 1 - b.amount * 0.86)
        const w = Math.max(3, cfg.w * (1 + wobX + breathe * 0.5))
        let h = Math.max(2, cfg.h[state] * (1 + wobY) * blinkScale)
        if (happy) h = Math.max(3, h * 0.35)  // content squint
        r.current.style.width = `${w}px`
        r.current.style.height = `${h}px`
        r.current.style.borderRadius = `${Math.min(w, h) * 0.5}px`
      })
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [state, variant, happy])

  const cfg = EYE[variant]
  const color = `rgba(255,255,255,${ALPHA[state]})`
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: cfg.gap, height: '100%' }}>
      {refs.map((r, i) => (
        <div
          key={i}
          ref={r}
          style={{
            background: color,
            boxShadow: `0 0 ${variant === 'hero' ? 9 : 5}px rgba(255,255,255,0.24)`,
          }}
        />
      ))}
    </div>
  )
}

function fmt(s) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

/* NowPlayingView (active player) */
function NowPlaying({ playing, elapsed }) {
  const btn = { width: 28, height: 28, display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.82)' }
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 }}>
      <Art size={86} radius={14} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', height: 17, whiteSpace: 'nowrap', overflow: 'hidden' }}>{TRACK.title}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', height: 14, marginTop: 3 }}>{TRACK.artist}</div>
        <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${(elapsed / TRACK.duration) * 100}%`, background: 'rgba(255,255,255,0.51)', borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>
          <span>{fmt(elapsed)}</span><span>{fmt(TRACK.duration)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 6 }}>
          <div style={btn}><SkipBack size={13} fill="currentColor" /></div>
          <div style={btn}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</div>
          <div style={btn}><SkipForward size={13} fill="currentColor" /></div>
        </div>
      </div>
    </div>
  )
}

/* CalendarWidget: month + year, week strip with today in blue, events */
function Calendar() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7))  // Monday
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
  const events = [
    { title: 'Design review', time: '10:00 – 10:45', color: '#5e9eff' },
    { title: 'Gym', time: '18:30 – 19:30', color: '#ff9f43' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{today.toLocaleString('en', { month: 'long' })}</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.32)' }}>{today.getFullYear()}</span>
      </div>
      <div style={{ display: 'flex' }}>
        {days.map((d) => {
          const isToday = d.toDateString() === today.toDateString()
          return (
            <div key={d.toISOString()} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 8, fontWeight: 500, color: isToday ? '#fff' : 'rgba(255,255,255,0.32)' }}>
                {d.toLocaleString('en', { weekday: 'short' }).toUpperCase()}
              </span>
              <span style={{
                width: 24, height: 24, borderRadius: 12, display: 'grid', placeItems: 'center',
                fontSize: 12, fontWeight: isToday ? 700 : 500, color: '#fff',
                background: isToday ? '#0a84ff' : 'transparent',
              }}>{d.getDate()}</span>
            </div>
          )
        })}
      </div>
      <div style={{ height: 0.5, background: 'rgba(255,255,255,0.07)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {events.map((e) => (
          <div key={e.title} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 3, height: 20, borderRadius: 2, background: e.color }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{e.title}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.32)' }}>{e.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FileThumb({ kind }) {
  const Icon = kind === 'img' ? ImageIcon : FileArchive
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={spring(0.35, 0.65)}
      style={{ width: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)' }}>
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>{kind === 'img' ? 'moodboard.png' : 'brief.zip'}</span>
    </motion.div>
  )
}

/* NotchAssistantWidget */
function Assistant({ typed, sent, thinking, reply }) {
  const status = thinking ? 'Thinking…' : reply && reply.length < REPLY.length ? 'Writing…' : 'Ready'
  const eyesState = thinking ? 'thinking' : reply && reply.length < REPLY.length ? 'speaking' : 'idle'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%', padding: '4px 14px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 110, height: 50 }}><Eyes state={eyesState} variant="hero" /></div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>Assistant</div>
          <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.4)' }}>{status}</div>
        </div>
      </div>
      <div style={{
        flex: 1, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)',
        padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden',
      }}>
        {!sent && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', paddingTop: 4 }}>Ask anything, or type /help for local commands.</div>}
        {sent && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring(0.3, 0.8)} style={{ alignSelf: 'flex-end', ...bubble(true) }}>
            <div style={label(true)}>You</div>{QUESTION}
          </motion.div>
        )}
        {reply && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring(0.3, 0.8)} style={{ alignSelf: 'flex-start', ...bubble(false) }}>
            <div style={label(false)}>Peek</div>{reply}
          </motion.div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, paddingBottom: 12 }}>
        <div style={{
          flex: 1, fontSize: 11, color: typed ? '#fff' : 'rgba(255,255,255,0.35)', padding: '7px 10px', borderRadius: 9,
          background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap', overflow: 'hidden',
        }}>
          {typed || 'Message…'}
          {typed && !sent && <span className="peek-caret">|</span>}
        </div>
        <div style={{ width: 28, height: 28, borderRadius: 14, display: 'grid', placeItems: 'center', background: typed && !sent ? '#0a84ff' : 'rgba(255,255,255,0.1)', color: '#fff', transition: 'background 160ms ease' }}>
          <ArrowUp size={13} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}

const bubble = (user) => ({
  maxWidth: '82%', fontSize: 11, lineHeight: 1.4, color: 'rgba(255,255,255,0.9)', padding: '7px 10px', borderRadius: 9,
  background: user ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.06)',
})
const label = (user) => ({ fontSize: 8.5, fontWeight: 600, marginBottom: 3, color: user ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.38)' })

/* macOS pointer */
function Cursor({ x, y, grab }) {
  return (
    <motion.div
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }}
      style={{ position: 'absolute', left: 0, top: 0, zIndex: 30, pointerEvents: 'none' }}
    >
      <motion.svg width="18" height="24" viewBox="0 0 18 24" animate={{ scale: grab ? 0.85 : 1 }} style={{ filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.5))' }}>
        <path d="M1.5 1.5 L1.5 19.5 L6 15.3 L9 22 L12 20.7 L9.1 14.2 L15 14.2 Z" fill="#000" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
      </motion.svg>
    </motion.div>
  )
}

/* ── Timeline ────────────────────────────────────────────── */

const REST = { x: 610, y: 300 }
const NOTCH_HOVER = { x: SCREEN_W / 2 + 30, y: 14 }
const AI_TAB = { x: PANEL_X + 12 + 4 + 28 + 6 + 10, y: 21 }
const HOME_TAB = { x: PANEL_X + 12 + 4 + 10, y: 21 }

export const CHAPTERS = [
  { id: 'music', label: 'Music' },
  { id: 'open', label: 'Open' },
  { id: 'assistant', label: 'Assistant' },
  { id: 'shelf', label: 'File shelf' },
]

const initial = {
  island: 'idle', expanded: false, tab: 'home', playing: false,
  dragHover: false, files: 0, fileFly: null,
  typed: '', sent: false, thinking: false, reply: '',
  cursor: REST, grab: false,
}

/* start: { id, n } — a chapter to jump to (n bumps on every click so the
   same chapter can be replayed). onChapter reports what is playing. */
export default function PeekDemo({ start, onChapter, paused }) {
  const [s, setS] = useState(initial)
  const [elapsed, setElapsed] = useState(48)
  const timers = useRef([])
  const set = useCallback((patch) => setS((p) => ({ ...p, ...patch })), [])

  // Track progress ticks while playing
  useEffect(() => {
    if (!s.playing || paused) return
    const id = setInterval(() => setElapsed((e) => (e + 1) % TRACK.duration), 1000)
    return () => clearInterval(id)
  }, [s.playing, paused])

  const run = useCallback((startAt) => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    let t = 0
    const at = (ms, fn) => { t += ms; timers.current.push(setTimeout(fn, t)) }
    const type = (text, every, key) => {
      for (let i = 1; i <= text.length; i++) at(every, () => set({ [key]: text.slice(0, i) }))
    }

    const chapters = {
      music: () => {
        at(0, () => onChapter?.('music'))
        at(0, () => setS({ ...initial }))
        at(900, () => set({ playing: true, island: 'peek' }))      // track starts → peek
        at(3500, () => set({ island: 'compact' }))                  // peekTimer 3.5s → compact
      },
      open: () => {
        at(0, () => onChapter?.('open'))
        at(700, () => set({ cursor: NOTCH_HOVER, playing: true, island: 'compact' }))
        at(650, () => set({ expanded: true, tab: 'home' }))       // hover → expand
        at(3800, () => {})
      },
      assistant: () => {
        at(0, () => onChapter?.('assistant'))
        at(300, () => set({ expanded: true, playing: true, island: 'compact', cursor: AI_TAB }))
        at(700, () => set({ tab: 'ai', typed: '', sent: false, thinking: false, reply: '' }))
        at(700, () => {})
        type(QUESTION, 45, 'typed')
        at(350, () => set({ sent: true, typed: '', thinking: true }))
        at(1400, () => set({ thinking: false }))
        type(REPLY, 22, 'reply')
        at(2600, () => set({ cursor: HOME_TAB }))
        at(600, () => set({ tab: 'home' }))
        at(900, () => set({ cursor: REST }))
        at(500, () => set({ expanded: false }))                    // mouse leaves → collapse
        at(1200, () => {})
      },
      shelf: () => {
        at(0, () => onChapter?.('shelf'))
        at(200, () => set({ expanded: false, files: 0, cursor: { x: 690, y: 330 }, fileFly: { x: 676, y: 300 } }))
        at(800, () => set({ grab: true }))
        at(250, () => set({ cursor: { x: SCREEN_W / 2 + 6, y: 40 }, fileFly: { x: SCREEN_W / 2 - 10, y: 12 }, dragHover: true }))
        at(900, () => set({ expanded: true, tab: 'shelf' }))       // drag over notch → panel with drop zone
        at(1100, () => set({ grab: false, fileFly: null, dragHover: false, files: 1 }))
        at(600, () => set({ files: 2 }))
        at(2600, () => set({ cursor: REST }))
        at(500, () => set({ expanded: false }))
        at(1400, () => {})
      },
    }

    const order = CHAPTERS.map((c) => c.id)
    let i = Math.max(0, order.indexOf(startAt))
    // Play from the chosen chapter to the end, then loop from the start
    for (let k = 0; k < order.length; k++) chapters[order[(i + k) % order.length]]()
    at(400, () => run(order[0]))
  }, [set, onChapter])

  useEffect(() => {
    if (paused) {
      timers.current.forEach(clearTimeout)
      timers.current = []
      return
    }
    run(start?.id || 'music')
    return () => timers.current.forEach(clearTimeout)
  }, [start, paused, run])

  const islandW = ISLAND_W[s.island]
  const panelH = PANEL_H[s.tab === 'ai' ? 'ai' : s.tab === 'shelf' ? 'shelf' : 'home']
  const wing = (islandW - NOTCH_W) / 2

  return (
    <div
      style={{
        width: SCREEN_W, height: SCREEN_H, position: 'relative', overflow: 'hidden', fontFamily: SF,
        borderRadius: '18px 18px 0 0', userSelect: 'none',
        background: 'radial-gradient(120% 90% at 70% 100%, #3b2a4a 0%, #1d1a2b 40%, #0c0c12 100%)',
      }}
    >
      {/* Wallpaper glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 50% at 25% 85%, rgba(183,55,46,0.35), transparent 70%)' }} />

      {/* Menu bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: NOTCH_H, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: 12, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontWeight: 700 }}>Finder</span><span>File</span><span>Edit</span><span>View</span>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Radio size={12} /><span>{new Date().toLocaleString('en', { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        </div>
      </div>

      {/* Collapsed island */}
      <motion.div
        animate={{
          width: islandW,
          opacity: s.expanded ? 0 : 1,
          scale: s.expanded ? 0.8 : 1,
          borderBottomLeftRadius: s.island === 'idle' ? 8 : 12,
          borderBottomRightRadius: s.island === 'idle' ? 8 : 12,
        }}
        transition={{ ...spring(0.3, 0.7), opacity: { duration: 0.2 } }}
        style={{ position: 'absolute', top: 0, left: '50%', x: '-50%', height: NOTCH_H, background: '#000', transformOrigin: 'top center', overflow: 'hidden', zIndex: 10 }}
      >
        <AnimatePresence mode="wait">
          {s.island === 'peek' && (
            <motion.div key="peek" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={spring(0.3, 0.7)} style={{ display: 'flex', height: '100%' }}>
              <div style={{ width: wing, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 7 }}>
                <Art size={NOTCH_H - 10} radius={6} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{TRACK.artist}</span>
              </div>
              <div style={{ width: NOTCH_W }} />
              <div style={{ width: wing, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingRight: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>{TRACK.title}</span>
                <Waveform playing={s.playing} />
              </div>
            </motion.div>
          )}
          {s.island === 'compact' && (
            <motion.div key="compact" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={spring(0.3, 0.7)} style={{ display: 'flex', height: '100%' }}>
              <div style={{ width: wing, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 5 }}>
                <Art size={NOTCH_H - 10} radius={6} />
              </div>
              <div style={{ width: NOTCH_W }} />
              <div style={{ width: wing, display: 'flex', alignItems: 'center', paddingLeft: 5 }}>
                <Waveform playing={s.playing} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* "Drop here" capsule under the island while dragging */}
      <AnimatePresence>
        {s.dragHover && !s.expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={spring(0.3, 0.75)}
            style={{ position: 'absolute', top: NOTCH_H + 2, left: '50%', x: '-50%', zIndex: 9, display: 'flex', gap: 6, alignItems: 'center', padding: '5px 12px', borderRadius: 999, background: '#000', fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}
          >
            <FileText size={10} /> Drop here
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded panel: morphs from the island (scaleX island→1, scaleY 0.001→1) */}
      <motion.div
        initial={false}
        animate={{
          scaleX: s.expanded ? 1 : islandW / PANEL_W,
          scaleY: s.expanded ? 1 : 0.001,
          opacity: s.expanded ? 1 : 0,
          height: panelH,
        }}
        transition={{ ...spring(0.4, 0.72), height: spring(0.3, 0.75), opacity: { duration: s.expanded ? 0.15 : 0.25 } }}
        style={{
          position: 'absolute', top: 0, left: PANEL_X, width: PANEL_W, zIndex: 11, background: '#000',
          borderRadius: '0 0 20px 20px', transformOrigin: 'top center', overflow: 'hidden',
        }}
      >
        {/* Tab bar */}
        <div style={{ position: 'absolute', top: 9, left: 12, display: 'flex', gap: 6, padding: '3px 4px', borderRadius: 999, background: 'rgba(255,255,255,0.06)' }}>
          {[['home', House], ['ai', Sparkles], ['shelf', FileText]].map(([id, Icon]) => {
            const active = s.tab === id
            const disabled = id === 'shelf' && s.files === 0 && s.tab !== 'shelf'
            return (
              <div key={id} style={{ width: 28, height: 22, borderRadius: 6, display: 'grid', placeItems: 'center', background: active ? 'rgba(255,255,255,0.18)' : 'transparent', color: disabled ? 'rgba(255,255,255,0.2)' : active ? '#fff' : 'rgba(255,255,255,0.55)', transition: 'background 200ms ease, color 200ms ease' }}>
                <Icon size={12} strokeWidth={active ? 2.4 : 1.8} />
              </div>
            )
          })}
        </div>

        {/* Companion eyes, top right */}
        {s.tab !== 'ai' && (
          <div style={{ position: 'absolute', top: 10, right: 10, width: 116, height: 46 }}>
            <Eyes state={s.dragHover ? 'listening' : 'idle'} happy={s.files > 0 && s.tab === 'shelf'} />
          </div>
        )}

        <div style={{ position: 'absolute', top: NOTCH_H + 6, left: 0, right: 0, bottom: 0 }}>
          <AnimatePresence mode="wait">
            {s.tab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={spring(0.3, 0.75)} style={{ display: 'flex', height: '100%', paddingBottom: 12, alignItems: 'center' }}>
                <div style={{ flex: 1, padding: '0 10px 0 14px', minWidth: 0 }}><NowPlaying playing={s.playing} elapsed={elapsed} /></div>
                <div style={{ width: 1, alignSelf: 'stretch', margin: '10px 0', background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ width: 190, padding: '0 12px 0 10px' }}><Calendar /></div>
              </motion.div>
            )}
            {s.tab === 'ai' && (
              <motion.div key="ai" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={spring(0.3, 0.75)} style={{ height: '100%' }}>
                <Assistant typed={s.typed} sent={s.sent} thinking={s.thinking} reply={s.reply} />
              </motion.div>
            )}
            {s.tab === 'shelf' && (
              <motion.div key="shelf" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={spring(0.3, 0.75)} style={{ display: 'flex', height: '100%', paddingBottom: 12, gap: 12, alignItems: 'center' }}>
                {s.files === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)' }}>
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}><FileText size={24} /></motion.div>
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>Drop files here</span>
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1, display: 'flex', gap: 8, paddingLeft: 14 }}>
                      <FileThumb kind="img" />
                      {s.files > 1 && <FileThumb kind="zip" />}
                    </div>
                    <div style={{ width: 1, alignSelf: 'stretch', margin: '4px 0', background: 'rgba(255,255,255,0.08)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingRight: 12 }}>
                      <div style={{ width: 60, height: 50, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Radio size={18} color="#0a84ff" />
                        <span style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>AirDrop</span>
                      </div>
                      <XCircle size={14} color="rgba(255,255,255,0.3)" />
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* File being dragged across the desktop */}
      <AnimatePresence>
        {s.fileFly && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: s.fileFly.x, y: s.fileFly.y }}
            animate={{ opacity: 1, scale: s.dragHover ? 0.7 : 1, x: s.fileFly.x, y: s.fileFly.y }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }}
            style={{ position: 'absolute', left: 0, top: 0, zIndex: 25, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.9)', display: 'grid', placeItems: 'center', color: '#444', boxShadow: '0 6px 16px rgba(0,0,0,0.4)' }}>
              <ImageIcon size={20} />
            </div>
            <span style={{ fontSize: 10, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>moodboard.png</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dock hint */}
      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, padding: 6, borderRadius: 16, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.15)' }}>
        {['#4fa3ff', '#ff6b5e', '#ffd166', '#7ad37a', '#c58cff', '#5e5e66'].map((c) => (
          <div key={c} style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(160deg, ${c}, ${c}99)` }} />
        ))}
      </div>

      <Cursor x={s.cursor.x} y={s.cursor.y} grab={s.grab} />
    </div>
  )
}
