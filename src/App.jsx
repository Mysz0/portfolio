import { Suspense, lazy, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Lenis from 'lenis'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Setup from './components/Setup'
import Keyboards from './components/Keyboards'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScrollRevealText from './components/ScrollRevealText'
import InkTrailCanvas from './components/InkTrailCanvas'

const ShaderBackground = lazy(() => import('./components/ShaderBackground'))

/* ── Mouse warmth context ────────────────────────────────
   Tracks cursor position globally so any component can
   respond to proximity without redundant listeners.       */

const MouseContext = createContext({ x: -1000, y: -1000 })
export const useMouse = () => useContext(MouseContext)

function MouseProvider({ children }) {
  const posRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const handleMove = (e) => {
      posRef.current.x = e.clientX
      posRef.current.y = e.clientY
    }
    const handleLeave = () => {
      posRef.current.x = -1000
      posRef.current.y = -1000
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return <MouseContext.Provider value={posRef}>{children}</MouseContext.Provider>
}

/* ── Reveal section with scroll parallax depth ───────── */

const RevealSection = ({ children, delay = 0, depth = 0 }) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Subtle parallax based on depth (0 = no parallax, 1 = max)
  const y = useTransform(scrollYProgress, [0, 1], [depth * 30, depth * -30])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </motion.div>
  )
}

/* ── Interstitial — scroll-driven ink reveal ─────────── */

const Interstitial = ({ text }) => (
  <div className="max-w-5xl mx-auto px-8 py-48 text-center">
    <ScrollRevealText
      text={text}
      className="font-light tracking-[0.5em] uppercase text-[11px] text-[var(--text-muted)]"
    />
  </div>
)

/* ── Decorative breathing separator ──────────────────── */

const BreathingSeparator = ({ delay = 0 }) => (
  <div className="flex justify-center py-8">
    <div
      className="breathe-ambient"
      style={{
        width: 1,
        height: 40,
        background: 'var(--border-hover)',
        animationDelay: `${delay}s`,
      }}
    />
  </div>
)

/* ── Smooth scroll setup ─────────────────────────────── */

function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    })
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])
  return null
}

/* ── App ─────────────────────────────────────────────── */

export default function App() {
  return (
    <MouseProvider>
      <Suspense fallback={null}>
        <ShaderBackground />
      </Suspense>
      <InkTrailCanvas />

      <div
        className="relative min-h-screen text-[var(--text)] overflow-x-hidden selection:bg-[var(--accent)] selection:text-white"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <SmoothScroll />

        {/* Content - Cinematic Scroll Journey */}
        <main className="relative z-10 space-y-0 pb-32">
          <Hero />

          <Interstitial text="The empty space is not nothing — it is everything waiting." />

          <RevealSection depth={0.15}>
            <About />
          </RevealSection>

          <Interstitial text="Each stone placed with intention." />

          <RevealSection depth={0.1}>
            <Projects />
          </RevealSection>

          <Interstitial text="The tools shape the hand that holds them." />

          <RevealSection depth={0.2}>
            <Setup />
          </RevealSection>

          <BreathingSeparator delay={-2} />

          <RevealSection depth={0.15}>
            <Keyboards />
          </RevealSection>

          <BreathingSeparator delay={-5} />

          <RevealSection depth={0.1}>
            <Contact />
          </RevealSection>

          <Footer />
        </main>
      </div>
    </MouseProvider>
  )
}
