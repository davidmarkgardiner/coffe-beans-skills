#!/usr/bin/env tsx
import admin from 'firebase-admin'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const projectId = process.env.VITE_FIREBASE_PROJECT_ID

try {
  admin.initializeApp({ projectId })
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') throw error
}

const db = admin.firestore()

async function updateVideoSeason() {
  console.log('🔄 Updating roaster video season to autumn...')
  
  await db.collection('content-videos')
    .doc('test-roaster-video-20251110T234350')
    .update({ season: 'autumn' })
  
  console.log('✅ Updated season to autumn')
}

updateVideoSeason().catch(console.error)
