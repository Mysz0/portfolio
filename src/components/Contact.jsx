import React, { useState } from 'react'

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
    <section
      id="contact"
      className="py-12 sm:py-16"
      style={{ animation: 'fadeInUp 0.8s ease-out both' }}
    >
      <div
        className="smart-glass p-8 sm:p-12 anim-soft-card"
        style={{ borderRadius: '20px' }}
      >
        <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{
          backgroundImage: 'linear-gradient(135deg, rgb(var(--theme-primary)), rgba(var(--theme-primary), 0.6))',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Let's Connect
        </h2>
        <p className="text-[var(--theme-text-body)] mb-8 text-lg">
          Have a project in mind? I'd love to hear about it. Send me a message and I'll get back to you as soon as possible.
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <input 
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="p-4 smart-glass text-[var(--theme-text-title)]" 
            placeholder="Name" 
            type="text"
            style={{ borderRadius: '12px' }}
            required
          />
          <input 
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="p-4 smart-glass text-[var(--theme-text-title)]" 
            placeholder="Email" 
            type="email"
            style={{ borderRadius: '12px' }}
            required
          />
          <textarea 
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="p-4 smart-glass text-[var(--theme-text-title)] sm:col-span-2 resize-none" 
            rows="4" 
            placeholder="Your message..."
            style={{ borderRadius: '12px' }}
            required
          />
          <button 
            type="submit" 
            className="sm:col-span-2 px-6 py-4 font-black uppercase tracking-wider text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{
              backgroundColor: 'rgb(var(--theme-primary))',
              border: '1px solid rgba(var(--theme-primary), 0.3)',
              borderRadius: '12px',
            }}
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  )
}
