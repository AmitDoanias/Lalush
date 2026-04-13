/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Rubik', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        navy: {
          950: '#060D1A',
          900: '#0A1628',
          800: '#0F2040',
          700: '#162C58',
          600: '#1E3A70',
        },
        gold: {
          50:  '#FDF9EC',
          100: '#FAF0CC',
          200: '#F4DC88',
          300: '#ECC84A',
          400: '#C9A84C',
          500: '#A88B38',
          600: '#876F28',
        },
        cream: {
          50:  '#FDFCFA',
          100: '#F8F5F0',
          200: '#F0EAE0',
          300: '#E5DDD0',
        },
        danger: '#E84040',
        warning: '#F59E0B',
        success: '#10B981',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.1)',
        'glow-gold': '0 0 20px rgba(201,168,76,0.25)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.35s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
