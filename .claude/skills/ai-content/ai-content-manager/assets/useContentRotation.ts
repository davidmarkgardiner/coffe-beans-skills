import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'

export type Season = 'winter' | 'spring' | 'summer' | 'autumn'
export type ContentType = 'video' | 'photo'

export interface ContentItem {
  id: string
  type: ContentType
  url: string
  season: Season
  holiday: string | null
  prompt: string
  metadata: {
    width: number
    height: number
    aspectRatio: string
    fileSize: number
    format: string
    duration?: number
  }
}

export interface UseContentRotationOptions {
  collectionType?: ContentType
  rotationInterval?: number // in milliseconds
  season?: Season | 'auto'
  holiday?: string | null
  maxPoolSize?: number
  preloadNext?: boolean
}

export interface UseContentRotationReturn {
  currentContent: ContentItem | null
  nextContent: ContentItem | null
  isLoading: boolean
  error: Error | null
  contentPool: ContentItem[]
  rotateNow: () => void
  refreshPool: () => Promise<void>
}

/**
 * Detect current season based on date
 */
function detectCurrentSeason(): Season {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  if ((month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day < 21)) {
    return 'winter'
  } else if ((month === 3 && day >= 21) || month === 4 || month === 5 || (month === 6 && day < 21)) {
    return 'spring'
  } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 21)) {
    return 'summer'
  } else {
    return 'autumn'
  }
}

/**
 * Custom hook for content rotation
 *
 * Fetches active content from Firestore and rotates through it at specified interval
 */
export function useContentRotation(options: UseContentRotationOptions = {}): UseContentRotationReturn {
  const {
    collectionType = 'video',
    rotationInterval = 30000, // 30 seconds default
    season = 'auto',
    holiday = null,
    maxPoolSize = 10,
    preloadNext = true,
  } = options

  const [contentPool, setContentPool] = useState<ContentItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const preloadedImages = useRef<Map<string, HTMLImageElement | HTMLVideoElement>>(new Map())

  const currentSeason = season === 'auto' ? detectCurrentSeason() : season

  /**
   * Fetch content pool from Firestore
   */
  const fetchContentPool = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const contentRef = collection(db, `content/${collectionType}s`)

      // Build query based on season and holiday
      let q = query(
        contentRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      )

      // Add season filter if specified
      if (currentSeason) {
        q = query(
          contentRef,
          where('season', '==', currentSeason),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc')
        )
      }

      // Note: Firestore doesn't support multiple inequality filters,
      // so we filter holiday client-side if needed
      const snapshot = await getDocs(q)

      let items = snapshot.docs.map(doc => ({
        id: doc.id,
        type: collectionType,
        ...doc.data(),
      })) as ContentItem[]

      // Filter by holiday client-side if specified
      if (holiday !== null) {
        items = items.filter(item => item.holiday === holiday)
      }

      // Limit pool size
      items = items.slice(0, maxPoolSize)

      if (items.length === 0) {
        throw new Error(`No ${collectionType} content found for season: ${currentSeason}`)
      }

      setContentPool(items)
      setCurrentIndex(0)

      console.log(`✅ Loaded ${items.length} content items for rotation`)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch content pool')
      setError(error)
      console.error('Error fetching content pool:', error)
    } finally {
      setIsLoading(false)
    }
  }, [collectionType, currentSeason, holiday, maxPoolSize])

  /**
   * Preload next content for smooth transitions
   */
  const preloadContent = useCallback((content: ContentItem) => {
    if (!preloadNext) return

    const key = content.id

    // Skip if already preloaded
    if (preloadedImages.current.has(key)) return

    if (content.type === 'video') {
      const video = document.createElement('video')
      video.src = content.url
      video.preload = 'auto'
      preloadedImages.current.set(key, video)
    } else {
      const img = new Image()
      img.src = content.url
      preloadedImages.current.set(key, img)
    }

    console.log(`🔄 Preloaded: ${content.id}`)
  }, [preloadNext])

  /**
   * Rotate to next content
   */
  const rotateNow = useCallback(() => {
    if (contentPool.length === 0) return

    const nextIndex = (currentIndex + 1) % contentPool.length
    setCurrentIndex(nextIndex)

    // Preload the content after next
    if (preloadNext && contentPool.length > 1) {
      const preloadIndex = (nextIndex + 1) % contentPool.length
      preloadContent(contentPool[preloadIndex])
    }

    console.log(`🔄 Rotated to content ${nextIndex + 1}/${contentPool.length}`)
  }, [contentPool, currentIndex, preloadNext, preloadContent])

  /**
   * Set up rotation interval
   */
  useEffect(() => {
    if (contentPool.length <= 1 || rotationInterval === 0) {
      return
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Start new interval
    intervalRef.current = setInterval(() => {
      rotateNow()
    }, rotationInterval)

    console.log(`⏰ Rotation interval set to ${rotationInterval}ms`)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [contentPool.length, rotationInterval, rotateNow])

  /**
   * Initial fetch and preload
   */
  useEffect(() => {
    fetchContentPool()
  }, [fetchContentPool])

  /**
   * Preload first few items when pool loads
   */
  useEffect(() => {
    if (contentPool.length > 0 && preloadNext) {
      // Preload current and next
      preloadContent(contentPool[0])
      if (contentPool.length > 1) {
        preloadContent(contentPool[1])
      }
    }
  }, [contentPool, preloadNext, preloadContent])

  const currentContent = contentPool[currentIndex] || null
  const nextContent = contentPool.length > 1 ? contentPool[(currentIndex + 1) % contentPool.length] : null

  return {
    currentContent,
    nextContent,
    isLoading,
    error,
    contentPool,
    rotateNow,
    refreshPool: fetchContentPool,
  }
}
