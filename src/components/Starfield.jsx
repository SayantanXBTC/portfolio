import React, { useRef, useEffect } from "react"

export default function Starfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    let w, h, stars
    function init() {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      stars = Array.from({ length: 180 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * w,
      }))
    }

    function animate() {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, w, h)
      stars.forEach(star => {
        star.z -= 2
        if (star.z <= 0) star.z = w

        const k = 128.0 / star.z
        const px = star.x * k + w / 2
        const py = star.y * k + h / 2

        if (px >= 0 && px <= w && py >= 0 && py <= h) {
          const size = (1 - star.z / w) * 2
          ctx.fillStyle = "white"
          ctx.fillRect(px, py, size, size)
        }
      })
      requestAnimationFrame(animate)
    }

    init()
    animate()
    window.addEventListener("resize", init)

    return () => window.removeEventListener("resize", init)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10"
      style={{ width: "100%", height: "100%" }}
    />
  )
}
