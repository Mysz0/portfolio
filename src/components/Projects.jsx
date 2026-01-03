import React from 'react'

const sampleProjects = [
  { id: 1, title: 'Project One', desc: 'Short description of project one.' },
  { id: 2, title: 'Project Two', desc: 'Short description of project two.' },
  { id: 3, title: 'Project Three', desc: 'Short description of project three.' }
]

export default function Projects() {
  return (
    <section id="projects" className="py-12">
      <h2 className="text-2xl font-semibold mb-6">Selected Projects</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {sampleProjects.map(p => (
          <article key={p.id} className="card p-6 rounded-lg">
            <h3 className="font-semibold mb-2">{p.title}</h3>
            <p className="text-slate-300">{p.desc}</p>
            <div className="mt-4">
              <a className="text-indigo-400 hover:underline" href="#">View</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
