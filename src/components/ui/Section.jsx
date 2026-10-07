import { motion } from "framer-motion"

const Section = ({ 
  children, 
  className = "",
  delay = 0,
  ...props 
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={`min-h-screen py-20 px-6 ${className}`}
      {...props}
    >
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </motion.section>
  )
}

const SectionHeader = ({ 
  title, 
  description,
  className = "" 
}) => {
  return (
    <div className={`mb-16 ${className}`}>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
      >
        <span className="bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
          {title}
        </span>
      </motion.h2>
      {description && (
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg text-slate-400 max-w-2xl"
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}

export { Section, SectionHeader }
