import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchActiveContent, type ContentItem, type ContentType, type Season } from '../services/contentService'

export interface UseContentRotationOptions {
  contentType?: ContentType
  rotationInterval?: number // in milliseconds
  season?: Season | 'auto'
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
 * Custom hook for content rotation
 *
 * Fetches active content from Firestore and rotates through it at specified interval
 */
export function useContentRotation(options: UseContentRotationOptions = {}): UseContentRotationReturn {
  const {
    contentType = 'photo',
    rotationInterval = 30000, // 30 seconds default
    season = 'auto',
    maxPoolSize = 10,
    preloadNext = true,
  } = options

  const [contentPool, setContentPool] = useState<ContentItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const intervalRef = useRef<number | null>(null)
  const preloadedImages = useRef<Map<string, HTMLImageElement | HTMLVideoElement>>(new Map())

  /**
   * Fetch content pool from Firestore
   */
  const fetchContentPool = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const items = await fetchActiveContent(
        contentType,
        season === 'auto' ? undefined : season,
        maxPoolSize
      )

      if (items.length === 0) {
        throw new Error(`No ${contentType} content found for current season`)
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
  }, [contentType, season, maxPoolSize])

  /**
   * Preload next content for smooth transitions
   * Videos: Only preload metadata to save bandwidth
   * Images: Preload full image
   */
  const preloadContent = useCallback((content: ContentItem) => {
    if (!preloadNext) return

    const key = content.id

    // Skip if already preloaded
    if (preloadedImages.current.has(key)) return

    if (content.type === 'video') {
      const video = document.createElement('video')
      video.src = content.url
      video.preload = 'metadata' // Only load metadata (not full video)
      video.muted = true
      video.playsInline = true

      // Start loading when video becomes visible soon
      video.addEventListener('loadedmetadata', () => {
        console.log(`📹 Video metadata loaded: ${content.id}`)
      })

      preloadedImages.current.set(key, video)
    } else {
      const img = new Image()
      img.src = content.url
      img.loading = 'lazy' // Use native lazy loading
      preloadedImages.current.set(key, img)
    }

    console.log(`🔄 Preload initiated: ${content.id}`)
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
    intervalRef.current = window.setInterval(() => {
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
