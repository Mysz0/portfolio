import React, { useEffect, useRef, useState } from 'react'
import { Code, Palette, Zap } from 'lucide-react'

export default function About() {
  const skills = [
    { icon: Code, label: 'Development', desc: 'React, Next.js, TypeScript, Tailwind CSS' },
    { icon: Palette, label: 'Design', desc: 'UI/UX, Translucent effects, Theme systems, Animations' },
    { icon: Zap, label: 'Performance', desc: 'Optimization, Firebase, Supabase, Vercel' }
  ]

  const detailedSkills = [
    { name: 'React & Next.js', level: 95, color: '#61dafb' },
    { name: 'TypeScript', level: 90, color: '#3178c6' },
    { name: 'Tailwind CSS', level: 98, color: '#06b6d4' },
    { name: 'UI/UX Design', level: 85, color: '#ec4899' },
    { name: 'Performance Optimization', level: 88, color: '#10b981' },
  ]

  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

        {/* Skill Progress Bars */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-6 text-[var(--theme-text-title)]">Technical Proficiency</h3>
          <div className="space-y-5">
            {detailedSkills.map((skill, idx) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--theme-text-body)]">{skill.name}</span>
                  <span className="text-sm font-bold" style={{ color: skill.color }}>
                    {skill.level}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(var(--theme-primary), 0.1)',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: isVisible ? `${skill.level}%` : '0%',
                      backgroundColor: skill.color,
                      boxShadow: `0 0 10px ${skill.color}66`,
                      transitionDelay: `${idx * 100}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
