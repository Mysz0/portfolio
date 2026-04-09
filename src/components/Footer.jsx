import { motion, useSpring, useMotionValue } from 'framer-motion'
import { Github, Twitter, Mail } from 'lucide-react'
import { useCallback, useRef } from 'react'

const links = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/Mysz0' },
  { icon: Twitter, label: 'Twitter', href: 'https://x.com/Myszo0' },
  { icon: Mail, label: 'Email', href: 'mailto:dev@hyruki.cc' },
]

/* Each icon breathes independently + has spring-physics hover */
function BreathingIcon({ icon: Icon, label, href, delay }) {
  const ref = useRef(null)
  const y = useSpring(0, { stiffness: 300, damping: 20, mass: 0.4 })
  const scale = useSpring(1, { stiffness: 400, damping: 15 })

  const handleHover = useCallback(() => {
    y.set(-4)
    scale.set(1.2)
  }, [y, scale])

  const handleLeave = useCallback(() => {
    y.set(0)
    scale.set(1)
  }, [y, scale])

  return (
    <motion.a
      ref={ref}
      href={href}
      target={href.startsWith('mailto') ? undefined : '_blank'}
      rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
      className="group relative transition-colors duration-500"
      style={{ color: 'var(--text-muted)', y, scale }}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      <motion.div
        className="breathe"
        style={{
          animationDelay: `${delay}s`,
          '--breathe-distance': '-2px',
        }}
      >
        <Icon size={20} className="group-hover:text-[var(--accent)] transition-colors duration-500" />
      </motion.div>
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">
        {label}
      </span>
    </motion.a>
  )
}

export default function Footer() {
  return (
    <motion.footer
      className="py-32 text-center max-w-5xl mx-auto px-6 sm:px-8 border-t border-[var(--border)]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5 }}
    >
      <div className="flex items-center justify-center gap-10 mb-12">
        {links.map(({ icon, label, href }, idx) => (
          <BreathingIcon
            key={label}
            icon={icon}
            label={label}
            href={href}
            delay={-idx * 2.5}
          />
        ))}
      </div>
      <p
        className="text-[10px] font-light tracking-[0.4em] text-[var(--text-muted)] breathe-ambient"
        style={{ animationDelay: '-7s', '--breathe-base-opacity': '0.5', '--breathe-peak-opacity': '0.7' }}
      >
        &copy; {new Date().getFullYear()} &mdash; Tended with care
      </p>
    </motion.footer>
  )
}
