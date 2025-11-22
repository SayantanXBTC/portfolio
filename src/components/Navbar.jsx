import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar() {
  const loc = useLocation()

  const items = [
    ['Home', '/'],
    ['About', '/about'],
    ['Skills', '/skills'],
    ['Projects', '/projects'],
    ['Internships', '/internships'],
    ['Certificates', '/certificates'],
    ['Achievements', '/achievements'],
    ['Education', '/education'],
    ['Contact', '/contact']
  ]

  return (
    <header className="fixed w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-brand-300">
          SayantanXBTC
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-3 items-center">
          {items.map(([label, path]) => (
            <Link
              key={path}
              to={path}
              className={`relative px-3 py-2 rounded-lg transition 
                ${
                  loc.pathname === path
                    ? 'bg-slate-800 text-brand-300'
                    : 'text-slate-300 hover:text-brand-300'
                }`}
            >
              <motion.span whileHover={{ scale: 1.03 }} className="inline-block">
                {label}
              </motion.span>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <MobileMenu items={items} current={loc.pathname} />
        </div>
      </div>
    </header>
  )
}

function MobileMenu({ items, current }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 bg-slate-800 rounded"
      >
        ☰
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-slate-900 p-2 rounded shadow-lg w-48">
          {items.map(([label, path]) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 
                ${current === path ? 'text-sky-300' : 'text-slate-300'}
              `}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
