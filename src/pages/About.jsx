import React from 'react'
import { motion } from 'framer-motion'

export default function About() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center pt-28 px-6 text-center"
    >
      <h1 className="text-4xl text-sky-400 font-bold mb-10" data-aos="fade-up">
        About Me
      </h1>

      <div
        className="max-w-3xl glass p-6 rounded-2xl shadow-xl text-left leading-8 text-lg text-slate-300"
        data-aos="fade-up"
      >
        <p className="mb-6">
          Hey! I’m a B.Tech CSE student at LPU, currently figuring out how to
          break software professionally (aka{' '}
          <span className="text-sky-300 font-semibold">Software Testing</span>). 
          I was raised in Agartala by a squad of teachers, which means 
          <span className="text-sky-300 font-semibold"> curiosity </span>
          isn’t just a trait for me — it’s basically a family requirement.
        </p>

        <p className="mb-6">
          That curiosity is exactly why I’ve gone down the rabbit hole of{' '}
          <span className="text-sky-300 font-semibold">Particle Physics</span>. 
          While I'm debugging code, my brain is usually floating around 
          high-energy physics concepts. It’s my ‘first love,’ my research 
          obsession, and the reason I keep wondering how the universe actually works.
        </p>

        <p className="mb-6">
          On the tech side, I work on automation testing, full-stack experiments, 
          and web design. I also collect quizzing awards — and 
          had the massive honor of representing Tripura at the{' '}
          <span className="text-sky-300 font-semibold">National Youth Festival 2025 </span> 
          in New Delhi.
        </p>

        <p className="mb-6">
          On campus, I’m *that guy*: the one treating every 9 AM lecture like 
          it’s the Champions League Final, usually wearing a football jersey. 
          I also change hairstyles more often than my passwords — 
          even <span className="text-sky-300 font-semibold">David Beckham </span> 
           would be ashamed (LOL).
        </p>

        <p className="mb-6">
          When I’m not screaming at football matches or reviewing movies like 
          a film critic, I’m wearing headphones and blasting a playlist that 
          jumps from <span className="text-sky-300 font-semibold">80s rock </span> 
          to <span className="text-sky-300 font-semibold">hip-hop </span> 
          to <span className="text-sky-300 font-semibold">pop anthems </span>.  
          Sonic whiplash? Absolutely.
        </p>

        <p className="font-semibold text-sky-300">
          My life motto: Keep the code clean, the hair unpredictable, and the volume maxed out.
        </p>
      </div>
    </motion.section>
  )
}
