import React from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ isDark, setIsDark }) {
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="fixed top-6 right-6 p-3 smart-glass z-50 transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        color: 'rgb(var(--theme-primary))',
        borderRadius: '12px',
      }}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
