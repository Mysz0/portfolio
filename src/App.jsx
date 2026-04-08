import { Suspense, lazy, useEffect } from 'react'
import { motion } from 'framer-motion'
import Lenis from 'lenis'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Setup from './components/Setup'
import Keyboards from './components/Keyboards'
import Contact from './components/Contact'
import Footer from './components/Footer'

const ShaderBackground = lazy(() => import('./components/ShaderBackground'))

const RevealSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: false, amount: 0.2 }}
    transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
)

const Interstitial = ({ text }) => (
  <RevealSection>
    <div className="max-w-5xl mx-auto px-8 py-48 opacity-50 font-light text-center tracking-[0.5em] uppercase text-[11px] text-[var(--text-muted)]">
      {text}
    </div>
  </RevealSection>
)

function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
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

export default function App() {
  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-x-hidden selection:bg-[var(--accent)] selection:text-white">
      <SmoothScroll />

      {/* Atmospheric Background */}
      <Suspense fallback={null}>
        <ShaderBackground />
      </Suspense>

      {/* Content - Cinematic Scroll Journey */}
      <main className="relative z-10 space-y-0 pb-32">
        <Hero />
        
        <Interstitial text="The empty space is not nothing — it is everything waiting." />

        <RevealSection>
          <About />
        </RevealSection>

        <Interstitial text="Each stone placed with intention." />

        <RevealSection>
          <Projects />
        </RevealSection>

        <Interstitial text="The tools shape the hand that holds them." />

        <RevealSection>
          <Setup />
        </RevealSection>

        <RevealSection>
          <Keyboards />
        </RevealSection>

        <RevealSection>
          <Contact />
        </RevealSection>

        <Footer />
      </main>
    </div>
  )
}
