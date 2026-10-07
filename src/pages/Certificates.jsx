import { useState } from "react"
import { motion } from "framer-motion"
import { FaGraduationCap, FaBrain, FaTools, FaCode } from "react-icons/fa"
import { Button } from "../components/ui/Button"
import { useTheme } from "../contexts/ThemeContext"
import { Award, ExternalLink } from "lucide-react"

// Certificate Card Component
const CertificateCard = ({ cert, index }) => {
  const { isDark } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1] 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      className="h-full"
    >
      <div className={`relative h-full rounded-2xl border backdrop-blur-xl overflow-hidden ${
        isDark 
          ? 'border-slate-800/50 bg-gradient-to-b from-slate-900/50 to-slate-900/30' 
          : 'border-slate-300/60 bg-white/90 shadow-lg'
      }`}>
        {/* Gradient Border Top */}
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${cert.color}`}></div>
        
        {/* Gradient Glow on Hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${cert.color} opacity-0`}
          animate={{ opacity: isHovered ? 0.1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        <div className="relative p-8 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start gap-5 mb-6">
            <motion.div 
              className={`p-4 rounded-xl bg-gradient-to-r ${cert.color} text-white flex-shrink-0 shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="text-3xl">{cert.icon}</div>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-xl font-bold mb-2 tracking-tight ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                {cert.title}
              </h3>
              <p className={`text-sm font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>{cert.institution}</p>
              <p className={`text-xs mt-1 ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}>{cert.date}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-6 flex-grow">
            <h4 className={`text-sm font-semibold mb-3 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Key Learnings:
            </h4>
            <ul className="space-y-3">
              {cert.skills.map((skill, skillIndex) => (
                <motion.li 
                  key={skillIndex} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + skillIndex * 0.05 }}
                  className={`flex items-start gap-3 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-gradient-to-r ${cert.color}`}></div>
                  <span className="text-sm leading-relaxed">{skill}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* View Certificate Button */}
          <div className="mt-auto">
            <a
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="default" className="w-full group">
                <FaGraduationCap />
                <span>View Certificate</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Certificates() {
  const { isDark } = useTheme()
  
  const certificates = [
    {
      title: "Foundations of Virtual Reality",
      institution: "IIT Madras (NPTEL)",
      date: "November 2025",
      icon: <FaGraduationCap />,
      color: "from-blue-500 to-cyan-500",
      skills: [
        "VR hardware, software, and 3D rendering pipelines",
        "Motion tracking and immersive environment design",
        "Practical VR UX and performance optimization"
      ],
      link: "/portfolio/docs/foundation-sb.pdf"
    },
    {
      title: "ChatGPT-4 Prompt Engineering: ChatGPT, Generative AI & LLM",
      institution: "Infosys Springboard",
      date: "August 2025",
      icon: <FaGraduationCap />,
      color: "from-cyan-500 to-blue-500",
      skills: [
        "Finite automata, regular expressions, and context-free grammars",
        "Turing machines and computational complexity",
        "Formal language theory and compiler design principles"
      ],
      link: "/portfolio/docs/chatgpt.pdf"
    },
    {
      title: "Master Generative AI & Tools",
      institution: "Udemy",
      date: "August 2025",
      icon: <FaBrain />,
      color: "from-purple-500 to-pink-500",
      skills: [
        "GANs, VAEs, Transformers & generative pipelines",
        "AI-generated images, text & audio workflows",
        "Hands-on projects using modern generative AI tools"
      ],
      link: "/portfolio/docs/master-sayantan.pdf"
    },
    {
      title: "Build Generative AI Apps with No-Code",
      institution: "Infosys Springboard",
      date: "August 2025",
      icon: <FaBrain />,
      color: "from-green-500 to-emerald-500",
      skills: [
        "Created AI applications without writing code",
        "Drag-and-drop builders to integrate AI modules",
        "End-to-end deployment for AI applications"
      ],
      link: "/portfolio/docs/build-ai.pdf"
    },
    {
      title: "Test Tribe REST Assured Course",
      institution: "Test Tribe",
      date: "January 2026",
      icon: <FaTools />,
      color: "from-orange-500 to-red-500",
      skills: [
        "REST API automation using REST Assured framework",
        "Advanced API testing patterns and best practices",
        "Integration with TestNG and Maven for CI/CD"
      ],
      link: "/portfolio/docs/microservices.pdf"
    },
    {
      title: "Test Automation using SOAP UI",
      institution: "LinkedIn Learning",
      date: "January 2026",
      icon: <FaCode />,
      color: "from-indigo-500 to-purple-500",
      skills: [
        "SOAP and REST web services testing automation",
        "Advanced scripting and data-driven testing",
        "Performance testing and load testing with SOAP UI"
      ],
      link: "/portfolio/docs/soapui.pdf"
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
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <Award className={`w-8 h-8 ${
              isDark ? 'text-amber-400' : 'text-amber-600'
            }`} />
          </motion.div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 pb-2 tracking-tight bg-gradient-to-r ${
            isDark 
              ? 'from-blue-400 via-purple-400 to-pink-400' 
              : 'from-blue-600 via-purple-600 to-pink-600'
          } bg-clip-text text-transparent`}>
            Certifications
          </h1>
          
          <p className={`text-xl max-w-3xl mx-auto ${
            isDark ? 'text-slate-400' : 'text-slate-700'
          }`}>
            Professional certifications and courses that showcase my commitment to continuous learning 
            and expertise in emerging technologies.
          </p>
        </motion.div>

        {/* Certificates Grid - 3 columns like Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {certificates.map((cert, index) => (
            <CertificateCard key={cert.title} cert={cert} index={index} />
          ))}
        </div>


      </div>
    </section>
  )
}