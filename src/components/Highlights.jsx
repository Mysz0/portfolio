import { motion } from 'framer-motion'
import { Sparkles, Gauge, Layers } from 'lucide-react'

const cards = [
  {
    icon: Sparkles,
    label: 'Interfaces Shipped',
    value: '25+',
    note: 'Product and marketing experiences with glass + theme systems',
  },
  {
    icon: Gauge,
    label: 'Performance',
    value: '95+',
    note: 'Lighthouse scores on shipped pages across desktop & mobile',
  },
  {
    icon: Layers,
    label: 'Themes Crafted',
    value: '10',
    note: 'Dynamic palettes, gradients, and motion systems (Aurora, Sakura, Winter...)',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function Highlights() {
  return (
    <motion.section
      className="py-12 sm:py-16"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <motion.article
              key={card.label}
              variants={cardVariant}
              className="glass-card p-6 flex flex-col gap-3 group"
            >
              <div className="flex items-center gap-3" style={{ color: 'var(--accent)' }}>
                <Icon size={18} />
                <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                  {card.label}
                </span>
              </div>
              <div className="text-4xl font-black text-[var(--text)]">
                {card.value}
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{card.note}</p>
            </motion.article>
          )
        })}
      </div>
    </motion.section>
  )
}
