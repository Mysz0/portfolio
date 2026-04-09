import { useRef, useCallback, useEffect } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import WindText from './WindText'

const stack = [
  { name: 'React', role: 'The Structure', tech: 'Reactive composition — building interfaces that respond before you finish thinking.' },
  { name: 'Three.js', role: 'The Atmosphere', tech: 'GPU-driven depth and light. The garden needs weather.' },
  { name: 'TypeScript', role: 'The Discipline', tech: 'Strict types as a form of respect for the code that follows.' },
  { name: 'Next.js', role: 'The Foundation', tech: 'Server and client woven together. Performant by default.' },
  { name: 'Tailwind', role: 'The Grid', tech: 'Utility-first spatial design — precision without ceremony.' },
  { name: 'Bun', role: 'The Current', tech: 'A fast runtime underneath everything. Speed as a baseline.' },
]

/* Spring-physics row — responds to mouse with organic motion */
function SpringRow({ item, idx }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 30, mass: 0.3 })
  const springY = useSpring(y, { stiffness: 200, damping: 30, mass: 0.3 })
  const isHovered = useRef(false)
  const rafId = useRef(null)

  // Idle vertical bob — distinct from Projects' lateral sway
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const phase = idx * 1.2
    function tick(now) {
      rafId.current = requestAnimationFrame(tick)
      if (isHovered.current) return
      const t = now / 1000
      x.set(Math.sin(t * 0.25 + phase) * 1.5)
      y.set(Math.sin(t * 0.35 + phase) * 2.5)
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
      className="group grid md:grid-cols-12 gap-8 items-center py-10 border-b border-[var(--border)] hover:bg-[var(--accent-soft)] transition-colors duration-500 px-4 cursor-default"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: idx * 0.05 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      <div className="md:col-span-3">
        <span className="text-sm font-bold uppercase tracking-widest text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-500">
          {item.name}
        </span>
      </div>
      <div className="md:col-span-3">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] opacity-40 group-hover:opacity-100 transition-opacity duration-500 inline-block breathe-ambient"
          style={{ animationDelay: `${-idx * 1.5}s` }}
        >
          {item.role}
        </span>
      </div>
      <div className="md:col-span-6 text-base text-[var(--text-body)] leading-relaxed group-hover:text-[var(--text)] transition-colors duration-500">
        {item.tech}
      </div>
    </motion.div>
  )
}

export default function Setup() {
  return (
    <section id="setup" className="py-24 sm:py-48 max-w-5xl mx-auto px-6 sm:px-8">
      <div className="max-w-2xl mb-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)] mb-6 breathe-ambient" style={{ animationDelay: '-1s' }}>Craft</p>
        <WindText className="text-5xl sm:text-7xl heading-accent mb-8">
          The Toolkit
        </WindText>
        <p className="text-[var(--text-body)] text-lg font-light leading-relaxed">
          A gardener is known by their tools. Each one chosen
          for what it removes as much as what it builds.
        </p>
      </div>

      <div className="grid gap-1 border-t border-[var(--border)]">
        {stack.map((item, idx) => (
          <SpringRow key={item.name} item={item} idx={idx} />
        ))}
      </div>
    </section>
  )
}
