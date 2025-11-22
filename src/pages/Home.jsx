import React, { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Typed from "typed.js"
import Starfield from "../components/starfield" // NEW
import "../styles/hero.css" // optional custom effects

export default function Home() {
  const typedRef = useRef(null)

  useEffect(() => {
    const t = new Typed(typedRef.current, {
      strings: ["Automation Engineer", "Particle Physics Researcher", "Software Tester"],
      typeSpeed: 70,
      backSpeed: 40,
      loop: true,
    })
    return () => t.destroy()
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pb-20"
    >
      {/* ⭐ STARFIELD BACKGROUND */}
      <Starfield />

      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-sky-300 drop-shadow-lg"
        data-aos="fade-down"
      >
        Hi! I’m Sayantan Bhattacharjee
      </motion.h1>

      {/* IMAGE CARD */}
      <motion.div
        className="mt-10 p-3 rounded-2xl glass border border-slate-700/40 shadow-xl"
        data-aos="zoom-in"
      >
        <img
          src="/portfolio/src/assets/def.jpg"
          alt="Sayantan"
          className="w-[400px] h-[400px] object-cover rounded-2xl shadow-xl"
        />
      </motion.div>

      <p className="mt-4 text-sky-300 italic" data-aos="fade-up">
        At the great Plenary Hall at Bharat Mandapam, New Delhi, India
      </p>

      <h2
        className="mt-6 text-xl md:text-2xl text-gray-300"
        data-aos="fade-up"
      >
        I am a <span ref={typedRef} className="text-sky-400"></span>
      </h2>

     <div className="mt-8 flex gap-4" data-aos="fade-up">
  <a
    href="/portfolio/docs/Sayantan-Bhattacharjee-CV.pdf"
    download
    className="px-6 py-3 bg-sky-600 text-black rounded-xl shadow-lg 
      hover:bg-sky-500 transition font-semibold"
  >
    Download CV
  </a>
</div>

    </motion.section>
  )
}
