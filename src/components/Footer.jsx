import React from 'react'

export default function Footer() {
  const PUBLIC_CV = "/docs/Sayantan-Bhattacharjee-CV.pdf"

  return (
    <footer className="mt-20 py-8 text-center text-slate-400">
      © 2025 Sayantan Bhattacharjee •{" "}
      <a href={PUBLIC_CV} className="text-sky-300 hover:underline">
        Download CV
      </a>
    </footer>
  )
}
