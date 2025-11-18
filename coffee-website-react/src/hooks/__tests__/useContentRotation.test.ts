import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useContentRotation } from '../useContentRotation'
import * as contentService from '../../services/contentService'
import type { ContentItem } from '../../services/contentService'

// Mock the content service
vi.mock('../../services/contentService')

const mockContentItem: ContentItem = {
  id: 'test-video-1',
  type: 'video',
  url: 'https://example.com/video1.mp4',
  storagePath: '/content/videos/winter/test-video-1.mp4',
  season: 'winter',
  holiday: null,
  status: 'active',
  prompt: 'Test video prompt',
  generatedBy: 'test',
  metadata: {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    fileSize: 5000000,
    format: 'mp4',
    duration: 6,
  },
  tags: ['test'],
  createdAt: new Date(),
}

const mockContentItem2: ContentItem = {
  ...mockContentItem,
  id: 'test-video-2',
  url: 'https://example.com/video2.mp4',
}

describe('useContentRotation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial Content Fetching', () => {
    it('should fetch content on mount', async () => {
      const fetchMock = vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockContentItem])

      renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 30000,
        })
      )

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('video', undefined, 10)
      })
    })

    it('should return loading state initially', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockContentItem])

      const { result } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 30000,
        })
      )

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should set error if content fetch fails', async () => {
      const error = new Error('Fetch failed')
      vi.spyOn(contentService, 'fetchActiveContent').mockRejectedValue(error)

      const { result } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 30000,
        })
      )

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.error?.message).toBe('Fetch failed')
      })
    })

    it('should set error if no content found', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([])

      const { result } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 30000,
        })
      )

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.error?.message).toContain('No video content found')
      })
    })
  })

  describe('Content Rotation', () => {
    it('should rotate to next content after interval', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockContentItem, mockContentItem2])

      const { result } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 30000,
        })
      )

      await waitFor(() => {
        expect(result.current.currentContent?.id).toBe('test-video-1')
      })

      // Advance time by 30 seconds
      vi.advanceTimersByTime(30000)

      await waitFor(() => {
        expect(result.current.currentContent?.id).toBe('test-video-2')
      })
    })

    it('should cycle back to first content after last one', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockContentItem, mockContentItem2])

      const { result } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 30000,
        })
      )

      await waitFor(() => {
        expect(result.current.currentContent?.id).toBe('test-video-1')
      })

      // Advance time by 60 seconds (2 rotations)
      vi.advanceTimersByTime(60000)

      await waitFor(() => {
        expect(result.current.currentContent?.id).toBe('test-video-1')
      })
    })

    it('should allow manual rotation with rotateNow', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockContentItem, mockContentItem2])

      const { result } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 0, // Disable auto-rotation
        })
      )

      await waitFor(() => {
        expect(result.current.currentContent?.id).toBe('test-video-1')
      })

      // Manually rotate
      result.current.rotateNow()

      await waitFor(() => {
        expect(result.current.currentContent?.id).toBe('test-video-2')
      })
    })
  })

  describe('Content Pool Refresh (New Feature)', () => {
    it('should refresh content pool at specified interval', async () => {
      const fetchMock = vi.spyOn(contentService, 'fetchActiveContent')
      fetchMock.mockResolvedValueOnce([mockContentItem])

      const { result } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 0,
          refreshInterval: 60000, // 1 minute
        })
      )

      await waitFor(() => {
        expect(result.current.currentContent?.id).toBe('test-video-1')
      })

      expect(fetchMock).toHaveBeenCalledTimes(1)

      // Mock new content for the refresh
      fetchMock.mockResolvedValueOnce([mockContentItem, mockContentItem2])

      // Advance time by 1 minute to trigger refresh
      vi.advanceTimersByTime(60000)

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2)
      })

      // New content should be loaded
      await waitFor(() => {
        expect(result.current.contentPool.length).toBe(2)
      })
    })

    it('should pick up newly generated videos after refresh', async () => {
      const fetchMock = vi.spyOn(contentService, 'fetchActiveContent')

      // First fetch: 1 video
      fetchMock.mockResolvedValueOnce([mockContentItem])

      const { result } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 0,
          refreshInterval: 60000,
        })
      )

      await waitFor(() => {
        expect(result.current.contentPool.length).toBe(1)
      })

      // Second fetch (after refresh): 2 videos (newly generated one added)
      fetchMock.mockResolvedValueOnce([mockContentItem, mockContentItem2])

      vi.advanceTimersByTime(60000)

      await waitFor(() => {
        expect(result.current.contentPool.length).toBe(2)
        expect(result.current.contentPool.some(item => item.id === 'test-video-2')).toBe(true)
      })
    })

    it('should reset to first content when pool is refreshed', async () => {
      const fetchMock = vi.spyOn(contentService, 'fetchActiveContent')
      fetchMock.mockResolvedValueOnce([mockContentItem, mockContentItem2])

      const { result } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 0,
          refreshInterval: 60000,
        })
      )

      await waitFor(() => {
        expect(result.current.contentPool.length).toBe(2)
      })

      // Manually rotate to second video
      result.current.rotateNow()

      await waitFor(() => {
        expect(result.current.currentIndex).toBe(1)
      })

      // Refresh with new content
      fetchMock.mockResolvedValueOnce([mockContentItem])

      vi.advanceTimersByTime(60000)

      await waitFor(() => {
        expect(result.current.currentIndex).toBe(0)
        expect(result.current.contentPool.length).toBe(1)
      })
    })

    it('should disable refresh when refreshInterval is 0', async () => {
      const fetchMock = vi.spyOn(contentService, 'fetchActiveContent')
      fetchMock.mockResolvedValueOnce([mockContentItem])

      renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 0,
          refreshInterval: 0, // Disabled
        })
      )

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1)
      })

      // Advance time significantly
      vi.advanceTimersByTime(120000)

      // Should still only have 1 fetch call
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('Configuration Options', () => {
    it('should respect custom refresh interval', async () => {
      const fetchMock = vi.spyOn(contentService, 'fetchActiveContent')
      fetchMock.mockResolvedValue([mockContentItem])

      renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 0,
          refreshInterval: 5 * 60 * 1000, // 5 minutes
        })
      )

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1)
      })

      // Advance time by 4 minutes - should not refresh yet
      vi.advanceTimersByTime(4 * 60 * 1000)
      expect(fetchMock).toHaveBeenCalledTimes(1)

      // Advance time by 1 more minute - should refresh now
      vi.advanceTimersByTime(1 * 60 * 1000)

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2)
      })
    })

    it('should use default 1 hour refresh interval', async () => {
      const fetchMock = vi.spyOn(contentService, 'fetchActiveContent')
      fetchMock.mockResolvedValue([mockContentItem])

      renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 0,
          // refreshInterval not specified - should use 1 hour default
        })
      )

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1)
      })

      // Advance time by 59 minutes - should not refresh yet
      vi.advanceTimersByTime(59 * 60 * 1000)
      expect(fetchMock).toHaveBeenCalledTimes(1)

      // Advance time by 1 more minute - should refresh now
      vi.advanceTimersByTime(1 * 60 * 1000)

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Content Preloading', () => {
    it('should preload next content when enabled', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockContentItem, mockContentItem2])

      const { result } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 0,
          preloadNext: true,
        })
      )

      await waitFor(() => {
        expect(result.current.nextContent?.id).toBe('test-video-2')
      })
    })

    it('should not preload when disabled', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockContentItem, mockContentItem2])

      const { result } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 0,
          preloadNext: false,
        })
      )

      await waitFor(() => {
        expect(result.current.nextContent).toBeNull()
      })
    })
  })

  describe('Hook Cleanup', () => {
    it('should clean up intervals on unmount', async () => {
      const fetchMock = vi.spyOn(contentService, 'fetchActiveContent')
      fetchMock.mockResolvedValue([mockContentItem, mockContentItem2])

      const { unmount } = renderHook(() =>
        useContentRotation({
          contentType: 'video',
          rotationInterval: 30000,
          refreshInterval: 60000,
        })
      )

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalled()
      })

      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
      unmount()

      // Should have called clearInterval for both rotation and refresh intervals
      expect(clearIntervalSpy).toHaveBeenCalled()
      expect(clearIntervalSpy.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })
})
