import { useState } from 'react'
import { motion } from 'framer-motion'
import WindText from './WindText'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const mailto = `mailto:dev@urabanradar.app?subject=${encodeURIComponent('Inquiry from ' + formData.name)}&body=${encodeURIComponent(`From: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`
    window.location.href = mailto
  }

  return (
    <section id="contact" className="py-24 sm:py-48 max-w-4xl mx-auto px-6 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)] mb-6">Connection</p>
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
            <div className="space-y-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors duration-500">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="How should I address you?"
                className="w-full border-b border-t-0 border-x-0 rounded-none px-0 py-4 focus:border-[var(--accent)] bg-transparent transition-colors duration-500"
                required
              />
            </div>
            <div className="space-y-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors duration-500">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Where should I reply?"
                type="email"
                className="w-full border-b border-t-0 border-x-0 rounded-none px-0 py-4 focus:border-[var(--accent)] bg-transparent transition-colors duration-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2 group">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors duration-500">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="What are we building together?"
              rows="4"
              className="w-full border-b border-t-0 border-x-0 rounded-none px-0 py-4 focus:border-[var(--accent)] bg-transparent resize-none transition-colors duration-500"
              required
            />
          </div>
          <div className="pt-8">
            <button type="submit" className="btn-primary w-full sm:w-auto">
              Send Message
            </button>
          </div>
        </form>
      </motion.div>
    </section>
  )
}
