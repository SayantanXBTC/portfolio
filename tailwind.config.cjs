// tailwind.config.cjs - cinematic black + accent system
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#050505",
          900: "#080808",
          800: "#0c0c0c",
          700: "#121212",
          600: "#1a1a1a",
        },
        paper: "#efede9",
        mute: "#a19e99",
        dim: "#6b6966",
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          strong: "rgb(var(--accent-strong-rgb) / <alpha-value>)",
          soft: "rgb(var(--accent-soft-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        label: "0.22em",
      },
      transitionTimingFunction: {
        cine: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
