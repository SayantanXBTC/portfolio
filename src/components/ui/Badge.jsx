import { motion } from "framer-motion"
import { useTheme } from "../../contexts/ThemeContext"

const Badge = ({ 
  children, 
  variant = "default",
  className = "",
  ...props 
}) => {
  const { isDark } = useTheme()
  
  const variants = {
    default: isDark 
      ? "bg-slate-800/50 text-slate-300 border-slate-700/50" 
      : "bg-slate-200/80 text-slate-900 border-slate-300/50",
    primary: isDark 
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
      : "bg-blue-100/80 text-blue-800 border-blue-300/50",
    success: isDark 
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
      : "bg-emerald-100/80 text-emerald-800 border-emerald-300/50",
    warning: isDark 
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
      : "bg-amber-100/80 text-amber-800 border-amber-300/50",
    outline: isDark 
      ? "bg-transparent text-slate-400 border-slate-700/50" 
      : "bg-transparent text-slate-700 border-slate-400/50",
  }

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        inline-flex items-center px-2.5 py-1 rounded-md
        text-xs font-medium border
        transition-colors duration-200
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.span>
  )
}

export { Badge }
