import React from "react"
import { FaGraduationCap, FaBrain } from "react-icons/fa"
import { motion } from "framer-motion"

export default function Certificates() {
  return (
    <section className="min-h-screen flex flex-col items-center pt-28 px-6">
      <h1 className="text-4xl text-sky-400 font-bold mb-10" data-aos="fade-up">
        Certificates
      </h1>

      {/* Foundations of VR — IIT Madras */}
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
              <li>Learned motion tracking and immersive environment design.</li>
              <li>Completed practical VR UX and performance modules.</li>
            </ul>

            <a
              href="/portfolio/public/docs/foundation-sb.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-5 py-2 bg-sky-400 text-black font-semibold rounded-xl shadow-md hover:opacity-90 transition"
            >
              View Certificate
            </a>
          </div>
        </div>
      </motion.div>

      {/* Master Generative AI & Tools */}
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
              <li>Built workflows for AI-generated images, text & audio.</li>
              <li>Hands-on projects using modern generative AI tools.</li>
            </ul>

            <a
              href="/portfolio/public/docs/master-sayantan.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-5 py-2 bg-sky-400 text-black font-semibold rounded-xl shadow-md hover:opacity-90 transition"
            >
              View Certificate
            </a>
          </div>
        </div>
      </motion.div>

      {/* Build Generative AI Apps with No-Code */}
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
              <li>Created AI applications without writing code.</li>
              <li>Used drag-and-drop builders to integrate AI modules.</li>
              <li>Learned end-to-end deployment for AI apps.</li>
            </ul>

            <a
              href="/portfolio/public/docs/build-ai.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-5 py-2 bg-sky-400 text-black font-semibold rounded-xl shadow-md hover:opacity-90 transition"
            >
              View Certificate
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
