import React from "react"

const internships = [
  {
    title: "JAVA Programming Intern",
    org: "Techvanto Academy",
    period: "June 2025 - Aug 2025",
    detail: "Built advanced Java modules with multithreading, collections, JDBC and exception handling."
  }
]

export default function Internships(){
  return (
    <section className="min-h-screen pt-28 px-6">
      <h1 className="text-4xl text-sky-300 font-bold mb-8" data-aos="fade-up">Internships</h1>

      <div className="max-w-4xl mx-auto grid gap-6">
        {internships.map((it,i)=>(
          <article key={it.title} className="glass p-6 rounded-2xl" data-aos="fade-right" data-aos-delay={i*80}>
            <h3 className="text-xl font-semibold text-sky-200">{it.title}</h3>
            <p className="text-slate-400">{it.org} • {it.period}</p>
            <p className="mt-3 text-slate-300">{it.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
