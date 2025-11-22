// tailwind.config.cjs
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e6f6ff',
          300: '#5fd3f6',
          500: '#0ea5e9',
          700: '#0369a1'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'glass-sm': '0 6px 18px rgba(2,6,23,0.6)',
        'glass-lg': '0 20px 40px rgba(2,6,23,0.65)'
      },
      borderRadius: {
        'xl-2': '1rem'
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
          '100%': { transform: 'translateY(0px)' }
        },
        glideIn: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        glide: 'glideIn 0.6s ease-out both'
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg,#071021 0%, #061226 50%, #071021 100%)'
      }
    }
  },
  plugins: []
}
