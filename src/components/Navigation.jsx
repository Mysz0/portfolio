import React, { useState, useEffect } from 'react'
import { Home, User, FolderGit2, Wrench, Keyboard, Mail } from 'lucide-react'

const navItems = [
  { id: 'hero', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: User },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'setup', label: 'Setup', icon: Wrench },
  { id: 'keyboards', label: 'Keyboards', icon: Keyboard },
  { id: 'contact', label: 'Contact', icon: Mail },
]

export default function Navigation() {
  const [activeSection, setActiveSection] = useState('hero')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100)

      // Determine active section
      const sections = navItems.map(item => document.getElementById(item.id)).filter(Boolean)
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        const rect = section.getBoundingClientRect()
        if (rect.top <= 150) {
          setActiveSection(section.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <nav
      className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${
        isVisible ? 'top-6 opacity-100' : '-top-20 opacity-0'
      }`}
    >
      <div
        className="smart-glass px-3 py-2 flex items-center gap-1"
        style={{
          borderRadius: '999px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.2)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="relative px-3 py-2 rounded-full transition-all duration-300 group"
              style={{
                backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              }}
              aria-label={item.label}
            >
              <Icon
                size={18}
                style={{
                  color: isActive ? 'rgb(16, 185, 129)' : 'var(--theme-text-muted)',
                  transition: 'color 0.3s',
                }}
              />
              
              {/* Tooltip */}
              <span
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '6px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
