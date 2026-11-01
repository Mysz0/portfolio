import { useState, useRef, useEffect, useMemo, Fragment, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import WindText from './WindText'

const CdFlow = lazy(() => import('./CdFlow'))

/* ── Occult character set for demon-scramble ──────────── */
const OCCULT_CHARS = [
  // Elder Futhark runes
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ',
  // Dark kanji
  '亡', '魂', '鬼', '邪', '闇', '影', '夢', '幽', '冥', '呪',
  // Occult symbols
  'ψ', 'Ω', 'ξ', 'ζ', '∞', '◊', '☽',
]

/* ── DemonText V3 — pure CSS transition crossfade ─────────
   Real characters rendered transparent (hold layout, zero reflow).
   Occult chars overlaid via ::before { content: attr(data-occult) }.
   IntersectionObserver adds 'demon-reveal' class → CSS transitions
   stagger left-to-right, crossfading occult→real like wind.
   Module-level Set tracks already-revealed texts so tab switches
   don't replay the animation. */

const revealedTexts = new Set()

function DemonText({ text }) {
  const containerRef = useRef(null)
  const alreadyRevealed = revealedTexts.has(text)

  // Stable computation: assign one occult char per non-space char + stagger delays
  const charData = useMemo(() => {
    let nonSpaceCount = 0
    const words = text.split(' ')
    return words.map((word) =>
      word.split('').map((ch) => ({
        ch,
        occult: OCCULT_CHARS[Math.floor(Math.random() * OCCULT_CHARS.length)],
        delay: nonSpaceCount++ * 30, // 30ms stagger per non-space char
      }))
    )
  }, [text])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Already played once — show revealed instantly, no animation
    if (revealedTexts.has(text)) {
      el.classList.add('demon-reveal')
      return
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          revealedTexts.add(text)
          if (prefersReduced) {
            el.classList.add('demon-reveal')
            return
          }
          // Delay to sync with parent AnimatePresence fade-in
          setTimeout(() => el.classList.add('demon-reveal'), 500)
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [text])

  return (
    <span ref={containerRef} className={`demon-text${alreadyRevealed ? ' demon-reveal' : ''}`}>
      {charData.map((word, wIdx) => (
        <Fragment key={wIdx}>
          <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {word.map((d, cIdx) => (
              <span
                key={cIdx}
                className="demon-char"
                data-occult={d.occult}
                style={alreadyRevealed ? undefined : { '--demon-d': `${d.delay}ms` }}
              >
                {d.ch}
              </span>
            ))}
          </span>
          {wIdx < charData.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  )
}

/* ── The CDs ───────────────────────────────────────────────
   Every project is a CD in a 3D picker (CdFlow). Covers are the
   real app icons and a screenshot of this site; the two web tools
   get covers set in their own sites' type (cdArt.js).         */

const projects = [
  {
    id: 'urban-radar',
    title: 'Urban Radar',
    desc: 'A location game for the streets you already walk. Places around you show up as nodes. Walk within 20 m, claim it on the spot, and come back tomorrow to keep your streak.',
    tracks: [
      'Live map of claimable nodes where the ground you hold turns green',
      'UrbanCard with handle, XP and streak that venues scan for rewards',
      'Daily streaks, with Streak Freeze for the days you miss',
    ],
    tech: ['React', 'Three.js', 'Framer Motion'],
    link: 'https://urbnradar.com',
    year: '2025/26',
    cover: { src: '/library/urban-radar-icon.png', bg: '#0c1310', scale: 0.8 },
    spine: { bg: '#0c1310', ink: '#3fc786' },
    disc: { bg: '#0c1310', ink: '#3fc786', art: 'cover', artScale: 0.3 },
  },
  {
    id: 'peek',
    title: 'Peek',
    desc: 'A native macOS app that turns the MacBook notch into a Dynamic Island, so the dead space at the top of the screen becomes something useful.',
    tracks: [
      'Media controls that live in the notch',
      'Calendar at a glance',
      'A file shelf for drag-and-drop between apps',
    ],
    tech: ['Swift', 'SwiftUI', 'AppKit'],
    link: '/peek',
    year: '2026',
    cover: { src: '/library/peek-icon.png', bg: '#0e0f11', scale: 0.72 },
    spine: { bg: '#0e0f11', ink: '#e8e8ea' },
    disc: { bg: '#d6d7da', ink: '#1a1b1e', art: 'image' },
  },
  {
    id: 'fidget',
    title: 'Fidget Knob',
    desc: 'A desk puck you twist in your hand to dim the lights, skip songs and run timers. Round screen, no touchscreen, open source down to the firmware.',
    tracks: [
      'Gyroscope twist with haptic detents, no moving parts',
      'Nine modes, from IKEA lights to dice, driven by an iPhone app over Bluetooth',
      'Sprite-field renderer that streams the screen in bands over DMA',
    ],
    tech: ['C++', 'ESP32', 'SwiftUI'],
    link: '/fidget',
    year: '2026',
    cover: { src: '/library/fidget-icon.png' },
    spine: { bg: '#1c1b19', ink: '#f2c99a' },
    disc: { bg: '#1c1b19', ink: '#f2c99a', art: 'cover', artScale: 0.24 },
  },
  {
    id: 'sanctuary',
    title: 'Digital Sanctuary',
    desc: 'This site. An immersive portfolio exploring atmospheric navigation and GPU-accelerated visuals, built to feel calm rather than loud.',
    tracks: [
      'Hand-written GLSL background that shifts as you scroll',
      'Kanji drawn stroke by stroke from KanjiVG data',
      'Quill cursor trail and wind that kicks up on fast scrolls',
    ],
    tech: ['Vite', 'Three.js', 'GLSL'],
    link: 'https://hyruki.cc',
    year: '2026',
    cover: { src: '/library/digital-sanctuary.jpg' },
    spine: { bg: '#1d1c1a', ink: '#EDE8DF' },
    disc: { full: 'cover' },
  },
  {
    id: 'developer-core',
    title: 'Developer Core',
    desc: 'Browser utilities where no data leaves your device. Fast, keyboard-first, nothing to sign up for.',
    tracks: [
      'Eleven tools: palettes, passwords, QR, JSON, diff, markdown and more',
      'Describe a vibe and get a matching five-colour palette',
      'Press / anywhere to search',
    ],
    tech: ['React', 'Bun', 'ShadCN'],
    link: 'https://tools.hyruki.cc',
    year: '2026',
    cover: { draw: 'developerCore' },
    spine: { bg: '#000', ink: '#f2f2f2' },
    disc: { bg: '#050505', ink: '#d0d0d0', art: 'cover', artScale: 0.26 },
  },
  {
    id: 'stack-config',
    title: 'Stack Config',
    desc: 'Select your technologies, get the commands, ship it. A visual architect for composing a dev stack.',
    tracks: [
      'Runtimes from Node and Bun to Go and Rust',
      'Frontend, styling and backend picks in one pass',
      'Outputs install commands and setup scripts',
    ],
    tech: ['React', 'Bun', 'Tailwind'],
    link: 'https://tech.hyruki.cc',
    year: '2026',
    cover: { draw: 'stackConfig' },
    spine: { bg: '#0b0c14', ink: '#e4e3ec' },
    disc: { bg: '#0b0c14', ink: '#c9c8d6', art: 'cover', artScale: 0.26 },
  },
]

const ease = [0.22, 1, 0.36, 1]

function Explore({ p }) {
  const external = p.link.startsWith('http')
  return (
    <a
      href={p.link}
      // Own pages (like /peek) open in place; other sites in a new tab
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="btn-secondary group/x inline-flex items-center gap-3 w-fit hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-300"
    >
      Explore <ArrowRight size={14} className="group-hover/x:translate-x-1 transition-transform duration-300" />
    </a>
  )
}

export default function Projects() {
  const [active, setActive] = useState(0)
  const p = projects[active]

  return (
    <section id="projects" className="py-24 sm:py-48 max-w-5xl mx-auto px-6 sm:px-8">
      <div className="max-w-2xl mb-12 sm:mb-16">
        <p className="eyebrow mb-6">Works</p>
        <WindText className="text-5xl sm:text-7xl heading-accent mb-8">
          Arrangements
        </WindText>
        <p className="text-[var(--text-body)] text-lg font-light leading-relaxed">
          Each project is a small garden, shaped by constraints,
          defined by what was left out as much as what was put in.
        </p>
      </div>

      {/* The CDs. Drag, scroll sideways or click one to bring it to the front */}
      <div className="relative h-[260px] sm:h-[420px] lg:h-[480px] -mx-6 sm:-mx-8" aria-hidden="true">
        <Suspense fallback={null}>
          <CdFlow projects={projects} active={active} onPick={setActive} />
        </Suspense>
      </div>

      {/* The same choice, as text */}
      <div
        className="mt-4 flex flex-wrap justify-center gap-x-1 gap-y-1"
        role="tablist"
        aria-label="Projects"
        onKeyDown={(e) => {
          const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
          if (!step) return
          e.preventDefault()
          const next = (active + step + projects.length) % projects.length
          setActive(next)
          e.currentTarget.children[next].focus()
        }}
      >
        {projects.map((q, i) => (
          <button
            key={q.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            aria-controls="project-detail"
            onClick={() => setActive(i)}
            className={`relative rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200 active:scale-[0.97] ${i === active ? 'text-[var(--bg)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          >
            {i === active && <motion.span layoutId="shelf-pick" className="absolute inset-0 rounded-full bg-[var(--text)]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{q.title}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={p.id}
          id="project-detail"
          role="tabpanel"
          className="mt-14 grid md:grid-cols-2 gap-10 md:gap-16 border-t border-[var(--border)] pt-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease }}
        >
          <div className="space-y-6">
            <div className="flex items-baseline justify-between gap-6">
              <h3 className="text-3xl sm:text-4xl font-bold text-[var(--text)]">{p.title}</h3>
              <span className="text-xs font-medium text-[var(--text-muted)] shrink-0">{p.year}</span>
            </div>
            <p className="text-[var(--text-body)] text-lg leading-relaxed">
              <DemonText text={p.desc} />
            </p>
          </div>
          <div className="space-y-7 md:pt-2">
            <ol className="space-y-2.5 text-[var(--text-body)]">
              {p.tracks.map((t, i) => (
                <li key={t} className="grid grid-cols-[2rem_1fr] gap-2">
                  <span className="font-mono text-xs text-[var(--accent)] pt-1.5">{String(i + 1).padStart(2, '0')}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <p className="text-sm text-[var(--text-muted)]">{p.tech.join(' · ')}</p>
              <Explore p={p} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
