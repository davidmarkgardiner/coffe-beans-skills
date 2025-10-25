#!/usr/bin/env tsx

/**
 * Upload Content to Firebase
 *
 * Uploads AI-generated content to Firebase Storage and creates Firestore metadata documents
 *
 * Usage:
 *   npm run upload:content
 *   tsx scripts/upload-content-to-firebase.ts
 *   tsx scripts/upload-content-to-firebase.ts --file=test-generated-content/test-autumn-photo-20251025T150958.jpg
 */

import { initializeApp } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)
const db = getFirestore(app)

type Season = 'winter' | 'spring' | 'summer' | 'autumn'
type ContentType = 'photo' | 'video'

interface ContentMetadata {
  id: string
  type: ContentType
  url: string
  storagePath: string
  season: Season
  holiday: string | null
  status: 'active' | 'archived'
  prompt: string
  generatedBy: 'manual' | 'github-actions'
  metadata: {
    width: number
    height: number
    aspectRatio: string
    fileSize: number
    format: string
    duration?: number
  }
  tags: string[]
  usageContext?: string
}

/**
 * Parse filename to extract metadata
 */
function parseFilename(filename: string): {
  type: ContentType
  season: Season
  contentId: string
  holiday: string | null
} {
  // Expected format: test-autumn-photo-20251025T150958.jpg
  // or: christmas-winter-video-20251225T120000.mp4
  const basename = path.basename(filename, path.extname(filename))
  const parts = basename.split('-')

  let season: Season = 'winter'
  let type: ContentType = 'photo'
  let holiday: string | null = null
  let contentId = basename

  // Detect type from extension
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.mp4' || ext === '.webm') {
    type = 'video'
  }

  // Extract season (look for winter, spring, summer, autumn in filename)
  const seasonMatch = basename.match(/(winter|spring|summer|autumn)/i)
  if (seasonMatch) {
    season = seasonMatch[1].toLowerCase() as Season
  }

  // Extract holiday if present
  const holidays = ['christmas', 'easter', 'halloween', 'valentines', 'newyear', 'mothersday', 'fathersday']
  for (const h of holidays) {
    if (basename.toLowerCase().includes(h)) {
      holiday = h
      break
    }
  }

  return { type, season, holiday, contentId }
}

/**
 * Get image dimensions (simplified - actual implementation would need image processing library)
 */
function getImageMetadata(fileBuffer: Buffer, format: string) {
  // For now, return default values
  // In production, use sharp or similar library to get actual dimensions
  return {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    format,
  }
}

/**
 * Upload file to Firebase Storage
 */
async function uploadToStorage(
  filePath: string,
  season: Season,
  type: ContentType,
  contentId: string
): Promise<{ url: string; storagePath: string; fileSize: number }> {
  console.log('📤 Uploading to Firebase Storage...')

  const fileBuffer = await fs.readFile(filePath)
  const ext = path.extname(filePath)
  const storagePath = `content/${type}s/${season}/${contentId}${ext}`

  // Create storage reference
  const storageRef = ref(storage, storagePath)

  // Determine content type
  let contentType = 'image/jpeg'
  if (ext === '.png') contentType = 'image/png'
  if (ext === '.webp') contentType = 'image/webp'
  if (ext === '.mp4') contentType = 'video/mp4'
  if (ext === '.webm') contentType = 'video/webm'

  // Upload file
  const metadata = {
    contentType,
    cacheControl: 'public, max-age=31536000', // Cache for 1 year
  }

  await uploadBytes(storageRef, fileBuffer, metadata)

  // Get download URL
  const url = await getDownloadURL(storageRef)

  console.log('✅ Uploaded to:', storagePath)
  console.log('🔗 Public URL:', url)

  return {
    url,
    storagePath,
    fileSize: fileBuffer.length,
  }
}

/**
 * Create Firestore document
 */
async function createFirestoreDocument(content: ContentMetadata) {
  console.log('📝 Creating Firestore document...')

  // Use collection path: content/{type}s/{contentId}
  // First create a parent doc in 'content' collection, then use subcollection
  const collectionPath = `content-${content.type}s` // Simplified: content-photos or content-videos
  const docRef = doc(db, collectionPath, content.id)

  const docData = {
    ...content,
    createdAt: serverTimestamp(),
  }

  await setDoc(docRef, docData)

  console.log('✅ Firestore document created:', `${collectionPath}/${content.id}`)
}

/**
 * Main upload function
 */
async function uploadContent(filePath: string) {
  console.log('🚀 Starting upload process...')
  console.log('📁 File:', filePath)
  console.log('━'.repeat(60))

  try {
    // Parse filename to get metadata
    const { type, season, holiday, contentId } = parseFilename(filePath)

    console.log('📊 Detected metadata:')
    console.log('  Type:', type)
    console.log('  Season:', season)
    console.log('  Holiday:', holiday || 'none')
    console.log('  Content ID:', contentId)
    console.log()

    // Upload to Storage
    const { url, storagePath, fileSize } = await uploadToStorage(filePath, season, type, contentId)

    // Get file metadata
    const ext = path.extname(filePath).substring(1)
    const fileBuffer = await fs.readFile(filePath)
    const fileMetadata = getImageMetadata(fileBuffer, ext)

    // Create content metadata object
    const contentMetadata: ContentMetadata = {
      id: contentId,
      type,
      url,
      storagePath,
      season,
      holiday,
      status: 'active',
      prompt: `Generated content for ${season}${holiday ? ` - ${holiday}` : ''}`,
      generatedBy: 'manual',
      metadata: {
        ...fileMetadata,
        fileSize,
      },
      tags: [season, ...(holiday ? [holiday] : []), 'coffee', 'edinburgh'],
      ...(type === 'photo' ? { usageContext: 'hero' } : {}),
    }

    // Create Firestore document
    await createFirestoreDocument(contentMetadata)

    console.log()
    console.log('━'.repeat(60))
    console.log('✨ Upload completed successfully!')
    console.log('━'.repeat(60))
    console.log()
    console.log('📊 Summary:')
    console.log('  Content ID:', contentId)
    console.log('  Type:', type)
    console.log('  Season:', season)
    console.log('  Status:', 'active')
    console.log('  File Size:', (fileSize / 1024).toFixed(2), 'KB')
    console.log('  Storage Path:', storagePath)
    console.log('  Public URL:', url.substring(0, 80) + '...')
    console.log()
    console.log('🎯 Next steps:')
    console.log('   1. View in Firebase Console: https://console.firebase.google.com/')
    console.log('   2. Test content rotation on website')
    console.log('   3. Deploy rules: firebase deploy --only firestore:rules,storage')
    console.log()

    return contentMetadata
  } catch (error: any) {
    console.error('━'.repeat(60))
    console.error('❌ Upload failed!')
    console.error('━'.repeat(60))
    console.error('\nError:', error.message)

    if (error.message?.includes('permission-denied') || error.message?.includes('unauthorized')) {
      console.error('\n💡 Solution:')
      console.error('   Deploy Firebase rules first:')
      console.error('   firebase deploy --only firestore:rules,storage')
    }

    if (error.message?.includes('not found') || error.message?.includes('ENOENT')) {
      console.error('\n💡 Solution:')
      console.error('   Make sure the file exists at:', filePath)
    }

    console.error()
    throw error
  }
}

/**
 * Upload all files in a directory
 */
async function uploadDirectory(dirPath: string) {
  console.log('📁 Scanning directory:', dirPath)
  console.log()

  const files = await fs.readdir(dirPath)
  const contentFiles = files.filter(f =>
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') ||
    f.endsWith('.webp') || f.endsWith('.mp4') || f.endsWith('.webm')
  )

  console.log(`Found ${contentFiles.length} content files`)
  console.log()

  for (const file of contentFiles) {
    const filePath = path.join(dirPath, file)
    await uploadContent(filePath)
    console.log()
  }

  console.log('✅ All files uploaded successfully!')
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)

  // Get file path from command line or use default
  const fileArg = args.find(arg => arg.startsWith('--file='))?.split('=')[1]
  const dirArg = args.find(arg => arg.startsWith('--dir='))?.split('=')[1]

  if (dirArg) {
    // Upload entire directory
    await uploadDirectory(dirArg)
  } else if (fileArg) {
    // Upload single file
    await uploadContent(fileArg)
  } else {
    // Default: upload test content directory
    const testDir = './test-generated-content'
    try {
      await fs.access(testDir)
      await uploadDirectory(testDir)
    } catch {
      console.error('❌ No file specified and test-generated-content directory not found')
      console.error('\nUsage:')
      console.error('  tsx scripts/upload-content-to-firebase.ts --file=path/to/file.jpg')
      console.error('  tsx scripts/upload-content-to-firebase.ts --dir=path/to/directory')
      process.exit(1)
    }
  }
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
