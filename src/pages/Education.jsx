import React from 'react'
import { FaUniversity, FaSchool, FaGraduationCap } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function Education() {
  return (
    <section className="min-h-screen flex flex-col items-center pt-28 px-6">
      <motion.h1 
        data-aos="fade-up" 
        className="text-4xl text-sky-400 font-bold mb-14 text-center"
      >
        Education
      </motion.h1>

      <div className="relative max-w-5xl w-full">
        
        {/* Middle timeline line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full border-l-2 border-sky-700/40 hidden md:block"></div>

        {/* 1. B.Tech */}
        <div className="md:flex md:justify-start md:pr-10 mb-16">
          
          <div data-aos="fade-right" className="md:w-1/2 w-full flex md:justify-end">
            <motion.div 
              initial={{opacity:0,x:-20}}
              animate={{opacity:1,x:0}}
              transition={{duration:0.6}}
              className="glass p-6 rounded-2xl shadow-glass-lg backdrop-blur-xl w-full md:w-[90%]"
            >
              <div className="flex items-center gap-4 mb-3">
                <FaUniversity className="text-3xl text-sky-400" />
                <h2 className="text-2xl font-semibold text-sky-300">
                  B.Tech — Computer Science & Engineering
                </h2>
              </div>
              <p className="text-slate-400 text-sm mb-2">
                Lovely Professional University • Since 2023 • CGPA: 
                <span className="text-sky-300 font-semibold"> 8.5</span>
              </p>
              <p className="text-slate-300 leading-7">
                Studying DS, OOP, DBMS, and advanced Software Testing.
                Built automation frameworks and tested distributed microservices.
              </p>
            </motion.div>
          </div>

          {/* Timeline node */}
          <div className="hidden md:flex items-center justify-center w-[4%]">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg"></div>
          </div>

          <div className="md:w-1/2 hidden md:block"></div>
        </div>

        {/* 2. Intermediate */}
        <div className="md:flex md:justify-end md:pl-10 mb-16">

          <div className="md:w-1/2 hidden md:block"></div>

          {/* node */}
          <div className="hidden md:flex items-center justify-center w-[4%]">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg"></div>
          </div>

          <div data-aos="fade-left" className="md:w-1/2 w-full flex md:justify-start">
            <motion.div
              initial={{opacity:0,x:20}}
              animate={{opacity:1,x:0}}
              transition={{duration:0.6}}
              className="glass p-6 rounded-2xl shadow-glass-lg backdrop-blur-xl w-full md:w-[90%]"
            >
              <div className="flex items-center gap-4 mb-3">
                <FaSchool className="text-3xl text-sky-400" />
                <h2 className="text-2xl font-semibold text-sky-300">
                  Intermediate — Hindi Higher Secondary School,Agartala
                </h2>
              </div>
              <p className="text-slate-400 text-sm mb-2">
                2020 – 2022 • Percentage:
                <span className="text-sky-300 font-semibold"> 93.6%</span>
              </p>
              <p className="text-slate-300 leading-7">
                Strong PCM foundation with deep interest in Particle Physics
                and early analytical training.
              </p>
            </motion.div>
          </div>
        </div>

        {/* 3. Matriculation */}
        <div className="md:flex md:justify-start md:pr-10 mb-16">

          <div data-aos="fade-right" className="md:w-1/2 w-full flex md:justify-end">
            <motion.div 
              initial={{opacity:0,x:-20}}
              animate={{opacity:1,x:0}}
              transition={{duration:0.6}}
              className="glass p-6 rounded-2xl shadow-glass-lg backdrop-blur-xl w-full md:w-[90%]"
            >
              <div className="flex items-center gap-4 mb-3">
                <FaGraduationCap className="text-3xl text-sky-400" />
                <h2 className="text-2xl font-semibold text-sky-300">
                  Matriculation — Holy Cross School,Agartala
                </h2>
              </div>
              <p className="text-slate-400 text-sm mb-2">
                2019 – 2020 • Percentage:
                <span className="text-sky-300 font-semibold"> 96%</span>
              </p>
              <p className="text-slate-300 leading-7">
                Consistent top performer with exceptional STEM aptitude
                and strong academic discipline.
              </p>
            </motion.div>
          </div>

          {/* node */}
          <div className="hidden md:flex items-center justify-center w-[4%]">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg"></div>
          </div>

          <div className="md:w-1/2 hidden md:block"></div>
        </div>
      </div>
    </section>
  )
}
