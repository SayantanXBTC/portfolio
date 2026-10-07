import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { ExternalLink, Github, Star, Sparkles, Wand2 } from "lucide-react"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { useTheme } from "../contexts/ThemeContext"

// Particle Trail Component
const ParticleTrail = ({ mouseX, mouseY, isHovering }) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!isHovering) {
      setParticles([])
      return
    }

    const interval = setInterval(() => {
      const newParticle = {
        id: Date.now() + Math.random(),
        x: mouseX,
        y: mouseY,
      }
      setParticles(prev => [...prev.slice(-8), newParticle])
    }, 50)

    return () => clearInterval(interval)
  }, [mouseX, mouseY, isHovering])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: particle.x, 
            y: particle.y, 
            scale: 1, 
            opacity: 0.8 
          }}
          animate={{ 
            scale: 0, 
            opacity: 0,
            x: particle.x + (Math.random() - 0.5) * 40,
            y: particle.y + (Math.random() - 0.5) * 40,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
          style={{ 
            boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)' 
          }}
        />
      ))}
    </div>
  )
}

// Orbiting Tech Icons Component
const OrbitingTechIcons = ({ tech, isHovering, gradient }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {tech.slice(0, 4).map((techName, index) => {
        const angle = (index / tech.slice(0, 4).length) * Math.PI * 2
        const radius = 120
        
        return (
          <motion.div
            key={techName}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
            initial={{ scale: 0, opacity: 0 }}
            animate={isHovering ? {
              scale: 1,
              opacity: 1,
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
            } : {
              scale: 0,
              opacity: 0,
              x: 0,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <motion.div
              animate={isHovering ? {
                rotate: 360,
              } : {
                rotate: 0,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className={`px-3 py-2 rounded-lg bg-gradient-to-r ${gradient} text-white text-xs font-semibold shadow-lg backdrop-blur-sm`}
            >
              {techName}
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Project Card Component with Flip Animation
const ProjectCard = ({ project, index }) => {
  const { isDark } = useTheme()
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="relative h-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false)
        setIsFlipped(false)
      }}
      onMouseMove={handleMouseMove}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1000px" }}
    >
      {/* Particle Trail */}
      <ParticleTrail 
        mouseX={mousePosition.x} 
        mouseY={mousePosition.y} 
        isHovering={isHovering} 
      />

      {/* Orbiting Tech Icons */}
      <OrbitingTechIcons 
        tech={project.tech} 
        isHovering={isHovering} 
        gradient={project.gradient}
      />

      {/* Flip Card Container */}
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Front of Card */}
        <div
          className={`w-full h-full rounded-2xl border backdrop-blur-xl overflow-hidden ${
            isDark 
              ? 'border-slate-800/50 bg-gradient-to-b from-slate-900/50 to-slate-900/30' 
              : 'border-slate-300/60 bg-white/90 shadow-lg'
          }`}
          style={{ 
            backfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
            position: isFlipped ? "absolute" : "relative",
            opacity: isFlipped ? 0 : 1,
            pointerEvents: isFlipped ? "none" : "auto"
          }}
        >
          {/* Gradient Glow */}
          <div className={`absolute inset-0 bg-gradient-to-r ${project.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
          
          {/* Project Image */}
          {project.image && (
            <div className="relative h-48 overflow-hidden">
              <motion.img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${
                isDark 
                  ? 'from-slate-900 via-slate-900/50 to-transparent' 
                  : 'from-white via-white/50 to-transparent'
              }`} />
              
              {/* Featured Badge on Image */}
              {project.featured && (
                <div className="absolute top-4 right-4">
                  <Badge variant="primary" className="flex items-center gap-1.5 text-sm py-1.5 px-3 backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          <div className="relative p-6 h-[calc(100%-12rem)] flex flex-col">
            {/* Title */}
            <h3 className={`text-2xl font-bold mb-3 tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {project.title}
            </h3>

            {/* Description */}
            <p className={`text-sm leading-relaxed mb-4 flex-grow line-clamp-3 ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}>
              {project.desc}
            </p>

            {/* Tech Stack Preview */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech.slice(0, 3).map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {project.tech.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.tech.length - 3} more
                </Badge>
              )}
            </div>

            {/* Click to Flip Hint */}
            <motion.div 
              className={`text-center py-2.5 px-4 rounded-lg border ${
                isDark 
                  ? 'border-blue-500/20 bg-blue-500/5 text-blue-400' 
                  : 'border-blue-500/30 bg-blue-50 text-blue-700'
              }`}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xs font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Click to see more details
              </span>
            </motion.div>
          </div>
        </div>

        {/* Back of Card */}
        <div
          className={`w-full h-full rounded-2xl border backdrop-blur-xl overflow-hidden ${
            isDark 
              ? 'border-slate-800/50 bg-gradient-to-b from-slate-900/90 to-slate-900/70' 
              : 'border-slate-300/60 bg-white/95 shadow-lg'
          }`}
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            transformStyle: "preserve-3d",
            position: isFlipped ? "relative" : "absolute",
            opacity: isFlipped ? 1 : 0,
            pointerEvents: isFlipped ? "auto" : "none",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        >
          <div className="relative p-8 h-full flex flex-col">
            {/* Back Header */}
            <div className="flex items-center justify-between mb-6">
              <h4 className={`text-2xl font-bold ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                Tech Stack & Links
              </h4>
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Wand2 className={`w-6 h-6 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </motion.div>
            </div>

            {/* All Tech Stack */}
            <div className="mb-6">
              <h5 className={`text-sm font-semibold mb-3 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Technologies Used:
              </h5>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech, i) => (
                  <motion.div
                    key={tech}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Badge variant="primary" className="text-sm">
                      {tech}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            {project.details && (
              <div className={`mb-6 p-4 rounded-xl ${
                isDark 
                  ? 'bg-slate-800/50 border border-slate-700/50' 
                  : 'bg-slate-100 border border-slate-300'
              }`}>
                <h5 className={`text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Key Features:
                </h5>
                <ul className={`text-sm space-y-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {project.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto space-y-3">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                >
                  <Github className="w-5 h-5" />
                  <span>View on GitHub</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
              
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>View Application</span>
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const { isDark } = useTheme()
  
  const projects = [
    {
      title: "PhysVerse",
      tech: ["React", "Three.js", "WebGL", "Physics", "GLSL"],
      desc: "An immersive 3D physics simulation platform that visualizes complex particle interactions, quantum mechanics, and cosmological phenomena with real-time particle systems.",
      github: "https://github.com/SayantanXBTC/PhysVerse",
      live: "https://physsversee.netlify.app/",
      gradient: "from-blue-500 to-cyan-500",
      image: "/portfolio/images/physsverse.png",
      details: [
        "Real-time 3D particle physics simulation",
        "Interactive quantum mechanics visualization",
        "WebGL-powered rendering engine",
        "Custom GLSL shaders for effects"
      ]
    },
    {
      title: "Humanity OS",
      tech: ["React", "Vite", "TensorFlow.js", "Gemini AI", "IndexedDB"],
      desc: "Real-time wellbeing platform combining on-device emotion analysis, carbon tracking, and AI therapist with offline-first storage and privacy-first architecture.",
      github: "https://github.com/SayantanXBTC/Humanity-OS",
      live: "https://humanity-os.netlify.app/",
      gradient: "from-purple-500 to-pink-500",
      image: "/portfolio/images/humanityos.png",
      details: [
        "On-device ML emotion detection",
        "Privacy-first data architecture",
        "AI-powered mental health support",
        "Carbon footprint tracking"
      ]
    },
    {
      title: "Drug Analysis Platform",
      tech: ["Python", "Agentic AI", "React", "Tailwind CSS", "Flask"],
      desc: "AI-powered drug recommendation system where users input their medical conditions and receive personalized drug suggestions with detailed information using agentic AI technology.",
      github: "https://github.com/SayantanXBTC/Medical-Analysis-Platform",
      live: "https://medicalanalysisplatform.netlify.app/",
      gradient: "from-emerald-500 to-teal-500",
      image: "/portfolio/images/druganalysis.png",
      details: [
        "Agentic AI for intelligent drug recommendations",
        "Condition-based drug analysis and suggestions",
        "Interactive React frontend with Tailwind CSS",
        "Real-time drug information and side effects"
      ]
    },
    {
      title: "Red Cross Society Website",
      tech: ["MongoDB", "Express", "React", "Node.js", "Socket.io"],
      desc: "Comprehensive web platform featuring volunteer management, donation tracking, event coordination, and AI-powered chatbot for instant assistance.",
      github: "https://github.com/SayantanXBTC/RedCrossAGT",
      live: "https://redcrosstrp.netlify.app/",
      gradient: "from-red-500 to-orange-500",
      image: "/portfolio/images/redcross.png",
      details: [
        "Real-time volunteer coordination",
        "Secure payment integration",
        "Event management system",
        "AI chatbot for support"
      ]
    },
    {
      title: "Bank Management System",
      tech: ["Java", "Swing", "JDBC", "MySQL", "JUnit"],
      desc: "End-to-end banking application with secure database operations, automated transaction processing, and comprehensive financial reporting.",
      github: "https://github.com/SayantanXBTC/Bank-Management-System-",
      gradient: "from-indigo-500 to-purple-500",
      image: "/portfolio/images/bankmanagement.png",
      details: [
        "Secure transaction processing",
        "Multi-user account management",
        "Automated report generation",
        "Role-based access control"
      ]
    }
  ]

  return (
    <section className="min-h-screen pt-28 px-6 pb-16 relative" style={{ zIndex: 1 }}>
      <div className="max-w-7xl mx-auto relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <Sparkles className={`w-8 h-8 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </motion.div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 pb-2 tracking-tight bg-gradient-to-r ${
            isDark 
              ? 'from-blue-400 via-purple-400 to-pink-400' 
              : 'from-blue-600 via-purple-600 to-pink-600'
          } bg-clip-text text-transparent`}>
            Featured Projects
          </h1>
          
          <p className={`text-xl max-w-3xl mx-auto ${
            isDark ? 'text-slate-400' : 'text-slate-700'
          }`}>
            A collection of projects showcasing my skills in full-stack development, 
            AI/ML, and system design.
          </p>
        </motion.div>

        {/* Projects Grid - Pyramid Layout: 3 on top, 2 centered below */}
        <div className="space-y-8 mb-16">
          {/* Top Row - 3 Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(0, 3).map((project, index) => (
              <div key={project.title} className="h-[580px]">
                <ProjectCard project={project} index={index} />
              </div>
            ))}
          </div>
          
          {/* Bottom Row - 2 Projects Centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {projects.slice(3, 5).map((project, index) => (
              <div key={project.title} className="h-[580px]">
                <ProjectCard project={project} index={index + 3} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <div className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden ${
            isDark 
              ? 'border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10' 
              : 'border-blue-300/40 bg-gradient-to-br from-blue-100 to-purple-100'
          }`}>
            <div className="p-10 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <Github className={`w-12 h-12 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </motion.div>
              
              <h3 className={`text-3xl font-bold mb-4 ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                Open Source & Collaboration
              </h3>
              
              <p className={`text-lg max-w-2xl mx-auto ${
                isDark ? 'text-slate-400' : 'text-slate-700'
              }`}>
                All projects are open source and available on GitHub. 
                Feel free to explore, contribute, or reach out for collaboration opportunities.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
