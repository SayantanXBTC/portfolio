import React from "react"

const internships = [
  {
    title: "JAVA Programming Intern",
    org: "Techvanto Academy",
    period: "June 2025 - Aug 2025",
    detail:
      "Developed advanced Java modules focusing on concurrency, collections, and JDBC. Designed unit & integration tests and improved performance across database operations.",
    responsibilities: [
      "Designed multithreaded components handling concurrent requests",
      "Implemented JDBC connection pooling and optimized SQL queries",
      "Created automated test suites for core modules with JUnit and TestNG",
    ],
    impact:
      "Reduced average request processing time by ~25% and improved test coverage to 88%",

    // NEW — certificate file path
    certificate: "/portfolio/public/docs/Sayantan Bhattacharjee-Certificate _page-0001.jpg"
  },
]

export default function Internships() {
  return (
    <section className="min-h-screen pt-28 px-6">
      <h1 className="text-4xl text-sky-300 font-bold mb-8 text-center">
        INTERNSHIPS
      </h1>

      <div className="max-w-6xl mx-auto grid gap-6">
        {internships.map((it) => (
          <article
            key={it.title}
            className="glass p-6 rounded-2xl border border-slate-700/40 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-sky-200">
                  {it.title}
                </h3>
                <p className="text-slate-400">
                  {it.org} • {it.period}
                </p>
              </div>
              <div className="text-sm text-slate-300 italic">{it.impact}</div>
            </div>

            <p className="mt-4 text-slate-300">{it.detail}</p>

            <div className="mt-4">
              <h4 className="text-sky-300 font-semibold">Responsibilities</h4>
              <ul className="list-disc list-inside text-slate-300 mt-2">
                {it.responsibilities.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>

            {/* ⭐ View Certificate Button */}
            <a
              href={it.certificate}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-5 px-5 py-2 bg-sky-400 text-black font-semibold rounded-xl shadow-md hover:opacity-90 transition"
            >
              View Certificate
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
