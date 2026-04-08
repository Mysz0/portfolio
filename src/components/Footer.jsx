import { motion } from 'framer-motion'
import { Github, Twitter, Mail } from 'lucide-react'

const links = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/Mysz0' },
  { icon: Twitter, label: 'Twitter', href: 'https://x.com/Myszo0' },
  { icon: Mail, label: 'Email', href: 'mailto:dev@urabanradar.app' },
]

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
        {links.map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith('mailto') ? undefined : '_blank'}
            rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
            className="group relative transition-all duration-500"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon size={20} className="group-hover:text-[var(--accent)] group-hover:scale-125 transition-all duration-500" />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500">
              {label}
            </span>
          </a>
        ))}
      </div>
      <p className="text-[10px] font-light tracking-[0.4em] text-[var(--text-muted)]">
        © {new Date().getFullYear()} — Tended with care
      </p>
    </motion.footer>
  )
}
