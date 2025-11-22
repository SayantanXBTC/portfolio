import React from "react"
import { motion } from "framer-motion"

export default function About() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center pt-28 px-6 pb-12"
    >
      <h1 className="text-4xl md:text-5xl text-sky-400 font-bold mb-8 text-center">
        About Me
      </h1>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LONG BIO */}
        <div className="glass p-8 rounded-2xl shadow-xl border border-slate-700/40">
          <h2 className="text-2xl font-semibold text-sky-300 mb-4">Who I am</h2>
          <p className="text-slate-300 leading-8 mb-4">
            I’m a B.Tech Computer Science student at Lovely Professional University with
            a deep appetite for building dependable software. I began coding to solve
            small automation problems and soon found joy in designing systems that make
            developers’ lives easier and testing more reliable.
          </p>

          <p className="text-slate-300 leading-8 mb-4">
            My curiosity pushed me toward particle physics — the discipline that taught
            me to model complex systems, think probabilistically, and build experiments
            that reveal unexpected results. I apply the same experimental rigor to
            software: design, observe, measure, iterate.
          </p>

          <p className="text-slate-300 leading-8">
            Outside code, I quiz, read research papers, and tinker with low-latency
            automation pipelines. I enjoy translating complex workflows into simple,
            testable units.
          </p>
        </div>

        {/* TECH PROFILE */}
        <div className="glass p-8 rounded-2xl shadow-xl border border-slate-700/40">
          <h2 className="text-2xl font-semibold text-sky-300 mb-4">Technical Snapshot</h2>

          <ul className="grid grid-cols-1 gap-3">
            <li className="p-3 rounded-lg bg-slate-900/40 border border-slate-700/30">
              <strong>Primary:</strong> Java, Selenium, TestNG, REST API testing
            </li>
            <li className="p-3 rounded-lg bg-slate-900/40 border border-slate-700/30">
              <strong>Frontend:</strong> React, TailwindCSS, Vite, Framer Motion
            </li>
            <li className="p-3 rounded-lg bg-slate-900/40 border border-slate-700/30">
              <strong>Data & DevOps:</strong> Docker, Git, GitHub Actions
            </li>
            <li className="p-3 rounded-lg bg-slate-900/40 border border-slate-700/30">
              <strong>Tools:</strong> Postman, Maven, Jenkins, Allure Reporting
            </li>
          </ul>

          <h3 className="mt-6 text-lg font-semibold text-sky-300">What I care about</h3>
          <p className="text-slate-300 leading-7 mt-2">
            Maintainability, reproducible tests, clear metrics, and fast feedback loops.
            I love turning flaky manual processes into stable repeatable pipelines.
          </p>

          <h3 className="mt-6 text-lg font-semibold text-sky-300">Fun facts</h3>
          <ul className="list-disc list-inside text-slate-300 mt-2">
            <li>Started competitive quizzing at age 12 — still addicted to trivia.</li>
            <li>Designed a small automation framework that reduced test runtime by 40%.</li>
            <li>Can argue for hours about which physics thought experiment is cooler LMAO.</li>
          </ul>
        </div>
      </div>

      {/* CTA / Values */}
      <div className="max-w-3xl mt-10 text-center">
        <p className="text-slate-300">
          I’m always open to new problems — whether it’s building a rock-solid
          test harness, automating a tedious workflow, or collaborating on research.
          If that sounds like you, let’s talk.
        </p>
      </div>
    </motion.section>
  )
}
