import { useState, useEffect } from 'react'
import { fetchActiveContent, type ContentItem } from '../services/contentService'

/**
 * Hook to provide rotating product images
 *
 * Fetches all active photos and distributes them across products
 * Rotates images every 30 seconds to keep the product grid fresh
 */
export function useProductImages(productCount: number) {
  const [photoPool, setPhotoPool] = useState<ContentItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch photo pool
  useEffect(() => {
    async function loadPhotos() {
      try {
        const photos = await fetchActiveContent('photo', undefined, 20) // Fetch up to 20 photos
        if (photos.length > 0) {
          setPhotoPool(photos)
        }
      } catch (error) {
        console.error('Failed to load product images:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPhotos()
  }, [])

  // Rotate images every 30 seconds
  useEffect(() => {
    if (photoPool.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photoPool.length)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [photoPool.length])

  // Generate image URLs for products
  const getProductImages = () => {
    if (photoPool.length === 0) {
      // Fallback Unsplash images
      return [
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
        'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&q=80',
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
      ]
    }

    // Distribute photos from pool across products
    const images: string[] = []
    for (let i = 0; i < productCount; i++) {
      const photoIndex = (currentIndex + i) % photoPool.length
      images.push(photoPool[photoIndex].url)
    }

    return images
  }

  return {
    productImages: getProductImages(),
    isLoading,
    photoCount: photoPool.length,
  }
}
