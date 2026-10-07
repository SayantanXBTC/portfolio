import { useState, useEffect } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi"
import { useTheme } from "../contexts/ThemeContext"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [rippleEffect, setRippleEffect] = useState(false)
  const theme = useTheme()
  const location = useLocation()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  // Handle theme toggle with ripple effect
  const handleThemeToggle = () => {
    setRippleEffect(true)
    theme.toggleTheme()
    setTimeout(() => setRippleEffect(false), 800)
  }

  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Skills", path: "/skills" },
    { name: "Projects", path: "/projects" },
    { name: "Internships", path: "/internships" },
    { name: "Certificates", path: "/certificates" },
    { name: "Achievements", path: "/achievements" },
    { name: "Education", path: "/education" },
    { name: "Contact", path: "/contact" },
  ]

  return (
    <>
      {/* Theme Transition Ripple Effect */}
      <AnimatePresence>
        {rippleEffect && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-0 pointer-events-none z-[100] ${
              theme.isDark 
                ? 'bg-gradient-radial from-slate-900 via-slate-800 to-transparent' 
                : 'bg-gradient-radial from-blue-100 via-white to-transparent'
            }`}
            style={{
              background: theme.isDark 
                ? 'radial-gradient(circle at center, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.5) 30%, transparent 70%)'
                : 'radial-gradient(circle at center, rgba(239, 246, 255, 0.9) 0%, rgba(255, 255, 255, 0.5) 30%, transparent 70%)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Premium Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? `${theme.navbar} shadow-lg border-b backdrop-blur-xl` 
            : 'bg-transparent border-b border-transparent backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="relative group"
            >
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                <span className="gradient-text">Sayantan</span>
                <span className={theme.text.tertiary}>XBTC</span>
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-600 group-hover:w-full transition-all duration-300"></div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map((link, index) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive 
                        ? `${theme.text.accent} bg-cyan-500/10` 
                        : `${theme.text.secondary} ${theme.button.ghost}`
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{link.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-cyan-500/10 rounded-lg"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
              
              {/* Theme Toggle */}
              <button
                onClick={handleThemeToggle}
                className={`ml-2 p-2.5 rounded-lg ${theme.button.ghost} transition-all duration-200 relative overflow-hidden`}
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme.isDark ? 0 : 180, scale: rippleEffect ? 1.2 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme.isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                </motion.div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`lg:hidden p-2 rounded-lg ${theme.button.ghost} touch-manipulation`}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={menuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed top-0 right-0 bottom-0 w-full max-w-sm ${theme.isDark ? 'bg-slate-900' : 'bg-white'} shadow-2xl z-50 lg:hidden overflow-y-auto`}
            >
              <div className="p-6 safe-area-inset">
                {/* Mobile Header */}
                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-bold gradient-text">Menu</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleThemeToggle}
                      className={`p-2.5 rounded-lg ${theme.button.ghost} touch-manipulation relative overflow-hidden`}
                      aria-label="Toggle theme"
                    >
                      <motion.div
                        animate={{ scale: rippleEffect ? 1.2 : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {theme.isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
                      </motion.div>
                    </button>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className={`p-2.5 rounded-lg ${theme.button.ghost} touch-manipulation`}
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                </div>

                {/* Mobile Links */}
                <nav className="space-y-2">
                  {links.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                      <NavLink
                        to={link.path}
                        className={({ isActive }) =>
                          `block px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 touch-manipulation ${
                            isActive 
                              ? `${theme.text.accent} bg-cyan-500/10 border border-cyan-500/20` 
                              : `${theme.text.secondary} hover:bg-slate-800/50`
                          }`
                        }
                      >
                        {link.name}
                      </NavLink>
                    </motion.div>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}