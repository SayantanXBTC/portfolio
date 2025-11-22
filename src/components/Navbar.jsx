import React, { useState, useEffect } from "react"
import { Link, NavLink } from "react-router-dom"
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi"

export default function Navbar() {
  const [theme, setTheme] = useState("dark")
  const [menuOpen, setMenuOpen] = useState(false)

  // Load theme on start
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
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/30 dark:bg-black/40 border-b border-slate-700/30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link className="text-sky-400 text-2xl font-bold tracking-wide" to="/">
          Sayantan
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex gap-6 text-gray-300 items-center">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `hover:text-sky-400 transition relative pb-1 
                ${isActive ? "text-sky-400 font-semibold" : ""}`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* THEME BUTTON */}
          <button
            onClick={toggleTheme}
            className="ml-4 p-2 rounded-full bg-slate-700/40 hover:bg-slate-600 transition shadow"
          >
            {theme === "dark" ? (
              <FiSun className="text-yellow-300 text-xl" />
            ) : (
              <FiMoon className="text-gray-900 text-xl" />
            )}
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden p-2 text-sky-300"
        >
          <FiMenu size={26} />
        </button>
      </div>

      {/* MOBILE OVERLAY MENU */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm md:hidden z-50"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-64 bg-slate-900 shadow-xl p-6 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="ml-auto text-sky-300 mb-4"
              onClick={() => setMenuOpen(false)}
            >
              <FiX size={28} />
            </button>

            {/* Mobile Links */}
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-lg ${
                    isActive
                      ? "text-sky-400 font-semibold"
                      : "text-gray-200 hover:text-sky-300"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Theme Toggle - Mobile */}
            <button
              onClick={toggleTheme}
              className="mt-6 p-2 rounded-full bg-slate-700/40 hover:bg-slate-600 transition shadow self-start"
            >
              {theme === "dark" ? (
                <FiSun className="text-yellow-300 text-xl" />
              ) : (
                <FiMoon className="text-gray-900 text-xl" />
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
