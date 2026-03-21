import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Code, Palette, Zap } from 'lucide-react'

const skills = [
  { icon: Code, label: 'Development', desc: 'React, Next.js, TypeScript, Tailwind CSS', color: '#8B5CF6' },
  { icon: Palette, label: 'Design', desc: 'UI/UX, Translucent effects, Theme systems, Animations', color: '#E8915A' },
  { icon: Zap, label: 'Performance', desc: 'Optimization, Firebase, Supabase, Vercel', color: '#7BA886' },
]

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
      className="py-20 sm:py-32 max-w-5xl mx-auto px-6 sm:px-8"
    >
      <motion.div className="glass-card p-8 sm:p-12" style={{ y, opacity }}>
        <h2 className="text-3xl sm:text-5xl font-black mb-8 heading-accent">
          About Me
        </h2>
        <div className="space-y-5 mb-12">
          <p className="text-[var(--text-body)] leading-relaxed text-lg">
            I'm a passionate frontend developer with expertise in building responsive, accessible, and performant web applications. With a focus on modern technologies and best practices, I create digital experiences that users love.
          </p>
          <p className="text-[var(--text-body)] leading-relaxed text-lg">
            My toolkit includes React, Next.js, TypeScript, and Tailwind CSS. I specialize in dynamic theming systems, translucent effects, and smooth animations that bring interfaces to life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {skills.map((skill, idx) => {
            const Icon = skill.icon
            return (
              <motion.div
                key={idx}
                className="p-5 rounded-xl border transition-[border-color] duration-500 hover:scale-[1.03] cursor-default"
                style={{
                  backgroundColor: `${skill.color}0a`,
                  borderColor: `${skill.color}25`,
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ borderColor: `${skill.color}55` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${skill.color}15` }}>
                    <Icon size={20} style={{ color: skill.color }} />
                  </div>
                  <h3 className="font-bold text-[var(--text)]">{skill.label}</h3>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{skill.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
