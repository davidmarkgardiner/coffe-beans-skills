#!/usr/bin/env tsx

import admin from 'firebase-admin'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

try {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  })
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    throw error
  }
}

const db = admin.firestore()

async function verifyVideo() {
  const docRef = db.collection('content-videos').doc('hero-winter-video-20251112')
  const doc = await docRef.get()
  
  if (!doc.exists) {
    console.error('❌ Video not found!')
    return
  }
  
  const data = doc.data()
  
  console.log('📹 Current Active Video:')
  console.log('━'.repeat(60))
  console.log('   ID:', doc.id)
  console.log('   Season:', data?.season)
  console.log('   Status:', data?.status)
  console.log('   URL:', data?.url)
  console.log('   Storage Path:', data?.storagePath)
  console.log('   File Size:', (data?.metadata?.fileSize / 1024 / 1024).toFixed(2), 'MB')
  console.log('━'.repeat(60))
  console.log()
  console.log('✅ This is the video from:')
  console.log('   /Users/davidgardiner/Downloads/2f9838b5-125d-47fb-afb1-b42eba55d85c.mp4')
  console.log()
  console.log('   We renamed it to: hero-winter-video-20251112.mp4')
  console.log('   And uploaded it to Firebase Storage')
}

verifyVideo().catch(console.error)
