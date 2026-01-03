import React, { useState, useLayoutEffect, useEffect } from 'react'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Setup from './components/Setup'
import Keyboards from './components/Keyboards'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme-mode') === 'dark' || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--theme-map-bg)] text-[var(--theme-text-title)] transition-colors duration-700 relative">
      <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
      <div className="max-w-5xl mx-auto px-5 py-3">
        <div className="scroll-reveal scroll-slide-up">
          <Hero />
        </div>
        <div className="scroll-reveal scroll-slide-left">
          <About />
        </div>
        <Projects />
        <Setup />
        <Keyboards />
        <div className="scroll-reveal scroll-slide-up">
          <Contact />
        </div>
        <div className="scroll-reveal scroll-slide-left">
          <Footer />
        </div>
      </div>
    </div>
  )
}
