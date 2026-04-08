import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import WindText from './WindText'

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
  const rowRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!rowRef.current) return
    const rect = rowRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rowRef.current.style.transform = `translate(${x * 6}px, ${y * 4}px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!rowRef.current) return
    rowRef.current.style.transform = 'translate(0px, 0px)'
  }, [])

  return (
    <div
      ref={rowRef}
      className="group grid md:grid-cols-12 gap-8 items-start border-b border-[var(--border)] pb-12 transition-transform duration-700"
      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="md:col-span-1 text-[var(--accent)] font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity duration-500">
        0{idx + 1}
      </div>
      <div className="md:col-span-7 space-y-6">
        <h3 className="text-3xl sm:text-4xl font-bold text-[var(--text)] transition-colors duration-500 group-hover:text-[var(--accent)]">
          {p.title}
        </h3>
        <p className="text-[var(--text-body)] text-lg leading-relaxed max-w-xl">
          {p.desc}
        </p>
        <div className="flex flex-wrap gap-3">
          {p.tech.map((t) => (
            <span key={t} className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-3 py-1 border border-[var(--border)] group-hover:border-[var(--border-hover)] transition-colors duration-500">
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
          className="btn-secondary inline-flex items-center gap-3 w-fit group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all duration-500"
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
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)] mb-6">Works</p>
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
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 relative ${
                active === tab.id ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text-body)]'
              }`}
            >
              {tab.label}
              {active === tab.id && (
                <motion.div
                  layoutId="activeProjTab"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--accent)]"
                />
              )}
            </button>
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
          transition={{ duration: 0.5 }}
        >
          {activeTab.items.map((p, idx) => (
            <ProjectRow key={p.title} p={p} idx={idx} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
