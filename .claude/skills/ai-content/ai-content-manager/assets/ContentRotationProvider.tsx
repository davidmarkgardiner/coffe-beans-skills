import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'

type Season = 'winter' | 'spring' | 'summer' | 'autumn'

interface RotationConfig {
  currentContentId: string
  currentContentType: 'video' | 'photo'
  rotationInterval: number
  activeContentPool: Array<{
    id: string
    type: 'video' | 'photo'
    weight: number
  }>
  lastRotated: Date
  currentSeason: Season
  currentHoliday: string | null
  autoRotate: boolean
  rotationStrategy: 'sequential' | 'random' | 'weighted'
}

interface ContentRotationContextType {
  config: RotationConfig | null
  isLoading: boolean
  error: Error | null
  refreshConfig: () => Promise<void>
}

const ContentRotationContext = createContext<ContentRotationContextType | undefined>(undefined)

interface ContentRotationProviderProps {
  children: ReactNode
  section?: string // 'hero', 'about', 'blog', etc.
  realtime?: boolean // Subscribe to real-time updates
}

/**
 * Content Rotation Provider
 *
 * Provides global access to content rotation configuration from Firestore.
 * Optionally subscribes to real-time updates.
 */
export function ContentRotationProvider({
  children,
  section = 'hero',
  realtime = false,
}: ContentRotationProviderProps) {
  const [config, setConfig] = useState<RotationConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Fetch rotation config from Firestore
   */
  const fetchConfig = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const configRef = doc(db, 'content-rotation-config', section)
      const configSnap = await getDoc(configRef)

      if (configSnap.exists()) {
        const data = configSnap.data()
        setConfig({
          ...data,
          lastRotated: data.lastRotated?.toDate(),
        } as RotationConfig)
        console.log(`✅ Loaded rotation config for: ${section}`)
      } else {
        throw new Error(`Rotation config not found for section: ${section}`)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch rotation config')
      setError(error)
      console.error('Error fetching rotation config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Subscribe to real-time config updates
   */
  useEffect(() => {
    if (!realtime) {
      // One-time fetch
      fetchConfig()
      return
    }

    // Real-time subscription
    const configRef = doc(db, 'content-rotation-config', section)

    const unsubscribe = onSnapshot(
      configRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setConfig({
            ...data,
            lastRotated: data.lastRotated?.toDate(),
          } as RotationConfig)
          setIsLoading(false)
          console.log(`🔄 Real-time config update for: ${section}`)
        } else {
          setError(new Error(`Rotation config not found for section: ${section}`))
          setIsLoading(false)
        }
      },
      (err) => {
        setError(err as Error)
        setIsLoading(false)
        console.error('Real-time subscription error:', err)
      }
    )

    return () => unsubscribe()
  }, [section, realtime])

  const value = {
    config,
    isLoading,
    error,
    refreshConfig: fetchConfig,
  }

  return (
    <ContentRotationContext.Provider value={value}>
      {children}
    </ContentRotationContext.Provider>
  )
}

/**
 * Hook to access content rotation context
 */
export function useContentRotationContext() {
  const context = useContext(ContentRotationContext)

  if (context === undefined) {
    throw new Error('useContentRotationContext must be used within ContentRotationProvider')
  }

  return context
}
