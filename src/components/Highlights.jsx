import React from 'react'
import { Sparkles, Gauge, Layers } from 'lucide-react'

const cards = [
  {
    icon: Sparkles,
    label: 'Interfaces Shipped',
    value: '25+',
    note: 'Product and marketing experiences with glass + theme systems'
  },
  {
    icon: Gauge,
    label: 'Performance',
    value: '95+',
    note: 'Lighthouse scores on shipped pages across desktop & mobile'
  },
  {
    icon: Layers,
    label: 'Themes Crafted',
    value: '10',
    note: 'Dynamic palettes, gradients, and motion systems (Aurora, Sakura, Winter...)'
  }
]

export default function Highlights() {
  return (
    <section className="py-12 sm:py-16">
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article 
              key={card.label}
              className="smart-glass p-5 sm:p-6 flex flex-col gap-2"
              style={{ borderRadius: '16px' }}
            >
              <div className="flex items-center gap-3 text-[rgb(var(--theme-primary))]">
                <Icon size={18} />
                <span className="text-xs font-black uppercase tracking-widest text-[var(--theme-text-muted)]">{card.label}</span>
              </div>
              <div className="text-3xl font-black text-[var(--theme-text-title)]">{card.value}</div>
              <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed">{card.note}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
