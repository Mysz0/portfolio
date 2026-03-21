import { useState, useLayoutEffect, Suspense, lazy } from 'react'
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

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme-mode') === 'dark' ||
             (!localStorage.getItem('theme-mode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return true
  })

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
    <div className="noise-overlay dot-grid relative min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-500 overflow-x-hidden">
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
