import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

export type Season = 'winter' | 'spring' | 'summer' | 'autumn'
export type ContentType = 'photo' | 'video'
export type ContentStatus = 'active' | 'archived'

export interface ContentItem {
  id: string
  type: ContentType
  url: string
  storagePath: string
  season: Season
  holiday: string | null
  status: ContentStatus
  prompt: string
  generatedBy: string
  metadata: {
    width: number
    height: number
    aspectRatio: string
    fileSize: number
    format: string
    duration?: number
  }
  tags: string[]
  usageContext?: string
  createdAt: Date
}

/**
 * Detect current season based on date
 */
export function detectCurrentSeason(): Season {
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
 * Fetch active content from Firestore
 */
export async function fetchActiveContent(
  type: ContentType,
  season?: Season,
  maxResults: number = 10
): Promise<ContentItem[]> {
  try {
    // Use the flat collection structure: content-photos or content-videos
    const collectionName = `content-${type}s`
    const contentRef = collection(db, collectionName)

    // Build query
    const currentSeason = season || detectCurrentSeason()

    try {
      // Try the indexed query first
      const q = query(
        contentRef,
        where('season', '==', currentSeason),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      )

      const snapshot = await getDocs(q)

      const items = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as ContentItem
      })

      console.log(`✅ Fetched ${items.length} ${type} items for ${currentSeason}`)

      return items
    } catch (indexError: any) {
      // If index not ready, fall back to simple query and filter client-side
      console.warn('Index not ready, using fallback query...')

      const snapshot = await getDocs(contentRef)

      const items = snapshot.docs
        .map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as ContentItem
        })
        .filter(item => item.season === currentSeason && item.status === 'active')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, maxResults)

      console.log(`✅ Fetched ${items.length} ${type} items for ${currentSeason} (fallback)`)

      return items
    }
  } catch (error) {
    console.error('Error fetching content:', error)
    throw error
  }
}

/**
 * Fetch all active content (photos + videos) for current season
 */
export async function fetchAllActiveContent(
  season?: Season,
  maxResults: number = 20
): Promise<ContentItem[]> {
  const currentSeason = season || detectCurrentSeason()

  const [photos, videos] = await Promise.all([
    fetchActiveContent('photo', currentSeason, maxResults),
    fetchActiveContent('video', currentSeason, maxResults),
  ])

  // Combine and sort by creation date
  const allContent = [...photos, ...videos].sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  )

  return allContent.slice(0, maxResults)
}

/**
 * Fetch content by holiday
 */
export async function fetchHolidayContent(
  type: ContentType,
  holiday: string,
  maxResults: number = 10
): Promise<ContentItem[]> {
  try {
    const collectionName = `content-${type}s`
    const contentRef = collection(db, collectionName)

    const q = query(
      contentRef,
      where('holiday', '==', holiday),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    )

    const snapshot = await getDocs(q)

    const items = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as ContentItem
    })

    return items
  } catch (error) {
    console.error('Error fetching holiday content:', error)
    throw error
  }
}
