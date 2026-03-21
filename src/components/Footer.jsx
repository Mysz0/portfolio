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
      className="py-16 text-center max-w-5xl mx-auto px-6 sm:px-8"
      style={{ borderTop: '1px solid var(--border)' }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-center gap-6 mb-6">
        {links.map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith('mailto') ? undefined : '_blank'}
            rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
            className="p-3 glass-card rounded-xl transition-all duration-300 hover:scale-110 hover:border-[var(--accent)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon size={18} />
          </a>
        ))}
      </div>
      <p className="text-sm text-[var(--text-muted)]">
        © {new Date().getFullYear()} Myszo — Built with React + Vite
      </p>
    </motion.footer>
  )
}
