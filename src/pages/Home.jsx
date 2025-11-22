import React, { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Typed from "typed.js"
import Starfield from "../components/starfield"
import heroImage from "../assets/images/def.jpg" // confirm file exists

const CV = "/portfolio/docs/Sayantan-Bhattacharjee-CV.pdf" // final public path
// Local uploaded path (for your reference): /mnt/data/SAYANTAN-BHATTACHARJEE-CV.pdf

export default function Home() {
  const typedRef = useRef(null)

  useEffect(() => {
    const t = new Typed(typedRef.current, {
      strings: ["Automation Engineer", "Particle Physics Researcher", "Researcher"],
      typeSpeed: 70,
      backSpeed: 40,
      loop: true
    })
    return () => t.destroy()
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pb-20"
    >
      <Starfield />
      <motion.h1 className="text-4xl md:text-5xl font-extrabold text-sky-300 drop-shadow-lg" data-aos="fade-down">
        Hi! I’m Sayantan Bhattacharjee
      </motion.h1>

      <motion.div className="mt-10 p-3 rounded-2xl glass border border-slate-700/40 shadow-xl" data-aos="zoom-in">
        <img
          src={heroImage}
          alt="Sayantan"
          className="w-[360px] h-[360px] md:w-[420px] md:h-[420px] object-cover rounded-2xl shadow-xl animate-float"
          loading="lazy"
        />
      </motion.div>

      <p className="mt-4 text-sky-300 italic max-w-2xl" data-aos="fade-up">
        At the great Plenary Hall at Bharat Mandapam, New Delhi, India
      </p>

      <h2 className="mt-6 text-xl md:text-2xl text-gray-300" data-aos="fade-up">
        I am a <span ref={typedRef} className="text-sky-400 font-semibold"></span>
      </h2>

      <div className="mt-8 flex gap-4" data-aos="fade-up">
        <a
          href={CV}
          download
          className="px-6 py-3 bg-gradient-to-br from-brand-400 to-brand-300 text-black rounded-xl shadow-lg hover:-translate-y-1 transition font-semibold"
        >
          Download CV
        </a>
      </div>
    </motion.section>
  )
}
