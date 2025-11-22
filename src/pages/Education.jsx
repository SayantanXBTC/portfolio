import React from "react"

const timeline = [
  { title: "B.Tech Computer Science & Engineering", org: "Lovely Professional University", period: "Aug 2023 - Present", details: "CGPA: 8.5" },
  { title: "Intermediate (Hindi Higher Secondary School)", org: "Agartala, Tripura", period: "2020 - 2022", details: "Percentage: 93.6%" },
  { title: "Matriculation (Holy Cross School)", org: "Agartala, Tripura", period: "2019 - 2020", details: "Percentage: 96%" }
]

export default function Education() {
  return (
    <section className="min-h-screen pt-28 px-6">
      <h1 className="text-4xl text-sky-300 font-bold mb-8" data-aos="fade-up">Education</h1>

      <div className="max-w-4xl mx-auto">
        <div className="relative border-l border-slate-700/40 pl-8">
          {timeline.map((t,i)=>(
            <div key={t.title} className="mb-10" data-aos="fade-right" data-aos-delay={i*80}>
              <div className="absolute -left-4 w-8 h-8 rounded-full bg-sky-500 shadow-neon"></div>
              <h3 className="text-xl font-semibold text-sky-200">{t.title}</h3>
              <p className="text-slate-400">{t.org} • {t.period}</p>
              <p className="mt-2 text-slate-300">{t.details}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
