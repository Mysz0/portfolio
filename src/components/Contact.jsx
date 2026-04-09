import { useState, useRef } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import WindText from './WindText'

/* Zen input with animated focus underline */
function ZenInput({ label, name, value, onChange, placeholder, type = 'text', required = false, as = 'input' }) {
  const [focused, setFocused] = useState(false)
  const Tag = as

  return (
    <div className="space-y-2 group relative">
      <label
        className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-700 ${
          focused ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <Tag
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          type={as === 'input' ? type : undefined}
          rows={as === 'textarea' ? 4 : undefined}
          className="w-full border-b border-t-0 border-x-0 rounded-none px-0 py-4 focus:border-transparent bg-transparent transition-colors duration-500 resize-none outline-none"
          required={required}
        />
        {/* Static border underneath */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border)]"
        />
        {/* Animated accent line that expands from center on focus */}
        <motion.div
          className="absolute bottom-0 left-1/2 h-px bg-[var(--accent)]"
          animate={{
            width: focused ? '100%' : '0%',
            marginLeft: focused ? '-50%' : '0%',
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ originX: 0.5 }}
        />
      </div>
    </div>
  )
}

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const buttonSpringY = useSpring(0, { stiffness: 300, damping: 20 })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const mailto = `mailto:dev@hyruki.cc?subject=${encodeURIComponent('Inquiry from ' + formData.name)}&body=${encodeURIComponent(`From: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`
    window.location.href = mailto
  }

  return (
    <section id="contact" className="relative py-24 sm:py-48 max-w-4xl mx-auto px-6 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)] mb-6 breathe-ambient" style={{ animationDelay: '-4s' }}>Connection</p>
          <WindText className="text-5xl sm:text-7xl heading-accent mb-8">
            Begin a Dialogue
          </WindText>
          <p className="text-[var(--text-body)] text-lg max-w-lg mx-auto font-light leading-relaxed">
            Every good garden was once a conversation
            between two people. Let's start ours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-12 max-w-2xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12">
            <ZenInput
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="How should I address you?"
              required
            />
            <ZenInput
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Where should I reply?"
              type="email"
              required
            />
          </div>
          <ZenInput
            label="Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="What are we building together?"
            as="textarea"
            required
          />
          <div className="pt-8">
            <motion.button
              type="submit"
              className="btn-primary w-full sm:w-auto"
              whileHover={{ y: -2 }}
              whileTap={{ y: 1, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <span>Send Message</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </section>
  )
}
