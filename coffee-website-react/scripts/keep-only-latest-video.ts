#!/usr/bin/env tsx

/**
 * Keep Only Latest Video Script
 *
 * Archives all videos except the most recent one (coffee machine video)
 * This removes old bean-pouring videos from rotation
 *
 * Usage:
 *   npx tsx scripts/keep-only-latest-video.ts
 *   npx tsx scripts/keep-only-latest-video.ts --keep=VIDEO_ID
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

try {
  admin.initializeApp({
    projectId: projectId,
  })
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    throw error
  }
}

const db = admin.firestore()

/**
 * Archive all videos except the one to keep
 */
async function keepOnlyLatestVideo(keepVideoId?: string) {
  console.log('🗄️  Starting video cleanup...')
  console.log('━'.repeat(60))

  // Get all videos
  const videosSnapshot = await db.collection('content-videos').get()

  console.log(`Found ${videosSnapshot.size} videos total`)
  console.log()

  // Find the latest video if not specified
  let videoToKeep = keepVideoId

  if (!videoToKeep) {
    // Find the most recently created active video
    const activeVideos = videosSnapshot.docs
      .filter(doc => doc.data().status === 'active')
      .map(doc => ({
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(0),
        data: doc.data()
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    if (activeVideos.length === 0) {
      console.error('❌ No active videos found!')
      return
    }

    videoToKeep = activeVideos[0].id
    console.log(`📹 Most recent video: ${videoToKeep}`)
    console.log(`   Created: ${activeVideos[0].createdAt.toISOString()}`)
    console.log(`   Season: ${activeVideos[0].data.season}`)
    console.log()
  }

  console.log(`✅ Keeping video: ${videoToKeep}`)
  console.log(`🗑️  Archiving all other videos...`)
  console.log()

  let archivedCount = 0

  for (const doc of videosSnapshot.docs) {
    if (doc.id === videoToKeep) {
      // Ensure the video we want to keep is active
      await db.collection('content-videos').doc(doc.id).update({
        status: 'active'
      })
      console.log(`  ✅ Keeping active: ${doc.id}`)
    } else {
      // Archive all other videos
      await db.collection('content-videos').doc(doc.id).update({
        status: 'archived'
      })
      console.log(`  🗑️  Archived: ${doc.id}`)
      archivedCount++
    }
  }

  console.log()
  console.log('━'.repeat(60))
  console.log(`✨ Cleanup complete!`)
  console.log(`   Kept: 1 video (${videoToKeep})`)
  console.log(`   Archived: ${archivedCount} videos`)
  console.log('━'.repeat(60))
  console.log()
  console.log('🎯 Next steps:')
  console.log('   1. Refresh your website to see only the latest video')
  console.log('   2. Old videos are still in Firebase Storage but hidden from rotation')
  console.log()
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  const keepVideoArg = args.find(arg => arg.startsWith('--keep='))?.split('=')[1]

  try {
    await keepOnlyLatestVideo(keepVideoArg)
  } catch (error: any) {
    console.error('━'.repeat(60))
    console.error('❌ Video cleanup failed!')
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
