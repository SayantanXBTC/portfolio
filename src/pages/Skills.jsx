import { useState } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { useTheme } from "../contexts/ThemeContext"
import {
  Code2,
  Palette,
  Server,
  TestTube,
  Wrench,
  Users,
  Lightbulb,
  Database,
  Globe,
  Terminal,
  FileCode,
  Cpu,
  GitBranch,
  Package,
  Rocket,
  CheckCircle2,
  MessageSquare,
  Clock,
  Target,
  Sparkles
} from "lucide-react"

// Skill icon mapping
const skillIcons = {
  // Programming Languages
  "Java": <FileCode className="w-5 h-5" />,
  "JavaScript": <Code2 className="w-5 h-5" />,
  "Python": <Terminal className="w-5 h-5" />,
  "C": <Cpu className="w-5 h-5" />,
  "C++": <Cpu className="w-5 h-5" />,
  
  // Frontend
  "React": <Sparkles className="w-5 h-5" />,
  "HTML5": <Globe className="w-5 h-5" />,
  "CSS3": <Palette className="w-5 h-5" />,
  "Tailwind CSS": <Palette className="w-5 h-5" />,
  "Framer Motion": <Sparkles className="w-5 h-5" />,
  
  // Backend & Database
  "Node.js": <Server className="w-5 h-5" />,
  "Express.js": <Server className="w-5 h-5" />,
  "MongoDB": <Database className="w-5 h-5" />,
  "MySQL": <Database className="w-5 h-5" />,
  "REST APIs": <Globe className="w-5 h-5" />,
  
  // Testing
  "Selenium": <TestTube className="w-5 h-5" />,
  "TestNG": <CheckCircle2 className="w-5 h-5" />,
  "JUnit": <CheckCircle2 className="w-5 h-5" />,
  "Postman": <Globe className="w-5 h-5" />,
  "Testing Library": <TestTube className="w-5 h-5" />,
  
  // DevOps
  "Git": <GitBranch className="w-5 h-5" />,
  "Docker": <Package className="w-5 h-5" />,
  "Jenkins": <Rocket className="w-5 h-5" />,
  "Maven": <Package className="w-5 h-5" />,
  "GitHub Actions": <GitBranch className="w-5 h-5" />,
  
  // Soft Skills
  "Problem Solving": <Lightbulb className="w-5 h-5" />,
  "Team Collaboration": <Users className="w-5 h-5" />,
  "Communication": <MessageSquare className="w-5 h-5" />,
  "Time Management": <Clock className="w-5 h-5" />,
  "Leadership": <Target className="w-5 h-5" />,
  "Adaptability": <Sparkles className="w-5 h-5" />
}

// Animated Skill Badge Component with Icons
const SkillBadge = ({ skill, index, categoryColor }) => {
  const { isDark } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1]
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, y: -2 }}
      className="relative"
    >
      {/* Glow Effect on Hover */}
      <motion.div
        className={`absolute inset-0 rounded-lg bg-gradient-to-r ${categoryColor} blur-md`}
        animate={{ 
          opacity: isHovered ? 0.4 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      
      <div className={`relative px-5 py-3 rounded-xl border-2 font-medium text-sm transition-all flex items-center gap-2.5 shadow-md ${
        isDark 
          ? 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:border-slate-600 hover:bg-slate-800/80' 
          : 'bg-white border-slate-300/60 text-slate-700 hover:border-slate-400 hover:bg-slate-50 shadow-lg'
      }`}>
        {/* Premium Icon */}
        <motion.div
          animate={isHovered ? { rotate: [0, -15, 15, 0] } : {}}
          transition={{ duration: 0.6 }}
          className={`flex-shrink-0 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}
        >
          {skillIcons[skill] || <Code2 className="w-5 h-5" />}
        </motion.div>
        
        {/* Skill Name */}
        <span className="font-semibold">{skill}</span>
      </div>
    </motion.div>
  )
}

// 3D Rotating Card Component
const SkillCard = ({ category, index }) => {
  const { isDark } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const rotateX = useTransform(mouseY, [-100, 100], [10, -10])
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1] 
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000"
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: "preserve-3d"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`relative h-full rounded-3xl border-2 backdrop-blur-xl overflow-hidden shadow-xl ${
          isDark 
            ? 'border-slate-800/60 bg-gradient-to-br from-slate-900/70 to-slate-900/40' 
            : 'border-slate-300/70 bg-gradient-to-br from-white/95 to-slate-50/95 shadow-2xl'
        }`}
      >
        {/* Enhanced Gradient Glow on Hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0`}
          animate={{ opacity: isHovered ? 0.15 : 0 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Animated Border Gradient */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0"
          style={{
            background: `linear-gradient(135deg, ${
              isDark 
                ? 'rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3)' 
                : 'rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2)'
            })`,
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative p-10 h-full flex flex-col" style={{ transform: "translateZ(20px)" }}>
          {/* Icon Header with Enhanced Animation */}
          <motion.div 
            className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${category.color} text-white mb-6 shadow-2xl self-start`}
            animate={isHovered ? {
              scale: [1, 1.15, 1],
              rotate: [0, -8, 8, 0]
            } : {}}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.1 }}
          >
            {category.icon}
          </motion.div>

          {/* Title */}
          <h3 className={`text-2xl font-bold mb-6 tracking-tight ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {category.title}
          </h3>

          {/* Skill Badges - Flex Grow to Fill Space */}
          <div className="flex flex-wrap gap-2.5 flex-grow content-start">
            {category.skills.map((skill, skillIndex) => (
              <SkillBadge 
                key={skill} 
                skill={skill} 
                index={skillIndex}
                categoryColor={category.color}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const skillCategories = [
  {
    title: "Programming Languages",
    icon: <Code2 className="w-7 h-7" />,
    skills: ["Java", "JavaScript", "Python", "C", "C++"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Frontend Development",
    icon: <Palette className="w-7 h-7" />,
    skills: ["React", "HTML5", "CSS3", "Tailwind CSS", "Framer Motion"],
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Backend & Database",
    icon: <Server className="w-7 h-7" />,
    skills: ["Node.js", "Express.js", "MongoDB", "MySQL", "REST APIs"],
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Testing & Automation",
    icon: <TestTube className="w-7 h-7" />,
    skills: ["Selenium", "TestNG", "JUnit", "Postman", "Testing Library"],
    color: "from-orange-500 to-red-500"
  },
  {
    title: "DevOps & Tools",
    icon: <Wrench className="w-7 h-7" />,
    skills: ["Git", "Docker", "Jenkins", "Maven", "GitHub Actions"],
    color: "from-indigo-500 to-purple-500"
  },
  {
    title: "Soft Skills",
    icon: <Users className="w-7 h-7" />,
    skills: ["Problem Solving", "Team Collaboration", "Communication", "Time Management", "Leadership", "Adaptability"],
    color: "from-pink-500 to-rose-500"
  }
]

export default function Skills() {
  const { isDark } = useTheme()

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
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <Sparkles className={`w-8 h-8 ${
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`} />
          </motion.div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 pb-2 tracking-tight bg-gradient-to-r ${
            isDark 
              ? 'from-blue-400 via-purple-400 to-pink-400' 
              : 'from-blue-600 via-purple-600 to-pink-600'
          } bg-clip-text text-transparent`}>
            Skills & Expertise
          </h1>
          
          <p className={`text-xl max-w-3xl mx-auto ${
            isDark ? 'text-slate-400' : 'text-slate-700'
          }`}>
            A comprehensive overview of my technical skills and soft skills developed 
            through hands-on projects, coursework, and continuous learning.
          </p>
        </motion.div>

        {/* Skills Grid - Fixed Height for Alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => (
            <SkillCard key={category.title} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
