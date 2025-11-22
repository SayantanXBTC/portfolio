import React, { useState } from "react"
import emailjs from "emailjs-com"
import { motion } from "framer-motion"

export default function Contact() {
  const [status, setStatus] = useState("")

  const sendMessage = e => {
    e.preventDefault()
    setStatus("Sending...")

    emailjs
      .sendForm(
        "SERVICE_ID",      // ← replace with EmailJS service ID
        "TEMPLATE_ID",     // ← replace with EmailJS template ID
        e.target,
        "USER_ID"          // ← replace with EmailJS public key
      )
      .then(() => {
        setStatus("Message sent!")
        e.target.reset()
      })
      .catch(() => setStatus("Failed to send."))
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center pt-28 px-6 text-center"
    >
      <h1 className="text-4xl text-sky-400 font-bold mb-8" data-aos="fade-up">
        Contact
      </h1>

      <motion.form
        onSubmit={sendMessage}
        data-aos="fade-up"
        className="max-w-xl w-full glass p-8 rounded-2xl shadow-lg text-left"
      >
        <label className="text-slate-300">Name</label>
        <input
          name="from_name"
          required
          className="w-full p-3 bg-transparent border border-slate-700 rounded mb-4"
        />

        <label className="text-slate-300">Email</label>
        <input
          name="from_email"
          type="email"
          required
          className="w-full p-3 bg-transparent border border-slate-700 rounded mb-4"
        />

        <label className="text-slate-300">Subject</label>
        <input
          name="subject"
          className="w-full p-3 bg-transparent border border-slate-700 rounded mb-4"
        />

        <label className="text-slate-300">Message</label>
        <textarea
          name="message"
          rows="5"
          required
          className="w-full p-3 bg-transparent border border-slate-700 rounded mb-4"
        ></textarea>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-brand-500 text-black rounded-lg hover:-translate-y-1 transition"
          >
            Send Message
          </button>
          <span className="text-slate-400">{status}</span>
        </div>

        <p className="mt-4 text-slate-500 text-sm">
          Replace SERVICE_ID, TEMPLATE_ID, USER_ID with EmailJS credentials.
        </p>
      </motion.form>
    </motion.section>
  )
}
