import { motion } from "framer-motion"
import { forwardRef } from "react"

const Button = forwardRef(({ 
  children, 
  variant = "default",
  size = "default",
  className = "",
  asChild = false,
  ...props 
}, ref) => {
  const variants = {
    default: "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700",
    primary: "bg-blue-600 hover:bg-blue-500 text-white border-blue-600",
    outline: "bg-transparent hover:bg-slate-800/50 text-slate-300 border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800/30 text-slate-300 border-transparent",
    gradient: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-transparent shadow-lg shadow-blue-500/20",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }

  const Component = asChild ? motion.div : motion.button

  const classes = `
    inline-flex items-center justify-center gap-2
    rounded-lg font-medium border
    transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
    disabled:opacity-50 disabled:pointer-events-none
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `

  if (asChild) {
    return (
      <Component
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={classes}
      >
        {children}
      </Component>
    )
  }

  return (
    <Component
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
      {...props}
    >
      {children}
    </Component>
  )
})

Button.displayName = "Button"

export { Button }
