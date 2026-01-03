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
  const [simpleMotion, setSimpleMotion] = useState(false)
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)
  const categories = activeTab === 'web' ? webCategories : linuxCategories

  useEffect(() => {
    const simple =
      (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) ||
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    setSimpleMotion(simple)
    if (simple) {
      setProgress(1)
      setTabTween(1)
    }
  }, [])

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

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (inView) {
      setProgress(1)
      setTabTween(1)
    }
  }, [inView])

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
      style={{ '--scroll-p': progress }}
      data-active={inView}
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
              // Bouncy spring easing
              const ease = (t) => {
                const c4 = (2 * Math.PI) / 3
                return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
              }
              
              const start = catIdx * 0.15
              const end = start + 0.5
              const rawT = Math.min(Math.max((progress - start) / Math.max(end - start, 0.0001), 0), 1)
              const t = ease(rawT)
              const blended = simpleMotion ? 1 : Math.min(1, t * 0.8 + tabTween * 0.4)
              
              // Staggered cascade from different directions
              const directions = [[-1, -1], [0, 1], [1, -1]]
              const [dirX, dirY] = directions[catIdx % 3]
              const translateX = simpleMotion ? 0 : 50 * (1 - blended) * dirX
              const translateY = simpleMotion ? 0 : 70 * (1 - blended) * (dirY === 0 ? 1 : dirY)
              const rotate = simpleMotion ? 0 : 6 * (1 - blended) * dirX
              const scale = simpleMotion ? 1 : 0.8 + 0.2 * blended
              const opacity = simpleMotion ? 1 : blended

              return (
                <article
                  key={category.name}
                  className="smart-glass p-6 sm:p-7 flex flex-col card-accent"
                  style={{
                    ['--card-transform']: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                    opacity,
                    transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out',
                    borderRadius: '18px',
                    borderColor: `${category.color}33`,
                    background: 'var(--theme-card-bg)',
                    backgroundImage: `linear-gradient(130deg, ${category.color}18, ${category.color}05 45%, transparent 70%)`,
                    boxShadow: `0 12px 36px -18px ${category.color}77`,
                    ['--card-shadow']: `${category.color}99`,
                    ['--card-color']: category.color,
                    ['--card-color-soft']: `${category.color}22`
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
