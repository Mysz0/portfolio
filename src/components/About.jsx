import React from 'react'
import { Code, Palette, Zap } from 'lucide-react'

export default function About() {
  const skills = [
    { icon: Code, label: 'Development', desc: 'React, Next.js, TypeScript, Tailwind CSS' },
    { icon: Palette, label: 'Design', desc: 'UI/UX, Translucent effects, Theme systems, Animations' },
    { icon: Zap, label: 'Performance', desc: 'Optimization, Firebase, Supabase, Vercel' }
  ]

  return (
    <section
      id="about"
      className="py-12 sm:py-16"
      style={{ animation: 'fadeInUp 0.8s ease-out both' }}
    >
      <div
        className="smart-glass p-8 sm:p-12 anim-soft-card"
        style={{ borderRadius: '20px' }}
      >
        <h2 className="text-3xl sm:text-4xl font-black mb-8" style={{
          backgroundImage: 'linear-gradient(135deg, rgb(var(--theme-primary)), rgba(var(--theme-primary), 0.6))',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          About Me
        </h2>
        <div className="space-y-5 mb-10">
          <p className="text-[var(--theme-text-body)] leading-relaxed text-lg">
            I'm a passionate frontend developer with expertise in building responsive, accessible, and performant web applications. With a focus on modern technologies and best practices, I create digital experiences that users love.
          </p>
          <p className="text-[var(--theme-text-body)] leading-relaxed text-lg">
            My toolkit includes React, Next.js, TypeScript, and Tailwind CSS. I specialize in dynamic theming systems, translucent effects, and smooth animations that bring interfaces to life. Every project is an opportunity to push the boundaries of what's possible on the web.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skills.map((skill, idx) => {
            const Icon = skill.icon
            return (
              <div key={idx} className="p-4 rounded-lg" style={{
                backgroundColor: 'rgba(var(--theme-primary), 0.08)',
                border: '1px solid rgba(var(--theme-primary), 0.15)'
              }}>
                <div className="flex items-center gap-3 mb-3">
                  <Icon size={20} style={{ color: 'rgb(var(--theme-primary))' }} />
                  <h3 className="font-bold text-[var(--theme-text-title)]">{skill.label}</h3>
                </div>
                <p className="text-sm text-[var(--theme-text-muted)]">{skill.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
