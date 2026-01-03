import React, { useEffect, useRef, useState } from 'react'
import { Github, Sparkles, LayoutGrid, Wrench, Archive } from 'lucide-react'

const tabs = [
  {
    id: 'featured',
    label: 'Featured Builds',
    icon: Sparkles,
    items: [
      {
        title: 'Urban Radar',
        desc: 'Location-based social app with a full theme engine (Emerald, Winter, Sakura, Aurora, Blackhole) and glass-morphism UI.',
        tech: ['React 19', 'Vite', 'Tailwind', 'Theme Engine'],
        link: 'https://github.com/Mysz0/urbanradar',
        year: '2025/2026',
        color: '#10b981'
      },
      {
        title: 'Orzechowce Sanctuary',
        desc: 'Adoption platform with admin tools, Supabase backend, responsive cards, and smooth filters for pets.',
        tech: ['Next.js 14', 'TypeScript', 'Supabase', 'Tailwind'],
        link: 'https://github.com/Mysz0/Orzechowce',
        year: '2026',
        color: '#f97316'
      }
    ]
  },
  {
    id: 'tools',
    label: 'Utilities',
    icon: Wrench,
    items: [
      {
        title: 'QR Code Generator',
        desc: 'Real-time QR generation with Firebase auth, stored codes, and animated particles on the canvas.',
        tech: ['Firebase', 'Firestore', 'Vanilla JS'],
        link: 'https://github.com/Mysz0/qrcode_generator',
        year: '2024',
        color: '#8b5cf6'
      }
    ]
  },
  {
    id: 'legacy',
    label: 'Legacy / Offline',
    icon: Archive,
    items: [
      {
        title: 'Minecraft Blocks Recipes',
        desc: 'Searchable recipes site for Minecraft items using MariaDB + vanilla HTML/CSS UI (Aug–Nov 2024).',
        tech: ['MariaDB', 'HTML', 'CSS'],
        link: '#',
        year: '2024',
        color: '#22c55e'
      },
      {
        title: 'Send Files',
        desc: 'Upload files and share a download URL. Static front-end; backend service formerly generated short links.',
        tech: ['HTML', 'CSS'],
        link: '#',
        year: '2024',
        color: '#f59e0b'
      }
    ]
  }
]

export default function Projects() {
  const [active, setActive] = useState('featured')
  const [tabTween, setTabTween] = useState(0)
  const [progress, setProgress] = useState(0)
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)
  const activeTab = tabs.find(t => t.id === active) ?? tabs[0]

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

  const spring = (value, factor = 1) => value * factor

  // lightweight tween to drive tab content entrance
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
  }, [active])

  return (
    <section
      id="projects"
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
            Builds
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-2 smart-glass" style={{ borderRadius: '12px' }}>
            <LayoutGrid size={16} style={{ color: 'rgb(var(--theme-primary))' }} />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Modular & Themed</span>
          </div>
        </div>

        <div className="inline-flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === active
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className="px-4 py-2 smart-glass flex items-center gap-2 text-sm font-semibold transition-all"
                style={{
                  borderRadius: '12px',
                  backgroundColor: isActive ? 'rgba(var(--theme-primary), 0.12)' : undefined,
                  borderColor: isActive ? 'rgba(var(--theme-primary), 0.35)' : undefined,
                  color: isActive ? 'rgb(var(--theme-primary))' : 'var(--theme-text-body)'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2" style={{ minHeight: '420px' }}>
          {activeTab.items.map((p, idx) => {
            // Dramatic spring easing
            const ease = (t) => {
              const c4 = (2 * Math.PI) / 3
              return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
            }
            
            const start = idx * 0.18
            const end = start + 0.55
            const rawT = Math.min(Math.max((progress - start) / Math.max(end - start, 0.0001), 0), 1)
            const t = ease(rawT)
            const blended = Math.min(1, t * 0.8 + tabTween * 0.4)
            
            const dir = idx % 2 === 0 ? -1 : 1
            const translateX = 60 * (1 - blended) * dir
            const translateY = 80 * (1 - blended)
            const rotate = 8 * (1 - blended) * dir
            const scale = 0.85 + 0.15 * blended
            const opacity = 0 + 1 * blended

            return (
              <article 
                key={p.title} 
                className="smart-glass p-6 sm:p-7 flex flex-col"
                style={{
                  transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                  opacity,
                  transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out',
                  borderRadius: '18px',
                  borderColor: `${p.color}33`
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="px-3 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${p.color}1a`,
                      color: p.color,
                      boxShadow: `0 10px 28px -14px ${p.color}99`
                    }}
                  >
                    <span className="text-xs font-black whitespace-nowrap">{p.year}</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">{activeTab.label}</span>
                </div>

                <h3 className="text-xl font-black mb-2 text-[var(--theme-text-title)]" style={{ lineHeight: 1.2 }}>
                  {p.title}
                </h3>
                <p className="text-[var(--theme-text-muted)] mb-5 leading-relaxed">
                  {p.desc}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {p.tech.map((t) => (
                    <span 
                      key={t}
                      className="text-xs font-semibold px-3 py-1"
                      style={{
                        backgroundColor: `${p.color}12`,
                        color: p.color,
                        borderRadius: '999px',
                        border: `1px solid ${p.color}33`
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
                    className="inline-flex items-center gap-2 font-black text-sm uppercase tracking-wider"
                    style={{ color: p.color }}
                  >
                    <Github size={16} />
                    View on GitHub
                  </a>
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted)]">
                    Offline / No repo
                  </span>
                )}
              </article>
            )
          })}
        </div>
        </div>
      </div>
    </section>
  )
}
