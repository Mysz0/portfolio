import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Palette, Database, Terminal } from 'lucide-react'

const webCategories = [
  {
    name: 'Frontend',
    icon: Code2,
    color: '#8B5CF6',
    tools: [
      { name: 'React 19', desc: 'Modern UI library' },
      { name: 'TypeScript', desc: 'Type safety & reliability' },
      { name: 'Tailwind CSS', desc: 'Utility-first styling' },
      { name: 'Vite', desc: 'Lightning-fast build tool' },
    ],
  },
  {
    name: 'Backend & Data',
    icon: Database,
    color: '#7BA886',
    tools: [
      { name: 'Supabase', desc: 'Auth & PostgreSQL' },
      { name: 'Firebase', desc: 'Real-time services' },
      { name: 'Next.js', desc: 'Full-stack framework' },
    ],
  },
  {
    name: 'Design System',
    icon: Palette,
    color: '#C4A0E5',
    tools: [
      { name: 'Dynamic Themes', desc: 'Multi-palette support' },
      { name: 'Responsive Design', desc: 'Mobile-first approach' },
      { name: 'Translucent Effects', desc: 'Glass & soft UI patterns' },
    ],
  },
]

const linuxCategories = [
  {
    name: 'Window Manager',
    icon: Terminal,
    color: '#E8915A',
    tools: [
      { name: 'Hyprland', desc: 'Modern Wayland WM' },
      { name: 'Matugen', desc: 'Auto-generated color schemes' },
      { name: 'Quickshell', desc: 'Custom bar & widgets' },
    ],
  },
  {
    name: 'Terminal & Tools',
    icon: Code2,
    color: '#8B5CF6',
    tools: [
      { name: 'Kitty', desc: 'GPU-based terminal' },
      { name: 'Zsh', desc: 'Shell configuration' },
      { name: 'Neovim (LazyVim)', desc: 'Text editor setup' },
      { name: 'Yazi', desc: 'Terminal file manager' },
    ],
  },
  {
    name: 'Applications',
    icon: Palette,
    color: '#A78BFA',
    tools: [
      { name: 'Rofi', desc: 'App launcher & menus' },
      { name: 'Hyprlock', desc: 'Lock screen' },
      { name: 'Zen Browser', desc: 'Web browser' },
      { name: 'swww + btop + cava', desc: 'Wallpaper, monitoring, audio viz' },
    ],
  },
]

export default function Setup() {
  const [activeTab, setActiveTab] = useState('web')
  const categories = activeTab === 'web' ? webCategories : linuxCategories

  return (
    <section id="setup" className="py-20 sm:py-32 max-w-5xl mx-auto px-6 sm:px-8">
      {/* Header */}
      <motion.div
        className="flex items-end justify-between gap-6 mb-12 flex-wrap"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3">Stack</p>
          <h2 className="text-4xl sm:text-5xl font-black heading-accent">Setup</h2>
        </div>
        <div className="flex gap-2">
          {['web', 'linux'].map((tab) => {
            const isActive = tab === activeTab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 border"
                style={{
                  backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                  borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {tab === 'web' ? 'Web Dev' : 'Linux Setup'}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="grid gap-6 lg:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35 }}
        >
          {categories.map((category, idx) => {
            const Icon = category.icon
            return (
              <motion.article
                key={category.name}
                className="glass-card p-7 flex flex-col relative overflow-hidden"
                style={{
                  borderColor: `${category.color}30`,
                  backgroundImage: `linear-gradient(145deg, ${category.color}08, transparent 50%)`,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -3, transition: { duration: 0.25 } }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ backgroundColor: `${category.color}15`, color: category.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-black text-[var(--text)]">{category.name}</h3>
                </div>

                <div className="space-y-2.5">
                  {category.tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="p-3 rounded-lg flex flex-col transition-transform duration-300 hover:translate-x-1"
                      style={{
                        backgroundColor: `${category.color}06`,
                        borderLeft: `3px solid ${category.color}40`,
                      }}
                    >
                      <div className="font-semibold text-sm text-[var(--text)]">{tool.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{tool.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
