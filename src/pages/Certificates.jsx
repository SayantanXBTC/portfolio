import React from "react"
import { FaGraduationCap, FaBrain } from "react-icons/fa"
import { motion } from "framer-motion"

export default function Certificates() {
  return (
    <section className="min-h-screen flex flex-col items-center pt-28 px-6">
      <h1 className="text-4xl text-sky-400 font-bold mb-10" data-aos="fade-up">
        Certificates
      </h1>

      {/* VR Certification */}
      <motion.div
        data-aos="fade-up"
        className="max-w-3xl w-full glass p-6 rounded-xl shadow-md mb-6 text-left"
      >
        <div className="flex items-start gap-4">
          <FaGraduationCap className="text-3xl text-sky-300" />

          <div>
            <h2 className="text-2xl font-semibold text-sky-300">
              Foundations of Virtual Reality — IIT Madras (NPTEL)
            </h2>
            <p className="text-slate-400 text-sm mb-3">November 2025</p>

            <ul className="list-disc list-inside text-slate-300 leading-8 text-lg">
              <li>Studied VR hardware, software, and 3D rendering pipelines.</li>
              <li>
                Learned motion tracking, user interaction systems, and immersive
                environment design.
              </li>
              <li>
                Completed practical VR modules focusing on UX and performance.
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Generative AI Certification */}
      <motion.div
        data-aos="fade-up"
        className="max-w-3xl w-full glass p-6 rounded-xl shadow-md mb-6 text-left"
      >
        <div className="flex items-start gap-4">
          <FaBrain className="text-3xl text-sky-300" />

          <div>
            <h2 className="text-2xl font-semibold text-sky-300">
              Master Generative AI & Tools — Udemy
            </h2>
            <p className="text-slate-400 text-sm mb-3">August 2025</p>

            <ul className="list-disc list-inside text-slate-300 leading-8 text-lg">
              <li>Studied GANs, VAEs, Transformers & generative pipelines.</li>
              <li>
                Built AI-generated content workflows (images, text, audio).
              </li>
              <li>
                Implemented real use-cases with no-code and low-code tools.
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* No-Code Certification */}
      <motion.div
        data-aos="fade-up"
        className="max-w-3xl w-full glass p-6 rounded-xl shadow-md mb-6 text-left"
      >
        <div className="flex items-start gap-4">
          <FaBrain className="text-3xl text-sky-300" />

          <div>
            <h2 className="text-2xl font-semibold text-sky-300">
              Build Generative AI Apps with No-Code — Udemy
            </h2>
            <p className="text-slate-400 text-sm mb-3">August 2025</p>

            <ul className="list-disc list-inside text-slate-300 leading-8 text-lg">
              <li>
                Designed and deployed AI apps using visual interfaces without
                coding.
              </li>
              <li>
                Integrated no-code models with automation pipelines and API
                systems.
              </li>
              <li>
                Completed multiple real-world projects using no-code platforms.
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
