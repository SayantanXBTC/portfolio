import React from "react"
import Tilt from "react-parallax-tilt"
import { motion } from "framer-motion"

export default function Projects() {
  const projects = [
    {
      title: "Distributed Microservices Automation Framework",
      tech: "Selenium • Rest Assured • Docker • Jenkins",
      desc: "Built a multilayer automation system validating cross-service workflows. Achieved 95% automation coverage.",
      github: "https://github.com/SayantanXBTC/project-microservices"
    },
    {
      title: "Automated Medical Diagnostic Workflow",
      tech: "Selenium • Rest Assured • Allure",
      desc: "Automated EMR-like workflows with compliance logging, reducing manual work by 90%.",
      github: "https://github.com/SayantanXBTC/project-medical"
    },
    {
      title: "Automated Bank Management System",
      tech: "Java Swing • JDBC • MySQL",
      desc: "End-to-end bank GUI with secure DB operations and automated test flows.",
      github: "https://github.com/SayantanXBTC/project-bank"
    }
  ]

  return (
    <section className="min-h-screen flex flex-col items-center pt-28 px-6 text-center">
      <motion.h1
        className="text-4xl text-sky-400 font-bold mb-8"
        data-aos="fade-up"
      >
        Projects
      </motion.h1>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((p, i) => (
          <Tilt
            key={p.title}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            glareEnable={true}
            glareMaxOpacity={0.08}
            perspective={1000}
          >
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition"
            >
              <h3 className="text-xl font-semibold text-sky-300">{p.title}</h3>
              <p className="text-slate-400 text-sm mt-2">{p.tech}</p>
              <p className="mt-4 text-slate-300 leading-7">{p.desc}</p>

              <div className="mt-4">
                <a
                  className="text-brand-300 hover:underline"
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub →
                </a>
              </div>
            </motion.article>
          </Tilt>
        ))}
      </div>
    </section>
  )
}
