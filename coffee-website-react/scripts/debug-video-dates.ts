#!/usr/bin/env tsx

/**
 * Debug Video Dates
 * Inspects video documents to see their actual createdAt dates
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

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function debugVideoDates() {
  console.log('🔍 Debugging Video Dates')
  console.log('━'.repeat(80))

  const videosRef = collection(db, 'content-videos')
  const snapshot = await getDocs(videosRef)

  console.log(`\nFound ${snapshot.size} video documents\n`)

  snapshot.docs.forEach((doc, index) => {
    const data = doc.data()
    const id = doc.id

    console.log(`${index + 1}. ${id}`)
    console.log(`   Status: ${data.status}`)
    console.log(`   Season: ${data.season}`)

    if (data.createdAt) {
      const createdDate = data.createdAt.toDate()
      console.log(`   Created: ${createdDate.toISOString()}`)
      console.log(`   Date String: ${createdDate.toLocaleDateString()}`)
    } else {
      console.log(`   Created: NO CREATED_AT FIELD`)
    }

    // Check if ID matches old date pattern
    const hasOldDateInId = /202510(2[0-8]|[01]\d|0[1-9])/i.test(id)
    console.log(`   Old ID Pattern Match: ${hasOldDateInId}`)

    console.log()
  })

  console.log('━'.repeat(80))
}

debugVideoDates().catch(console.error)
