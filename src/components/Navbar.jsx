import React, { useState, useEffect } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { FiMenu, FiX } from "react-icons/fi"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const location = useLocation()

  // Auto-close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Skills", path: "/skills" },
    { name: "Projects", path: "/projects" },
    { name: "Internships", path: "/internships" },
    { name: "Certificates", path: "/certificates" },
    { name: "Achievements", path: "/achievements" },
    { name: "Research", path: "/research" },
    { name: "Education", path: "/education" },
    { name: "Contact", path: "/contact" },
  ]

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-slate-700/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link className="text-sky-400 text-2xl font-bold" to="/">
          SayantanXBTC
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex gap-6 text-gray-300 items-center">
          {links.map((link) => (
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

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden text-sky-300 p-2"
        >
          <FiMenu size={28} />
        </button>
      </div>

      {/* MOBILE OVERLAY MENU */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm md:hidden z-50">
          <div
            className="absolute right-0 top-0 h-full w-72 bg-slate-900 p-6 flex flex-col gap-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setMenuOpen(false)}
              className="text-sky-300 self-end"
            >
              <FiX size={28} />
            </button>

            {/* MOBILE NAV LINKS */}
            <div className="flex flex-col gap-4 text-lg">
              {links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `py-1 ${
                      isActive
                        ? "text-sky-400 font-semibold"
                        : "text-gray-200 hover:text-sky-300"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
