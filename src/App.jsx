import { useState, useEffect, useLayoutEffect, Suspense, lazy } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Setup from './components/Setup'
import Keyboards from './components/Keyboards'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ThemeToggle from './components/ThemeToggle'
import Particles from './components/Particles'

const ShaderBackground = lazy(() => import('./components/ShaderBackground'))

function useGlassCardMouseTracking() {
  useEffect(() => {
    const onMouseMove = (e) => {
      const card = e.target.closest('.glass-card')
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      card.style.setProperty('--mouse-x', `${x}%`)
      card.style.setProperty('--mouse-y', `${y}%`)
    }
    document.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => document.removeEventListener('mousemove', onMouseMove)
  }, [])
}

function CursorTracker() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 600, damping: 50 })
  const springY = useSpring(mouseY, { stiffness: 600, damping: 50 })

  useEffect(() => {
    let raf
    let clientX = 0
    let clientY = 0

    const onPointerMove = (e) => {
      if (e.pointerType !== 'mouse') return
      clientX = e.clientX
      clientY = e.clientY
    }

    const update = () => {
      mouseX.set(clientX)
      mouseY.set(clientY)
      raf = requestAnimationFrame(update)
    }

    window.addEventListener('pointermove', onPointerMove)
    raf = requestAnimationFrame(update)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const unsubX = springX.on('change', (v) => {
      document.documentElement.style.setProperty('--cursor-x', `${v}px`)
    })
    const unsubY = springY.on('change', (v) => {
      document.documentElement.style.setProperty('--cursor-y', `${v}px`)
    })
    return () => { unsubX(); unsubY() }
  }, [springX, springY])

  return null
}

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme-mode') === 'dark' ||
             (!localStorage.getItem('theme-mode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return true
  })

  useGlassCardMouseTracking()

  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.style.colorScheme = isDark ? 'dark' : 'light'
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light')

    const baseColor = isDark ? '#0F0B15' : '#FAF7F2'
    const head = document.head
    head.querySelectorAll('meta[name="theme-color"]').forEach((el) => el.remove())
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    meta.setAttribute('content', baseColor)
    head.appendChild(meta)
  }, [isDark])

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-500 overflow-x-hidden">
      {/* Dot grid overlay */}
      <div className="dot-grid fixed inset-0 pointer-events-none z-[1]" />
      {/* Noise texture overlay */}
      <div className="noise-overlay fixed inset-0 pointer-events-none z-[9999]" />
      {/* Cursor tracking (ice-like spring movement) */}
      <CursorTracker />

      {/* Ambient cursor glow */}
      <div className="ambient-light" />

      {/* WebGL shader background */}
      <Suspense fallback={null}>
        <ShaderBackground isDark={isDark} />
      </Suspense>

      {/* Floating particles */}
      <Particles count={20} />

      {/* Theme toggle */}
      <ThemeToggle isDark={isDark} setIsDark={setIsDark} />

      {/* Content */}
      <div className="relative z-10">
        <Hero />
        <About />
        <Projects />
        <Setup />
        <Keyboards />
        <Contact />
        <Footer />
      </div>
    </div>
  )
}
