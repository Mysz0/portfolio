import { useRef, Fragment } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * ScrollRevealText — Characters appear one by one as you scroll past,
 * like ink bleeding through paper. Each character has its own opacity
 * mapped to a slice of the scroll range.
 *
 * Words are grouped in nowrap spans so line breaks only happen between
 * words, never mid-word.
 */
export default function ScrollRevealText({ text, className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.35'],
  })

  const totalChars = text.length
  const words = text.split(' ')

  let charIndex = 0

  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
    >
      {words.map((word, wIdx) => {
        const startIdx = charIndex
        charIndex += word.length + 1 // +1 for the space

        return (
          <Fragment key={wIdx}>
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
              {word.split('').map((char, cIdx) => (
                <ScrollChar
                  key={cIdx}
                  char={char}
                  index={startIdx + cIdx}
                  total={totalChars}
                  progress={scrollYProgress}
                />
              ))}
            </span>
            {wIdx < words.length - 1 && ' '}
          </Fragment>
        )
      })}
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
      {char}
    </motion.span>
  )
}
