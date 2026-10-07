// tailwind.config.cjs - Framer-Style Design System
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Framer-style neutral palette
        slate: {
          850: '#1a202e',
          950: '#0b0f14',
        },
        // Accent colors
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },

      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.5rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.03em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
      },

      backgroundImage: {
        "hero-gradient": "linear-gradient(180deg, #0b0f14 0%, #111827 50%, #0b0f14 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.3) 100%)",
        "shimmer": "linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.05) 50%, transparent 100%)",
      },

      boxShadow: {
        "framer": "0 8px 32px rgba(0, 0, 0, 0.3)",
        "framer-lg": "0 12px 48px rgba(0, 0, 0, 0.4)",
        "glow": "0 0 20px rgba(59, 130, 246, 0.1)",
        "glow-lg": "0 0 30px rgba(59, 130, 246, 0.15)",
        "glow-hover": "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.05)",
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '40px',
      },

      keyframes: {
        // Framer-style animations
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },

      animation: {
        float: "float 8s ease-in-out infinite",
        fadeIn: "fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        scaleIn: "scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        slideInLeft: "slideInLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        slideInRight: "slideInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },

      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
      },

      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },

      // Framer-style easing
      transitionTimingFunction: {
        'framer': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
}