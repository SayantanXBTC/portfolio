import React from "react"
import { FaTrophy } from "react-icons/fa"
import { motion } from "framer-motion"

export default function Achievements() {
  const items = [
    {
      title: "National Youth Festival 2025 – Representative",
      desc: "Selected from over 30 lakh students to represent Tripura and present ideas on Tech for Viksit Bharat 2047."
    },
    {
      title: "National Space Day – Quiz Winner",
      desc: "Placed in the top 100 nationwide; invited for an ISRO field visit to Sriharikota."
    },
    {
      title: "President – ConverseE+ Club",
      desc: "Organized events, led student teams, coordinated competitions and mentoring sessions."
    },
    {
      title: "CPE Multi-Event Achievement Recipient",
      desc: "Won multiple events including debates, vocabulary contests, quizzes and aptitude challenges."
    }
  ]

  return (
    <section className="min-h-screen flex flex-col items-center pt-28 px-6">
      <h1 className="text-4xl text-sky-400 font-bold mb-10" data-aos="fade-up">
        Achievements
      </h1>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass p-6 rounded-xl shadow-md text-left hover:shadow-xl transition"
          >
            <div className="flex items-start gap-4">
              <FaTrophy className="text-3xl text-sky-300" />
              <div>
                <h3 className="text-xl font-semibold text-sky-300">
                  {it.title}
                </h3>
                <p className="text-slate-400 mt-2 leading-7">{it.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
