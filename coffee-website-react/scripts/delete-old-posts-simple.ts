#!/usr/bin/env tsx
/**
 * Delete specific old blog posts by ID
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, deleteDoc, doc } from 'firebase/firestore'
import { config } from 'dotenv'

config({ path: '.env.local' })

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

async function deleteOldPosts() {
  console.log('🗑️  Deleting old blog posts...\n')

  // These are the old posts with Unsplash images
  const oldPostIds = [
    'RlpqMt5Kc8pLaHbzZuT4',  // Old Christmas post with Unsplash
    '90BG5vzVwhNtHGZoGQwS',  // Old general post
    'pms0pynA8MSYasxFd9tl',  // Old general post
    'nOxy5l2TGLXe3eGGc3ql',  // Old general post
  ]

  for (const postId of oldPostIds) {
    try {
      await deleteDoc(doc(db, 'blog-posts', postId))
      console.log(`✅ Deleted: ${postId}`)
    } catch (error: any) {
      console.error(`❌ Failed to delete ${postId}:`, error.message)
    }
  }

  console.log(`\n✅ Cleanup complete! Only the new post with AI-generated images remains.`)
  console.log(`   Keep: hdnHLbft0RwUNpHU0eW5 (has Firebase Storage URLs)`)
}

deleteOldPosts().catch(console.error)
