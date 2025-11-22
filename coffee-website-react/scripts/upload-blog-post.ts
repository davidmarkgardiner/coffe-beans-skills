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
import { GoogleGenAI } from '@google/genai'
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
const API_KEY = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY
if (!API_KEY) {
  console.error('⚠️  Warning: GEMINI_API_KEY not found. Blog images will not be generated.')
}
const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null

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
 * Generate AI image for article using Gemini Imagen
 */
async function generateCoffeeImage(article: CuratedArticle, articleIndex: number): Promise<string | null> {
  console.log(`   🎨 Generating AI image for article ${articleIndex + 1}: "${article.title}"...`)

  if (!genAI) {
    console.log(`      ⚠️  Gemini API not configured, using fallback images`)
    // Fallback to curated Christmas-themed coffee images
    const christmasCoffeeImages = [
      'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1482146039114-f19e8b7d7889?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop',
    ]
    return christmasCoffeeImages[articleIndex % christmasCoffeeImages.length]
  }

  try {
    // Use the imagePrompt from the article, which includes Christmas theming
    const imagePrompt = article.imagePrompt || `Professional food photography of ${article.title}: overhead shot of a beautiful coffee drink in a festive red mug on a rustic wooden table with Christmas decorations (pine branches, cinnamon sticks, star anise, cranberries), warm golden lighting from fairy lights, shallow depth of field, steam rising, cozy Christmas cafe atmosphere with bokeh lights in background, 4K quality, no text or watermarks`

    console.log(`      📝 Prompt: ${imagePrompt.substring(0, 80)}...`)
    console.log(`      ⏳ Generating image with Imagen 4.0 (this may take 10-30 seconds)...`)

    // Generate image using Imagen (same as test-content-generation.ts)
    const response = await genAI.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '4:3',
      },
    })

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('No images generated')
    }

    console.log(`      ✅ Image generated successfully!`)

    // Upload to Firebase Storage
    const imageBytes = response.generatedImages[0].image.imageBytes
    // imageBytes is base64-encoded, so decode it to binary
    const imageBuffer = Buffer.from(imageBytes, 'base64')
    const timestamp = Date.now()
    const storageRef = ref(storage, `blog-images/${timestamp}-${articleIndex}.jpg`)

    console.log(`      📤 Uploading to Firebase Storage...`)
    await uploadBytes(storageRef, imageBuffer, {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000',
    })

    const downloadURL = await getDownloadURL(storageRef)
    console.log(`      ✅ Image uploaded: ${downloadURL.substring(0, 60)}...`)

    return downloadURL
  } catch (error: any) {
    console.error(`      ❌ Error generating image: ${error.message || error}`)

    // Fallback to Christmas-themed Unsplash images on error
    console.log(`      ⚠️  Using fallback Unsplash image`)
    const christmasCoffeeImages = [
      'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1482146039114-f19e8b7d7889?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop',
    ]
    return christmasCoffeeImages[articleIndex % christmasCoffeeImages.length]
  }
}

/**
 * Generate featured image for blog post - Christmas themed
 */
async function generateFeaturedImage(blogPost: BlogPost): Promise<string | null> {
  console.log('🎨 Generating featured image for blog post...')

  try {
    // Use a curated Christmas-themed featured image from Unsplash
    // When Imagen API is available, this can be generated dynamically
    const christmasFeaturedImages = [
      'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=1200&h=800&fit=crop', // Christmas coffee setup
      'https://images.unsplash.com/photo-1482146039114-f19e8b7d7889?w=1200&h=800&fit=crop', // Festive hot drinks
      'https://images.unsplash.com/photo-1608398002239-e7f8830d4d10?w=1200&h=800&fit=crop', // Christmas cafe scene
    ]

    // Use first image as featured, or rotate based on day
    const dayOfMonth = new Date().getDate()
    const featuredImageUrl = christmasFeaturedImages[dayOfMonth % christmasFeaturedImages.length]

    console.log(`   ✅ Using Christmas-themed featured image`)
    return featuredImageUrl
  } catch (error: any) {
    console.error('   ❌ Error generating featured image:', error.message || error)
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

  // Generate AI images for each article (or use Christmas-themed fallbacks)
  console.log(`🎨 Generating images for ${blogPost.articles.length} articles...`)
  const articlesWithImages = await Promise.all(
    blogPost.articles.map(async (article, index) => {
      const imageUrl = await generateCoffeeImage(article, index)
      return {
        ...article,
        imageUrl: imageUrl || undefined  // Always include imageUrl field
      }
    })
  )

  // Generate featured image for the blog post
  const featuredImage = await generateFeaturedImage(blogPost)

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
