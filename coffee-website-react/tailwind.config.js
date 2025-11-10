/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stockbridge Coffee Brand Colors
        // Primary Colors
        background: '#F5F0E8', // Off-White - website background
        surface: '#E8DCC8', // Cream/Beige - cards, sections
        accent: {
          DEFAULT: '#A89175', // Tan/Brown - accent elements
          hover: '#8F7B62', // Darker tan for hover states
          light: '#B8975A', // Gold/Bronze - highlights
          dark: '#212f1f', // Log Cabin Green - primary brand color
        },
        text: '#1A1A1A', // Black - primary text
        heading: '#212f1f', // Log Cabin Green - headings, emphasis

        // Secondary Colors
        brand: {
          green: '#212f1f', // Log Cabin Green (main brand)
          'green-dark': '#1a231a', // Darker Green (shadows)
          cream: '#E8DCC8', // Cream/Beige (labels, backgrounds)
          tan: '#A89175', // Tan/Brown (accents)
          gold: '#B8975A', // Gold/Bronze (premium accents)
          black: '#1A1A1A', // Black (text, buttons)
          'off-white': '#F5F0E8', // Off-White (backgrounds)
        },

        // Legacy color mappings for backward compatibility
        coffee: {
          50: '#F5F0E8',
          100: '#E8DCC8',
          200: '#E8DCC8',
          300: '#B8975A',
          400: '#A89175',
          500: '#A89175',
          600: '#8F7B62',
          700: '#212f1f',
          800: '#1a231a',
          900: '#1A1A1A',
          950: '#1A1A1A',
        },
        grey: {
          50: '#F5F0E8',
          100: '#E8DCC8',
          200: '#E8DCC8',
          300: '#B8975A',
          400: '#A89175',
          500: '#8F7B62',
          600: '#212f1f',
          700: '#1a231a',
          800: '#1A1A1A',
          900: '#1A1A1A',
        },
        charcoal: '#1A1A1A',
        cream: '#F5F0E8',
      },
      fontFamily: {
        logo: ['Bebas Neue', 'sans-serif'],
        heading: ['Bebas Neue', 'sans-serif'],
        display: ['Cinzel', 'serif'],
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: 'inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 1px 2px rgba(33, 47, 31, 0.08)',
        medium: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 12px rgba(33, 47, 31, 0.12)',
        large: 'inset 0 2px 0 rgba(255, 255, 255, 0.24), 0 12px 24px rgba(33, 47, 31, 0.18)',
        xl: 'inset 0 3px 0 rgba(255, 255, 255, 0.28), 0 18px 36px rgba(26, 35, 26, 0.22)',
      },
      backgroundImage: {
        'gradient-cta': 'linear-gradient(135deg, #A89175 0%, #8F7B62 55%, #212f1f 100%)',
        'gradient-cta-hover': 'linear-gradient(135deg, #B8975A 0%, #A89175 45%, #8F7B62 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(245, 240, 232, 0.95) 0%, rgba(232, 220, 200, 0.9) 100%)',
        'gradient-surface-hover': 'linear-gradient(180deg, rgba(245, 240, 232, 0.98) 0%, rgba(232, 220, 200, 0.95) 100%)',
        'gradient-nav-strong': 'linear-gradient(180deg, rgba(33, 47, 31, 0.95) 0%, rgba(33, 47, 31, 0.9) 70%, rgba(33, 47, 31, 0.85) 100%)',
        'gradient-nav-soft': 'linear-gradient(180deg, rgba(33, 47, 31, 0.88) 0%, rgba(33, 47, 31, 0.82) 70%, rgba(33, 47, 31, 0.75) 100%)',
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
