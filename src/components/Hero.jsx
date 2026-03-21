import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const projects = [
  { name: 'Urban Radar', year: '2025/2026', color: '#8B5CF6' },
  { name: 'Orzechowce Sanctuary', year: '2026', color: '#E8915A' },
  { name: 'QR Code Generator', year: '2024', color: '#A78BFA' },
]

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <header ref={ref} className="relative z-10 min-h-screen flex items-center">
      <motion.div style={{ y, opacity }} className="w-full max-w-5xl mx-auto px-6 sm:px-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            Product UI & Theming
          </span>
        </motion.div>

        {/* Main heading — large, bold, staggered lines */}
        <div className="mb-8 space-y-1">
          {['Myszo.', 'I build bold,', 'themeable interfaces.'].map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -60, filter: 'blur(12px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1
                className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95]"
                style={i === 0 ? {
                  backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                } : undefined}
              >
                {line}
              </h1>
            </motion.div>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-lg sm:text-xl text-[var(--text-body)] mb-12 leading-relaxed max-w-2xl"
        >
          React developer focused on dynamic theme systems, glass-morphism, and performance.
          Sharp layouts, motion that guides, and code that ships.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="flex items-center gap-4 flex-wrap mb-16"
        >
          <a
            href="#projects"
            className="group relative px-8 py-4 rounded-2xl font-bold text-white overflow-hidden transition-transform duration-300 hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <span className="relative z-10">See Projects</span>
          </a>
          <a
            href="#contact"
            className="px-8 py-4 rounded-2xl font-bold glass-card transition-transform duration-300 hover:scale-105 active:scale-95"
            style={{ color: 'var(--accent)' }}
          >
            Email Me
          </a>
        </motion.div>

        {/* Floating project pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-wrap gap-3"
        >
          {projects.map((p, i) => (
            <motion.div
              key={p.name}
              className="glass-card px-4 py-2.5 rounded-full flex items-center gap-3 text-sm"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3.5 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.6,
                ease: 'easeInOut',
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="font-medium text-[var(--text)]">{p.name}</span>
              <span className="text-[var(--text-muted)] text-xs font-mono">{p.year}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

    </header>
  )
}
