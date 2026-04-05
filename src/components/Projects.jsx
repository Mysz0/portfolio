import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Sparkles, Wrench, Archive, Globe } from 'lucide-react'

const tabs = [
  {
    id: 'featured',
    label: 'Featured',
    icon: Sparkles,
    items: [
      {
        title: 'Urban Radar',
        desc: 'Location-based social app with a full theme engine (Emerald, Winter, Sakura, Aurora, Blackhole) and glass-morphism UI.',
        tech: ['React 19', 'Vite', 'Tailwind', 'Theme Engine'],
        link: 'https://github.com/Mysz0/urbanradar',
        year: '2025/2026',
        color: '#8B5CF6',
      },
      {
        title: 'Portfolio',
        desc: 'Personal portfolio site showcasing projects and contact info.',
        tech: ['Vite', 'React', 'Tailwind'],
        link: 'https://me.hyruki.cc',
        year: '2026',
        color: '#E8915A',
      },
    ],
  },
  {
    id: 'tools',
    label: 'Utilities',
    icon: Wrench,
    items: [
      {
        title: 'Tools',
        desc: 'Set of tools including a QR code generator, password generator, json formatter and diff checker.',
        tech: ['React', 'Bun', 'ShadCN UI', 'Tailwind'],
        link: 'https://tools.hyruki.cc',
        year: '2026',
        color: '#A78BFA',
      },
      {
        title: 'Tech stack configurator',
        desc: 'A tool to pick your tech stack and generate the setup commands for your development environment.',
        tech: ['React', 'Bun', 'ShadCN UI', 'Tailwind'],
        link: 'https://tech.hyruki.cc',
        year: '2026',
        color: '#A78BFA',
      },
      
    ],
  },
  {
    id: 'legacy',
    label: 'Legacy',
    icon: Archive,
    items: [
      {
        title: 'Minecraft Blocks Recipes',
        desc: 'Searchable recipes site for Minecraft items using MariaDB + vanilla HTML/CSS UI.',
        tech: ['MariaDB', 'HTML', 'CSS'],
        link: '#',
        year: '2024',
        color: '#7BA886',
      },
      {
        title: 'Send Files',
        desc: 'Upload files and share a download URL. Static front-end with short link generation.',
        tech: ['HTML', 'CSS'],
        link: '#',
        year: '2024',
        color: '#C4A0E5',
      },
      {
        title: 'QR Code Generator',
        desc: 'Real-time QR generation with Firebase auth, stored codes, and animated particles on the canvas.',
        tech: ['Firebase', 'Firestore', 'Vanilla JS'],
        link: 'https://github.com/Mysz0/qrcode_generator',
        year: '2024',
        color: '#A78BFA',
      },
    ],
  },
]

export default function Projects() {
  const [active, setActive] = useState('featured')
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <section id="projects" className="py-20 sm:py-32 max-w-5xl mx-auto px-6 sm:px-8">
      {/* Header */}
      <motion.div
        className="flex items-end justify-between gap-6 mb-12 flex-wrap"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3">Portfolio</p>
          <h2 className="text-4xl sm:text-5xl font-black heading-accent">Builds</h2>
        </div>
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === active
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-colors duration-300 border"
                style={{
                  backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                  borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="grid gap-6 lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35 }}
        >
          {activeTab.items.map((p, idx) => (
            <motion.article
              key={p.title}
              className="glass-card p-7 flex flex-col relative overflow-hidden group"
              style={{
                borderColor: `${p.color}30`,
                backgroundImage: `linear-gradient(145deg, ${p.color}08, transparent 50%)`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-black"
                  style={{ backgroundColor: `${p.color}15`, color: p.color }}
                >
                  {p.year}
                </div>
              </div>

              <h3 className="text-2xl font-black mb-3 text-[var(--text)]">{p.title}</h3>
              <p className="text-[var(--text-muted)] mb-6 leading-relaxed">{p.desc}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${p.color}0c`,
                      color: p.color,
                      border: `1px solid ${p.color}25`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {p.link && p.link !== '#' ? (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold text-sm mt-auto transition-all duration-300 hover:gap-3"
                  style={{ color: p.color }}
                >
                  {p.link.includes('github.com') ? <Github size={16} /> : <Globe size={16} />}
                  {p.link.includes('github.com') ? 'View on GitHub' : 'View page'}
                </a>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-auto">
                  Offline / No repo
                </span>
              )}
            </motion.article>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
