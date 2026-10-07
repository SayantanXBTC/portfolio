import { useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export default function AnimatedBackground() {
  const canvasRef = useRef(null)
  const { isDark } = useTheme()
  const particlesRef = useRef([])
  const creaturesRef = useRef([])
  const animationFrameRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    // Particle class for background dots
    class Particle {
      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.size = Math.random() * 3.5 + 1.2
        this.speedX = (Math.random() - 0.5) * 1.2
        this.speedY = (Math.random() - 0.5) * 1.2
        this.opacity = Math.random() * 0.6 + 0.2
        this.hue = Math.random() * 60 + (isDark ? 200 : 190)
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x < 0 || this.x > width) this.speedX *= -1
        if (this.y < 0 || this.y > height) this.speedY *= -1
        
        // Color shift
        this.hue += 0.1
        if (this.hue > (isDark ? 260 : 250)) this.hue = isDark ? 200 : 190
      }

      draw() {
        ctx.fillStyle = `hsla(${this.hue}, 70%, ${isDark ? 60 : 50}%, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Creature class for IMMERSIVE shapes
    class Creature {
      constructor() {
        this.type = Math.floor(Math.random() * 5)
        this.reset()
      }

      reset() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.size = Math.random() * 180 + 100 // 100-280px (larger)
        this.speedX = (Math.random() - 0.5) * 1.2
        this.speedY = (Math.random() - 0.5) * 1.2
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.015
        this.opacity = Math.random() * 0.18 + 0.08 // More visible
        this.hue = Math.random() * 80 + (isDark ? 180 : 170)
        this.pulseSpeed = Math.random() * 0.012 + 0.006
        this.pulsePhase = Math.random() * Math.PI * 2
        this.vertices = Math.floor(Math.random() * 4) + 5
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.rotation += this.rotationSpeed
        this.pulsePhase += this.pulseSpeed
        
        // Color shift
        this.hue += 0.15
        if (this.hue > (isDark ? 260 : 250)) this.hue = isDark ? 180 : 170

        // Wrap around edges
        if (this.x < -this.size) this.x = width + this.size
        if (this.x > width + this.size) this.x = -this.size
        if (this.y < -this.size) this.y = height + this.size
        if (this.y > height + this.size) this.y = -this.size
      }

      draw() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 1
        const currentSize = this.size * pulse
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize)
        gradient.addColorStop(0, `hsla(${this.hue}, 75%, ${isDark ? 65 : 58}%, ${this.opacity})`)
        gradient.addColorStop(0.5, `hsla(${this.hue + 20}, 70%, ${isDark ? 50 : 45}%, ${this.opacity * 0.7})`)
        gradient.addColorStop(1, `hsla(${this.hue + 40}, 65%, ${isDark ? 35 : 30}%, 0)`)
        
        ctx.fillStyle = gradient

        switch(this.type) {
          case 0: // Organic blob
            ctx.beginPath()
            for (let i = 0; i < this.vertices; i++) {
              const angle = (Math.PI * 2 * i) / this.vertices
              const wobble = Math.sin(this.pulsePhase * 2 + i) * 0.25 + 1
              const radius = currentSize * wobble
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.fill()
            break
          case 1: // Circle
            ctx.beginPath()
            ctx.arc(0, 0, currentSize, 0, Math.PI * 2)
            ctx.fill()
            break
          case 2: // Ellipse
            ctx.beginPath()
            ctx.ellipse(0, 0, currentSize, currentSize * 0.65, 0, 0, Math.PI * 2)
            ctx.fill()
            break
          case 3: // Curved blob
            ctx.beginPath()
            const points = 7
            for (let i = 0; i < points; i++) {
              const angle = (Math.PI * 2 * i) / points
              const nextAngle = (Math.PI * 2 * (i + 1)) / points
              const wobble1 = Math.sin(this.pulsePhase + i) * 0.3 + 1
              const wobble2 = Math.sin(this.pulsePhase + i + 1) * 0.3 + 1
              
              const x1 = Math.cos(angle) * currentSize * wobble1
              const y1 = Math.sin(angle) * currentSize * wobble1
              const x2 = Math.cos(nextAngle) * currentSize * wobble2
              const y2 = Math.sin(nextAngle) * currentSize * wobble2
              
              if (i === 0) ctx.moveTo(x1, y1)
              ctx.quadraticCurveTo(
                (x1 + x2) / 2 * 1.15,
                (y1 + y2) / 2 * 1.15,
                x2, y2
              )
            }
            ctx.closePath()
            ctx.fill()
            break
          case 4: // Double layer
            ctx.beginPath()
            ctx.arc(0, 0, currentSize * 0.85, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = this.opacity * 0.6
            ctx.beginPath()
            ctx.arc(0, 0, currentSize * 0.55, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 1
            break
        }
        
        ctx.restore()
      }
    }

    // Initialize particles and creatures
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < 150; i++) {
        particlesRef.current.push(new Particle())
      }
    }

    const initCreatures = () => {
      creaturesRef.current = []
      for (let i = 0; i < 24; i++) {
        creaturesRef.current.push(new Creature())
      }
    }

    // Dynamic color-shifting gradient background
    let gradientOffset = 0
    const drawGradientBackground = () => {
      gradientOffset += 0.004
      
      if (isDark) {
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        const hue1 = 210 + Math.sin(gradientOffset) * 35
        const hue2 = 250 + Math.cos(gradientOffset * 0.8) * 35
        const hue3 = 230 + Math.sin(gradientOffset * 1.2) * 30
        
        gradient.addColorStop(0, `hsl(${hue1}, 45%, 9%)`)
        gradient.addColorStop(0.5, `hsl(${hue2}, 40%, 7%)`)
        gradient.addColorStop(1, `hsl(${hue3}, 50%, 11%)`)
        
        ctx.fillStyle = gradient
      } else {
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        const hue1 = 190 + Math.sin(gradientOffset) * 45
        const hue2 = 230 + Math.cos(gradientOffset * 0.8) * 45
        const hue3 = 210 + Math.sin(gradientOffset * 1.2) * 40
        
        gradient.addColorStop(0, `hsl(${hue1}, 65%, 95%)`)
        gradient.addColorStop(0.5, `hsl(${hue2}, 55%, 91%)`)
        gradient.addColorStop(1, `hsl(${hue3}, 60%, 88%)`)
        
        ctx.fillStyle = gradient
      }
      
      ctx.fillRect(0, 0, width, height)
    }

    // Animation loop
    const animate = () => {
      drawGradientBackground()

      // Draw creatures FIRST (behind)
      creaturesRef.current.forEach(creature => {
        creature.update()
        creature.draw()
      })

      // Draw particles (in front)
      particlesRef.current.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Handle resize
    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      initParticles()
      initCreatures()
    }

    window.addEventListener('resize', handleResize)

    initParticles()
    initCreatures()
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ 
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  )
}
