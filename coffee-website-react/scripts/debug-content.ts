#!/usr/bin/env tsx

/**
 * Debug Content - Check what's in Firestore
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'
import * as dotenv from 'dotenv'

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

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function debugContent() {
  console.log('🔍 Checking Firestore content...\n')

  // Check content-videos collection
  console.log('📹 Checking content-videos collection:')
  const videosRef = collection(db, 'content-videos')
  const videosSnapshot = await getDocs(videosRef)

  if (videosSnapshot.empty) {
    console.log('  ❌ No documents found in content-videos collection')
  } else {
    console.log(`  ✅ Found ${videosSnapshot.size} documents`)
    videosSnapshot.forEach(doc => {
      const data = doc.data()
      console.log(`\n  Document ID: ${doc.id}`)
      console.log(`    Type: ${data.type}`)
      console.log(`    Season: ${data.season}`)
      console.log(`    Status: ${data.status}`)
      console.log(`    URL: ${data.url?.substring(0, 80)}...`)
      console.log(`    Created: ${data.createdAt?.toDate()}`)
    })
  }

  // Check content-photos collection
  console.log('\n\n📸 Checking content-photos collection:')
  const photosRef = collection(db, 'content-photos')
  const photosSnapshot = await getDocs(photosRef)

  if (photosSnapshot.empty) {
    console.log('  ❌ No documents found in content-photos collection')
  } else {
    console.log(`  ✅ Found ${photosSnapshot.size} documents`)
    photosSnapshot.forEach(doc => {
      const data = doc.data()
      console.log(`\n  Document ID: ${doc.id}`)
      console.log(`    Type: ${data.type}`)
      console.log(`    Season: ${data.season}`)
      console.log(`    Status: ${data.status}`)
      console.log(`    URL: ${data.url?.substring(0, 80)}...`)
    })
  }

  // Try querying for active autumn videos
  console.log('\n\n🔍 Querying for active autumn videos:')
  const q = query(
    videosRef,
    where('season', '==', 'autumn'),
    where('status', '==', 'active')
  )
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    console.log('  ❌ No active autumn videos found')
  } else {
    console.log(`  ✅ Found ${querySnapshot.size} active autumn videos`)
    querySnapshot.forEach(doc => {
      console.log(`    - ${doc.id}`)
    })
  }

  console.log('\n')
}

debugContent().catch(console.error)
