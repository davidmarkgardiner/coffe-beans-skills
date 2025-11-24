// src/components/ThemeToggle.tsx
// Theme toggle button with Sun/Moon icons

import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 hover:bg-accent/10 dark:hover:bg-accent/20"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 180 : 0,
          scale: theme === 'dark' ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="w-5 h-5 text-white dark:text-white" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 0 : -180,
          scale: theme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="w-5 h-5 text-white dark:text-white" />
      </motion.div>
      {/* Invisible placeholder to maintain button size */}
      <div className="w-5 h-5 opacity-0">
        <Sun className="w-5 h-5" />
      </div>
    </motion.button>
  )
}
