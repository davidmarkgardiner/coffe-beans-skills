/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Golden Coffee Palette
        coffee: {
          50: '#fbf7ef',
          100: '#f8f3e8',
          200: '#f0e5d4',
          300: '#e4d2b5',
          400: '#d2ba8f',
          500: '#c9a26a',
          600: '#b48846',
          700: '#C9932C', // Primary golden coffee tone
          800: '#8a5a16',
          900: '#5b390e',
          950: '#3a2408',
        },
        // Warm Grey Scale
        grey: {
          50: '#f9f6ef',
          100: '#f1eadb',
          200: '#e1d3bb',
          300: '#d3c1a1',
          400: '#bfa887',
          500: '#a3896a',
          600: '#7f6850',
          700: '#57493b',
          800: '#3a2f25',
          900: '#1e1915',
        },
        charcoal: '#2f2721',
        cream: '#f7f1e3',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: 'inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 1px 2px rgba(47, 39, 33, 0.08)',
        medium: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 12px rgba(47, 39, 33, 0.12)',
        large: 'inset 0 2px 0 rgba(255, 255, 255, 0.24), 0 12px 24px rgba(47, 39, 33, 0.18)',
        xl: 'inset 0 3px 0 rgba(255, 255, 255, 0.28), 0 18px 36px rgba(30, 25, 21, 0.22)',
      },
      backgroundImage: {
        'gradient-cta': 'linear-gradient(135deg, #c9a26a 0%, #C9932C 55%, #8a5a16 100%)',
        'gradient-cta-hover': 'linear-gradient(135deg, #e4d2b5 0%, #c9a26a 45%, #7f5523 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(248, 243, 232, 0.95) 0%, rgba(229, 206, 165, 0.9) 100%)',
        'gradient-surface-hover': 'linear-gradient(180deg, rgba(248, 243, 232, 0.98) 0%, rgba(229, 206, 165, 0.95) 100%)',
        'gradient-nav-strong': 'linear-gradient(180deg, rgba(247, 241, 227, 0.95) 0%, rgba(247, 241, 227, 0.9) 70%, rgba(247, 241, 227, 0.85) 100%)',
        'gradient-nav-soft': 'linear-gradient(180deg, rgba(247, 241, 227, 0.88) 0%, rgba(247, 241, 227, 0.82) 70%, rgba(247, 241, 227, 0.75) 100%)',
        'gradient-body': 'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.38) 0, transparent 70%), radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.25) 0, transparent 70%)',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
