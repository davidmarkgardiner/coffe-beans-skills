import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['stockbridge.lab.danatlab.com'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - loaded first, cached long-term
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Firebase SDK - large, split separately
          'vendor-firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
            'firebase/analytics',
          ],

          // Stripe - payment processing
          'vendor-stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],

          // Framer Motion - animations
          'vendor-motion': ['framer-motion'],

          // UI utilities
          'vendor-ui': ['lucide-react', 'zod'],
        },
      },
    },
    // Increase chunk size warning limit since we're intentionally chunking
    chunkSizeWarningLimit: 600,
  },
})
