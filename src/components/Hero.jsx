import React from 'react'
import { ChevronDown, Sparkles, Code2, Zap } from 'lucide-react'

export default function Hero() {
  return (
    <header className="py-16 sm:py-28" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
      <div className="max-w-5xl mx-auto grid gap-10 sm:gap-12 md:grid-cols-[1.2fr_0.8fr] items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 smart-glass animate-pulse" style={{ borderRadius: '999px', animationDuration: '3s' }}>
            <Sparkles size={16} style={{ color: 'rgb(var(--theme-primary))' }} />
            <span className="text-xs font-black uppercase tracking-[0.24em] text-[var(--theme-text-muted)]">Product UI & Theming</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4" style={{
            backgroundImage: 'linear-gradient(135deg, rgb(var(--theme-primary)), rgba(var(--theme-primary), 0.6))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Myszo - I build bold, themeable interfaces.
          </h1>
          <p className="text-base sm:text-lg text-[var(--theme-text-body)] mb-8 leading-relaxed max-w-2xl">
            React developer focused on dynamic theme systems, glass-morphism, and performance. Less fluff, more polish: sharp layouts, motion that guides, and code that ships.
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(var(--theme-primary), 0.1)' }}>
              <Code2 size={16} style={{ color: 'rgb(var(--theme-primary))' }} />
              <span className="text-sm font-bold text-[var(--theme-text-body)]">5+ Years</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Zap size={16} style={{ color: '#3b82f6' }} />
              <span className="text-sm font-bold text-[var(--theme-text-body)]">15+ Projects</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a href="#projects" className="px-6 py-3 smart-glass font-semibold text-white transition-all hover:scale-105" style={{
              backgroundColor: 'rgb(var(--theme-primary))',
              border: '1px solid rgba(var(--theme-primary), 0.3)',
              borderRadius: '12px',
            }}>
              See Projects
            </a>
            <a href="#contact" className="px-6 py-3 smart-glass font-semibold transition-all hover:scale-105" style={{
              color: 'rgb(var(--theme-primary))',
              borderRadius: '12px',
            }}>
              Email Me
            </a>
          </div>
        </div>

        <div className="smart-glass p-5 sm:p-6" style={{ borderRadius: '18px' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[var(--theme-text-muted)]">Now Shipping</span>
            <ChevronDown size={16} className="animate-bounce" style={{ animationDuration: '2s', color: 'rgb(var(--theme-primary))' }} />
          </div>
          <ul className="space-y-3 text-sm text-[var(--theme-text-body)]">
            <li className="flex justify-between items-center group cursor-pointer">
              <span className="group-hover:translate-x-1 transition-transform">Urban Radar</span>
              <span className="font-semibold" style={{ color: 'rgb(var(--theme-primary))' }}>2025/2026</span>
            </li>
            <li className="flex justify-between items-center group cursor-pointer">
              <span className="group-hover:translate-x-1 transition-transform">Orzechowce Sanctuary</span>
              <span className="font-semibold" style={{ color: 'rgb(var(--theme-primary))' }}>2026</span>
            </li>
            <li className="flex justify-between items-center group cursor-pointer">
              <span className="group-hover:translate-x-1 transition-transform">QR Code Generator</span>
              <span className="font-semibold" style={{ color: 'rgb(var(--theme-primary))' }}>2024</span>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
