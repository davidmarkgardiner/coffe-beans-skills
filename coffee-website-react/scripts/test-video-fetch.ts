#!/usr/bin/env tsx

/**
 * Test fetching videos from the frontend's perspective
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

// Initialize Firebase (same as frontend)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

console.log('🔧 Firebase Config (Frontend):')
console.log('  Project ID:', firebaseConfig.projectId)
console.log('  Storage Bucket:', firebaseConfig.storageBucket)
console.log('  Auth Domain:', firebaseConfig.authDomain)
console.log()

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function testVideoFetch() {
  console.log('🔍 Testing video fetch (as frontend would)...')
  console.log()

  try {
    const contentRef = collection(db, 'content-videos')
    const currentSeason = 'winter' // Current season

    // Try the indexed query first (same as contentService.ts)
    console.log('📊 Query parameters:')
    console.log('  Collection: content-videos')
    console.log('  Season:', currentSeason)
    console.log('  Status: active')
    console.log('  Order: createdAt desc')
    console.log('  Limit: 10')
    console.log()

    try {
      const q = query(
        contentRef,
        where('season', '==', currentSeason),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(10)
      )

      const snapshot = await getDocs(q)

      console.log(`✅ Query successful! Found ${snapshot.size} videos`)
      console.log()

      snapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        console.log(`📹 Video ${index + 1}: ${doc.id}`)
        console.log('   URL:', data.url)
        console.log('   Season:', data.season)
        console.log('   Status:', data.status)
        console.log()
      })

      if (snapshot.size === 0) {
        console.log('⚠️  No active winter videos found!')
        console.log('   This is why the video is not showing on the website.')
        console.log()
      } else {
        console.log('✅ Videos are accessible from frontend!')
        console.log('   If the video is not showing, check:')
        console.log('   1. Browser console for errors (F12)')
        console.log('   2. Make sure you\'re at http://localhost:5173')
        console.log('   3. Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)')
        console.log('   4. Check Network tab for failed video loads')
      }
    } catch (indexError: any) {
      console.warn('⚠️  Index not ready, using fallback query...')
      console.log()

      // Fallback query
      const snapshot = await getDocs(contentRef)

      const items = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((item: any) => item.season === currentSeason && item.status === 'active')
        .sort((a: any, b: any) => {
          const aTime = a.createdAt?.toMillis?.() || 0
          const bTime = b.createdAt?.toMillis?.() || 0
          return bTime - aTime
        })
        .slice(0, 10)

      console.log(`✅ Fallback query successful! Found ${items.length} videos`)
      console.log()

      items.forEach((item: any, index: number) => {
        console.log(`📹 Video ${index + 1}: ${item.id}`)
        console.log('   URL:', item.url)
        console.log('   Season:', item.season)
        console.log('   Status:', item.status)
        console.log()
      })
    }
  } catch (error: any) {
    console.error('❌ Error fetching videos:', error.message)
    console.error()
    console.error('Stack:', error.stack)
  }
}

testVideoFetch().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
