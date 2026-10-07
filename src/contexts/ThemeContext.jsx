import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDark(savedTheme === 'dark')
    }
  }, [])

  const toggleTheme = () => {
    // Start transition animation
    setIsTransitioning(true)
    
    // Add transition class to body
    document.body.style.transition = 'background-color 0.4s cubic-bezier(0.22, 1, 0.36, 1), color 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
    
    // Toggle theme after a brief delay for smooth animation
    setTimeout(() => {
      const newTheme = !isDark
      setIsDark(newTheme)
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      
      // End transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false)
        document.body.style.transition = ''
      }, 400)
    }, 50)
  }

  const theme = {
    isDark,
    toggleTheme,
    isTransitioning,
    // Framer-style background system
    bg: isDark 
      ? 'bg-slate-950' 
      : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
    // Text hierarchy - Framer style
    text: {
      primary: isDark ? 'text-slate-100' : 'text-slate-900',
      secondary: isDark ? 'text-slate-400' : 'text-slate-600',
      tertiary: isDark ? 'text-slate-500' : 'text-slate-500',
      accent: isDark ? 'text-blue-400' : 'text-blue-600',
      muted: isDark ? 'text-slate-600' : 'text-slate-400'
    },
    // Framer-style card system
    card: isDark 
      ? 'bg-gradient-to-b from-slate-900/50 to-slate-900/30 backdrop-blur-xl border-slate-800/50' 
      : 'bg-white/70 backdrop-blur-xl border-slate-200/50',
    cardHover: isDark
      ? 'hover:border-slate-700/50 hover:shadow-glow-hover'
      : 'hover:border-blue-400/50 hover:shadow-lg',
    // Input system
    input: isDark 
      ? 'bg-slate-900/50 border-slate-800/50 focus:border-blue-500' 
      : 'bg-white/80 border-slate-300/50 focus:border-blue-500',
    // Navbar - Framer style
    navbar: isDark 
      ? 'bg-slate-950/80 backdrop-blur-xl border-slate-800/50' 
      : 'bg-white/80 backdrop-blur-xl border-slate-200/30',
    // Button variants - shadcn inspired
    button: {
      primary: isDark
        ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-600'
        : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-600',
      secondary: isDark
        ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
        : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900',
      ghost: isDark
        ? 'hover:bg-slate-800/50 text-slate-300 hover:text-blue-400'
        : 'hover:bg-slate-100 text-slate-700 hover:text-blue-600',
      outline: isDark
        ? 'bg-transparent hover:bg-slate-800/50 text-slate-300 border-slate-700'
        : 'bg-transparent hover:bg-slate-50 text-slate-700 border-slate-300',
    }
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}