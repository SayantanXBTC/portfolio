import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTrophy, FaRocket, FaUsers, FaMedal, FaStar, FaAward, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { Badge } from "../components/ui/Badge"
import { useTheme } from "../contexts/ThemeContext"
import { Sparkles } from "lucide-react"

// Image Lightbox Component
const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  const { isDark } = useTheme()
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
      >
        <FaTimes className="w-6 h-6" />
      </motion.button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1, x: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <FaChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, x: 4 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <FaChevronRight className="w-6 h-6" />
          </motion.button>
        </>
      )}

      {/* Image Container with Scroll */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-6xl w-full max-h-[90vh] overflow-auto"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) transparent'
        }}
      >
        <img
          src={images[currentIndex]}
          alt="Achievement"
          className="w-full h-auto rounded-2xl shadow-2xl"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="sticky bottom-4 left-1/2 -translate-x-1/2 inline-block px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// Achievement Card Component with Premium Interactions
const AchievementCard = ({ achievement, index }) => {
  const { isDark } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openLightbox = (imageIndex) => {
    setCurrentImageIndex(imageIndex)
    setLightboxOpen(true)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % achievement.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + achievement.images.length) % achievement.images.length)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration: 1, 
          delay: index * 0.15,
          ease: [0.16, 1, 0.3, 1] // Nike-style easing
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group"
      >
        {/* Premium Glow Effect */}
        <motion.div 
          className={`absolute -inset-4 rounded-3xl bg-gradient-to-r ${achievement.color} opacity-0 blur-3xl`}
          animate={{ 
            opacity: isHovered ? 0.3 : 0,
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        
        <motion.div 
          className={`relative overflow-hidden rounded-3xl border backdrop-blur-xl ${
            isDark 
              ? 'border-slate-800/50 bg-gradient-to-b from-slate-900/80 to-slate-900/40' 
              : 'border-slate-300/60 bg-white/95 shadow-2xl'
          }`}
          whileHover={{ 
            y: -12,
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
          }}
        >
          {/* Animated Gradient Border */}
          <motion.div 
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${achievement.color}`}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: index * 0.15 + 0.3 }}
          />
          
          {/* Shine Effect on Hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: isHovered ? "200%" : "-100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          
          <div className="p-10">
            {/* Header with Icon - Nike-style layout */}
            <div className="flex items-start gap-8 mb-8">
              <motion.div 
                className={`p-6 rounded-2xl bg-gradient-to-br ${achievement.color} text-white flex-shrink-0 shadow-2xl`}
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.6 }
                }}
              >
                <div className="text-5xl">{achievement.icon}</div>
              </motion.div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <motion.h3 
                    className={`text-3xl md:text-4xl font-bold tracking-tight ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.2 }}
                  >
                    {achievement.title}
                  </motion.h3>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Badge variant="primary" className="text-base py-2.5 px-5 font-semibold">
                      {achievement.badge}
                    </Badge>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Description - Premium typography */}
            <motion.p 
              className={`text-lg md:text-xl leading-relaxed mb-8 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + 0.3 }}
            >
              {achievement.detail}
            </motion.p>
            
            {/* Impact Box - Nike-style callout */}
            <motion.div 
              className={`p-6 rounded-2xl border-l-4 mb-8 ${
                isDark 
                  ? 'bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-blue-400' 
                  : 'bg-gradient-to-r from-blue-50 to-transparent border-blue-500'
              }`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + 0.4 }}
              whileHover={{ x: 4 }}
            >
              <p className={`font-bold text-lg flex items-center gap-3 mb-3 ${
                isDark ? 'text-blue-400' : 'text-blue-700'
              }`}>
                <FaStar className="text-xl" />
                Impact
              </p>
              <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                {achievement.impact}
              </p>
            </motion.div>

            {/* Interactive Image Gallery - Premium grid */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + 0.5 }}
            >
              <div className="flex items-center justify-between">
                <h4 className={`text-lg font-bold ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                }`}>
                  Gallery
                </h4>
                <span className={`text-sm font-medium ${
                  isDark ? 'text-slate-500' : 'text-slate-600'
                }`}>
                  {achievement.images.length} {achievement.images.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>
              
              <div className={`grid ${
                achievement.images.length === 1 ? 'grid-cols-1 max-w-md' : 
                achievement.images.length === 2 ? 'grid-cols-2' : 
                'grid-cols-3'
              } gap-4`}>
                {achievement.images.map((image, imgIndex) => (
                  <motion.div
                    key={imgIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: index * 0.15 + 0.6 + imgIndex * 0.1,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -8,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openLightbox(imgIndex)}
                    className={`relative ${
                      achievement.images.length === 1 ? 'aspect-[4/3]' : 'aspect-video'
                    } rounded-2xl overflow-hidden cursor-pointer group/img`}
                  >
                    {/* Image */}
                    <img
                      src={image}
                      alt={`${achievement.title} ${imgIndex + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                    />
                    
                    {/* Premium Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className={`absolute inset-0 bg-gradient-to-t ${
                        isDark 
                          ? 'from-black/80 via-black/40 to-transparent' 
                          : 'from-black/60 via-black/30 to-transparent'
                      } flex flex-col items-center justify-center gap-2`}
                    >
                      <Sparkles className="w-10 h-10 text-white" />
                      <span className="text-white text-sm font-semibold">View Full Size</span>
                    </motion.div>
                    
                    {/* Corner Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                      {imgIndex + 1}/{achievement.images.length}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <ImageLightbox
            images={achievement.images}
            currentIndex={currentImageIndex}
            onClose={() => setLightboxOpen(false)}
            onNext={nextImage}
            onPrev={prevImage}
          />
        )}
      </AnimatePresence>
    </>
  )
}

const achievements = [
  {
    title: "National Youth Festival 2025 - State Representative",
    detail:
      "Selected as the state representative from Tripura to present 'Tech for Viksit Bharat 2047' at the National Youth Festival. Presented a 12-minute talk outlining technology-driven education initiatives and prototype ideas for scalable learning platforms.",
    impact: "Presented to national leaders; selected among top delegates for a follow-up workshop.",
    icon: <FaTrophy />,
    color: "from-yellow-500 to-orange-500",
    badge: "National Recognition",
    images: [
      "/portfolio/images/NYF1.jpeg",
      "/portfolio/images/NYF2.jpeg",
      "/portfolio/images/NYF3.jpeg",
      "/portfolio/images/NYF4.jpeg",
      "/portfolio/images/NYF5.jpeg"
    ]
  },
  {
    title: "National Space Day 2025 - Quiz Winner",
    detail:
      "Ranked among the top 100 participants in a national-level space quiz (65,000+ participants). Shortlisted and invited to the ISRO Sriharikota facility for a special outreach program.",
    impact: "Hands-on exposure to launch operations and research teams at ISRO.",
    icon: <FaRocket />,
    color: "from-blue-500 to-purple-500",
    badge: "Top 100",
    images: [
      "/portfolio/images/SPACE.jpeg"
    ]
  },
  {
    title: "President — ConverseE+ Club",
    detail:
      "Led a student-run engineering and entrepreneurship club where I organized 15+ workshops, hackathons and mentoring sessions. Built partnerships with local startups and helped students ship 8 small projects.",
    impact: "Increased club membership and raised sponsorships for events.",
    icon: <FaUsers />,
    color: "from-green-500 to-teal-500",
    badge: "Leadership",
    images: [
      "/portfolio/images/PRES1.jpeg",
      "/portfolio/images/PRES2.jpeg"
    ]
  },
  {
    title: "CPE Multi-Event Winner",
    detail:
      "Won multiple events across debates, quizzes, vocabulary & aptitude at the college level. Regular member of quiz teams and debate squads.",
    impact: "Overall holistic development.",
    icon: <FaMedal />,
    color: "from-purple-500 to-pink-500",
    badge: "Multi-Talented",
    images: [
      "/portfolio/images/CPE1.jpeg",
      "/portfolio/images/CPE2.jpeg",
      "/portfolio/images/CPE3.jpeg",
      "/portfolio/images/CPE4.jpeg"
    ]
  },
]

export default function Achievements() {
  const { isDark } = useTheme()

  return (
    <section className="min-h-screen pt-20 sm:pt-28 px-4 sm:px-6 pb-12 sm:pb-16 relative overflow-hidden" style={{ zIndex: 1 }}>
      {/* Celebration Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute ${isDark ? 'text-yellow-500/20' : 'text-yellow-400/30'}`}
            initial={{ 
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              scale: [0, 1, 0],
              rotate: [0, 360],
              y: [-20, -100]
            }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              repeat: Infinity,
              repeatDelay: 5
            }}
          >
            <FaStar size={20} />
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative" style={{ zIndex: 2 }}>
        {/* Grand Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex p-4 sm:p-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-4 sm:mb-6 shadow-2xl"
          >
            <FaAward size={32} className="sm:w-12 sm:h-12" />
          </motion.div>

          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 pb-2 tracking-tight bg-gradient-to-r ${
            isDark 
              ? 'from-blue-400 via-purple-400 to-pink-400' 
              : 'from-blue-600 via-purple-600 to-pink-600'
          } bg-clip-text text-transparent`}>
            Achievements & Recognition
          </h1>
          
          <p className={`text-base sm:text-xl max-w-3xl mx-auto px-4 ${
            isDark ? 'text-slate-400' : 'text-slate-700'
          }`}>
            Celebrating milestones, recognition, and moments of excellence that define my journey
          </p>
        </motion.div>

        {/* Achievement Cards */}
        <div className="grid gap-8 sm:gap-12">
          {achievements.map((achievement, index) => (
            <AchievementCard key={achievement.title} achievement={achievement} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
