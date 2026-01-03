import React from 'react'

export default function Footer() {
  return (
    <footer className="py-12 text-center text-[var(--theme-text-muted)] text-sm" style={{
      borderTop: '1px solid var(--theme-border)',
      animation: 'fadeInUp 0.8s ease-out 0.4s backwards'
    }}>
      <div className="max-w-4xl mx-auto space-y-4">
        <p>
          © {new Date().getFullYear()} Myszo — Built with React + Vite
        </p>
        <div className="flex items-center justify-center gap-8 text-xs">
          <a href="https://github.com/Mysz0" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--theme-primary))] transition-colors">GitHub</a>
          <a href="https://x.com/Myszo0" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--theme-primary))] transition-colors">Twitter</a>
          <a href="mailto:dev@urabanradar.app" className="hover:text-[rgb(var(--theme-primary))] transition-colors">Email</a>
        </div>
      </div>
    </footer>
  )
}
