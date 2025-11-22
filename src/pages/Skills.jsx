import React from "react"
import {
  FaJava,
  FaJsSquare,
  FaReact,
  FaTools,
  FaPython,
  FaNodeJs,
  FaHtml5,
  FaCss3Alt,
  FaCuttlefish,
} from "react-icons/fa"
import { SiCplusplus } from "react-icons/si"

const skills = [
  {
    name: "Java",
    icon: <FaJava />,
    level: 92,
    desc: "OOP, Collections, Multithreading, JDBC",
  },
  {
    name: "Selenium",
    icon: <FaTools />,
    level: 90,
    desc: "WebDriver, Page Object Model, Selenium Grid",
  },
  {
    name: "TestNG",
    icon: <FaTools />, // FIXED - SiTestng removed
    level: 88,
    desc: "Test suites, annotations, reporting, data-driven testing",
  },
  {
    name: "JUnit",
    icon: <FaTools />, // FIXED
    level: 85,
    desc: "Unit testing, assertions, mocking",
  },
  {
    name: "Maven",
    icon: <FaTools />, // FIXED - SiMaven removed
    level: 84,
    desc: "Dependency management, build automation",
  },
  {
    name: "REST API Testing",
    icon: <FaTools />,
    level: 87,
    desc: "Postman, Rest Assured, API Automation",
  },
  {
    name: "JavaScript",
    icon: <FaJsSquare />,
    level: 80,
    desc: "ES6+, DOM, Async programming",
  },
  {
    name: "Node.js",
    icon: <FaNodeJs />,
    level: 78,
    desc: "Express, APIs, backend fundamentals",
  },
  {
    name: "React",
    icon: <FaReact />,
    level: 76,
    desc: "Components, Hooks, Router, Vite",
  },
  {
    name: "HTML",
    icon: <FaHtml5 />,
    level: 90,
    desc: "Semantic markup, forms, accessibility",
  },
  {
    name: "CSS",
    icon: <FaCss3Alt />,
    level: 88,
    desc: "Layouts, animations, responsive design",
  },
  {
    name: "Python",
    icon: <FaPython />,
    level: 70,
    desc: "Scripting, automation, data tasks",
  },
  {
    name: "C",
    icon: <FaCuttlefish />,
    level: 65,
    desc: "Procedural programming, memory management basics",
  },
  {
    name: "C++",
    icon: <SiCplusplus />,
    level: 60,
    desc: "OOP fundamentals, STL basics",
  },
]

export default function Skills() {
  return (
    <section className="min-h-screen pt-28 px-6">
      <h1 className="text-4xl text-sky-300 font-bold mb-10 text-center">
        Skills
      </h1>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {skills.map((s) => (
          <article
            key={s.name}
            className="glass p-6 rounded-2xl border border-slate-700/40 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl text-sky-300">{s.icon}</div>

              <div>
                <h3 className="text-xl font-semibold text-sky-200">
                  {s.name}
                </h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-sky-400 to-brand-300"
                  style={{ width: `${s.level}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 text-slate-300">
                {s.level}% proficiency
              </p>
            </div>
          </article>
        ))}
      </div>

      <p className="max-w-3xl mx-auto text-center text-slate-400 mt-10">
        These are the technologies I use frequently in automation, development, and coursework.
      </p>
    </section>
  )
}
