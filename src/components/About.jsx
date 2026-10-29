import { useRef, useEffect, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import WindText from './WindText'

/* ── Ink Brush Border ─────────────────────────────────────
   SVG path that draws itself as you scroll into view,
   replacing the static border-l on the quote block.        */

function InkBrushBorder({ scrollYProgress }) {
  const dashOffset = useTransform(scrollYProgress, [0.05, 0.5], [1, 0])

  return (
    <svg
      className="absolute left-0 top-0 w-[2px] h-full"
      preserveAspectRatio="none"
      viewBox="0 0 2 100"
      fill="none"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <motion.path
        d="M 1 2 C 1 20, 0.5 35, 1 50 C 1.5 65, 0.8 80, 1 98"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray={1}
        style={{ strokeDashoffset: dashOffset }}
      />
    </svg>
  )
}

/* ── Breathing Prose ──────────────────────────────────────
   Per-word breathing on the quote text — more subtle than
   the hero subtitle. Uses the same word-breathe CSS class.  */

function BreathingQuote({ text }) {
  const words = useMemo(() => text.split(' '), [text])

  return (
    <span aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="word-breathe"
          style={{
            '--word-duration': `${7 + (i * 1.7) % 5}s`,
            '--word-delay': `${-(i * 0.9 + i * i * 0.15)}s`,
            '--word-base': `${0.62 + (i % 4) * 0.04}`,
            '--word-peak': `${0.88 + (i % 3) * 0.04}`,
            '--word-drift': `${-0.3 - (i % 3) * 0.25}px`,
            marginRight: '0.3em',
          }}
        >
          {word}
        </span>
      ))}
    </span>
  )
}

/* ── Prose Column ─────────────────────────────────────────
   Block-level breathing using breathe-slow keyframe.
   Different delays per column for out-of-phase drift.
   Preserves inline markup (<em>ma</em>) by not splitting.   */

function BreathingColumn({ children, delay = 0 }) {
  return (
    <p
      className="breathe-ambient"
      style={{
        animationDelay: `${delay}s`,
        '--breathe-base-opacity': '0.82',
        '--breathe-peak-opacity': '0.95',
        '--breathe-distance': '-0.5px',
        '--breathe-scale': '1',
      }}
    >
      {children}
    </p>
  )
}

export default function About() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.3'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [40, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      ref={ref}
      id="about"
      className="py-24 sm:py-48 max-w-5xl mx-auto px-6 sm:px-8"
    >
      <motion.div style={{ y, opacity }}>
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)] mb-6 breathe-ambient" style={{ animationDelay: '-1s' }}>Philosophy</p>
          <WindText className="text-5xl sm:text-7xl heading-accent mb-14">
            The Garden
          </WindText>

          <div className="space-y-14">
            {/* Quote with scroll-drawn ink brush border */}
            <div className="relative pl-10">
              <InkBrushBorder scrollYProgress={scrollYProgress} />
              <p className="text-[var(--text-body)] text-xl sm:text-2xl font-light leading-relaxed italic">
                <BreathingQuote text="A zen garden doesn't demand your attention. It earns it through restraint. I build interfaces the same way." />
              </p>
            </div>

            {/* Prose columns with block-level breathing */}
            <div className="grid sm:grid-cols-2 gap-16 text-[var(--text-body)] text-lg leading-relaxed">
              <BreathingColumn delay={-2}>
                There is a Japanese concept called <em>ma</em>, the purposeful void.
                The silence between notes that gives music its shape.
                I pursue that same emptiness in code: removing
                until only the essential remains.
              </BreathingColumn>
              <BreathingColumn delay={-7}>
                Performance is not a metric to me, it is a feeling.
                When an interface responds before you finish thinking,
                when a transition feels like breathing, that is
                the craft I care about.
              </BreathingColumn>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
