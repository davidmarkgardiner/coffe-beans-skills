#!/usr/bin/env tsx
/**
 * Upload Blog Post to Firestore
 *
 * Reads the generated blog post and uploads it to Firestore
 *
 * Usage:
 *   npm run upload:blog
 *   npm run upload:blog -- --file=./custom-blog-post.json
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from 'dotenv'
import * as fs from 'fs/promises'

config({ path: '.env.local' })

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

// Validate config
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingKeys.length > 0) {
  console.error('❌ Error: Missing Firebase configuration:')
  missingKeys.forEach(key => console.error(`  - ${key}`))
  console.error('Please set these in .env.local')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)

// Initialize Gemini AI for image generation
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('⚠️  Warning: GEMINI_API_KEY not found. Blog images will not be generated.')
}
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null

interface CuratedArticle {
  title: string
  url: string
  source: string
  summary: string
  fullContent: string // Full blog article content
  imagePrompt: string // Prompt for generating accompanying image
  imageUrl?: string // URL of generated image (added during upload)
  relevanceScore: number
  publishedDate?: string
}

interface BlogPost {
  title: string
  introduction: string
  articles: CuratedArticle[]
  conclusion: string
  tags: string[]
  category: string
}

interface FirestoreBlogPost {
  title: string
  slug: string
  introduction: string
  articles: CuratedArticle[]
  conclusion: string
  tags: string[]
  category: string
  status: 'published' | 'draft'
  publishedAt: any
  createdAt: any
  updatedAt: any
  author: string
  readTime: string
  excerpt: string
  featuredImage?: string
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Calculate estimated read time
 */
function calculateReadTime(blogPost: BlogPost): string {
  const introWords = blogPost.introduction.split(' ').length
  const conclusionWords = blogPost.conclusion.split(' ').length
  const articleWords = blogPost.articles.reduce((total, article) => {
    return total + article.fullContent.split(' ').length
  }, 0)

  const totalWords = introWords + conclusionWords + articleWords
  const readTimeMinutes = Math.ceil(totalWords / 200) // Average reading speed

  return `${readTimeMinutes} min read`
}

/**
 * Generate excerpt from introduction
 */
function generateExcerpt(introduction: string): string {
  const maxLength = 160
  if (introduction.length <= maxLength) {
    return introduction
  }

  return introduction.substring(0, maxLength - 3).trim() + '...'
}

/**
 * Get coffee image URL - using Picsum for reliable image delivery
 */
async function fetchCoffeeImage(article: CuratedArticle, articleIndex: number): Promise<string | null> {
  console.log(`   🎨 Fetching image for article ${articleIndex + 1}: "${article.title}"...`)

  try {
    // Use specific coffee-themed images from Unsplash via direct URLs
    // These are curated coffee images that will reliably load
    const coffeeImages = [
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop', // Pumpkin spice latte
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop', // Espresso martini/cocktail
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop', // Iced coffee
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop', // Vietnamese coffee
    ]

    const imageUrl = coffeeImages[articleIndex % coffeeImages.length]
    console.log(`      ✅ Using curated coffee image`)
    return imageUrl
  } catch (error: any) {
    console.error(`      ❌ Error fetching image: ${error.message || error}`)
    return null
  }
}

/**
 * Fetch featured image for blog post from Unsplash
 */
async function fetchFeaturedImage(blogPost: BlogPost): Promise<string | null> {
  console.log('🎨 Fetching featured image...')

  try {
    // Use a curated featured image from Unsplash
    const featuredImageUrl = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=800&fit=crop'

    console.log(`   ✅ Using featured image`)
    return featuredImageUrl
  } catch (error: any) {
    console.error('   ❌ Error fetching featured image:', error.message || error)
    return null
  }
}

/**
 * Upload blog post to Firestore
 */
async function uploadBlogPost(blogPost: BlogPost): Promise<string> {
  console.log('📤 Preparing blog post for upload...')

  const now = Timestamp.now()
  const slug = generateSlug(blogPost.title)
  const readTime = calculateReadTime(blogPost)
  const excerpt = generateExcerpt(blogPost.introduction)

  // Fetch images for each article from Unsplash
  console.log(`🎨 Fetching images for ${blogPost.articles.length} articles...`)
  const articlesWithImages = await Promise.all(
    blogPost.articles.map(async (article, index) => {
      const imageUrl = await fetchCoffeeImage(article, index)
      return {
        ...article,
        imageUrl: imageUrl || undefined  // Always include imageUrl field
      }
    })
  )

  // Fetch featured image for the blog post
  const featuredImage = await fetchFeaturedImage(blogPost)

  const firestorePost: FirestoreBlogPost = {
    title: blogPost.title,
    slug,
    introduction: blogPost.introduction,
    articles: articlesWithImages,
    conclusion: blogPost.conclusion,
    tags: blogPost.tags,
    category: blogPost.category,
    status: 'published',
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    author: 'Stockbridge Coffee Team',
    readTime,
    excerpt,
    ...(featuredImage && { featuredImage }),
  }

  console.log('📤 Uploading blog post to Firestore...')

  try {
    const docRef = await addDoc(collection(db, 'blog-posts'), firestorePost)
    console.log(`✅ Blog post uploaded with ID: ${docRef.id}`)
    return docRef.id
  } catch (error) {
    console.error('❌ Error uploading blog post:', error)
    throw error
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2)
  const fileArg = args.find(arg => arg.startsWith('--file='))
  const filePath = fileArg ? fileArg.split('=')[1] : './scripts/generated-blog-post.json'

  console.log('📝 Stockbridge Coffee - Blog Post Upload')
  console.log('='.repeat(50))
  console.log(`Reading from: ${filePath}`)
  console.log('')

  try {
    // Read the generated blog post
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const blogPost: BlogPost = JSON.parse(fileContent)

    console.log(`Title: ${blogPost.title}`)
    console.log(`Category: ${blogPost.category}`)
    console.log(`Articles: ${blogPost.articles.length}`)
    console.log('')

    // Upload to Firestore
    const postId = await uploadBlogPost(blogPost)

    console.log('')
    console.log('✅ Blog post successfully published!')
    console.log(`   ID: ${postId}`)
    console.log(`   Slug: ${generateSlug(blogPost.title)}`)
    console.log(`   URL: /blog/${generateSlug(blogPost.title)}`)
    console.log('')
    console.log('Next steps:')
    console.log('  1. View on website: http://localhost:5173/blog')
    console.log('  2. Send newsletter: npm run send:newsletter')

  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.error(`❌ Error: File not found: ${filePath}`)
      console.error('Please run: npm run curate:blog')
    } else {
      console.error('❌ Error:', error)
    }
    process.exit(1)
  }
}

main()
