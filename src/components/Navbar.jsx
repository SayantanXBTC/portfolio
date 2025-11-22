import React, { useState, useEffect } from "react"
import { Link, NavLink } from "react-router-dom"
import { FiSun, FiMoon } from "react-icons/fi"

export default function Navbar() {
  const [theme, setTheme] = useState("dark")

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark"
    setTheme(saved)
    document.documentElement.classList.toggle("dark", saved === "dark")
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
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
    <nav className="fixed top-0 left-0 w-full z-40 backdrop-blur-xl bg-black/30 dark:bg-black/40 border-b border-slate-700/30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link className="text-sky-400 text-2xl font-bold tracking-wide" to="/">
          Sayantan
        </Link>

        {/* NAV LINKS */}
        <div className="hidden md:flex gap-6 text-gray-300">
          {links.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `hover:text-sky-400 transition ${
                  isActive ? "text-sky-400 font-semibold" : ""
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-slate-700/40 hover:bg-slate-600 transition shadow"
        >
          {theme === "dark" ? (
            <FiSun className="text-yellow-300 text-xl" />
          ) : (
            <FiMoon className="text-slate-900 text-xl" />
          )}
        </button>
      </div>
    </nav>
  )
}
