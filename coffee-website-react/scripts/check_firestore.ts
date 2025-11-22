#!/usr/bin/env tsx
/**
 * Check Firestore blog posts
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { config } from 'dotenv'

config({ path: '/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/.env.local' })

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

async function checkBlogPosts() {
  console.log('🔍 Checking blog-posts collection...\n')

  try {
    const q = query(
      collection(db, 'blog-posts'),
      orderBy('publishedAt', 'desc'),
      limit(5)
    )

    const snapshot = await getDocs(q)

    console.log(`Found ${snapshot.size} blog posts\n`)

    snapshot.forEach((doc) => {
      const data = doc.data()
      console.log(`📝 ${doc.id}`)
      console.log(`   Title: ${data.title}`)
      console.log(`   Slug: ${data.slug}`)
      console.log(`   Status: ${data.status}`)
      console.log(`   Featured Image: ${data.featuredImage ? 'Yes' : 'No'}`)
      console.log(`   Articles: ${data.articles?.length || 0}`)

      if (data.articles && data.articles.length > 0) {
        console.log(`\n   📷 Article Images:`)
        data.articles.forEach((article: any, i: number) => {
          console.log(`      ${i + 1}. ${article.title}`)
          console.log(`         imageUrl: ${article.imageUrl || 'MISSING'}`)
        })
      }
      console.log()
    })
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

checkBlogPosts()
