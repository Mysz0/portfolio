import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const mailto = `mailto:dev@urabanradar.app?subject=${encodeURIComponent('Portfolio contact from ' + formData.name)}&body=${encodeURIComponent(`From: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`
    window.location.href = mailto
  }

  return (
    <section id="contact" className="py-20 sm:py-32 max-w-5xl mx-auto px-6 sm:px-8">
      <motion.div
        className="glass-card p-8 sm:p-14 relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Decorative accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, var(--accent), transparent 70%)' }}
        />

        <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3">Get in Touch</p>
        <h2 className="text-3xl sm:text-5xl font-black mb-4 heading-accent">
          Let's Connect
        </h2>
        <p className="text-[var(--text-body)] mb-10 text-lg max-w-xl">
          Have a project in mind? Send me a message and I'll get back to you.
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="p-4 rounded-xl"
            placeholder="Name"
            type="text"
            required
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="p-4 rounded-xl"
            placeholder="Email"
            type="email"
            required
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="p-4 rounded-xl sm:col-span-2 resize-none"
            rows="4"
            placeholder="Your message..."
            required
          />
          <motion.button
            type="submit"
            className="sm:col-span-2 px-6 py-4 font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-colors duration-300"
            style={{ backgroundColor: 'var(--accent)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send size={18} />
            Send Message
          </motion.button>
        </form>
      </motion.div>
    </section>
  )
}
