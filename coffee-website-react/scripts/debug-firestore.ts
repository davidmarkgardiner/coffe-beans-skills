#!/usr/bin/env tsx

/**
 * Debug script to check what content is in Firestore
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

console.log('🔧 Firebase Config:')
console.log('  Project ID:', firebaseConfig.projectId)
console.log('  Storage Bucket:', firebaseConfig.storageBucket)
console.log()

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function checkFirestore() {
  console.log('📊 Checking Firestore content...\n')

  // Check content-videos
  console.log('━'.repeat(60))
  console.log('📹 CONTENT-VIDEOS Collection')
  console.log('━'.repeat(60))

  const videosRef = collection(db, 'content-videos')
  const videosSnapshot = await getDocs(videosRef)

  console.log(`Found ${videosSnapshot.size} video documents\n`)

  videosSnapshot.forEach((doc, index) => {
    const data = doc.data()
    console.log(`Video ${index + 1}:`)
    console.log(`  ID: ${doc.id}`)
    console.log(`  Season: ${data.season}`)
    console.log(`  Status: ${data.status}`)
    console.log(`  URL: ${data.url?.substring(0, 80)}...`)
    console.log(`  Created: ${data.createdAt?.toDate?.() || 'unknown'}`)
    console.log()
  })

  // Check content-photos
  console.log('━'.repeat(60))
  console.log('🖼️  CONTENT-PHOTOS Collection')
  console.log('━'.repeat(60))

  const photosRef = collection(db, 'content-photos')
  const photosSnapshot = await getDocs(photosRef)

  console.log(`Found ${photosSnapshot.size} photo documents\n`)

  photosSnapshot.forEach((doc, index) => {
    const data = doc.data()
    console.log(`Photo ${index + 1}:`)
    console.log(`  ID: ${doc.id}`)
    console.log(`  Season: ${data.season}`)
    console.log(`  Status: ${data.status}`)
    console.log(`  URL: ${data.url?.substring(0, 80)}...`)
    console.log(`  Created: ${data.createdAt?.toDate?.() || 'unknown'}`)
    console.log()
  })

  console.log('━'.repeat(60))
  console.log('✅ Firestore check complete')
  console.log('━'.repeat(60))
}

checkFirestore().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
