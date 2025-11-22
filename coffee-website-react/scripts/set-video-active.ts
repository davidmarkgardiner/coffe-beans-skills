#!/usr/bin/env tsx

/**
 * Set specific video as active and archive all others
 */

import admin from 'firebase-admin'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

// Initialize Firebase Admin
const projectId = process.env.VITE_FIREBASE_PROJECT_ID
const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET

try {
  admin.initializeApp({
    projectId: projectId,
    storageBucket: storageBucket,
  })
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    throw error
  }
}

const db = admin.firestore()

async function setVideoActive(activeVideoId: string) {
  console.log('🔄 Setting video statuses...')
  console.log(`   Active video: ${activeVideoId}`)
  console.log()

  try {
    const snapshot = await db.collection('content-videos').get()

    console.log(`Found ${snapshot.size} videos`)
    console.log()

    let activeCount = 0
    let archivedCount = 0

    // Update all videos
    const batch = db.batch()

    snapshot.docs.forEach((doc) => {
      const docRef = db.collection('content-videos').doc(doc.id)

      if (doc.id === activeVideoId) {
        batch.update(docRef, { status: 'active' })
        activeCount++
        console.log(`✅ ${doc.id} → active`)
      } else {
        batch.update(docRef, { status: 'archived' })
        archivedCount++
        console.log(`📦 ${doc.id} → archived`)
      }
    })

    // Commit the batch
    await batch.commit()

    console.log()
    console.log('━'.repeat(60))
    console.log('✨ Status update completed!')
    console.log('━'.repeat(60))
    console.log()
    console.log('📊 Summary:')
    console.log(`   Active videos: ${activeCount}`)
    console.log(`   Archived videos: ${archivedCount}`)
    console.log()
    console.log('🎯 Next steps:')
    console.log('   1. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)')
    console.log('   2. Check the hero section - only the active video should show')
    console.log()

  } catch (error: any) {
    console.error('❌ Error updating video statuses:', error.message)
    throw error
  }
}

// Get video ID from command line or use default
const args = process.argv.slice(2)
const videoId = args[0] || 'hero-winter-video-20251112'

setVideoActive(videoId).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
