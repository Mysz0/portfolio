import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import WindText from './WindText'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <header ref={ref} className="relative z-10 min-h-[90vh] flex items-center justify-center">
      <motion.div
        style={{ y, opacity }}
        className="w-full max-w-5xl mx-auto px-6 sm:px-8 text-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <span className="text-[11px] font-light tracking-[0.5em] text-[var(--text-muted)]">
            枯山水
          </span>
        </motion.div>

        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <WindText
            as="h1"
            className="text-7xl sm:text-9xl lg:text-[11rem] heading-accent"
          >
            Myszo.
          </WindText>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
          className="text-lg sm:text-xl text-[var(--text-body)] mb-20 leading-relaxed max-w-md mx-auto font-light"
        >
          Crafting quiet interfaces where every element
          earns its place — like stones in a garden.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="flex items-center justify-center gap-8 flex-wrap"
        >
          <a href="#projects" className="btn-primary">
            View Works
          </a>
          <a href="#contact" className="btn-secondary">
            Say Hello
          </a>
        </motion.div>
      </motion.div>
    </header>
  )
}
