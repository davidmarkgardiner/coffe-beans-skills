#!/usr/bin/env tsx

/**
 * Archive Old Content Script
 *
 * Archives old liquid coffee content by setting status to "archived"
 * This removes them from active rotation while preserving the data
 *
 * Usage:
 *   npm run archive:old
 *   tsx scripts/archive-old-content.ts
 *   tsx scripts/archive-old-content.ts --before=2025-10-29
 */

import admin from 'firebase-admin'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

// Initialize Firebase Admin
const projectId = process.env.VITE_FIREBASE_PROJECT_ID

console.log('🔧 Firebase Config:')
console.log('  Project ID:', projectId)
console.log()

// Initialize Admin SDK with application default credentials
try {
  admin.initializeApp({
    projectId: projectId,
  })
} catch (error: any) {
  // App may already be initialized
  if (error.code !== 'app/duplicate-app') {
    throw error
  }
}

const db = admin.firestore()

interface ContentDoc {
  id: string
  season: string
  status: string
  url: string
  createdAt?: any
  prompt?: string
}

/**
 * Archive content before a specific date
 */
async function archiveOldContent(beforeDate?: string) {
  console.log('🗄️  Starting archive process...')
  console.log('━'.repeat(60))

  // Parse cutoff date
  const cutoffDate = beforeDate ? new Date(beforeDate) : new Date('2025-10-29')
  console.log('📅 Archiving content created before:', cutoffDate.toISOString().split('T')[0])
  console.log()

  let totalArchived = 0

  // Archive videos
  console.log('📹 Processing videos...')
  const videosSnapshot = await db.collection('content-videos').get()

  console.log(`Found ${videosSnapshot.size} video documents`)

  for (const docSnapshot of videosSnapshot.docs) {
    const data = docSnapshot.data() as ContentDoc

    // Skip already archived content
    if (data.status === 'archived') {
      continue
    }

    // Check if content should be archived based on creation date
    let shouldArchive = false

    // Check createdAt timestamp if it exists
    if (data.createdAt) {
      const createdDate = data.createdAt.toDate()
      shouldArchive = createdDate < cutoffDate
    }

    // Also check ID pattern and prompt (even if createdAt exists)
    // This handles cases where createdAt was set incorrectly
    const hasOldDateInId = /202510(2[0-8]|[01]\d|0[1-9])/i.test(docSnapshot.id)
    const isLiquidCoffee = data.prompt?.toLowerCase().includes('cappuccino') ||
                          data.prompt?.toLowerCase().includes('latte') ||
                          data.prompt?.toLowerCase().includes('liquid')

    // Archive if ANY condition is true
    shouldArchive = shouldArchive || hasOldDateInId || isLiquidCoffee

    if (shouldArchive) {
      await db.collection('content-videos').doc(docSnapshot.id).update({
        status: 'archived'
      })

      console.log(`  ✅ Archived video: ${docSnapshot.id}`)
      totalArchived++
    }
  }

  console.log()

  // Archive photos
  console.log('🖼️  Processing photos...')
  const photosSnapshot = await db.collection('content-photos').get()

  console.log(`Found ${photosSnapshot.size} photo documents`)

  for (const docSnapshot of photosSnapshot.docs) {
    const data = docSnapshot.data() as ContentDoc

    // Skip already archived content
    if (data.status === 'archived') {
      continue
    }

    // Check if content should be archived based on creation date
    let shouldArchive = false

    // Check createdAt timestamp if it exists
    if (data.createdAt) {
      const createdDate = data.createdAt.toDate()
      shouldArchive = createdDate < cutoffDate
    }

    // Also check ID pattern and prompt (even if createdAt exists)
    // This handles cases where createdAt was set incorrectly
    const hasOldDateInId = /202510(2[0-8]|[01]\d|0[1-9])/i.test(docSnapshot.id)
    const isLiquidCoffee = data.prompt?.toLowerCase().includes('cappuccino') ||
                          data.prompt?.toLowerCase().includes('latte') ||
                          data.prompt?.toLowerCase().includes('liquid')

    // Archive if ANY condition is true
    shouldArchive = shouldArchive || hasOldDateInId || isLiquidCoffee

    if (shouldArchive) {
      await db.collection('content-photos').doc(docSnapshot.id).update({
        status: 'archived'
      })

      console.log(`  ✅ Archived photo: ${docSnapshot.id}`)
      totalArchived++
    }
  }

  console.log()
  console.log('━'.repeat(60))
  console.log(`✨ Archive process complete! Archived ${totalArchived} items`)
  console.log('━'.repeat(60))
  console.log()
  console.log('🎯 Next steps:')
  console.log('   1. Refresh your website to see only coffee bean content')
  console.log('   2. Old content is still in Firebase Storage but hidden from rotation')
  console.log('   3. To permanently delete, manually delete from Firebase Console')
  console.log()
}

/**
 * List all active content (for verification)
 */
async function listActiveContent() {
  console.log('📊 Active Content Summary')
  console.log('━'.repeat(60))

  // Count active videos
  const activeVideosSnapshot = await db.collection('content-videos')
    .where('status', '==', 'active')
    .get()

  console.log(`📹 Active Videos: ${activeVideosSnapshot.size}`)
  activeVideosSnapshot.forEach(doc => {
    const data = doc.data()
    console.log(`  - ${doc.id} (${data.season})`)
  })

  console.log()

  // Count active photos
  const activePhotosSnapshot = await db.collection('content-photos')
    .where('status', '==', 'active')
    .get()

  console.log(`🖼️  Active Photos: ${activePhotosSnapshot.size}`)
  activePhotosSnapshot.forEach(doc => {
    const data = doc.data()
    console.log(`  - ${doc.id} (${data.season})`)
  })

  console.log('━'.repeat(60))
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  const beforeDateArg = args.find(arg => arg.startsWith('--before='))?.split('=')[1]
  const listOnly = args.includes('--list')

  try {
    if (listOnly) {
      await listActiveContent()
    } else {
      await archiveOldContent(beforeDateArg)
      console.log()
      await listActiveContent()
    }
  } catch (error: any) {
    console.error('━'.repeat(60))
    console.error('❌ Archive process failed!')
    console.error('━'.repeat(60))
    console.error('\nError:', error.message)
    console.error()
    process.exit(1)
  }
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
