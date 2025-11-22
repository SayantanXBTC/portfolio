import React, { useEffect, useRef } from 'react'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import Typed from 'typed.js'
import { motion } from 'framer-motion'

const CV = "/docs/Sayantan-Bhattacharjee-CV.pdf"

export default function Home() {
  const typedRef = useRef(null)

  useEffect(() => {
    const t = new Typed(typedRef.current, {
      strings: ["Automation Engineer", "Particle Physics Researcher"],
      typeSpeed: 80,
      backSpeed: 40,
      loop: true
    })

    return () => t.destroy()
  }, [])

  const particlesInit = async main => {
    await loadFull(main)
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center relative bg-hero-gradient text-white"
    >
      <Particles
        init={particlesInit}
        className="absolute inset-0 -z-10"
        options={{
          background: { color: '#071021' },
          particles: {
            color: { value: '#0ea5e9' },
            links: { enable: true, color: '#0ea5e9' },
            move: { enable: true }
          }
        }}
      />

      <motion.h1
        className="clamp-hero font-extrabold text-center mb-6"
        data-aos="fade-down"
      >
        Hi! I’m Sayantan Bhattacharjee
      </motion.h1>

      <motion.div
        data-aos="zoom-in"
        className="glass neon p-3 rounded-xl border border-slate-800"
        whileHover={{ scale: 1.02 }}
      >
        <motion.img
          src="/images/def.jpg"
          alt="Sayantan"
          className="w-[420px] h-[420px] object-cover rounded-xl shadow-xl animate-float"
        />
      </motion.div>

      <p
        className="mt-6 text-sky-300 italic lead max-w-2xl text-center"
        data-aos="fade-up"
      >
        At the great Plenary Hall at Bharat Mandapam,New Delhi,India
      </p>

      <h2 data-aos="fade-up" className="mt-6 text-xl md:text-2xl text-gray-200">
        I am a{" "}
        <span ref={typedRef} className="text-brand-500 font-semibold"></span>
      </h2>

      <div className="mt-8 flex gap-4" data-aos="fade-up">
        <a
          href={CV}
          download
          className="px-6 py-3 bg-gradient-to-br from-brand-500 to-brand-300 text-black rounded-xl shadow-lg hover:-translate-y-1 transition"
        >
          Download CV
        </a>

        <a
          href="/projects"
          className="px-6 py-3 border border-slate-700 rounded-xl text-slate-200 hover:text-brand-300 transition"
        >
          View Projects
        </a>
      </div>
    </motion.section>
  )
}
