import React from "react"
import { motion } from "framer-motion"
import heroImage from "../assets/images/def.jpg" // optional usage in about

export default function About() {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center pt-28 px-6">
      <h1 className="text-4xl text-sky-400 font-bold mb-10" data-aos="fade-up">About Me</h1>

      <div className="max-w-3xl glass p-8 rounded-2xl shadow-xl text-left leading-8 text-lg text-slate-300 backdrop-blur-xl border border-slate-700/50" data-aos="fade-up">
        <p className="mb-6" data-aos="fade-right" data-aos-delay="30">
          Hey! I’m a B.Tech CSE student at LPU, currently figuring out how to break software professionally (aka <span className="text-sky-300 font-semibold">Software Testing</span>). I grew up in Agartala in a family of teachers — so curiosity wasn’t optional; it was basically a rule.
        </p>

        <p className="mb-6" data-aos="fade-left" data-aos-delay="80">
          That curiosity pushed me deep into <span className="text-sky-300 font-semibold">Particle Physics</span>. While debugging code, my brain is usually running collider experiments in the background. Physics is my first love and the reason I question everything.
        </p>

        <p className="mb-6" data-aos="fade-up" data-aos-delay="120">
          On the tech side, I work on automation testing, full-stack bits, and web design. I also pick up quizzing trophies like side quests — and had the honor of representing Tripura at the <span className="text-sky-300 font-semibold">National Youth Festival 2025</span>.
        </p>

        <p className="font-semibold text-sky-300" data-aos="zoom-in" data-aos-delay="160">
          My life motto: Keep the code clean, the hair unpredictable, and the volume maxed out.
        </p>
      </div>
    </motion.section>
  )
}
