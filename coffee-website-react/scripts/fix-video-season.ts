#!/usr/bin/env tsx

import admin from 'firebase-admin'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

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

async function updateVideoSeason() {
  console.log('🔄 Updating video season to autumn...')
  console.log()
  
  const docRef = db.collection('content-videos').doc('hero-winter-video-20251112')
  const doc = await docRef.get()
  
  if (!doc.exists) {
    console.error('❌ Video not found!')
    return
  }
  
  const oldSeason = doc.data()?.season
  await docRef.update({ season: 'autumn' })
  
  console.log('✅ Video season updated!')
  console.log('   Old season:', oldSeason)
  console.log('   New season: autumn')
  console.log()
  console.log('🎯 Next steps:')
  console.log('   Hard refresh your browser (Cmd+Shift+R)')
  console.log('   The video should now appear!')
}

updateVideoSeason().catch(console.error)
