/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sophisticated Color Palette
        background: '#F7F4ED', // Light cream - main background
        surface: '#E9E1D7', // Soft beige - cards, sections
        accent: {
          DEFAULT: '#B8A690', // Taupe brown - buttons, borders, highlights
          hover: '#A69582', // Darkened by 10% for hover states
          light: '#C9B5A4', // Lighter shade for subtle elements
          dark: '#A08976', // Darker shade for borders/dividers
        },
        text: '#5B5245', // Deep mocha - primary text
        heading: '#3A3530', // Espresso brown - headings, footer, nav

        // Legacy color mappings for backward compatibility
        coffee: {
          50: '#F7F4ED',
          100: '#F7F4ED',
          200: '#E9E1D7',
          300: '#E9E1D7',
          400: '#C9B5A4',
          500: '#B8A690',
          600: '#B8A690',
          700: '#B8A690',
          800: '#A08976',
          900: '#5B5245',
          950: '#3A3530',
        },
        grey: {
          50: '#F7F4ED',
          100: '#E9E1D7',
          200: '#E9E1D7',
          300: '#C9B5A4',
          400: '#B8A690',
          500: '#A08976',
          600: '#7A6F63',
          700: '#5B5245',
          800: '#4A453F',
          900: '#3A3530',
        },
        charcoal: '#3A3530',
        cream: '#F7F4ED',
      },
      fontFamily: {
        logo: ['Montserrat', 'sans-serif'],
        heading: ['Bebas Neue', 'sans-serif'],
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
        'gradient-cta': 'linear-gradient(135deg, #B8A690 0%, #A08976 55%, #7A6F63 100%)',
        'gradient-cta-hover': 'linear-gradient(135deg, #C9B5A4 0%, #B8A690 45%, #A69582 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(247, 244, 237, 0.95) 0%, rgba(233, 225, 215, 0.9) 100%)',
        'gradient-surface-hover': 'linear-gradient(180deg, rgba(247, 244, 237, 0.98) 0%, rgba(233, 225, 215, 0.95) 100%)',
        'gradient-nav-strong': 'linear-gradient(180deg, rgba(58, 53, 48, 0.95) 0%, rgba(58, 53, 48, 0.9) 70%, rgba(58, 53, 48, 0.85) 100%)',
        'gradient-nav-soft': 'linear-gradient(180deg, rgba(58, 53, 48, 0.88) 0%, rgba(58, 53, 48, 0.82) 70%, rgba(58, 53, 48, 0.75) 100%)',
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
