import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import WindText from './WindText'

export default function About() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.3'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [40, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      ref={ref}
      id="about"
      className="py-24 sm:py-48 max-w-5xl mx-auto px-6 sm:px-8"
    >
      <motion.div style={{ y, opacity }}>
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)] mb-6">Philosophy</p>
          <WindText className="text-5xl sm:text-7xl heading-accent mb-14">
            The Garden
          </WindText>

          <div className="space-y-14">
            <p className="text-[var(--text-body)] text-xl sm:text-2xl font-light leading-relaxed italic border-l border-[var(--accent)] pl-10">
              A zen garden doesn't demand your attention — it
              earns it through restraint. I build interfaces the same way.
            </p>

            <div className="grid sm:grid-cols-2 gap-16 text-[var(--text-body)] text-lg leading-relaxed">
              <p>
                There is a Japanese concept — <em>ma</em>, the purposeful void.
                The silence between notes that gives music its shape.
                I pursue that same emptiness in code: removing
                until only the essential remains.
              </p>
              <p>
                Performance is not a metric to me, it is a feeling.
                When an interface responds before you finish thinking,
                when a transition feels like breathing — that is
                the craft I care about.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[var(--border)] pt-12">
          {[
            { label: 'Runtime', val: 'Bun / Node' },
            { label: 'Interface', val: 'React' },
            { label: 'Language', val: 'TypeScript' },
            { label: 'Atmosphere', val: 'Three.js / GLSL' },
          ].map((s) => (
            <div key={s.label} className="group">
              <div className="text-[10px] font-light uppercase tracking-widest text-[var(--text-muted)] mb-2 group-hover:text-[var(--accent)] transition-colors duration-500">{s.label}</div>
              <div className="text-sm font-bold uppercase tracking-tight text-[var(--text)] group-hover:translate-x-1 transition-transform duration-500">{s.val}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
