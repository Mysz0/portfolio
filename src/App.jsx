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
    root.style.colorScheme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');

    const baseColor =
      getComputedStyle(root).getPropertyValue('--theme-safe-area').trim() ||
      (isDark ? '#0b1220' : '#f8fafc');

    const setMetaColor = (color) => {
      const head = document.head;
      if (!head) return;
      head.querySelectorAll('meta[name="theme-color"]').forEach((el) => el.remove());
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', color);
      head.appendChild(meta);

      const statusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (statusBar) {
        statusBar.setAttribute('content', isDark ? 'black-translucent' : 'default');
      }
    };

    // Immediate paint-safe color for Safari/iOS UI chrome
    document.documentElement.style.backgroundColor = baseColor;
    document.body.style.backgroundColor = baseColor;
    setMetaColor(baseColor);

    // Second pass after CSS vars settle (Safari needs this)
    requestAnimationFrame(() => {
      const cssColor =
        getComputedStyle(root).getPropertyValue('--theme-safe-area').trim() || baseColor;
      document.documentElement.style.backgroundColor = cssColor;
      document.body.style.backgroundColor = cssColor;
      setMetaColor(cssColor);
      // force repaint hint
      void document.body.offsetHeight;
    });
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
        <div id="hero" className="scroll-reveal scroll-slide-up">
          <Hero />
        </div>
        <About />
        <Projects />
        <Setup />
        <Keyboards />
        <Contact />
        <div className="scroll-reveal scroll-slide-left">
          <Footer />
        </div>
      </div>
    </div>
  )
}
