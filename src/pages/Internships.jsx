import React from "react"
import { motion } from "framer-motion"

export default function Internships() {
  return (
    <section className="min-h-screen flex flex-col items-center pt-28 px-6 text-center">
      <motion.h1
        className="text-4xl text-sky-400 font-bold mb-8"
        data-aos="fade-up"
      >
        Internships
      </motion.h1>

      <motion.div
        data-aos="fade-up"
        className="max-w-4xl w-full glass p-6 rounded-xl shadow-md text-left"
      >
        <h3 className="text-2xl font-semibold text-sky-300">
          Techvanto Academy — Java Programming Intern
        </h3>
        <p className="text-slate-400 text-sm mb-4">June 2025 – August 2025</p>

        <ul className="list-disc list-inside text-slate-300 leading-8 text-lg">
          <li>
            Developed multithreading, collections, JDBC modules and robust
            exception handling.
          </li>
          <li>
            Built performance-optimized Java components using structured OOP
            modularity.
          </li>
          <li>
            Designed reusable utilities for file handling, DB connectivity and
            application testing.
          </li>
        </ul>
      </motion.div>
    </section>
  )
}
