import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Github, Copy, Check, Music, CalendarDays, FolderDown, Hand, Sparkles, Bluetooth } from 'lucide-react'
import PeekDemo, { CHAPTERS } from './PeekDemo'

/* ── Peek page (hyruki.cc/peek) ─────────────────────────────
   Download page for Peek. The centrepiece is PeekDemo, a live
   replica of the app's notch playing its real flows. Same palette,
   type and buttons as the main site.                          */

const REPO = 'https://github.com/Mysz0/peek'
const DOWNLOAD = `${REPO}/releases/latest/download/Peek.zip`
const UNQUARANTINE = 'xattr -dr com.apple.quarantine /Applications/Peek.app'

const features = [
  { icon: Music, title: 'Now playing', chapter: 'music', desc: 'Artwork, controls and a live waveform. Works with any app that plays audio, or connects straight to Spotify or Apple Music.' },
  { icon: CalendarDays, title: 'Calendar', chapter: 'open', desc: 'Upcoming events from the calendars you pick, a hover away.' },
  { icon: FolderDown, title: 'File shelf', chapter: 'shelf', desc: 'Drop files on the notch to keep them handy, then drag them out again or AirDrop them.' },
  { icon: Sparkles, title: 'Assistant', chapter: 'assistant', desc: 'Optional. Chat from the notch with push-to-talk, using a small model on your Mac or any OpenAI-compatible provider.' },
  { icon: Hand, title: 'Gestures', desc: 'Click the notch to open it. Swipe left or right to skip tracks, up or down to open or close.' },
  { icon: Bluetooth, title: 'Vessel', desc: 'Experimental. A Bluetooth desk companion the assistant can travel to, with a simulation mode to try it without hardware.' },
]

const ease = [0.22, 1, 0.36, 1]
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease },
})

/* The "ee" in Peek, drawn as the app's two eye pills: they blink,
   glance toward the cursor and squint happily when `happy` is set */
function TitleEyes({ happy }) {
  const wrap = useRef(null)
  const eyes = useRef(null)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    let timer
    const loop = () => {
      timer = setTimeout(() => {
        setBlink(true)
        setTimeout(() => setBlink(false), 140)
        loop()
      }, 2400 + Math.random() * 2600)
    }
    loop()
    const onMove = (e) => {
      if (!wrap.current || !eyes.current) return
      const r = wrap.current.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight
      eyes.current.style.transform = `translate(${(dx * 14).toFixed(1)}px, ${(dy * 8).toFixed(1)}px)`
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => { clearTimeout(timer); window.removeEventListener('mousemove', onMove) }
  }, [])

  const h = happy ? '0.07em' : blink ? '0.03em' : '0.19em'
  return (
    <span ref={wrap} className="inline-flex items-center justify-center align-middle" style={{ width: '0.95em', height: '0.6em', margin: '0 0.04em' }} aria-hidden="true">
      <span ref={eyes} className="inline-flex items-center gap-[0.11em]" style={{ transition: 'transform 300ms cubic-bezier(0.23,1,0.32,1)' }}>
        {[0, 1].map((i) => (
          <span
            key={i}
            style={{
              display: 'block', width: '0.27em', height: h, borderRadius: '0.12em',
              background: 'var(--text)', boxShadow: '0 0 0.12em rgba(237,232,223,0.35)',
              transform: happy ? 'translateY(-0.02em)' : 'none',
              transition: 'height 120ms ease-out, transform 200ms ease-out',
            }}
          />
        ))}
      </span>
    </span>
  )
}

/* Scales the fixed-size 820px demo down to fit narrow screens */
function FitToWidth({ width, height, children }) {
  const ref = useRef(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])
  return (
    <div ref={ref} style={{ width: '100%', maxWidth: width, height: height * scale, margin: '0 auto' }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  )
}

function CopyCommand() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(UNQUARANTINE)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be blocked; the command is still selectable
    }
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] pl-4 pr-2 py-2 font-mono text-[13px] text-[var(--text-body)]">
      <code className="flex-1 overflow-x-auto whitespace-nowrap py-1">{UNQUARANTINE}</code>
      <button type="button" onClick={copy} className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200" aria-label={copied ? 'Copied' : 'Copy command'}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  )
}

export default function PeekPage() {
  const [start, setStart] = useState({ id: 'music', n: 0 })
  const [current, setCurrent] = useState('music')
  const [paused, setPaused] = useState(false)
  const [happy, setHappy] = useState(false)
  const demoRef = useRef(null)

  // Only animate the demo while it's on screen
  useEffect(() => {
    const el = demoRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const jump = useCallback((id, scroll = false) => {
    setStart((s) => ({ id, n: s.n + 1 }))
    if (scroll) demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  return (
    <div className="min-h-screen text-[var(--text)] overflow-x-hidden selection:bg-[var(--accent)] selection:text-white" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <nav className="max-w-5xl mx-auto px-6 sm:px-8 pt-8 flex items-center justify-between text-sm">
        <a href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200">
          <ArrowLeft size={15} /> Hyruki
        </a>
        <a href={REPO} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200">
          <Github size={15} /> Source
        </a>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Hero */}
        <header className="pt-16 sm:pt-20 pb-14 text-center flex flex-col items-center">
          <motion.p {...rise(0)} className="eyebrow mb-5"><span lang="ja">覗</span>macOS app</motion.p>
          <motion.h1 {...rise(0.06)} className="heading-accent text-8xl sm:text-9xl mb-6 leading-none" aria-label="Peek">
            P<TitleEyes happy={happy} />k
          </motion.h1>
          <motion.p {...rise(0.12)} className="text-lg sm:text-xl text-[var(--text-body)] font-light leading-relaxed max-w-md mb-10">
            Your MacBook notch, but alive. Music, calendar, a file shelf and an assistant, right where your eyes already are.
          </motion.p>
          <motion.div {...rise(0.18)} className="flex flex-wrap items-center justify-center gap-4">
            <a href={DOWNLOAD} className="btn-primary" onMouseEnter={() => setHappy(true)} onMouseLeave={() => setHappy(false)} onFocus={() => setHappy(true)} onBlur={() => setHappy(false)}>
              <span className="inline-flex items-center gap-2"><Download size={16} /> Download</span>
            </a>
            <a href={REPO} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <Github size={16} /> GitHub
            </a>
          </motion.div>
          <motion.p {...rise(0.24)} className="mt-6 text-sm text-[var(--text-muted)]">
            Free · macOS 13 or later · MacBooks with a notch · Apple Silicon and Intel
          </motion.p>
        </header>

        {/* Live demo */}
        <motion.section {...rise(0.3)} className="relative pb-20">
          {/* Glow behind the screen */}
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 w-[90%] h-[70%] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(183,55,46,0.22), rgba(94,158,255,0.06) 60%, transparent)', filter: 'blur(30px)' }} />
          <div ref={demoRef} className="relative">
            <FitToWidth width={844} height={466}>
              {/* Laptop lid: bezel around the screen, hinge below */}
              <div style={{ width: 844, padding: '12px 12px 0', borderRadius: '24px 24px 0 0', background: '#0b0b0d', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px -20px rgba(0,0,0,0.7)' }}>
                <PeekDemo start={start} onChapter={setCurrent} paused={paused} />
              </div>
              <div style={{ width: 900, height: 14, marginLeft: -28, borderRadius: '0 0 12px 12px', background: 'linear-gradient(#2a2a2e, #141416)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
            </FitToWidth>
          </div>

          {/* Chapter chips */}
          <div className="mt-10 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Demo scenes">
            {CHAPTERS.map((c) => {
              const active = current === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => jump(c.id)}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 active:scale-[0.97] ${active ? 'text-[var(--bg)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                  style={{ transition: 'color 200ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)' }}
                >
                  {active && <motion.span layoutId="peek-chip" className="absolute inset-0 rounded-full bg-[var(--text)]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                  <span className="relative">{c.label}</span>
                </button>
              )
            })}
          </div>
        </motion.section>

        {/* Features */}
        <section className="py-16 border-t border-[var(--border)]">
          <p className="eyebrow mb-10"><span lang="ja">作</span>What it does</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon
              const Tag = f.chapter ? 'button' : 'div'
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease }}
                >
                  <Tag
                    type={f.chapter ? 'button' : undefined}
                    onClick={f.chapter ? () => jump(f.chapter, true) : undefined}
                    className={`peek-card group w-full h-full text-left rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 ${f.chapter ? 'cursor-pointer' : ''}`}
                  >
                    <div className="mb-4 inline-grid place-items-center w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Icon size={18} />
                    </div>
                    <h2 className="text-lg font-semibold text-[var(--text)] mb-2">{f.title}</h2>
                    <p className="text-[var(--text-body)] leading-relaxed text-[15px]">{f.desc}</p>
                    {f.chapter && <span className="mt-4 inline-block text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors duration-200">See it ↑</span>}
                  </Tag>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Install */}
        <section className="py-16 border-t border-[var(--border)]">
          <p className="eyebrow mb-10"><span lang="ja">鍵</span>Install</p>
          <ol className="space-y-5 text-[var(--text-body)] leading-relaxed max-w-2xl">
            <li className="flex gap-4"><span className="font-mono text-[var(--accent)]">1</span><span>Download <a href={DOWNLOAD} className="text-[var(--text)] underline underline-offset-4 decoration-[var(--border-hover)] hover:decoration-[var(--text)]">Peek.zip</a> and unzip it.</span></li>
            <li className="flex gap-4"><span className="font-mono text-[var(--accent)]">2</span><span>Move <strong className="font-semibold text-[var(--text)]">Peek.app</strong> to your Applications folder and open it.</span></li>
            <li className="flex gap-4"><span className="font-mono text-[var(--accent)]">3</span><span>
              Peek isn't notarized by Apple yet, so macOS blocks the first launch. Open <strong className="font-semibold text-[var(--text)]">System Settings → Privacy &amp; Security</strong>, scroll down and click <strong className="font-semibold text-[var(--text)]">Open Anyway</strong>. Or run this once in Terminal:
            </span></li>
          </ol>
          <div className="mt-6 max-w-2xl sm:pl-8"><CopyCommand /></div>
          <p className="mt-8 max-w-2xl text-sm text-[var(--text-muted)] leading-relaxed">
            Peek asks for calendar access, automation access (to read what Spotify or Music is playing) and microphone access (only for push-to-talk). Each one is optional.
          </p>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-6 sm:px-8 py-16 border-t border-[var(--border)] flex flex-wrap gap-4 justify-between text-sm text-[var(--text-muted)]">
        <a href="/" className="hover:text-[var(--text)] transition-colors duration-200">hyruki.cc</a>
        <a href={`${REPO}/releases`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors duration-200">All releases</a>
      </footer>
    </div>
  )
}
