import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import Typed from "typed.js"
import { ArrowRight, Github, Linkedin, Mail, Sparkles, Download } from "lucide-react"
import { Button } from "../components/ui/Button"
import { useTheme } from "../contexts/ThemeContext"
import heroImage from "../assets/images/def.jpg"

// 3D Tilt Image Component
const TiltImage = ({ src, alt }) => {
  const { isDark } = useTheme()
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15])

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      className="relative perspective-1000"
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
        className={`relative p-1 rounded-3xl ${
          isDark 
            ? 'bg-gradient-to-b from-slate-700/50 to-transparent' 
            : 'bg-gradient-to-b from-slate-300/50 to-transparent'
        }`}
        style={{ transform: "translateZ(50px)" }}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-2xl"
          animate={{
            opacity: isHovered ? 0.4 : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.3 }}
        />
        
        <div className={`relative rounded-3xl overflow-hidden backdrop-blur-xl border ${
          isDark 
            ? 'bg-slate-900/50 border-slate-800/50' 
            : 'bg-white/60 border-slate-300/50'
        }`}>
          <img
            src={heroImage}
            alt={alt}
            className="w-[280px] h-[280px] md:w-[360px] md:h-[360px] object-cover object-center"
            loading="eager"
          />
          
          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: isHovered ? ["0%", "200%"] : "0%"
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Floating Particles Component
const FloatingParticles = () => {
  const { isDark } = useTheme()
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${
            isDark ? 'bg-blue-400/30' : 'bg-blue-600/20'
          }`}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const typedRef = useRef(null)
  const { isDark } = useTheme()

  useEffect(() => {
    const t = new Typed(typedRef.current, {
      strings: [
        "Upcoming Automation Engineer",
        "Applied Particle Physics Researcher",
        "Enthusiastic Web Developer"
      ],
      typeSpeed: 60,
      backSpeed: 35,
      backDelay: 1500,
      loop: true,
    })
    return () => t.destroy()
  }, [])

  const socialLinks = [
    { icon: Github, href: "https://github.com/SayantanXBTC", label: "GitHub", color: "hover:text-slate-300" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/sayantan-bhattacharje/", label: "LinkedIn", color: "hover:text-blue-400" },
    { icon: Mail, href: "mailto:bhattacharjeesayantan86@gmail.com", label: "Email", color: "hover:text-red-400" },
  ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 overflow-hidden">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      <div className="max-w-5xl w-full mx-auto text-center space-y-4 sm:space-y-6 md:space-y-8 relative" style={{ zIndex: 10 }}>
        {/* Hero Title with Letter Animation */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight px-2 sm:px-4 pb-2"
        >
          <span className={`block mb-1 sm:mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Hi! I'm
          </span>
          <motion.span 
            className={`block bg-gradient-to-r ${
              isDark 
                ? 'from-blue-400 via-purple-400 to-pink-400' 
                : 'from-blue-600 via-purple-600 to-pink-600'
            } bg-clip-text text-transparent pb-2 leading-tight`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Sayantan Bhattacharjee
          </motion.span>
        </motion.h1>

        {/* Typed Subtitle with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={`text-base sm:text-lg md:text-xl lg:text-2xl px-2 sm:px-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
        >
          <span>I am an </span>
          <span 
            ref={typedRef} 
            className={`font-semibold bg-gradient-to-r ${
              isDark 
                ? 'from-blue-400 to-cyan-400' 
                : 'from-blue-600 to-cyan-600'
            } bg-clip-text text-transparent`}
          ></span>
        </motion.div>

        {/* Social Links - Clearer and Sleeker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 sm:gap-5"
        >
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-xl border-2 transition-all shadow-lg touch-manipulation ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/80 hover:border-blue-500/50 hover:shadow-blue-500/20'
                  : 'bg-white/90 border-slate-300/80 text-slate-700 hover:bg-white hover:border-blue-500/50 hover:shadow-blue-500/20'
              } ${social.color}`}
              aria-label={social.label}
            >
              <social.icon size={24} strokeWidth={1.5} className="sm:w-7 sm:h-7" />
            </motion.a>
          ))}
        </motion.div>

        {/* 3D Tilt Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center py-4 sm:py-0"
        >
          <TiltImage src={heroImage} alt="Sayantan Bhattacharjee" />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`mt-3 sm:mt-4 text-xs sm:text-sm italic text-center max-w-md px-4 ${
              isDark ? 'text-slate-500' : 'text-slate-600'
            }`}
          >
            At the great Plenary Hall at Bharat Mandapam, New Delhi, India
          </motion.p>
        </motion.div>

        {/* CTA Buttons - Clearer and Sleeker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0"
        >
          <motion.a
            href="/portfolio/docs/Sayantan-General CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all shadow-lg touch-manipulation ${
              isDark 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/30 hover:shadow-blue-500/50'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/30 hover:shadow-blue-500/50'
            }`}
          >
            <Download size={18} strokeWidth={2} className="sm:w-5 sm:h-5" />
            <span>View Resume</span>
          </motion.a>
          
          <motion.a
            href="/portfolio/contact"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base border-2 transition-all shadow-lg touch-manipulation ${
              isDark 
                ? 'bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700/80 hover:border-blue-500 shadow-slate-800/50 hover:shadow-blue-500/30'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-500 shadow-slate-300/50 hover:shadow-blue-500/30'
            }`}
          >
            <Mail size={18} strokeWidth={2} className="sm:w-5 sm:h-5" />
            <span>Get in Touch</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}