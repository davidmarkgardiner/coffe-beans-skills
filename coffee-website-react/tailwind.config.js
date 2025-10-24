/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F4ED',
        surface: '#E9E1D7',
        accent: '#B8A690',
        'accent-hover': '#AE9C83',
        'accent-deep': '#8F7D64',
        text: '#5B5245',
        heading: '#3A3530',
        border: '#D4C8B8',
        muted: '#6A6054',
        contrast: '#F7F4ED',
        'contrast-alt': '#E9E1D7',
        white: '#FFFFFF',
        black: '#0F0D0A',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: 'inset 0 1px 0 rgba(247, 244, 237, 0.5), 0 1px 2px rgba(58, 53, 48, 0.08)',
        medium: 'inset 0 1px 0 rgba(247, 244, 237, 0.55), 0 6px 14px rgba(58, 53, 48, 0.12)',
        large: 'inset 0 2px 0 rgba(247, 244, 237, 0.6), 0 12px 26px rgba(58, 53, 48, 0.18)',
        xl: 'inset 0 3px 0 rgba(247, 244, 237, 0.65), 0 18px 40px rgba(58, 53, 48, 0.22)',
      },
      backgroundImage: {
        'gradient-cta': 'linear-gradient(135deg, #B8A690 0%, #AE9C83 55%, #8F7D64 100%)',
        'gradient-cta-hover': 'linear-gradient(135deg, #C9BAA4 0%, #B8A690 50%, #6F6252 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(247, 244, 237, 0.96) 0%, rgba(233, 225, 215, 0.9) 100%)',
        'gradient-surface-hover': 'linear-gradient(180deg, rgba(247, 244, 237, 0.98) 0%, rgba(233, 225, 215, 0.96) 100%)',
        'gradient-nav-strong': 'linear-gradient(180deg, rgba(58, 53, 48, 0.92) 0%, rgba(58, 53, 48, 0.88) 70%, rgba(58, 53, 48, 0.82) 100%)',
        'gradient-nav-soft': 'linear-gradient(180deg, rgba(58, 53, 48, 0.78) 0%, rgba(58, 53, 48, 0.7) 70%, rgba(58, 53, 48, 0.6) 100%)',
        'gradient-body': 'radial-gradient(circle at 20% 20%, rgba(233, 225, 215, 0.55) 0, transparent 65%), radial-gradient(circle at 80% -10%, rgba(184, 166, 144, 0.18) 0, transparent 65%)',
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
