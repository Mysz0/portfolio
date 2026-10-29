import { useState, useRef, useEffect, useMemo, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import WindText from './WindText'

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

const tabs = [
  {
    id: 'featured',
    label: 'Featured Builds',
    items: [
      {
        title: 'Urban Radar',
        desc: 'A location game for the streets you already walk. Places around you show up as nodes. Walk within 20 m, claim it on the spot, and come back tomorrow to keep your streak.',
        highlights: [
          'Live map of claimable nodes where the ground you hold turns green',
          'UrbanCard with handle, XP and streak that venues scan for rewards',
          'Daily streaks, with Streak Freeze for the days you miss',
        ],
        tech: ['React', 'Three.js', 'Framer Motion'],
        link: 'https://urabanradar.app',
        year: '2025/26',
      },
      {
        title: 'Digital Sanctuary',
        desc: 'This site. An immersive portfolio exploring atmospheric navigation and GPU-accelerated visuals, built to feel calm rather than loud.',
        highlights: [
          'Hand-written GLSL background that shifts as you scroll',
          'Kanji drawn stroke by stroke from KanjiVG data',
          'Quill cursor trail and wind that kicks up on fast scrolls',
        ],
        tech: ['Vite', 'Three.js', 'GLSL'],
        link: 'https://me.hyruki.cc',
        year: '2026',
      },
      {
        title: 'Peek',
        desc: 'A native macOS app that turns the MacBook notch into a Dynamic Island, so the dead space at the top of the screen becomes something useful.',
        highlights: [
          'Media controls that live in the notch',
          'Calendar at a glance',
          'A file shelf for drag-and-drop between apps',
        ],
        tech: ['Swift', 'SwiftUI', 'AppKit'],
        link: 'https://peek.hyruki.cc',
        year: '2026',
      },
    ],
  },
  {
    id: 'tools',
    label: 'Utilities',
    items: [
      {
        title: 'Developer Core',
        desc: 'Browser utilities where no data leaves your device. Fast, keyboard-first, nothing to sign up for.',
        highlights: [
          'Eleven tools: palettes, passwords, QR, JSON, diff, markdown and more',
          'Describe a vibe and get a matching five-colour palette',
          'Press / anywhere to search',
        ],
        tech: ['React', 'Bun', 'ShadCN'],
        link: 'https://tools.hyruki.cc',
        year: '2026',
      },
      {
        title: 'Stack Config',
        desc: 'Select your technologies, get the commands, ship it. A visual architect for composing a dev stack.',
        highlights: [
          'Runtimes from Node and Bun to Go and Rust',
          'Frontend, styling and backend picks in one pass',
          'Outputs install commands and setup scripts',
        ],
        tech: ['React', 'Bun', 'Tailwind'],
        link: 'https://tech.hyruki.cc',
        year: '2026',
      },
    ],
  },
]

function ProjectRow({ p, idx }) {
  return (
    <div className="group grid md:grid-cols-12 gap-8 items-start border-b border-[var(--border)] pb-12">
      <div className="md:col-span-1">
        <span className="text-[var(--accent)] font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity duration-500">
          0{idx + 1}
        </span>
      </div>
      <div className="md:col-span-7 space-y-6">
        <h3 className="text-3xl sm:text-4xl font-bold text-[var(--text)] transition-colors duration-500 group-hover:text-[var(--accent)]">
          {p.title}
        </h3>
        <p className="text-[var(--text-body)] text-lg leading-relaxed max-w-xl">
          <DemonText text={p.desc} />
        </p>
        <ul className="space-y-2 text-[var(--text-body)] max-w-xl">
          {p.highlights.map((h) => (
            <li key={h} className="flex gap-3">
              <span className="text-[var(--accent)] select-none" aria-hidden="true">・</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          {p.tech.map((t) => (
            <span
              key={t}
              className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-3 py-1 border border-[var(--border)] group-hover:border-[var(--border-hover)] transition-colors duration-500"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="md:col-span-4 md:text-right flex flex-col md:items-end gap-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
          {p.year}
        </span>
        <a
          href={p.link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-flex items-center gap-3 w-fit group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-colors duration-500"
        >
          Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-500" />
        </a>
      </div>
    </div>
  )
}

export default function Projects() {
  const [active, setActive] = useState('featured')
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0]
  return (
    <section id="projects" className="py-24 sm:py-48 max-w-5xl mx-auto px-6 sm:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)] mb-6 breathe-ambient" style={{ animationDelay: '-2s' }}>Works</p>
          <WindText className="text-5xl sm:text-7xl heading-accent mb-8">
            Arrangements
          </WindText>
          <p className="text-[var(--text-body)] text-lg font-light leading-relaxed">
            Each project is a small garden, shaped by constraints,
            defined by what was left out as much as what was put in.
          </p>
        </div>
        <div className="flex gap-8 border-b border-[var(--border)]">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 relative ${active === tab.id ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text-body)]'
                }`}
              whileHover={{ y: -1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {tab.label}
              {active === tab.id && (
                <motion.div
                  layoutId="activeProjTab"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--accent)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="grid gap-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab.items.map((p, idx) => (
            <ProjectRow key={p.title} p={p} idx={idx} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
