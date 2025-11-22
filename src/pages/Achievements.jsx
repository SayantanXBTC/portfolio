import React from "react"

const achievements = [
  {
    title: "National Youth Festival 2025 - State Representative",
    detail:
      "Selected as the state representative from Tripura to present 'Tech for Viksit Bharat 2047' at the National Youth Festival. Presented a 12-minute talk outlining technology-driven education initiatives and prototype ideas for scalable learning platforms.",
    impact: "Presented to national leaders; selected among top delegates for a follow-up workshop.",
  },
  {
    title: "National Space Day 2025 - Quiz Winner",
    detail:
      "Ranked among the top 100 participants in a national-level space quiz (65,000+ participants). Shortlisted and invited to the ISRO Sriharikota facility for a special outreach program.",
    impact: "Hands-on exposure to launch operations and research teams at ISRO.",
  },
  {
    title: "President — ConverseE+ Club",
    detail:
      "Led a student-run engineering and entrepreneurship club where I organized 15+ workshops, hackathons and mentoring sessions. Built partnerships with local startups and helped students ship 8 small projects.",
    impact: "Increased club membership and raised sponsorships for events.",
  },
  {
    title: "CPE Multi-Event Winner",
    detail:
      "Won multiple events across debates, quizzes, vocabulary & aptitude at the college level. Regular member of quiz teams and debate squads.",
    impact: "Overall holistic develpment",
  },
]

export default function Achievements() {
  return (
    <section className="min-h-screen pt-28 px-6">
      <h1 className="text-4xl text-sky-300 font-bold mb-8 text-center">ACHIEVEMENTS</h1>

      <div className="max-w-6xl mx-auto grid gap-6">
        {achievements.map((a, i) => (
          <div key={a.title} className="glass p-6 rounded-2xl border border-slate-700/40 shadow-xl">
            <h3 className="text-2xl font-semibold text-sky-200">{a.title}</h3>
            <p className="mt-3 text-slate-300 leading-7">{a.detail}</p>
            <p className="mt-3 text-sm text-slate-400 italic">Impact: {a.impact}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
