#!/usr/bin/env tsx
/**
 * Delete old duplicate blog posts
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore'
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
  console.log('🔍 Finding old blog posts to delete...\n')

  // Get all posts with the Christmas slug
  const q = query(
    collection(db, 'blog-posts'),
    where('slug', '==', 'brew-up-christmas-cheer-4-festive-coffee-recipes-to-delight-your-holiday-season')
  )

  const snapshot = await getDocs(q)
  console.log(`Found ${snapshot.size} posts with this slug\n`)

  const postsToDelete = []

  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data()
    const hasFirebaseImages = data.articles?.[0]?.imageUrl?.includes('firebasestorage')
    const hasUnsplashImages = data.articles?.[0]?.imageUrl?.includes('unsplash')

    console.log(`📝 ${docSnapshot.id}`)
    console.log(`   First image: ${data.articles?.[0]?.imageUrl?.substring(0, 60)}...`)
    console.log(`   Type: ${hasFirebaseImages ? 'Firebase (NEW - AI generated)' : 'Unsplash (OLD - fallback)'}`)

    if (hasUnsplashImages) {
      postsToDelete.push(docSnapshot.id)
      console.log(`   ❌ Will DELETE (old post)`)
    } else {
      console.log(`   ✅ Will KEEP (new AI-generated images)`)
    }
    console.log()
  })

  // Delete old posts
  if (postsToDelete.length > 0) {
    console.log(`\n🗑️  Deleting ${postsToDelete.length} old post(s)...\n`)

    for (const postId of postsToDelete) {
      await deleteDoc(doc(db, 'blog-posts', postId))
      console.log(`   ✅ Deleted: ${postId}`)
    }

    console.log(`\n✅ Cleanup complete! The blog post with AI-generated images is now the only one.`)
  } else {
    console.log(`\n✅ No old posts to delete.`)
  }
}

deleteOldPosts().catch(console.error)
