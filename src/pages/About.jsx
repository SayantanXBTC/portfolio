import { useState, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Badge } from "../components/ui/Badge"
import { useTheme } from "../contexts/ThemeContext"
import { Sparkles, Code, Rocket, Heart } from "lucide-react"

// Magnetic Text Component
const MagneticText = ({ children, className }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.1)
    y.set((e.clientY - centerY) * 0.1)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  )
}

// Reveal Text Animation
const RevealText = ({ children, delay = 0 }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="inline-block"
    >
      {children}
    </motion.span>
  )
}

// Floating Icon Component
const FloatingIcon = ({ icon: Icon, delay, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        rotate: 0,
        y: [0, -10, 0]
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        rotate: { duration: 0.5, delay },
        y: { 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: delay + 0.5
        }
      }}
      className={`absolute ${color}`}
    >
      <Icon className="w-6 h-6" />
    </motion.div>
  )
}

export default function About() {
  const { isDark } = useTheme()
  const [hoveredCard, setHoveredCard] = useState(null)
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return (
    <section className="min-h-screen pt-28 px-4 sm:px-6 pb-20 relative overflow-hidden" style={{ zIndex: 1 }}>
      {/* Enhanced Floating Icons Background */}
      <FloatingIcon icon={Code} delay={0.5} color="top-32 left-[10%] text-blue-400/30" />
      <FloatingIcon icon={Rocket} delay={0.7} color="top-48 right-[15%] text-purple-400/30" />
      <FloatingIcon icon={Sparkles} delay={0.9} color="bottom-32 left-[20%] text-cyan-400/30" />
      <FloatingIcon icon={Heart} delay={1.1} color="bottom-48 right-[10%] text-pink-400/30" />
      
      <div className="max-w-6xl mx-auto relative" style={{ zIndex: 2 }}>
        {/* Enhanced Title with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <Sparkles className={`w-10 h-10 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 pb-2 tracking-tight">
            <MagneticText>
              <span className={`bg-gradient-to-r ${
                isDark 
                  ? 'from-blue-400 via-purple-400 to-pink-400' 
                  : 'from-blue-600 via-purple-600 to-pink-600'
              } bg-clip-text text-transparent`}>
                About Me
              </span>
            </MagneticText>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`max-w-3xl mx-auto text-xl leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}
          >
            Automation Engineer and Applied Physics Researcher building reliable software systems with experimental rigor
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {/* WHO I AM */}
          <motion.div 
            variants={itemVariants}
            onMouseEnter={() => setHoveredCard('who')}
            onMouseLeave={() => setHoveredCard(null)}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`relative h-full rounded-3xl border-2 backdrop-blur-xl overflow-hidden shadow-xl ${
              isDark 
                ? 'border-slate-800/60 bg-gradient-to-br from-slate-900/70 to-slate-900/40' 
                : 'border-slate-300/70 bg-gradient-to-br from-white/95 to-slate-50/95 shadow-2xl'
            }`}>
              {/* Enhanced Gradient Glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 opacity-0"
                animate={{ opacity: hoveredCard === 'who' ? 0.15 : 0 }}
                transition={{ duration: 0.4 }}
              />
              
              {/* Animated Border Gradient */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, ${
                    isDark 
                      ? 'rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.3)' 
                      : 'rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2)'
                  })`,
                  opacity: hoveredCard === 'who' ? 1 : 0,
                }}
                transition={{ duration: 0.4 }}
              />
              
              <div className="relative p-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-6 shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Sparkles className="w-7 h-7" />
                </motion.div>
                
                <h2 className={`text-3xl font-semibold mb-6 tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>
                  <MagneticText>Who I am</MagneticText>
                </h2>
                
                <div className={`space-y-5 leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <RevealText delay={0.4}>
                    <p className="text-base">
                      I'm a B.Tech Computer Science student at Lovely Professional University, specializing in automation engineering and software quality assurance. My journey began with solving automation challenges, which evolved into a passion for designing robust testing frameworks and reliable software systems.
                    </p>
                  </RevealText>
                  
                  <RevealText delay={0.5}>
                    <p className="text-base">
                      My background in applied particle physics research has shaped my approach to software development. I apply experimental methodology to engineering: formulate hypotheses, design controlled tests, measure outcomes, and iterate based on data. This scientific rigor translates directly into building maintainable, well-tested codebases.
                    </p>
                  </RevealText>
                  
                  <RevealText delay={0.6}>
                    <p className="text-base">
                      Beyond development, I actively participate in competitive quizzing, contribute to research discussions, and optimize automation pipelines for performance. I focus on transforming complex manual processes into streamlined, repeatable workflows that deliver consistent results.
                    </p>
                  </RevealText>
                </div>
              </div>
            </div>
          </motion.div>

          {/* TECHNICAL SNAPSHOT */}
          <motion.div 
            variants={itemVariants}
            onMouseEnter={() => setHoveredCard('tech')}
            onMouseLeave={() => setHoveredCard(null)}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`relative h-full rounded-3xl border-2 backdrop-blur-xl overflow-hidden shadow-xl ${
              isDark 
                ? 'border-slate-800/60 bg-gradient-to-br from-slate-900/70 to-slate-900/40' 
                : 'border-slate-300/70 bg-gradient-to-br from-white/95 to-slate-50/95 shadow-2xl'
            }`}>
              {/* Enhanced Gradient Glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 opacity-0"
                animate={{ opacity: hoveredCard === 'tech' ? 0.15 : 0 }}
                transition={{ duration: 0.4 }}
              />
              
              {/* Animated Border Gradient */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, ${
                    isDark 
                      ? 'rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3)' 
                      : 'rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2)'
                  })`,
                  opacity: hoveredCard === 'tech' ? 1 : 0,
                }}
                transition={{ duration: 0.4 }}
              />
              
              <div className="relative p-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-6 shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <Code className="w-7 h-7" />
                </motion.div>
                
                <h2 className={`text-3xl font-semibold mb-6 tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>
                  <MagneticText>Technical Snapshot</MagneticText>
                </h2>
                
                <div className="space-y-4 mb-6">
                  {[
                    { label: "Primary", value: "Java, Selenium, TestNG, REST API testing", delay: 0.5 },
                    { label: "Frontend", value: "React, TailwindCSS, Vite, Framer Motion", delay: 0.6 },
                    { label: "Data & DevOps", value: "Docker, Git, GitHub Actions", delay: 0.7 },
                    { label: "Tools", value: "Postman, Maven, Jenkins, Allure Reporting", delay: 0.8 }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: item.delay, duration: 0.5 }}
                      whileHover={{ x: 4, scale: 1.02 }}
                      className={`p-4 rounded-xl border ${
                        isDark 
                          ? 'bg-slate-800/30 border-slate-700/30' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <p className={`text-sm mb-2 font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>{item.label}</p>
                      <p className={`text-lg ${
                        isDark ? 'text-slate-200' : 'text-slate-900'
                      }`}>{item.value}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <h3 className={`text-lg font-semibold mb-3 ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}>
                    <MagneticText>Core Principles</MagneticText>
                  </h3>
                  <p className={`leading-relaxed text-base ${
                    isDark ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    Code maintainability, reproducible test results, measurable quality metrics, and rapid feedback cycles. I specialize in converting unreliable manual processes into stable, automated pipelines with comprehensive test coverage.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* BEYOND ACADEMICS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, scale: 1.01 }}
        >
          <div className={`relative rounded-3xl border-2 backdrop-blur-xl overflow-hidden shadow-xl ${
            isDark 
              ? 'border-slate-800/60 bg-gradient-to-br from-slate-900/70 to-slate-900/40' 
              : 'border-slate-300/70 bg-gradient-to-br from-white/95 to-slate-50/95 shadow-2xl'
          }`}>
            {/* Animated Gradient Border */}
            <motion.div
              className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${
                  isDark 
                    ? 'rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2)' 
                    : 'rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15)'
                })`,
              }}
            />
            
            <div className="relative p-12">
              <div className="flex items-center gap-4 mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl"
                >
                  <Heart className="w-7 h-7" />
                </motion.div>
                
                <h3 className={`text-3xl font-bold tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>
                  <MagneticText>Beyond Academics</MagneticText>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    text: "Started competitive quizzing at age 12, still going strong with multiple state-level wins and a genuine love for trivia", 
                    delay: 0.5 
                  },
                  { 
                    text: "Avid reader of books and watcher of movies and TV series — literally everything from sci-fi to documentaries", 
                    delay: 0.6 
                  },
                  { 
                    text: "Spend time learning about cellular biology and can ramble for hours about which physics thought experiment is cooler", 
                    delay: 0.7 
                  }
                ].map((fact, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: fact.delay, duration: 0.5 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className={`p-7 rounded-2xl border-2 transition-all duration-300 ${
                      isDark 
                        ? 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/60' 
                        : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <p className={`text-base leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {fact.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}