import React, { useState } from "react"
import emailjs from "emailjs-com"

export default function Contact(){
  const [form, setForm] = useState({ name: "", email: "", message: ""})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const serviceID = "YOUR_EMAILJS_SERVICE_ID"
  const templateID = "YOUR_EMAILJS_TEMPLATE_ID"
  const userID = "YOUR_EMAILJS_USER_ID" // public key

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setSuccess({ ok: false, msg: "Please fill all fields." })
      return
    }
    setLoading(true)
    emailjs.send(serviceID, templateID, {
      from_name: form.name,
      from_email: form.email,
      message: form.message
    }, userID).then(() => {
      setLoading(false)
      setSuccess({ ok: true, msg: "Message sent — thank you!" })
      setForm({ name: "", email: "", message: "" })
    }).catch(err => {
      setLoading(false)
      setSuccess({ ok: false, msg: "Failed to send — try again later." })
      console.error(err)
    })
  }

  return (
    <section className="min-h-screen pt-28 px-6">
      <h1 className="text-4xl text-sky-300 font-bold mb-8 text-center">
  Contact
</h1>


      <div className="max-w-3xl mx-auto glass p-6 rounded-2xl" data-aos="fade-up">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className="p-3 rounded-md bg-slate-900/50 border border-slate-700 text-slate-200" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Your email" className="p-3 rounded-md bg-slate-900/50 border border-slate-700 text-slate-200" />
          <textarea name="message" value={form.message} onChange={handleChange} rows="6" placeholder="Message" className="p-3 rounded-md bg-slate-900/50 border border-slate-700 text-slate-200"></textarea>

          <div className="flex items-center gap-4">
            <button type="submit" className="px-6 py-3 bg-sky-600 rounded-xl text-black font-semibold" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>

            {success && (
              <div className={`p-2 rounded-md ${success.ok ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
                {success.msg}
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
