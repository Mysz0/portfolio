import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Github, Copy, Check, Hand, Vibrate, ChevronDown } from 'lucide-react'
import KnobDemo, { MODES, EFFECTS } from './KnobDemo'
import PrintingSoon from './PrintingSoon'
import { PACKS, PALETTES } from './fidgetSprites'

/* ── Fidget Knob page (hyruki.cc/fidget) ────────────────────
   A desk puck you twist. The centrepiece is KnobDemo, the real
   sprite renderer ported from the firmware, playable in place. */

const REPO = 'https://github.com/Mysz0/fidget-knob'
const README = `${REPO}#readme`

// What each gesture does per mode, straight from the firmware
const GESTURES = [
  { mode: 'Lights', twist: 'Brightness, or colour', tap: 'On / off', shake: 'Brightness ↔ colour' },
  { mode: 'Music', twist: 'Volume', tap: 'Play / pause', shake: 'Next track' },
  { mode: 'Timer', twist: 'Set minutes', tap: 'Start / pause', shake: 'Reset' },
  { mode: 'Dice', twist: 'D6, D20, D100, coin, yes/no', tap: 'Roll', shake: 'Roll' },
]
const moreModes = ['Clock', 'Photos', 'Notifications', 'Games', 'Ambient']

const parts = [
  ['Seeed Xiao ESP32-C3', 'Brain, WiFi, Bluetooth, battery charging'],
  ['Waveshare 1.28" round LCD (GC9A01)', 'The 240 × 240 screen'],
  ['MPU-6050', 'Twist, shake, tap and wake-on-motion'],
  ['3 V coin vibration motor', 'Haptic detents'],
  ['2N2222A, 1 kΩ, 1N4148', 'Motor driver'],
  ['400 mAh 1S LiPo', 'A few weeks per charge'],
]

const ease = [0.22, 1, 0.36, 1]
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease },
})
const reveal = (i = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, delay: i * 0.05, ease },
})

function CodeBlock({ lines }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lines.filter((l) => !l.startsWith('#')).join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be blocked; the text is still selectable
    }
  }
  return (
    <div className="relative rounded-xl border border-[var(--border)] bg-[var(--bg-card)] pl-4 pr-12 py-3 font-mono text-[13px] leading-relaxed text-[var(--text-body)]">
      <pre className="overflow-x-auto">
        {lines.map((l, i) => (
          <div key={i} className={l.startsWith('#') ? 'text-[var(--text-muted)]' : ''}>{l}</div>
        ))}
      </pre>
      <button type="button" onClick={copy} className="absolute top-2 right-2 rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200" aria-label={copied ? 'Copied' : 'Copy commands'}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  )
}

function Choice({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="fidget-choice"
    >
      {children}
    </button>
  )
}

function Picker({ label, value, onChange, options }) {
  return (
    <label className="fidget-picker">
      <span>{label}</span>
      <span className="fidget-select-wrap">
        <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
          {options.map((name, i) => <option key={name} value={i}>{name}</option>)}
        </select>
        <ChevronDown size={13} aria-hidden="true" />
      </span>
    </label>
  )
}

const Step = ({ n, title, children }) => (
  <motion.li {...reveal(n)} className="grid grid-cols-[2rem_1fr] gap-x-2 gap-y-3">
    <span className="font-mono text-[var(--accent)] pt-0.5">{n}</span>
    <div className="min-w-0 space-y-3">
      <h3 className="text-[var(--text)] font-semibold">{title}</h3>
      {children}
    </div>
  </motion.li>
)

const A = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--text)] underline underline-offset-4 decoration-[var(--border-hover)] hover:decoration-[var(--text)]">{children}</a>
)

export default function FidgetPage() {
  const [mode, setMode] = useState('lights')
  const [pack, setPack] = useState(0)
  const [palette, setPalette] = useState(1)
  const [effect, setEffect] = useState(0)
  const [paused, setPaused] = useState(false)
  const gestures = useRef(null)
  const demoRef = useRef(null)

  // Only draw while the knob is on screen
  useEffect(() => {
    const el = demoRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="min-h-screen text-[var(--text)] overflow-x-hidden selection:bg-[var(--accent)] selection:text-white" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <nav className="max-w-5xl mx-auto px-6 sm:px-8 pt-8 flex items-center justify-between text-sm">
        <a href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200">
          <ArrowLeft size={15} /> Hyruki
        </a>
        <a href={REPO} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200">
          <Github size={15} /> Source
        </a>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Hero */}
        <header className="pt-16 sm:pt-20 pb-12 text-center flex flex-col items-center">
          <motion.p {...rise(0)} className="eyebrow mb-5">ESP32 + iPhone</motion.p>
          <motion.h1 {...rise(0.06)} className="heading-accent text-7xl sm:text-9xl mb-6 leading-none">Fidget Knob</motion.h1>
          <motion.p {...rise(0.12)} className="text-lg sm:text-xl text-[var(--text-body)] font-light leading-relaxed max-w-lg mb-10">
            A puck you twist in your hand. It dims the lights, plays the music and keeps the time, on a round screen made of tiny sprites.
          </motion.p>
          <motion.div {...rise(0.18)} className="flex flex-wrap items-center justify-center gap-4">
            <a href="#build" className="btn-primary"><span>Build one</span></a>
            <a href={REPO} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <Github size={16} /> GitHub
            </a>
          </motion.div>
          <motion.p {...rise(0.24)} className="mt-6 text-sm text-[var(--text-muted)]">
            Open source · No touchscreen · Nothing leaves your home
          </motion.p>
        </header>

        {/* Live knob */}
        <motion.section {...rise(0.3)} className="fidget-demo pb-12" ref={demoRef}>
          <div className="fidget-model-stage">
            <KnobDemo mode={mode} pack={pack} palette={palette} effect={effect} onGesture={gestures} paused={paused} />
          </div>

          <div className="fidget-controls">
            <div className="fidget-mode-options" role="group" aria-label="Mode">
              {MODES.map((m) => (
                <Choice key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</Choice>
              ))}
            </div>
            <div className="fidget-look-options">
              <Picker label="Glyphs" value={pack} onChange={setPack} options={PACKS.map((p) => p.name)} />
              <Picker label="Palette" value={palette} onChange={setPalette} options={PALETTES.map((p) => p.name)} />
              <Picker label="Motion" value={effect} onChange={setEffect} options={EFFECTS} />
            </div>
            <div className="flex justify-center gap-3">
              <button type="button" onClick={() => gestures.current?.tap()} className="btn-secondary !min-w-0 !py-2 !px-5 text-sm">
                <Hand size={15} /> Tap
              </button>
              <button type="button" onClick={() => gestures.current?.shake()} className="btn-secondary !min-w-0 !py-2 !px-5 text-sm">
                <Vibrate size={15} /> Shake
              </button>
            </div>
            <p className="text-center text-xs text-[var(--text-muted)] leading-relaxed">
              Same glyph renderer as the firmware.
            </p>
          </div>
        </motion.section>

        {/* Modes */}
        <section className="py-16 border-t border-[var(--border)]">
          <p className="eyebrow mb-6">What it does</p>
          <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  <th className="font-medium py-3 pr-6 w-[22%]">Mode</th>
                  <th className="font-medium py-3 pr-6">Twist</th>
                  <th className="font-medium py-3 pr-6">Tap</th>
                  <th className="font-medium py-3">Shake</th>
                </tr>
              </thead>
              <tbody>
                {GESTURES.map((g, i) => (
                  <motion.tr key={g.mode} {...reveal(i)} className="border-t border-[var(--border)] align-baseline">
                    <td className="py-5 pr-6"><span className="heading-accent text-3xl text-[var(--text)]">{g.mode}</span></td>
                    <td className="py-5 pr-6 text-[var(--text-body)]">{g.twist}</td>
                    <td className="py-5 pr-6 text-[var(--text-body)]">{g.tap}</td>
                    <td className="py-5 text-[var(--text-body)]">{g.shake}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-8 max-w-2xl text-[var(--text-body)] leading-relaxed">
            Plus {moreModes.slice(0, -1).join(', ')} and {moreModes.at(-1)}. Lights works on its own over WiFi. Everything else talks Bluetooth to a small iPhone app, which picks the mode and the look. On Android or a computer it pairs as a plain media remote.
          </p>
        </section>

        {/* Parts */}
        <section className="py-16 border-t border-[var(--border)]">
          <p className="eyebrow mb-10">Parts</p>
          <ul className="max-w-2xl divide-y divide-[var(--border)]">
            {parts.map(([name, role], i) => (
              <motion.li key={name} {...reveal(i)} className="py-3.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6">
                <span className="text-[var(--text)]">{name}</span>
                <span className="text-sm text-[var(--text-muted)] sm:text-right">{role}</span>
              </motion.li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-sm text-[var(--text-muted)] leading-relaxed">
            No encoder, no moving parts. The twist comes from the gyroscope, so the whole body is the knob.
          </p>
        </section>

        {/* Build */}
        <section id="build" className="py-16 border-t border-[var(--border)] scroll-mt-8">
          <p className="eyebrow mb-10">Build one</p>
          <ol className="max-w-2xl space-y-10 text-[var(--text-body)] leading-relaxed">
            <Step n={1} title="Wire it up">
              <p>
                Everything hangs off the Xiao. Wire by the <span className="font-mono text-[var(--text)]">D0</span>–<span className="font-mono text-[var(--text)]">D10</span> labels on the board, not the GPIO numbers. The full table and the three pin traps that cost me evenings are in the <A href={`${README}`}>README</A>.
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Before anything else, flash <span className="font-mono">arduino/LcdTest</span>. If the screen shows colour, the rest is worth debugging.
              </p>
            </Step>
            <Step n={2} title="Configure the firmware">
              <p>You need <A href="https://platformio.org/install/cli">PlatformIO</A>. Copy the config and fill in your WiFi.</p>
              <CodeBlock lines={['git clone https://github.com/Mysz0/fidget-knob', 'cd fidget-knob/firmware', 'cp include/config.h.example include/config.h']} />
            </Step>
            <Step n={3} title="Pair with your hub">
              <p>Only for Lights. Press the button under the DIRIGERA hub when asked; the script writes the token and certificate into your config.</p>
              <CodeBlock lines={['pip3 install requests', 'python3 tools/pair.py <hub-ip>']} />
            </Step>
            <Step n={4} title="Flash it">
              <CodeBlock lines={['pio run -t upload', '# optional: unit tests on your computer', 'pio test -e native']} />
            </Step>
            <Step n={5} title="Install the iPhone app">
              <p>For Music, Timer and the rest. Needs Xcode, iOS 26 and a real iPhone, since the simulator has no Bluetooth. Set your own team under Signing.</p>
              <CodeBlock lines={['brew install xcodegen', 'cd ios && xcodegen', 'open FidgetKnob.xcodeproj']} />
            </Step>
            <Step n={6} title="Print the case">
              <p>Three parts, PLA or PETG, no supports. The files are on their way, see below.</p>
            </Step>
          </ol>
        </section>

        {/* 3D incoming */}
        <section className="py-16 border-t border-[var(--border)]">
          <p className="eyebrow mb-10">3D model</p>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-10 items-center">
            <motion.div {...reveal(0)}>
              <h2 className="heading-accent text-5xl sm:text-6xl mb-5 leading-none">Incoming.</h2>
              <p className="text-[var(--text-body)] leading-relaxed max-w-sm">
                The case is still being printed, measured and printed again. The files land here and in the repo once one fits right.
              </p>
            </motion.div>
            <motion.div {...reveal(1)}>
              <PrintingSoon />
            </motion.div>
          </div>
        </section>

        <section className="py-12 border-t border-[var(--border)]">
          <p className="eyebrow mb-4">Inspiration & authorship</p>
          <p className="max-w-2xl text-sm text-[var(--text-body)] leading-relaxed">
            The screen’s glyph animation was inspired by an Instagram video from{' '}
            <A href="https://www.instagram.com/kindofdevice_/">@kindofdevice_</A>
            {' '}by <A href="https://kindofstudio.co/">Kind of Studio</A>.
            {' '}The rest combines my own ideas with that inspiration. All project files and wiring are my own work.
          </p>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-6 sm:px-8 py-16 border-t border-[var(--border)] flex flex-wrap gap-4 justify-between text-sm text-[var(--text-muted)]">
        <a href="/" className="hover:text-[var(--text)] transition-colors duration-200">hyruki.cc</a>
        <a href={REPO} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors duration-200">Source on GitHub</a>
      </footer>
    </div>
  )
}
