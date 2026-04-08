import { useRef, useCallback } from 'react'

export default function WindText({ children, as: Tag = 'h2', className = '' }) {
  const ref = useRef(null)
  const rafRef = useRef(null)
  const text = typeof children === 'string' ? children : ''

  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const chars = ref.current.querySelectorAll('[data-wind]')

      chars.forEach((char) => {
        const charRect = char.getBoundingClientRect()
        const charCenter = charRect.left + charRect.width / 2 - rect.left
        const distance = Math.abs(mouseX - charCenter)
        const radius = 140
        const influence = Math.max(0, 1 - distance / radius)
        const smooth = influence * influence * (3 - 2 * influence) // smoothstep

        // Gentle lift + subtle brightness — like breath passing over sand
        const yOffset = -6 * smooth
        const brightness = 1 + 0.15 * smooth
        char.style.transform = `translateY(${yOffset}px)`
        char.style.opacity = brightness
      })
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (!ref.current) return
    const chars = ref.current.querySelectorAll('[data-wind]')
    chars.forEach((char) => {
      char.style.transform = 'translateY(0px)'
      char.style.opacity = ''
    })
  }, [])

  return (
    <Tag
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ overflow: 'visible', lineHeight: 1.35 }}
    >
      {text.split('').map((char, i) => (
        <span
          key={i}
          data-wind
          style={{
            display: 'inline-block',
            willChange: 'transform, opacity',
            transition: 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
            verticalAlign: 'baseline',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </Tag>
  )
}
