import React, { useEffect, useRef, useState } from 'react'
import { Code2, Palette, Database, Zap, Terminal } from 'lucide-react'

const webCategories = [
  {
    name: 'Frontend',
    icon: Code2,
    color: '#3b82f6',
    tools: [
      { name: 'React 19', desc: 'Modern UI library' },
      { name: 'TypeScript', desc: 'Type safety & reliability' },
      { name: 'Tailwind CSS', desc: 'Utility-first styling' },
      { name: 'Vite', desc: 'Lightning-fast build tool' }
    ]
  },
  {
    name: 'Backend & Data',
    icon: Database,
    color: '#10b981',
    tools: [
      { name: 'Supabase', desc: 'Auth & PostgreSQL' },
      { name: 'Firebase', desc: 'Real-time services' },
      { name: 'Next.js', desc: 'Full-stack framework' }
    ]
  },
  {
    name: 'Design System',
    icon: Palette,
    color: '#a855f7',
    tools: [
      { name: 'Dynamic Themes', desc: 'Multi-palette support' },
      { name: 'Responsive Design', desc: 'Mobile-first approach' },
      { name: 'Translucent Effects', desc: 'Glass & soft UI patterns' }
    ]
  }
]

const linuxCategories = [
  {
    name: 'Window Manager',
    icon: Terminal,
    color: '#06b6d4',
    tools: [
      { name: 'Hyprland', desc: 'Modern Wayland WM' },
      { name: 'Matugen', desc: 'Auto-generated color schemes' },
      { name: 'Quickshell', desc: 'Custom bar & widgets' }
    ]
  },
  {
    name: 'Terminal & Tools',
    icon: Code2,
    color: '#3b82f6',
    tools: [
      { name: 'Kitty', desc: 'GPU-based terminal' },
      { name: 'Zsh', desc: 'Shell configuration' },
      { name: 'Neovim (LazyVim)', desc: 'Text editor setup' },
      { name: 'Yazi', desc: 'Terminal file manager' }
    ]
  },
  {
    name: 'Applications',
    icon: Palette,
    color: '#a855f7',
    tools: [
      { name: 'Rofi', desc: 'App launcher & menus' },
      { name: 'Hyprlock', desc: 'Lock screen' },
      { name: 'Zen Browser', desc: 'Web browser' },
      { name: 'swww + btop + cava', desc: 'Wallpaper, monitoring, audio viz' }
    ]
  }
]

export default function Setup() {
  const [activeTab, setActiveTab] = useState('web')
  const [progress, setProgress] = useState(0)
  const [tabTween, setTabTween] = useState(0)
  const sectionRef = useRef(null)
  const categories = activeTab === 'web' ? webCategories : linuxCategories

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = Math.max(rect.height - vh * 0.6, 1)
      const offset = Math.min(Math.max(vh * 0.5 - rect.top, 0), total)
      setProgress(offset / total)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // simple tween on tab change to animate content entrance
  useEffect(() => {
    let raf
    const start = performance.now()
    const duration = 280
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      setTabTween(t)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [activeTab])

  return (
    <section
      id="setup"
      className="py-4 sm:py-8 scroll-tell"
      ref={sectionRef}
    >
      <div className="scroll-tell-shell">
        <div className="scroll-tell-stage">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-black" style={{
              backgroundImage: 'linear-gradient(135deg, rgb(var(--theme-primary)), rgba(var(--theme-primary), 0.6))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Setup
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-2 smart-glass" style={{ borderRadius: '12px' }}>
              <Zap size={16} style={{ color: 'rgb(var(--theme-primary))' }} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Tools & Tech</span>
            </div>
          </div>

          <div className="inline-flex gap-2 mb-8 flex-wrap">
            {['web', 'linux'].map((tab) => {
              const isActive = tab === activeTab
              const label = tab === 'web' ? 'Web Dev' : 'Linux Setup'
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 smart-glass flex items-center gap-2 text-sm font-semibold transition-all"
                  style={{
                    borderRadius: '12px',
                    backgroundColor: isActive ? 'rgba(var(--theme-primary), 0.12)' : undefined,
                    borderColor: isActive ? 'rgba(var(--theme-primary), 0.35)' : undefined,
                    color: isActive ? 'rgb(var(--theme-primary))' : 'var(--theme-text-body)'
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3" style={{ minHeight: '420px' }}>
            {categories.map((category, catIdx) => {
              const Icon = category.icon
              const start = catIdx * 0.06
              const end = start + 0.9
              const t = Math.min(Math.max((progress - start) / Math.max(end - start, 0.0001), 0), 1)
              const blended = Math.min(1, t * 0.9 + tabTween * 0.4)
              const dir = catIdx % 2 === 0 ? -1 : 1
              const translateX = 40 * (1 - blended) * dir
              const translateY = 14 * (1 - blended)
              const scale = 0.94 + 0.06 * blended
              const opacity = 0.4 + 0.6 * blended
              const blur = 5 * (1 - blended)

              return (
                <article
                  key={category.name}
                  className="smart-glass p-6 sm:p-7 flex flex-col"
                  style={{
                    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                    opacity,
                    filter: `blur(${blur}px)`,
                    transition: 'transform 140ms linear, opacity 120ms linear, filter 160ms linear',
                    borderRadius: '18px',
                    borderColor: `${category.color}33`
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="p-3 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${category.color}1a`,
                        color: category.color,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-black text-[var(--theme-text-title)]">
                      {category.name}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {category.tools.map((tool) => (
                      <div
                        key={tool.name}
                        className="p-3 rounded-lg flex flex-col"
                        style={{
                          backgroundColor: `${category.color}08`,
                          borderLeft: `3px solid ${category.color}`,
                        }}
                      >
                        <div className="font-semibold text-sm text-[var(--theme-text-title)]">
                          {tool.name}
                        </div>
                        <div className="text-xs text-[var(--theme-text-muted)]">
                          {tool.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
