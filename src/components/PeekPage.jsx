import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Github, Copy, Check } from 'lucide-react'

/* ── Peek page (hyruki.cc/peek) ─────────────────────────────
   Download page for Peek. Same palette, type and buttons as the
   main site, no 3D: it should load instantly.                 */

const REPO = 'https://github.com/Mysz0/peek'
const DOWNLOAD = `${REPO}/releases/latest/download/Peek.zip`
const UNQUARANTINE = 'xattr -dr com.apple.quarantine /Applications/Peek.app'

const features = [
  {
    title: 'Now playing',
    desc: 'Artwork, controls and a live spectrogram. Works with any app that plays audio, or connects straight to Spotify or Apple Music.',
  },
  {
    title: 'Calendar',
    desc: 'Upcoming events from the calendars you pick, a hover away.',
  },
  {
    title: 'File shelf',
    desc: 'Drop files on the notch to keep them handy, then drag them out again.',
  },
  {
    title: 'Gestures',
    desc: 'Click the notch to open it. Swipe left or right to skip tracks, up or down to open or close.',
  },
  {
    title: 'AI assistant',
    desc: 'Optional. Chat from the notch with push-to-talk, using a small model on your Mac or any OpenAI-compatible provider.',
  },
  {
    title: 'Vessel',
    desc: 'Experimental. A Bluetooth desk companion the assistant can travel to, with a simulation mode to try it without hardware.',
  },
]

const ease = [0.22, 1, 0.36, 1]
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
})

function CopyCommand() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(UNQUARANTINE)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be blocked; the command is still selectable
    }
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] pl-4 pr-2 py-2 font-mono text-[13px] text-[var(--text-body)]">
      <code className="flex-1 overflow-x-auto whitespace-nowrap py-1">{UNQUARANTINE}</code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200"
        aria-label={copied ? 'Copied' : 'Copy command'}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  )
}

export default function PeekPage() {
  return (
    <div
      className="min-h-screen text-[var(--text)] selection:bg-[var(--accent)] selection:text-white"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <nav className="max-w-4xl mx-auto px-6 sm:px-8 pt-8 flex items-center justify-between text-sm">
        <a href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200">
          <ArrowLeft size={15} /> Hyruki
        </a>
        <a href={REPO} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200">
          <Github size={15} /> Source
        </a>
      </nav>

      <main className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Hero */}
        <header className="pt-20 sm:pt-28 pb-20 text-center flex flex-col items-center">
          <motion.img
            {...rise(0)}
            src="/peek-icon.png"
            alt=""
            width="112"
            height="112"
            className="mb-10 rounded-[26px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          />
          <motion.p {...rise(0.05)} className="eyebrow mb-5"><span lang="ja">覗</span>macOS app</motion.p>
          <motion.h1 {...rise(0.1)} className="heading-accent text-7xl sm:text-8xl mb-6">Peek</motion.h1>
          <motion.p {...rise(0.15)} className="text-lg sm:text-xl text-[var(--text-body)] font-light leading-relaxed max-w-md mb-12">
            Turns the MacBook notch into a Dynamic Island. Music, calendar and a file shelf, right where your eyes already are.
          </motion.p>
          <motion.div {...rise(0.2)} className="flex flex-wrap items-center justify-center gap-4">
            <a href={DOWNLOAD} className="btn-primary">
              <span className="inline-flex items-center gap-2"><Download size={16} /> Download</span>
            </a>
            <a href={REPO} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <Github size={16} /> GitHub
            </a>
          </motion.div>
          <motion.p {...rise(0.25)} className="mt-6 text-sm text-[var(--text-muted)]">
            Free · macOS 13 or later · MacBooks with a notch · Apple Silicon and Intel
          </motion.p>
        </header>

        {/* Features */}
        <section className="py-16 border-t border-[var(--border)]">
          <p className="eyebrow mb-10"><span lang="ja">作</span>What it does</p>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
            {features.map((f) => (
              <div key={f.title}>
                <h2 className="text-lg font-semibold text-[var(--text)] mb-2">{f.title}</h2>
                <p className="text-[var(--text-body)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Install */}
        <section className="py-16 border-t border-[var(--border)]">
          <p className="eyebrow mb-10"><span lang="ja">鍵</span>Install</p>
          <ol className="space-y-5 text-[var(--text-body)] leading-relaxed max-w-2xl">
            <li className="flex gap-4"><span className="font-mono text-[var(--accent)]">1</span><span>Download <a href={DOWNLOAD} className="text-[var(--text)] underline underline-offset-4 decoration-[var(--border-hover)] hover:decoration-[var(--text)]">Peek.zip</a> and unzip it.</span></li>
            <li className="flex gap-4"><span className="font-mono text-[var(--accent)]">2</span><span>Move <strong className="font-semibold text-[var(--text)]">Peek.app</strong> to your Applications folder and open it.</span></li>
            <li className="flex gap-4"><span className="font-mono text-[var(--accent)]">3</span><span>
              Peek isn't notarized by Apple yet, so macOS blocks the first launch. Open <strong className="font-semibold text-[var(--text)]">System Settings → Privacy &amp; Security</strong>, scroll down and click <strong className="font-semibold text-[var(--text)]">Open Anyway</strong>. Or run this once in Terminal:
            </span></li>
          </ol>
          <div className="mt-6 max-w-2xl sm:pl-8">
            <CopyCommand />
          </div>
          <p className="mt-8 max-w-2xl text-sm text-[var(--text-muted)] leading-relaxed">
            Peek asks for calendar access, automation access (to read what Spotify or Music is playing) and microphone access (only for push-to-talk). Each one is optional.
          </p>
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-6 sm:px-8 py-16 border-t border-[var(--border)] flex flex-wrap gap-4 justify-between text-sm text-[var(--text-muted)]">
        <a href="/" className="hover:text-[var(--text)] transition-colors duration-200">hyruki.cc</a>
        <a href={`${REPO}/releases`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors duration-200">All releases</a>
      </footer>
    </div>
  )
}
