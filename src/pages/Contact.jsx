import { useState } from "react"
import { motion } from "framer-motion"
import { 
  FaEnvelope, 
  FaLinkedin, 
  FaGithub, 
  FaInstagram, 
  FaMapMarkerAlt, 
  FaPhone,
  FaPaperPlane,
  FaUser,
  FaComment
} from "react-icons/fa"
import { Mail } from "lucide-react"
import emailjs from "emailjs-com"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { useTheme } from "../contexts/ThemeContext"

export default function Contact(){
  const [form, setForm] = useState({ name: "", email: "", message: ""})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const { isDark } = useTheme()

  const serviceID = "service_iqvvqxr"
  const templateID = "template_iqvvqxr"
  const userID = "Iq_vvQXRiqvvqxr"

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
      setSuccess({ ok: true, msg: "Message sent successfully! I'll get back to you soon." })
      setForm({ name: "", email: "", message: "" })
    }).catch(err => {
      setLoading(false)
      setSuccess({ ok: false, msg: "Failed to send message. Please try again." })
      console.error(err)
    })
  }

  const contactInfo = [
    {
      icon: <FaEnvelope />,
      label: "Email",
      value: "bhattacharjeesayantan86@gmail.com",
      link: "mailto:bhattacharjeesayantan86@gmail.com"
    },
    {
      icon: <FaPhone />,
      label: "Phone",
      value: "+91 9366335595 / +91 8798144052",
      link: "tel:+919366335595"
    },
    {
      icon: <FaMapMarkerAlt />,
      label: "Location",
      value: "Agartala, Tripura, India",
      link: null
    }
  ]

  const socialLinks = [
    {
      icon: <FaLinkedin />,
      label: "LinkedIn",
      link: "https://www.linkedin.com/in/sayantan-bhattacharje/",
      color: "hover:text-blue-400"
    },
    {
      icon: <FaGithub />,
      label: "GitHub", 
      link: "https://github.com/SayantanXBTC",
      color: "hover:text-slate-300"
    },
    {
      icon: <FaInstagram />,
      label: "Instagram",
      link: "https://instagram.com/sayantanxbtc",
      color: "hover:text-pink-400"
    }
  ]

  return (
    <section className="min-h-screen pt-20 sm:pt-28 px-4 sm:px-6 pb-12 sm:pb-16 relative" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4 sm:mb-6"
          >
            <Mail className={`w-6 h-6 sm:w-8 sm:h-8 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </motion.div>
          
          <motion.h1 
            className={`text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 sm:mb-6 pb-2 tracking-tight bg-gradient-to-r ${
              isDark 
                ? 'from-blue-400 via-purple-400 to-pink-400' 
                : 'from-blue-600 via-purple-600 to-pink-600'
            } bg-clip-text text-transparent`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Let's Connect
          </motion.h1>
          
          <motion.p 
            className={`text-center mb-8 sm:mb-16 max-w-2xl mx-auto text-base sm:text-xl px-4 ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Have a project in mind or want to collaborate? I'd love to hear from you. 
            Let's build something amazing together.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ x: 4 }}
          >
            <Card>
              <CardContent className="p-10">
                <h2 className={`text-3xl font-semibold mb-8 flex items-center gap-4 tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>
                  <FaPaperPlane />
                  Send Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <FaUser className={`absolute left-5 top-4 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <input 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      placeholder="Your Name" 
                      className={`w-full pl-14 pr-5 py-4 rounded-xl transition-colors ${
                        isDark 
                          ? 'bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-400 focus:border-blue-400' 
                          : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                      } focus:outline-none`}
                    />
                  </div>
                  
                  <div className="relative">
                    <FaEnvelope className={`absolute left-5 top-4 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <input 
                      name="email" 
                      type="email"
                      value={form.email} 
                      onChange={handleChange} 
                      placeholder="Your Email" 
                      className={`w-full pl-14 pr-5 py-4 rounded-xl transition-colors ${
                        isDark 
                          ? 'bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-400 focus:border-blue-400' 
                          : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                      } focus:outline-none`}
                    />
                  </div>
                  
                  <div className="relative">
                    <FaComment className={`absolute left-5 top-4 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <textarea 
                      name="message" 
                      value={form.message} 
                      onChange={handleChange} 
                      rows="6" 
                      placeholder="Your Message" 
                      className={`w-full pl-14 pr-5 py-4 rounded-xl transition-colors resize-none ${
                        isDark 
                          ? 'bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-400 focus:border-blue-400' 
                          : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                      } focus:outline-none`}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    variant="gradient"
                    size="lg"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </Button>

                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl ${success.ok ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'}`}
                    >
                      {success.msg}
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info & Social */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Contact Information */}
            <Card>
              <CardContent className="p-10">
                <h2 className={`text-3xl font-semibold mb-8 tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>Contact Information</h2>
                
                <div className="space-y-5">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={info.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex items-center gap-5 p-4 rounded-xl transition-colors ${
                        isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className={isDark ? 'text-blue-400' : 'text-blue-600'} style={{ fontSize: '24px' }}>
                        {info.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>{info.label}</p>
                        {info.link ? (
                          <a 
                            href={info.link} 
                            className={`text-lg transition-colors ${
                              isDark 
                                ? 'text-slate-200 hover:text-blue-400' 
                                : 'text-slate-900 hover:text-blue-600'
                            }`}
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className={`text-lg ${
                            isDark ? 'text-slate-200' : 'text-slate-900'
                          }`}>{info.value}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardContent className="p-10">
                <h2 className={`text-3xl font-semibold mb-8 tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>Follow Me</h2>
                
                <div className="flex gap-5">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.label}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-5 rounded-xl transition-all duration-300 ${
                        isDark 
                          ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      } ${social.color}`}
                    >
                      <div className="text-3xl">{social.icon}</div>
                    </motion.a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Response Promise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card hover={false} className={`border-blue-500/20 ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10' 
                  : 'bg-gradient-to-br from-blue-100 to-cyan-100'
              }`}>
                <CardContent className="p-8">
                  <h3 className={`text-xl font-semibold mb-3 ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}>Quick Response</h3>
                  <p className={isDark ? 'text-slate-400' : 'text-slate-700'}>
                    I typically respond within 24 hours. For urgent matters, 
                    feel free to reach out via LinkedIn or email directly.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}