import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * ScrollRevealText — Characters appear one by one as you scroll past,
 * like ink bleeding through paper. Each character has its own opacity
 * mapped to a slice of the scroll range.
 */
export default function ScrollRevealText({ text, className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.35'],
  })

  const chars = text.split('')

  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
    >
      {chars.map((char, i) => (
        <ScrollChar
          key={i}
          char={char}
          index={i}
          total={chars.length}
          progress={scrollYProgress}
        />
      ))}
    </span>
  )
}

function ScrollChar({ char, index, total, progress }) {
  // Each character gets a slice of the scroll range
  // with overlap so the reveal feels fluid, not stepped
  const start = index / (total + 8)
  const end = (index + 8) / (total + 8)

  const opacity = useTransform(progress, [start, end], [0.06, 0.5])

  return (
    <motion.span
      style={{ opacity }}
      className="inline-block"
      aria-hidden="true"
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  )
}
