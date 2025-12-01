import React from "react";

export default function Education() {
  return (
    <section className="min-h-screen pt-32 pb-24 px-6">
      <h1 className="text-4xl md:text-5xl text-sky-300 font-bold text-center mb-16 tracking-wide">
        EDUCATION
      </h1>

      <div className="max-w-4xl mx-auto relative">

        {/* Vertical Timeline Line */}
        <div className="absolute left-5 md:left-6 top-0 bottom-0 w-[3px] bg-sky-500/40 rounded-full"></div>

        <div className="space-y-20">

          {[
            {
              title: "B.Tech — Computer Science & Engineering",
              subtitle: "Lovely Professional University • Aug 2023 – Present",
              details:
                "CGPA: 8.5 • Coursework: Data Structures, OS, DBMS, Software Testing",
            },
            {
              title: "Intermediate — Hindi Higher Secondary School",
              subtitle: "Agartala, Tripura • 2020 – 2022",
              details: "Percentage: 93.6% • Focus: Physics & Maths",
            },
            {
              title: "Matriculation — Holy Cross School",
              subtitle: "Agartala, Tripura • 2019 – 2020",
              details: "Percentage: 96%",
            },
          ].map((item, index) => (
            <div key={index} className="relative pl-12 md:pl-16">

              {/* Dot */}
              <div className="absolute left-3 md:left-4 top-2 w-5 h-5 bg-sky-400 rounded-full shadow-lg shadow-sky-500/40 ring-4 ring-sky-500/20"></div>

              {/* Content */}
              <h2 className="text-2xl font-semibold text-sky-300">
                {item.title}
              </h2>

              <p className="text-slate-400 mb-4">{item.subtitle}</p>

              <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700 shadow-lg hover:scale-[1.02] transition-all duration-300">
                <p className="text-slate-300 text-lg leading-relaxed">
                  {item.details}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
