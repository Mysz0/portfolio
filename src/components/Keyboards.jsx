import { useRef, useCallback, useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import WindText from './WindText'

/* ── JIS keyboard → hiragana mapping ──────────────────── */
const JIS_HIRAGANA = {
  '1': 'ぬ', '2': 'ふ', '3': 'あ', '4': 'う', '5': 'え',
  '6': 'お', '7': 'や', '8': 'ゆ', '9': 'よ', '0': 'わ',
  '-': 'ほ', '=': 'へ',
  'q': 'た', 'w': 'て', 'e': 'い', 'r': 'す', 't': 'か',
  'y': 'ん', 'u': 'な', 'i': 'に', 'o': 'ら', 'p': 'せ',
  'a': 'ち', 's': 'と', 'd': 'し', 'f': 'は', 'g': 'き',
  'h': 'く', 'j': 'ま', 'k': 'の', 'l': 'り', ';': 'れ',
  'z': 'つ', 'x': 'さ', 'c': 'そ', 'v': 'ひ', 'b': 'こ',
  'n': 'み', 'm': 'も', ',': 'ね', '.': 'る', '/': 'め',
}

const ALL_HIRAGANA = Object.values(JIS_HIRAGANA)

const keyboards = [
  {
    title: 'Zoom65 v2',
    desc: 'Custom linear build with a focus on acoustic precision and fluid response.',
    specs: ['Akko V3 Pro Yellow', 'Durock V2', 'Kanagawa PBT'],
    year: '2026',
  },
  {
    title: 'Magnum65',
    desc: 'Gasket-mounted industrial cornerstone with ultra-smooth transitions.',
    specs: ['Gateron Smoothie', 'Typeplus', 'PBTfans Origami'],
    year: '2025',
  },
  {
    title: 'Dusk67',
    desc: 'Organic wooden enclosure with boutique tactile feedback.',
    specs: ['Napworks Tactile', 'YIKB Stabs', 'PBTfans Classic'],
    year: '2025',
  },
]

/* Spring-physics tilt card — organic motion with mass and damping */
function TiltCard({ children, className, delay = 0 }) {
  const ref = useRef(null)
  const isHovered = useRef(false)
  const rafId = useRef(null)

  // Spring-driven rotation for organic feel
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20, mass: 0.5 })
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20, mass: 0.5 })
  const springY = useSpring(0, { stiffness: 200, damping: 25 })

  // Leaf-on-water idle float — gentle bob + rotation when not hovered
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const phase = delay * 2.1
    function tick(now) {
      rafId.current = requestAnimationFrame(tick)
      if (isHovered.current) return
      const t = now / 1000
      springY.set(Math.sin(t * 0.3 + phase) * 3.5)
      rotateY.set(Math.sin(t * 0.15 + phase) * 1.5)
      rotateX.set(Math.cos(t * 0.2 + phase) * 1)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current) }
  }, [delay, rotateX, rotateY, springY])

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    isHovered.current = true
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(x * 8)
    rotateX.set(-y * 8)
    springY.set(-3)
  }, [rotateX, rotateY, springY])

  const handleMouseLeave = useCallback(() => {
    isHovered.current = false
  }, [])

  return (
    <motion.article
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 600,
        rotateX: springRotateX,
        rotateY: springRotateY,
        y: springY,
      }}
    >
      {children}
    </motion.article>
  )
}

export default function Keyboards() {
  const sectionRef = useRef(null)
  const poolRef = useRef(null)
  const isVisible = useRef(false)
  const lastKeyTime = useRef(0)
  const [hasKeyboard, setHasKeyboard] = useState(false)

  // Detect keyboard-capable device (hover + fine pointer = desktop/laptop)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setHasKeyboard(mq.matches)
    const onChange = (e) => setHasKeyboard(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  /* ── Spawn a single hiragana ripple into the pool ──── */
  const spawnChar = useCallback((char) => {
    if (!poolRef.current) return
    if (poolRef.current.children.length >= 25) {
      poolRef.current.firstChild?.remove()
    }
    const el = document.createElement('span')
    el.textContent = char
    el.className = 'hiragana-ripple'
    el.style.left = `${8 + Math.random() * 84}%`
    el.style.top = `${5 + Math.random() * 90}%`
    el.style.animationDuration = `${2.5 + Math.random() * 1.5}s`
    poolRef.current.appendChild(el)
    el.addEventListener('animationend', () => el.remove())
  }, [])

  /* ── Hiragana keystroke ripples + ambient auto-spawn ── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => { isVisible.current = entry.isIntersecting },
      { threshold: 0.25 },
    )
    observer.observe(section)

    // Keyboard listener — spawn on keypress
    function onKeyDown(e) {
      if (!isVisible.current) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const key = e.key.toLowerCase()
      const char = JIS_HIRAGANA[key]
      if (!char) return
      lastKeyTime.current = Date.now()
      spawnChar(char)
    }

    // Ambient auto-spawn — random hiragana when user isn't typing
    const autoInterval = setInterval(() => {
      if (!isVisible.current) return
      // Don't auto-spawn if user typed within last 2s
      if (Date.now() - lastKeyTime.current < 2000) return
      const char = ALL_HIRAGANA[Math.floor(Math.random() * ALL_HIRAGANA.length)]
      spawnChar(char)
    }, 2500)

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      observer.disconnect()
      clearInterval(autoInterval)
    }
  }, [spawnChar])

  return (
    <section ref={sectionRef} id="keyboards" className="relative py-24 sm:py-48 max-w-5xl mx-auto px-6 sm:px-8">
      {/* Hiragana keystroke pool — ink-in-water dissolve overlay */}
      <div ref={poolRef} className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true" />

      <div className="max-w-2xl mb-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)] mb-6 breathe-ambient" style={{ animationDelay: '-3s' }}>Touch</p>
        <WindText className="text-5xl sm:text-7xl heading-accent mb-8">
          Instruments
        </WindText>
        <p className="text-[var(--text-body)] text-lg font-light leading-relaxed">
          The keyboard is where thought meets matter.
          Each build is a study in sound, weight, and feel.
        </p>
      </div>

      <div className="grid gap-1 lg:grid-cols-3 border-t border-[var(--border)]">
        {keyboards.map((kb, idx) => (
          <motion.div
            key={kb.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: idx * 0.1 }}
          >
            <TiltCard
              className="group p-10 flex flex-col border-b lg:border-b-0 lg:border-r border-[var(--border)] last:border-r-0 hover:bg-[var(--accent-soft)] transition-colors duration-700 h-full cursor-default"
              delay={idx}
            >
              <div className="flex justify-between items-start mb-12">
                <span
                  className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors duration-500 breathe-ambient"
                  style={{ animationDelay: `${-idx * 2.5}s` }}
                >
                  Build {kb.year}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[var(--text)] mb-4 group-hover:translate-x-1 transition-transform duration-500">{kb.title}</h3>
              <p className="text-[var(--text-body)] mb-12 text-base leading-relaxed italic">
                {kb.desc}
              </p>

              <div className="mt-auto space-y-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] opacity-40 group-hover:opacity-100 transition-opacity duration-500">Configuration</div>
                <div className="flex flex-wrap gap-2">
                  {kb.specs.map((spec, specIdx) => (
                    <motion.span
                      key={spec}
                      className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-2 py-1 border border-[var(--border)] group-hover:border-[var(--border-hover)] transition-colors duration-500"
                      style={{
                        animation: `sway 7s ease-in-out infinite`,
                        animationDelay: `${-specIdx * 1.8}s`,
                        '--sway-distance': '1px',
                        '--sway-rotate': '0deg',
                      }}
                    >
                      {spec}
                    </motion.span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Keyboard hint — only shown on devices with physical keyboard */}
      {hasKeyboard && (
        <p
          className="text-center mt-12 text-xs tracking-[0.3em] text-[var(--text-muted)] opacity-40 italic"
          style={{ fontFamily: 'var(--font-accent)' }}
        >
          try your keyboard...
        </p>
      )}
    </section>
  )
}
