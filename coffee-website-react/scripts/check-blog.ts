#!/usr/bin/env tsx
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
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

async function checkBlogPost() {
  const q = query(collection(db, 'blog-posts'), orderBy('publishedAt', 'desc'), limit(1))
  const snapshot = await getDocs(q)
  
  snapshot.forEach(doc => {
    console.log('Latest Blog Post:')
    console.log('ID:', doc.id)
    const data = doc.data()
    console.log('Title:', data.title)
    console.log('Featured Image:', data.featuredImage)
    console.log('\nArticles:')
    data.articles?.forEach((article: any, i: number) => {
      console.log(`\n  Article ${i + 1}: ${article.title}`)
      console.log(`  Has imageUrl: ${article.imageUrl ? 'YES' : 'NO'}`)
      if (article.imageUrl) {
        console.log(`  Image URL: ${article.imageUrl}`)
      }
    })
  })
}

checkBlogPost()
