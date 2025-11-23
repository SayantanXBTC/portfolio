import React from "react"

export default function Education() {
  return (
    <section className="min-h-screen pt-28 px-6 pb-20">
      <h1 className="text-4xl text-sky-300 font-bold text-center mb-12">
        EDUCATION
      </h1>

      <div className="max-w-4xl mx-auto relative border-l-4 border-sky-500 pl-6 space-y-16">

        {/* B.Tech */}
        <div className="relative">
          <div className="absolute -left-[15px] top-1 w-4 h-4 bg-sky-400 rounded-full shadow-md"></div>

          <h2 className="text-2xl font-semibold text-sky-300">
            B.Tech — Computer Science & Engineering
          </h2>
          <p className="text-slate-400 mb-3">
            Lovely Professional University • Aug 2023 – Present
          </p>

          <div className="glass p-4 rounded-xl border border-slate-700/30 shadow-lg">
            <p className="text-slate-300 leading-relaxed">
              CGPA: <span className="text-sky-300 font-semibold">8.5</span> •
              Coursework: Data Structures, OS, DBMS, Software Testing
            </p>
          </div>
        </div>

        {/* Class 12 */}
        <div className="relative">
          <div className="absolute -left-[15px] top-1 w-4 h-4 bg-sky-400 rounded-full shadow-md"></div>

          <h2 className="text-2xl font-semibold text-sky-300">
            Intermediate — Hindi Higher Secondary School
          </h2>
          <p className="text-slate-400 mb-3">
            Agartala, Tripura • 2020 – 2022
          </p>

          <div className="glass p-4 rounded-xl border border-slate-700/30 shadow-lg">
            <p className="text-slate-300 leading-relaxed">
              Percentage:{" "}
              <span className="text-sky-300 font-semibold">93.6%</span> • Focus:
              Physics & Maths
            </p>
          </div>
        </div>

        {/* Class 10 */}
        <div className="relative">
          <div className="absolute -left-[15px] top-1 w-4 h-4 bg-sky-400 rounded-full shadow-md"></div>

          <h2 className="text-2xl font-semibold text-sky-300">
            Matriculation — Holy Cross School
          </h2>
          <p className="text-slate-400 mb-3">
            Agartala, Tripura • 2019 – 2020
          </p>

          <div className="glass p-4 rounded-xl border border-slate-700/30 shadow-lg">
            <p className="text-slate-300 leading-relaxed">
              Percentage:{" "}
              <span className="text-sky-300 font-semibold">96%</span>
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
