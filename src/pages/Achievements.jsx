import React from "react"

const achievements = [
  { 
    title: "National Youth Festival 2025 - State Representative", 
    detail: "Selected from over 30 lakh registered candidates and presented ideas for 'Tech for Viksit Bharat 2047' before national leaders includig the Prime Minister." 
  },
  { 
    title: "National Space Day 2025 - Quiz Winner", 
    detail: "Among top 100 winners from a pool of 65,000+; Invited to ISRO,Sriharikota." 
  },
  { 
    title: "President of ConverseE+ Club", 
    detail: "Leading student-driven initiatives, managing events, and mentoring teams at LPU." 
  },
  { 
    title: "CPE Multi-Event Winner", 
    detail: "Winner of mulitple debates, quizzes, vocabulary & aptitude competitions across LPU." 
  }
]

export default function Achievements() {
  return (
    <section className="min-h-screen pt-28 px-6">
      <h1 
        className="text-4xl text-sky-300 font-bold mb-8" 
        data-aos="fade-up"
      >
        Achievements
      </h1>

      <div className="max-w-5xl mx-auto grid gap-6">
        {achievements.map((a, i) => (
          <div
            key={a.title}
            className="glass p-6 rounded-2xl"
            data-aos="fade-up"
            data-aos-delay={i * 80}
          >
            <h3 className="text-xl font-semibold text-sky-200">{a.title}</h3>
            <p className="mt-2 text-slate-300">{a.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
