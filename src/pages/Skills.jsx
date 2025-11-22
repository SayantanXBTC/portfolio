import React from 'react'
import { motion } from 'framer-motion'

export default function Skills() {
  const badges = [
    'C++','JavaScript','Java','Python','React','NodeJS',
    'Selenium','MySQL','MongoDB','Jenkins','Docker','Rest Assured'
  ]

  return (
    <section className="min-h-screen flex flex-col items-center pt-28 px-6 text-center">
      <h1 className="text-4xl text-sky-400 font-bold mb-8" data-aos="fade-up">
        Skills
      </h1>

      <div
        className="max-w-5xl w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
        data-aos="fade-up"
      >
        {badges.map((b, i) => (
          <motion.div
            key={b}
            whileHover={{ scale: 1.06 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass p-4 rounded-xl text-center shadow-sm"
          >
            <div className="font-semibold text-sky-300">{b}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
