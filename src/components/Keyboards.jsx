import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import WindText from './WindText'

const keyboards = [
  {
    title: 'Zoom65 v2',
    desc: 'Custom linear build with a focus on acoustic precision and fluid response.',
    specs: ['Akko V3 Pro Yellow', 'Durock V2', 'Kanagawa PBT'],
    year: '2026',
  },
  {
    title: 'Magnum65',
    desc: 'Gasket-mounted industrial cornerstone with ultra-smooth transitions.',
    specs: ['Gateron Smoothie', 'Typeplus', 'PBTfans Origami'],
    year: '2025',
  },
  {
    title: 'Dusk67',
    desc: 'Organic wooden enclosure with boutique tactile feedback.',
    specs: ['Napworks Tactile', 'YIKB Stabs', 'PBTfans Classic'],
    year: '2025',
  },
]

function TiltCard({ children, className }) {
  const ref = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-2px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0px)'
  }, [])

  return (
    <article
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      {children}
    </article>
  )
}

export default function Keyboards() {
  return (
    <section id="keyboards" className="py-24 sm:py-48 max-w-5xl mx-auto px-6 sm:px-8">
      <div className="max-w-2xl mb-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)] mb-6">Touch</p>
        <WindText className="text-5xl sm:text-7xl heading-accent mb-8">
          Instruments
        </WindText>
        <p className="text-[var(--text-body)] text-lg font-light leading-relaxed">
          The keyboard is where thought meets matter.
          Each build is a study in sound, weight, and feel.
        </p>
      </div>

      <div className="grid gap-1 lg:grid-cols-3 border-t border-[var(--border)]">
        {keyboards.map((kb, idx) => (
          <motion.div
            key={kb.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: idx * 0.1 }}
          >
            <TiltCard className="group p-10 flex flex-col border-b lg:border-b-0 lg:border-r border-[var(--border)] last:border-r-0 hover:bg-[var(--accent-soft)] transition-all duration-700 h-full">
              <div className="flex justify-between items-start mb-12">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors duration-500">
                  Build {kb.year}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[var(--text)] mb-4 group-hover:translate-x-1 transition-transform duration-500">{kb.title}</h3>
              <p className="text-[var(--text-body)] mb-12 text-base leading-relaxed italic">
                {kb.desc}
              </p>

              <div className="mt-auto space-y-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] opacity-40 group-hover:opacity-100 transition-opacity duration-500">Configuration</div>
                <div className="flex flex-wrap gap-2">
                  {kb.specs.map((spec) => (
                    <span key={spec} className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-2 py-1 border border-[var(--border)] group-hover:border-[var(--border-hover)] transition-colors duration-500">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
