import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { ThemeProvider, useTheme } from "./contexts/ThemeContext"
import AnimatedBackground from "./components/AnimatedBackground"

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import About from "./pages/About"
import Skills from "./pages/Skills"
import Projects from "./pages/Projects"
import Internships from "./pages/Internships"
import Certificates from "./pages/Certificates"
import Achievements from "./pages/Achievements"
import Education from "./pages/Education"
import Contact from "./pages/Contact"

function AnimatedRoutes() {
  const location = useLocation()

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.3, 
          ease: [0.22, 1, 0.36, 1]
        }}
        className="pt-16"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/education" element={<Education />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  )
}

function AppContent() {
  const theme = useTheme()
  
  return (
    <div className={`min-h-screen ${theme.text.primary} transition-all duration-500 relative`}>
      <AnimatedBackground />
      <div className="relative" style={{ zIndex: 10 }}>
        <Navbar />
        <AnimatedRoutes />
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Router basename="/portfolio">
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}