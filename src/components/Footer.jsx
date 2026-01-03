import React from 'react'

export default function Footer() {
  return (
    <footer className="py-8 text-sm text-slate-400 text-center">
      <div className="max-w-4xl mx-auto">© {new Date().getFullYear()} Your Name — Built with React + Vite</div>
    </footer>
  )
}
