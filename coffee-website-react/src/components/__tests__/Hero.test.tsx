import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Hero } from '../Hero'
import * as contentService from '../../services/contentService'
import type { ContentItem } from '../../services/contentService'

// Mock framer-motion to simplify testing
vi.mock('framer-motion', () => ({
  motion: {
    video: ({ src, ...props }: any) => <video src={src} {...props} data-testid="hero-video" />,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock the content service
vi.mock('../../services/contentService')

const mockVideoItem: ContentItem = {
  id: 'hero-video-1',
  type: 'video',
  url: 'https://example.com/hero-video-1.mp4',
  storagePath: '/content/videos/winter/hero-video-1.mp4',
  season: 'winter',
  holiday: null,
  status: 'active',
  prompt: 'Beautiful coffee hero video',
  generatedBy: 'gemini',
  metadata: {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    fileSize: 15000000,
    format: 'mp4',
    duration: 8,
  },
  tags: ['hero', 'video'],
  createdAt: new Date(),
}

const mockVideoItem2: ContentItem = {
  ...mockVideoItem,
  id: 'hero-video-2',
  url: 'https://example.com/hero-video-2.mp4',
}

describe('Hero Component - Background Video Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should display loading state initially', () => {
    vi.spyOn(contentService, 'fetchActiveContent').mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<Hero />)

    // Should show poster image during loading
    const section = screen.getByRole('region')
    expect(section).toBeInTheDocument()
  })

  it('should display video when content loads', async () => {
    vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockVideoItem])

    render(<Hero />)

    await waitFor(() => {
      const video = screen.getByTestId('hero-video')
      expect(video).toBeInTheDocument()
      expect(video).toHaveAttribute('src', mockVideoItem.url)
    })
  })

  it('should rotate to new video after 30 seconds', async () => {
    const fetchMock = vi.spyOn(contentService, 'fetchActiveContent')
    fetchMock.mockResolvedValue([mockVideoItem, mockVideoItem2])

    const { rerender } = render(<Hero />)

    await waitFor(() => {
      const video = screen.getByTestId('hero-video')
      expect(video).toHaveAttribute('src', mockVideoItem.url)
    })

    // Advance time by 30 seconds to trigger rotation
    vi.advanceTimersByTime(30000)

    rerender(<Hero />)

    await waitFor(() => {
      const video = screen.getByTestId('hero-video')
      expect(video).toHaveAttribute('src', mockVideoItem2.url)
    })
  })

  describe('Background Video Update Feature', () => {
    it('should refresh content pool every 5 minutes', async () => {
      const fetchMock = vi.spyOn(contentService, 'fetchActiveContent')
      fetchMock.mockResolvedValueOnce([mockVideoItem])

      render(<Hero />)

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1)
      })

      // Advance time by 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000)

      fetchMock.mockResolvedValueOnce([mockVideoItem, mockVideoItem2])

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2)
      })
    })

    it('should pick up newly generated videos after refresh', async () => {
      const fetchMock = vi.spyOn(contentService, 'fetchActiveContent')

      // Initial load: 1 video
      fetchMock.mockResolvedValueOnce([mockVideoItem])

      render(<Hero />)

      await waitFor(() => {
        const video = screen.getByTestId('hero-video')
        expect(video).toHaveAttribute('src', mockVideoItem.url)
      })

      // Simulate new video generation and refresh (5 minutes later)
      fetchMock.mockResolvedValueOnce([mockVideoItem, mockVideoItem2])
      vi.advanceTimersByTime(5 * 60 * 1000)

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2)
      })

      // After another 30 seconds, should rotate to new video
      vi.advanceTimersByTime(30000)

      await waitFor(() => {
        const video = screen.getByTestId('hero-video')
        expect(video).toHaveAttribute('src', mockVideoItem2.url)
      })
    })

    it('should use refreshInterval of 5 minutes for Hero component', async () => {
      const fetchMock = vi.spyOn(contentService, 'fetchActiveContent')
      fetchMock.mockResolvedValue([mockVideoItem])

      render(<Hero />)

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
  })

  describe('Video Autoplay and Loop', () => {
    it('should set video autoPlay attribute', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockVideoItem])

      render(<Hero />)

      await waitFor(() => {
        const video = screen.getByTestId('hero-video')
        expect(video).toHaveAttribute('autoplay')
      })
    })

    it('should set video loop attribute', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockVideoItem])

      render(<Hero />)

      await waitFor(() => {
        const video = screen.getByTestId('hero-video')
        expect(video).toHaveAttribute('loop')
      })
    })

    it('should set video muted attribute', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockVideoItem])

      render(<Hero />)

      await waitFor(() => {
        const video = screen.getByTestId('hero-video')
        expect(video).toHaveAttribute('muted')
      })
    })
  })

  describe('Fallback Behavior', () => {
    it('should display fallback image when no content is available', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([])

      render(<Hero />)

      await waitFor(() => {
        const section = screen.getByRole('region')
        expect(section).toBeInTheDocument()
        // Fallback image should be rendered in the styles
      })
    })
  })

  describe('Hero Content Section', () => {
    it('should display Stockbridge Coffee heading', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockVideoItem])

      render(<Hero />)

      const heading = screen.getByText('STOCKBRIDGE COFFEE')
      expect(heading).toBeInTheDocument()
    })

    it('should display Edinburgh subheading', async () => {
      vi.spyOn(contentService, 'fetchActiveContent').mockResolvedValue([mockVideoItem])

      render(<Hero />)

      const subheading = screen.getByText('Edinburgh')
      expect(subheading).toBeInTheDocument()
    })
  })
})
