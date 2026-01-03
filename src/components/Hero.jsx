import React from 'react'

export default function Hero() {
  return (
    <header className="py-20 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">Your Name</h1>
        <p className="text-lg sm:text-xl text-slate-300 mb-8">Sleek modern frontend developer. I build beautiful, accessible interfaces.</p>
        <div className="flex items-center justify-center gap-4">
          <a href="#contact" className="px-6 py-3 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white shadow">Contact Me</a>
          <a href="#projects" className="px-6 py-3 rounded-md border border-slate-700 text-slate-100 hover:bg-white/5">See Projects</a>
        </div>
      </div>
    </header>
  )
}
