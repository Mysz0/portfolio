import { motion } from 'framer-motion'
import { Keyboard } from 'lucide-react'

const keyboards = [
  {
    title: 'Zoom65 v2',
    desc: 'Premium 65% custom keyboard with smooth linear switches and stunning wave-inspired keycaps.',
    specs: ['Akko V3 Pro Yellow', 'Durock V2 Stabs', 'Kanagawa Keycaps (XVX)'],
    year: '2026',
    color: '#8B5CF6',
  },
  {
    title: 'Magnum65',
    desc: 'Gasket-mount 65% build featuring ultra-smooth linear switches and premium stabilizers.',
    specs: ['Gateron Smoothie', 'Typeplus x YIKB Stabs', 'PBTfans Origami Keycaps'],
    year: '2025',
    color: '#E8915A',
  },
  {
    title: 'Dusk67',
    desc: 'Sleek wooden keyboard with a 67-key layout featuring boutique switches and top-tier stabilizers.',
    specs: ['Siliworks x Napworks Nap', 'Typeplus x YIKB Stabs', 'PBTfans Classic Keycaps'],
    year: '2025',
    color: '#C4A0E5',
  },
]

export default function Keyboards() {
  return (
    <section id="keyboards" className="py-20 sm:py-32 max-w-5xl mx-auto px-6 sm:px-8">
      {/* Header */}
      <motion.div
        className="flex items-end justify-between gap-4 mb-12 flex-wrap"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3">Hobby</p>
          <h2 className="text-4xl sm:text-5xl font-black heading-accent">Keyboards</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 glass-card rounded-xl">
          <Keyboard size={16} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Custom Builds
          </span>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {keyboards.map((kb, idx) => (
          <motion.article
            key={kb.title}
            className="glass-card p-7 flex flex-col relative overflow-hidden group"
            style={{
              borderColor: `${kb.color}30`,
              backgroundImage: `linear-gradient(145deg, ${kb.color}08, transparent 50%)`,
            }}
            initial={{ opacity: 0, y: 40, rotateX: 8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-black"
                style={{ backgroundColor: `${kb.color}15`, color: kb.color }}
              >
                {kb.year}
              </div>
              <Keyboard size={18} style={{ color: kb.color, opacity: 0.4 }} />
            </div>

            <h3 className="text-xl font-black mb-2 text-[var(--text)]">{kb.title}</h3>
            <p className="text-[var(--text-muted)] mb-6 leading-relaxed text-sm">{kb.desc}</p>

            <div className="space-y-2 mt-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Specs</div>
              {kb.specs.map((spec) => (
                <div
                  key={spec}
                  className="text-xs font-medium px-3 py-2 rounded-md transition-transform duration-300 hover:translate-x-1"
                  style={{
                    backgroundColor: `${kb.color}06`,
                    borderLeft: `2px solid ${kb.color}40`,
                    color: 'var(--text-body)',
                  }}
                >
                  {spec}
                </div>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
