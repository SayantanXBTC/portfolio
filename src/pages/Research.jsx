import React from "react"
import { motion } from "framer-motion"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
}

const researchProjects = [
  {
    title: "Particle-Dependent Time Dilation Sensitivity Study",
    status: "In Progress",
    description: `
Investigating whether different subatomic particles exhibit varying effective 
time-dilation responses under ultra-strong gravitational, magnetic, and 
rotational fields near compact cosmic objects; evaluating how intrinsic 
properties such as mass, spin, charge, and magnetic moment may influence 
particle-specific temporal behavior in extreme astrophysical environments.
    `
  },
  {
    title: "Early-Universe Freeze-Out Particle Time-Trace Hypothesis",
    status: "In Progress",
    description: `
Exploring whether certain early-universe freeze-out particles could retain unique 
intrinsic temporal evolution properties due to decoupling during non-equilibrium 
cosmological phase transitions; assessing their potential role as long-term cosmic 
time-reference indicators by analyzing theoretical stability, interaction history, 
and distinguishable observational signatures within modern cosmology.
    `
  }
]

export default function Research() {
  return (
    <section className="min-h-screen pt-32 px-6 pb-28">
      {/* PAGE TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-extrabold text-sky-300 text-center drop-shadow-lg"
      >
        Research Work
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-slate-300 text-center max-w-3xl mx-auto text-lg"
      >
        My current theoretical explorations in high-energy particle physics and cosmology.
      </motion.p>

      <div className="max-w-6xl mx-auto grid gap-10 mt-14">
        {researchProjects.map((item, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="
              glass p-8 rounded-3xl border border-slate-700/40 shadow-2xl 
              hover:shadow-neon-soft transition-all hover:-translate-y-1 
              bg-gradient-to-br from-slate-900/40 to-slate-800/20
            "
          >
            <h2 className="text-2xl md:text-3xl text-sky-200 font-semibold leading-snug">
              {item.title}
            </h2>

            <p className="text-sky-400 mt-1 font-medium">{item.status}</p>

            <p className="text-slate-300 mt-5 leading-8 whitespace-pre-line text-lg">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
