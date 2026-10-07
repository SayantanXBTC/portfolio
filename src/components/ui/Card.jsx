import { motion } from "framer-motion"
import { forwardRef } from "react"
import { useTheme } from "../../contexts/ThemeContext"

const Card = forwardRef(({ 
  className = "", 
  children, 
  hover = true,
  gradient = false,
  ...props 
}, ref) => {
  const { isDark } = useTheme()
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { 
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}}
      className={`
        relative rounded-2xl border backdrop-blur-xl
        ${isDark 
          ? 'border-slate-800/50 bg-gradient-to-b from-slate-900/50 to-slate-900/30' 
          : 'border-slate-300/60 bg-white/90 shadow-sm'
        }
        ${hover ? (isDark 
          ? 'hover:border-slate-700/50 hover:shadow-lg hover:shadow-blue-500/5' 
          : 'hover:border-slate-400/60 hover:shadow-xl hover:shadow-blue-500/10'
        ) : ''}
        ${gradient ? 'before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-b before:from-slate-700/50 before:to-transparent before:-z-10' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
})

Card.displayName = "Card"

const CardHeader = ({ className = "", children, ...props }) => {
  const { isDark } = useTheme()
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

const CardTitle = ({ className = "", children, ...props }) => {
  const { isDark } = useTheme()
  return (
    <h3 className={`text-xl font-semibold tracking-tight ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    } ${className}`} {...props}>
      {children}
    </h3>
  )
}

const CardDescription = ({ className = "", children, ...props }) => {
  const { isDark } = useTheme()
  return (
    <p className={`text-sm mt-1.5 ${
      isDark ? 'text-slate-400' : 'text-slate-600'
    } ${className}`} {...props}>
      {children}
    </p>
  )
}

const CardContent = ({ className = "", children, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
)

const CardFooter = ({ className = "", children, ...props }) => (
  <div className={`p-6 pt-0 flex items-center ${className}`} {...props}>
    {children}
  </div>
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
