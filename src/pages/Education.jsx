import { motion } from "framer-motion"
import { FaGraduationCap, FaUniversity, FaSchool } from "react-icons/fa"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { useTheme } from "../contexts/ThemeContext"

export default function Education() {
  const { isDark } = useTheme()
  
  const educationData = [
    {
      title: "B.Tech — Computer Science & Engineering",
      subtitle: "Lovely Professional University • Aug 2023 – Present",
      details: "CGPA: 9.1 • Coursework: Data Structures, OS, DBMS, Software Testing",
      icon: <FaGraduationCap />,
      color: "from-blue-500 to-purple-600",
      status: "Current"
    },
    {
      title: "Intermediate — Hindi Higher Secondary School",
      subtitle: "Agartala, Tripura • 2020 – 2022",
      details: "Percentage: 93.6% • Focus: Physics & Maths",
      icon: <FaUniversity />,
      color: "from-green-500 to-teal-500",
      status: "Completed"
    },
    {
      title: "Matriculation — Holy Cross School",
      subtitle: "Agartala, Tripura • 2019 – 2020",
      details: "Percentage: 96%",
      icon: <FaSchool />,
      color: "from-orange-500 to-red-500",
      status: "Completed"
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  return (
    <section className="min-h-screen pt-20 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 relative" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4 sm:mb-6"
          >
            <FaGraduationCap className={`text-4xl sm:text-5xl ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </motion.div>
          
          <motion.h1 
            className={`text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 sm:mb-6 pb-2 tracking-tight bg-gradient-to-r ${
              isDark 
                ? 'from-blue-400 via-purple-400 to-pink-400' 
                : 'from-blue-600 via-purple-600 to-pink-600'
            } bg-clip-text text-transparent`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Education
          </motion.h1>
          
          <motion.p 
            className={`text-center max-w-3xl mx-auto text-base sm:text-xl px-4 ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            My academic journey showcasing consistent excellence and a strong foundation 
            in computer science and engineering principles.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 mb-12 sm:mb-16"
        >
          {educationData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.2,
                ease: [0.22, 1, 0.36, 1] 
              }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card>
              <CardContent className="p-10">
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={`p-5 rounded-2xl bg-gradient-to-r ${item.color} text-white flex-shrink-0 shadow-lg`}>
                    <div className="text-4xl">{item.icon}</div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3 gap-4">
                      <h2 className={`text-3xl font-bold tracking-tight ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}>
                        {item.title}
                      </h2>
                      <Badge variant={item.status === 'Current' ? 'success' : 'primary'} className="text-sm py-2 px-4">
                        {item.status}
                      </Badge>
                    </div>

                    <p className={`mb-5 font-medium text-lg ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {item.subtitle}
                    </p>

                    <div className={`p-5 rounded-xl border-l-4 ${
                      isDark 
                        ? 'bg-slate-800/30 border-blue-400' 
                        : 'bg-blue-50 border-blue-500'
                    }`}>
                      <p className={`text-lg leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-800'
                      }`}>
                        {item.details}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}