import React, { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

const PROGRESS_RING_RADIUS = 20

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrolled / scrollHeight) * 100

      setScrollProgress(progress)
      setIsVisible(scrolled > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const circumference = 2 * Math.PI * PROGRESS_RING_RADIUS

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
      }`}
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
      }}
      aria-label="Back to top"
    >
      {/* Background circle */}
      <div
        className="absolute inset-0 smart-glass"
        style={{
          borderRadius: '50%',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 24px -8px rgba(16, 185, 129, 0.3)',
        }}
      />

      {/* Progress ring */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="28"
          cy="28"
          r={PROGRESS_RING_RADIUS}
          stroke="rgba(16, 185, 129, 0.15)"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="28"
          cy="28"
          r={PROGRESS_RING_RADIUS}
          stroke="rgb(16, 185, 129)"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (scrollProgress / 100) * circumference}
          style={{
            transition: 'stroke-dashoffset 0.1s ease-out',
            filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))',
          }}
        />
      </svg>

      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ArrowUp size={20} style={{ color: 'rgb(16, 185, 129)' }} />
      </div>
    </button>
  )
}
