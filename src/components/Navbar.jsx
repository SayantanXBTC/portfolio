import React, { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { FiMenu, FiX } from "react-icons/fi"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Skills", path: "/skills" },
    { name: "Projects", path: "/projects" },
    { name: "Research", path: "/research" },
    { name: "Internships", path: "/internships" },
    { name: "Certificates", path: "/certificates" },
    { name: "Achievements", path: "/achievements" },
    { name: "Education", path: "/education" },
    { name: "Contact", path: "/contact" },
  ]

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-black/40 backdrop-blur-xl border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* LOGO */}
          <Link className="text-sky-400 text-2xl font-bold tracking-wide" to="/">
            SayantanXBTC
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 text-gray-300 items-center">
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

          {/* Mobile Icon */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 text-sky-300"
          >
            <FiMenu size={28} />
          </button>
        </div>
      </nav>

      {/* MOBILE OVERLAY - OUTSIDE NAV */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-40
        ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* SIDE DRAWER - OUTSIDE NAV */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-slate-900 shadow-xl p-6 z-50
        transform transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <button
          className="mb-6 text-sky-300"
          onClick={() => setMenuOpen(false)}
        >
          <FiX size={28} />
        </button>

        <div className="flex flex-col gap-5">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-lg ${
                  isActive
                    ? "text-sky-400 font-semibold"
                    : "text-gray-300 hover:text-sky-300"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  )
}
