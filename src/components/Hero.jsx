import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import WindText from './WindText'
import KanjiStrokes from './KanjiStrokes'

// Split subtitle into words for word-by-word breathing
const SUBTITLE_WORDS = 'Crafting quiet interfaces where every element earns its place — like stones in a garden.'.split(' ')

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  /* Shared rhythm clock — both KanjiStrokes and WindText
     read from this to stay synchronized.
     origin is set at render time so it's available before effects. */
  const rhythmRef = useRef({ origin: performance.now(), cycle: 33 })

  return (
    <header ref={ref} className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center">
      <motion.div
        style={{ y, opacity }}
        className="w-full max-w-5xl mx-auto px-6 sm:px-8 text-center"
      >
        {/* Kanji label — stroke-by-stroke calligraphy cycle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <KanjiStrokes
            rhythmRef={rhythmRef}
            className="text-[var(--text-muted)]"
          />
        </motion.div>

        {/* Main title — WindText with living ink + spring orbits */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <WindText
            as="h1"
            className="text-7xl sm:text-9xl lg:text-[11rem] heading-accent"
            alive
            rhythmRef={rhythmRef}
          >
            Hyruki.
          </WindText>
        </motion.div>

        {/* Subtitle — word-by-word autonomous breathing */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
          className="text-lg sm:text-xl text-[var(--text-body)] mb-20 leading-relaxed max-w-md mx-auto font-light"
          aria-label="Crafting quiet interfaces where every element earns its place — like stones in a garden."
        >
          {SUBTITLE_WORDS.map((word, i) => (
            <span
              key={i}
              className="word-breathe"
              style={{
                '--word-duration': `${6 + (i * 1.3) % 4}s`,
                '--word-delay': `${-(i * 1.1 + i * i * 0.2)}s`,
                '--word-base': `${0.52 + (i % 4) * 0.06}`,
                '--word-peak': `${0.82 + (i % 3) * 0.06}`,
                '--word-drift': `${-0.5 - (i % 3) * 0.4}px`,
                marginRight: '0.3em',
              }}
            >
              {word}
            </span>
          ))}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="flex items-center justify-center gap-8 flex-wrap"
        >
          <motion.a
            href="#projects"
            className="btn-primary"
            whileHover={{ y: -2 }}
            whileTap={{ y: 1, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <span>View Works</span>
          </motion.a>
          <motion.a
            href="#contact"
            className="btn-secondary"
            whileHover={{ y: -2 }}
            whileTap={{ y: 1, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            Say Hello
          </motion.a>
        </motion.div>
      </motion.div>
    </header>
  )
}
