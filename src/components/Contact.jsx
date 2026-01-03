import React from 'react'

export default function Contact() {
  return (
    <section id="contact" className="py-12">
      <div className="card p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Get In Touch</h2>
        <p className="text-slate-300 mb-4">Interested in working together or just want to say hi? Drop a message.</p>
        <form className="grid gap-3 sm:grid-cols-2">
          <input className="p-3 rounded bg-transparent border border-slate-700" placeholder="Name" />
          <input className="p-3 rounded bg-transparent border border-slate-700" placeholder="Email" />
          <textarea className="p-3 rounded bg-transparent border border-slate-700 sm:col-span-2" rows="4" placeholder="Message"></textarea>
          <button type="button" className="sm:col-span-2 px-4 py-2 rounded bg-indigo-500 hover:bg-indigo-600">Send</button>
        </form>
      </div>
    </section>
  )
}
