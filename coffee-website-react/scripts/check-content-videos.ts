#!/usr/bin/env tsx

/**
 * Check content-videos collection in Firestore
 */

import admin from 'firebase-admin'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

// Initialize Firebase Admin
const projectId = process.env.VITE_FIREBASE_PROJECT_ID
const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET

console.log('🔧 Firebase Config:')
console.log('  Project ID:', projectId)
console.log('  Storage Bucket:', storageBucket)
console.log()

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

async function checkContentVideos() {
  console.log('🔍 Checking content-videos collection...')
  console.log()

  try {
    const snapshot = await db.collection('content-videos').get()

    console.log(`Found ${snapshot.size} videos`)
    console.log()

    snapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      console.log(`📹 Video ${index + 1}: ${doc.id}`)
      console.log('   Type:', data.type)
      console.log('   Season:', data.season)
      console.log('   Status:', data.status)
      console.log('   URL:', data.url)
      console.log('   Storage Path:', data.storagePath)
      console.log('   Created At:', data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A')
      console.log()
    })

    if (snapshot.size === 0) {
      console.log('⚠️  No videos found in content-videos collection!')
      console.log('   Try uploading a video using: npm run upload:content')
    }
  } catch (error: any) {
    console.error('❌ Error checking content-videos:', error.message)
    throw error
  }
}

checkContentVideos().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
