import React from "react"
import { FaCertificate } from "react-icons/fa"

const certificates = [
  { title: "Foundations Of Virtual Reality - IIT Madras (NPTEL)", date: "Nov 2025", id: "NPTEL-VR" },
  { title: "Master Generative AI and Tools - Udemy", date: "Aug 2025", id: "UD-GAI" },
  { title: "Build Generative AI Apps (No-Code) - Udemy", date: "Aug 2025", id: "UD-NO-CODE" }
]

export default function Certificates() {
  return (
    <section className="min-h-screen pt-28 px-6">
      <h1 className="text-4xl text-sky-300 font-bold mb-8" data-aos="fade-up">Certificates</h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {certificates.map((c,i)=>(
          <article key={c.id} className="glass p-6 rounded-2xl" data-aos="zoom-in" data-aos-delay={i*80}>
            <div className="flex items-center gap-3">
              <FaCertificate className="text-brand-400 text-2xl" />
              <h3 className="text-lg font-semibold text-sky-200">{c.title}</h3>
            </div>
            <p className="mt-3 text-slate-300">{c.date}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
