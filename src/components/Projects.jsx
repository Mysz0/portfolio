import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import WindText from './WindText'

/* ── Occult character set for demon-scramble ──────────── */
const OCCULT_CHARS = [
  // Elder Futhark runes
  'ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ',
  // Dark kanji
  '亡','魂','鬼','邪','闇','影','夢','幽','冥','呪',
  // Occult symbols
  'ψ','Ω','ξ','ζ','∞','◊','☽',
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
        <span key={wIdx} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
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
          {wIdx < charData.length - 1 && (
            <span style={{ display: 'inline', whiteSpace: 'pre' }}>{' '}</span>
          )}
        </span>
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
        desc: 'A location-based social ecosystem. Built with a custom real-time theme engine that morphs the entire UI between atmospheric states.',
        tech: ['React', 'Three.js', 'Framer Motion'],
        link: 'https://urabanradar.app',
        year: '2025/26',
      },
      {
        title: 'Digital Sanctuary',
        desc: 'An immersive portfolio experience exploring atmospheric navigation and GPU-accelerated visuals.',
        tech: ['Vite', 'Three.js', 'ShaderLab'],
        link: 'https://me.hyruki.cc',
        year: '2026',
      },
      {
        title: 'Peek',
        desc: 'A native macOS app that transforms the MacBook notch into a Dynamic Island with media controls, calendar, and file shelf.',
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
        desc: 'High-performance utilities focused on speed and minimal cognitive load.',
        tech: ['React', 'Bun', 'ShadCN'],
        link: 'https://tools.hyruki.cc',
        year: '2026',
      },
      {
        title: 'Stack Config',
        desc: 'Visual environment architect for composing development stacks and generation scripts.',
        tech: ['React', 'Bun', 'Tailwind'],
        link: 'https://tech.hyruki.cc',
        year: '2026',
      },
    ],
  },
]

function ProjectRow({ p, idx }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 180, damping: 25, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 180, damping: 25, mass: 0.4 })
  const isHovered = useRef(false)
  const rafId = useRef(null)

  // Idle micro-sway — continuous when not hovered
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const phase = idx * 1.8
    function tick(now) {
      rafId.current = requestAnimationFrame(tick)
      if (isHovered.current) return
      const t = now / 1000
      x.set(Math.sin(t * 0.4 + phase) * 3)
      y.set(Math.cos(t * 0.3 + phase) * 1.5)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current) }
  }, [idx, x, y])

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    isHovered.current = true
    const rect = ref.current.getBoundingClientRect()
    const mx = (e.clientX - rect.left) / rect.width - 0.5
    const my = (e.clientY - rect.top) / rect.height - 0.5
    x.set(mx * 8)
    y.set(my * 5)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    isHovered.current = false
  }, [])

  return (
    <motion.div
      ref={ref}
      className="group grid md:grid-cols-12 gap-8 items-start border-b border-[var(--border)] pb-12 cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      <div className="md:col-span-1">
        <span
          className="text-[var(--accent)] font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity duration-500 inline-block breathe-ambient"
          style={{ animationDelay: `${-idx * 3}s` }}
        >
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
        <div className="flex flex-wrap gap-3">
          {p.tech.map((t, tIdx) => (
            <motion.span
              key={t}
              className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-3 py-1 border border-[var(--border)] group-hover:border-[var(--border-hover)] transition-colors duration-500"
              style={{
                animation: 'sway 7s ease-in-out infinite',
                animationDelay: `${-tIdx * 2}s`,
                '--sway-distance': '1px',
                '--sway-rotate': '0deg',
              }}
            >
              {t}
            </motion.span>
          ))}
        </div>
      </div>
      <div className="md:col-span-4 md:text-right flex flex-col md:items-end gap-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
          {p.year}
        </span>
        <motion.a
          href={p.link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-flex items-center gap-3 w-fit group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all duration-500"
          whileHover={{ x: 3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-500" />
        </motion.a>
      </div>
    </motion.div>
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
            Each project is a small garden — shaped by constraints,
            defined by what was left out as much as what was put in.
          </p>
        </div>
        <div className="flex gap-8 border-b border-[var(--border)]">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 relative ${
                active === tab.id ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text-body)]'
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
