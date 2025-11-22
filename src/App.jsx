import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import About from "./pages/About"
import Skills from "./pages/Skills"
import Projects from "./pages/Projects"
import Research from "./pages/Research"
import Internships from "./pages/Internships"
import Certificates from "./pages/Certificates"
import Achievements from "./pages/Achievements"
import Education from "./pages/Education"
import Contact from "./pages/Contact"

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <motion.main
      key={location.pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="pt-20"
    >
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/research" element={<Research />} />
        <Route path="/internships" element={<Internships />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/education" element={<Education />} />
        <Route path="/contact" element={<Contact />} />

        {/* FALLBACK: If any invalid path → redirect to Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </motion.main>
  )
}

export default function App() {
  return (
    <Router basename="/portfolio">
      <div className="min-h-screen bg-hero-gradient text-gray-100">
        <Navbar />
        <AnimatedRoutes />
        <Footer />
      </div>
    </Router>
  )
}
