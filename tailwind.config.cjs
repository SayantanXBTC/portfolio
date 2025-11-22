// tailwind.config.cjs
module.exports = {
  darkMode: 'class', // 🌙 Enable Dark Mode via class
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eaf6ff",
          100: "#cdefff",
          200: "#9edfff",
          300: "#5fd3f6",
          400: "#2ebdf5",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },

      backgroundImage: {
        "hero-gradient":
          "linear-gradient(180deg, #020617 0%, #041025 55%, #020617 100%)",
        "cosmic":
          "radial-gradient(circle at 50% 20%, rgba(59,130,246,0.2), transparent 70%), radial-gradient(circle at 80% 80%, rgba(14,165,233,0.2), transparent 70%)",
        "stars":
          "url('https://raw.githubusercontent.com/vaibhav111tandon/starfield-bg/main/stars.png')",
      },

      boxShadow: {
        "glass-sm": "0 4px 18px rgba(2, 6, 23, 0.55)",
        "glass-lg": "0 20px 40px rgba(2, 6, 23, 0.6)",
        neon: "0 0 15px rgba(14, 165, 233, 0.8)",
        "neon-soft": "0 0 25px rgba(14, 165, 233, 0.4)",
      },

      backdropFilter: {
        blur: "blur(20px)",
      },

      borderRadius: {
        "xl-2": "1rem",
        "soft-xl": "1.15rem",
      },

      keyframes: {
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
          "100%": { transform: "translateY(0px)" },
        },
        glideIn: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeStar: {
          "0%, 100%": { opacity: 0.4 },
          "50%": { opacity: 1 },
        },
      },

      animation: {
        float: "float 6s ease-in-out infinite",
        glide: "glideIn 0.6s ease-out both",
        "star-twinkle": "fadeStar 3s ease-in-out infinite",
      },

      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
