import { motion } from 'framer-motion'
import WindText from './WindText'

const stack = [
  { name: 'React', role: 'The Structure', tech: 'Reactive composition — building interfaces that respond before you finish thinking.' },
  { name: 'Three.js', role: 'The Atmosphere', tech: 'GPU-driven depth and light. The garden needs weather.' },
  { name: 'TypeScript', role: 'The Discipline', tech: 'Strict types as a form of respect for the code that follows.' },
  { name: 'Next.js', role: 'The Foundation', tech: 'Server and client woven together. Performant by default.' },
  { name: 'Tailwind', role: 'The Grid', tech: 'Utility-first spatial design — precision without ceremony.' },
  { name: 'Bun', role: 'The Current', tech: 'A fast runtime underneath everything. Speed as a baseline.' },
]

export default function Setup() {
  return (
    <section id="setup" className="py-24 sm:py-48 max-w-5xl mx-auto px-6 sm:px-8">
      <div className="max-w-2xl mb-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)] mb-6">Craft</p>
        <WindText className="text-5xl sm:text-7xl heading-accent mb-8">
          The Toolkit
        </WindText>
        <p className="text-[var(--text-body)] text-lg font-light leading-relaxed">
          A gardener is known by their tools. Each one chosen
          for what it removes as much as what it builds.
        </p>
      </div>

      <div className="grid gap-1 border-t border-[var(--border)]">
        {stack.map((item, idx) => (
          <motion.div
            key={item.name}
            className="group grid md:grid-cols-12 gap-8 items-center py-10 border-b border-[var(--border)] hover:bg-[var(--accent-soft)] transition-colors duration-500 px-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.05 }}
          >
            <div className="md:col-span-3 text-sm font-bold uppercase tracking-widest text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-500">
              {item.name}
            </div>
            <div className="md:col-span-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] opacity-40 group-hover:opacity-100 transition-opacity duration-500">
              {item.role}
            </div>
            <div className="md:col-span-6 text-base text-[var(--text-body)] leading-relaxed group-hover:text-[var(--text)] transition-colors duration-500">
              {item.tech}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
