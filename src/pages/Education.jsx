import React from "react"

const timeline = [
  {
    title: "B.Tech — Computer Science & Engineering",
    org: "Lovely Professional University",
    period: "Aug 2023 - Present",
    details: "CGPA: 8.5 • Coursework: Data Structures, OS, DBMS, Software Testing",
  },
  {
    title: "Intermediate — Hindi Higher Secondary School",
    org: "Agartala, Tripura",
    period: "2020 - 2022",
    details: "Percentage: 93.6% • Focus: Physics & Maths",
  },
  {
    title: "Matriculation — Holy Cross School",
    org: "Agartala, Tripura",
    period: "2019 - 2020",
    details: "Percentage: 96%",
  },
]

export default function Education() {
  return (
    <section className="min-h-screen pt-28 px-6">
      <h1 className="text-4xl md:text-5xl text-sky-300 font-bold mb-8 text-center">EDUCATION</h1>

      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-sky-400 to-brand-400 h-full opacity-30"></div>

          <div className="space-y-10">
            {timeline.map((t, i) => (
              <div key={t.title} className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className={`md:w-1/2 ${i % 2 === 0 ? "md:pr-8 text-right md:order-1" : "md:pl-8 text-left md:order-2"}`}>
                  <h3 className="text-xl font-semibold text-sky-200">{t.title}</h3>
                  <p className="text-slate-400">{t.org} • {t.period}</p>
                </div>

                <div className="md:w-1/2 md:order-3">
                  <div className="glass p-4 rounded-2xl border border-slate-700/40 shadow-xl">
                    <p className="text-slate-300 leading-7">{t.details}</p>
                  </div>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-sky-400 border-4 border-slate-900 shadow-neon"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
