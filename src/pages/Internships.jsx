import { motion } from "framer-motion"
import { FaCode, FaCertificate, FaCalendarAlt, FaBuilding } from "react-icons/fa"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { useTheme } from "../contexts/ThemeContext"

const internships = [
  {
    title: "JAVA Programming Intern",
    org: "Techvanto Academy",
    period: "June 2025 - Aug 2025",
    detail:
      "Developed advanced Java modules focusing on concurrency, collections, and JDBC. Designed unit & integration tests and improved performance across database operations.",
    responsibilities: [
      "Designed multithreaded components handling concurrent requests",
      "Implemented JDBC connection pooling and optimized SQL queries",
      "Created automated test suites for core modules with JUnit and TestNG",
    ],
    impact:
      "Reduced average request processing time by ~25% and improved test coverage to 88%",
    certificate: "/portfolio/docs/sayantan-intern.jpg",
    icon: <FaCode />,
    color: "from-orange-500 to-red-500"
  },
]

export default function Internships() {
  const { isDark } = useTheme()
  
  return (
    <section className="min-h-screen pt-28 px-6 pb-16 relative" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto relative" style={{ zIndex: 2 }}>
        <motion.h1 
          className={`text-5xl md:text-6xl font-bold text-center mb-6 pb-2 tracking-tight bg-gradient-to-r ${
            isDark 
              ? 'from-blue-400 via-purple-400 to-pink-400' 
              : 'from-blue-600 via-purple-600 to-pink-600'
          } bg-clip-text text-transparent`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Internships
        </motion.h1>
        
        <motion.p 
          className={`text-center mb-16 max-w-3xl mx-auto text-xl ${
            isDark ? 'text-slate-400' : 'text-slate-700'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Professional experience and hands-on learning opportunities that have shaped 
          my technical skills and industry knowledge.
        </motion.p>

        <div className="grid gap-8">
          {internships.map((internship, index) => (
            <motion.div
              key={internship.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1] 
              }}
              whileHover={{ y: -6 }}
            >
              <Card>
                <CardContent className="p-10">
                  {/* Header Section */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
                    <div className="flex items-start gap-6">
                      {/* Icon */}
                      <div className={`p-5 rounded-2xl bg-gradient-to-r ${internship.color} text-white flex-shrink-0 shadow-lg`}>
                        <div className="text-4xl">{internship.icon}</div>
                      </div>
                      
                      {/* Title and Organization */}
                      <div>
                        <h3 className={`text-3xl font-bold mb-3 tracking-tight ${
                          isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}>
                          {internship.title}
                        </h3>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                          <div className="flex items-center gap-3">
                            <FaBuilding className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                            <span className={`font-medium ${
                              isDark ? 'text-slate-400' : 'text-slate-700'
                            }`}>{internship.org}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <FaCalendarAlt className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                            <span className={isDark ? 'text-slate-400' : 'text-slate-700'}>
                              {internship.period}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Impact Badge */}
                    <div className={`p-5 rounded-xl max-w-sm ${
                      isDark 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-green-100 border border-green-300'
                    }`}>
                      <p className={`font-semibold text-sm ${
                        isDark ? 'text-green-400' : 'text-green-700'
                      }`}>
                        <span className="block mb-2">Impact:</span>
                        {internship.impact}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-lg leading-relaxed mb-8 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {internship.detail}
                  </p>

                  {/* Responsibilities */}
                  <div className="mb-8">
                    <h4 className={`font-semibold text-xl mb-4 flex items-center gap-3 ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isDark ? 'bg-blue-400' : 'bg-blue-600'
                      }`}></div>
                      Key Responsibilities
                    </h4>
                    <ul className="space-y-3">
                      {internship.responsibilities.map((responsibility, idx) => (
                        <li key={idx} className={`flex items-start gap-4 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                            isDark ? 'bg-blue-400' : 'bg-blue-600'
                          }`}></div>
                          <span className="leading-relaxed text-lg">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Certificate Button */}
                  <div className="flex justify-start">
                    <a
                      href={internship.certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="gradient" size="lg">
                        <FaCertificate />
                        View Certificate
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}