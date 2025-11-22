import React, { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Typed from "typed.js"
import Starfield from "../components/Starfield"
import heroImage from "../assets/images/def.jpg"

export default function Home() {
  const typedRef = useRef(null)

  useEffect(() => {
    const t = new Typed(typedRef.current, {
      strings: [
        "Upcoming Automation Engineer",
        "Applied Particle Physics Researcher"
      ],
      typeSpeed: 60,
      backSpeed: 35,
      backDelay: 1500,
      loop: true,
    })
    return () => t.destroy()
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex flex-col items-center justify-start text-center px-6 pt-32 pb-20"
    >
      <Starfield />

      {/* TITLE */}
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-sky-300 drop-shadow-lg"
        data-aos="fade-down"
      >
        Hi! I’m <span className="text-sky-400">Sayantan Bhattacharjee</span>
      </motion.h1>

      {/* TYPED TEXT */}
      <h2 className="mt-4 text-xl md:text-2xl text-gray-300" data-aos="fade-up">
        I am an{" "}
        <span ref={typedRef} className="text-sky-400 font-semibold"></span>
      </h2>

      {/* SOCIAL LINKS */}
      <div className="mt-6 flex gap-6 text-slate-300 text-lg">
        <a
          href="https://github.com/SayantanXBTC"
          target="_blank"
          rel="noreferrer"
          className="hover:text-sky-300 transition"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/sayantan-bhattacharje/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-sky-300 transition"
        >
          LinkedIn
        </a>
        <a
          href="mailto:bhattacharjeesayantan86@gmail.com"
          className="hover:text-sky-300 transition"
        >
          Email
        </a>
      </div>

      {/* HERO IMAGE */}
      <motion.div
        className="mt-12 p-3 rounded-3xl glass border border-slate-700/40 shadow-2xl"
        data-aos="zoom-in"
      >
        <img
          src={heroImage}
          alt="Sayantan"
          className="w-[330px] h-[330px] md:w-[420px] md:h-[420px] object-cover rounded-2xl shadow-xl animate-float"
          loading="lazy"
        />
      </motion.div>

      <p className="mt-6 text-sky-300 italic max-w-2xl" data-aos="fade-up">
        At the great Plenary Hall at Bharat Mandapam, New Delhi, India
      </p>

      {/* CV BUTTONS */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up">
        <a
          href="/portfolio/docs/Sayantan-Bhattacharjee-CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-sky-400 text-black rounded-xl shadow-lg hover:-translate-y-1 transition font-semibold"
        >
          View CV
        </a>
      </div>
    </motion.section>
  )
}
