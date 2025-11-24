// src/contexts/ThemeContext.tsx
// Theme Context for Dark Mode Toggle

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Force light mode only
  const [theme] = useState<Theme>('light')

  // Ensure dark class is never applied
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
  }, [])

  // No-op functions since theme is locked to light mode
  const toggleTheme = () => {
    // Do nothing - light mode only
  }

  const setTheme = () => {
    // Do nothing - light mode only
  }

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
