# Firebase Schema for AI Content Manager

Complete Firestore and Firebase Storage structure for managing AI-generated seasonal content.

## Firestore Collections

### `/content/videos`

Stores metadata for all generated video content.

**Document Structure:**

```typescript
interface VideoContent {
  id: string // Auto-generated document ID
  url: string // Firebase Storage download URL
  storagePath: string // Full path in Storage: /content/videos/{season}/{id}.mp4
  season: 'winter' | 'spring' | 'summer' | 'autumn'
  holiday: string | null // 'christmas' | 'easter' | 'halloween' | etc. or null
  createdAt: Timestamp
  status: 'active' | 'archived' | 'pending' | 'error'
  prompt: string // The AI prompt used to generate this content
  generatedBy: string // 'github-actions' | 'manual' | 'admin-studio'
  metadata: {
    width: number // e.g., 1920
    height: number // e.g., 1080
    aspectRatio: string // e.g., '16:9'
    duration: number // in seconds, e.g., 6
    fileSize: number // in bytes
    format: string // e.g., 'mp4'
  }
  tags: string[] // ['cozy', 'steam', 'cappuccino', 'window-frost']
}
```

**Example Document:**

```json
{
  "id": "winter-video-20250125-abc123",
  "url": "https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/content%2Fvideos%2Fwinter%2Fwinter-video-20250125-abc123.mp4?alt=media&token=xyz",
  "storagePath": "/content/videos/winter/winter-video-20250125-abc123.mp4",
  "season": "winter",
  "holiday": "christmas",
  "createdAt": "2025-01-25T10:30:00Z",
  "status": "active",
  "prompt": "Cinematic slow-motion video of steam rising from cappuccino...",
  "generatedBy": "github-actions",
  "metadata": {
    "width": 1920,
    "height": 1080,
    "aspectRatio": "16:9",
    "duration": 6,
    "fileSize": 5242880,
    "format": "mp4"
  },
  "tags": ["cozy", "steam", "cappuccino", "christmas", "winter"]
}
```

### `/content/photos`

Stores metadata for all generated photo content.

**Document Structure:**

```typescript
interface PhotoContent {
  id: string
  url: string
  storagePath: string // /content/photos/{season}/{id}.jpg
  season: 'winter' | 'spring' | 'summer' | 'autumn'
  holiday: string | null
  createdAt: Timestamp
  status: 'active' | 'archived' | 'pending' | 'error'
  prompt: string
  generatedBy: string
  metadata: {
    width: number
    height: number
    aspectRatio: string
    fileSize: number
    format: string // 'jpg' | 'webp' | 'png'
  }
  tags: string[]
  usageContext: string // 'hero' | 'about' | 'blog' | 'testimonials'
}
```

**Example Document:**

```json
{
  "id": "spring-photo-20250401-def456",
  "url": "https://firebasestorage.googleapis.com/.../spring-photo-20250401-def456.jpg",
  "storagePath": "/content/photos/spring/spring-photo-20250401-def456.jpg",
  "season": "spring",
  "holiday": null,
  "createdAt": "2025-04-01T08:00:00Z",
  "status": "active",
  "prompt": "Bright, airy photo of flat white beside fresh tulips...",
  "generatedBy": "manual",
  "metadata": {
    "width": 1920,
    "height": 1080,
    "aspectRatio": "16:9",
    "fileSize": 1048576,
    "format": "jpg"
  },
  "tags": ["spring", "tulips", "bright", "natural-light"],
  "usageContext": "hero"
}
```

### `/content-rotation-config/hero`

Configuration for hero section content rotation.

**Document Structure:**

```typescript
interface RotationConfig {
  currentContentId: string // ID of currently displayed content
  currentContentType: 'video' | 'photo'
  rotationInterval: number // milliseconds, default 30000
  activeContentPool: ContentPoolItem[] // Array of active content IDs in rotation
  lastRotated: Timestamp
  currentSeason: 'winter' | 'spring' | 'summer' | 'autumn'
  currentHoliday: string | null
  autoRotate: boolean // Enable/disable automatic rotation
  rotationStrategy: 'sequential' | 'random' | 'weighted'
}

interface ContentPoolItem {
  id: string
  type: 'video' | 'photo'
  weight: number // For weighted rotation (1-10, higher = more frequent)
  addedAt: Timestamp
}
```

**Example Document:**

```json
{
  "currentContentId": "winter-video-20250125-abc123",
  "currentContentType": "video",
  "rotationInterval": 30000,
  "activeContentPool": [
    {
      "id": "winter-video-20250125-abc123",
      "type": "video",
      "weight": 5,
      "addedAt": "2025-01-25T10:30:00Z"
    },
    {
      "id": "winter-photo-20250125-ghi789",
      "type": "photo",
      "weight": 3,
      "addedAt": "2025-01-25T10:32:00Z"
    }
  ],
  "lastRotated": "2025-01-25T14:15:30Z",
  "currentSeason": "winter",
  "currentHoliday": "christmas",
  "autoRotate": true,
  "rotationStrategy": "sequential"
}
```

### `/content-rotation-config/about` (Future)

Similar structure for About section content rotation.

### `/content-rotation-config/blog` (Future)

Similar structure for Blog section content rotation.

---

## Firebase Storage Structure

```
/content
  /videos
    /winter
      winter-video-20250125-abc123.mp4
      winter-video-20250201-xyz789.mp4
    /spring
      spring-video-20250325-def456.mp4
    /summer
      summer-video-20250615-ghi789.mp4
    /autumn
      autumn-video-20250925-jkl012.mp4
  /photos
    /winter
      winter-photo-20250125-abc123.jpg
      winter-photo-20250125-def456.jpg
    /spring
      spring-photo-20250401-ghi789.jpg
    /summer
      summer-photo-20250701-jkl012.jpg
    /autumn
      autumn-photo-20251001-mno345.jpg
  /temp
    # Temporary uploads before processing
  /archived
    # Moved here when status changes to 'archived'
```

---

## Firestore Security Rules

**File:** `firestore.rules`

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Content collections - public read, admin write
    match /content/{contentType}/{contentId} {
      // Anyone can read active content
      allow read: if resource.data.status == 'active';

      // Only authenticated admins can write
      allow write: if request.auth != null &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Rotation config - public read for active settings, admin write
    match /content-rotation-config/{section} {
      // Anyone can read to fetch rotation settings
      allow read: if true;

      // Only admins can update rotation config
      allow write: if request.auth != null &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Analytics (future) - public can increment, admin can read all
    match /content-analytics/{analyticsId} {
      allow read: if request.auth != null &&
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';

      // Allow incrementing view counts
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['views', 'lastViewed']);
    }
  }
}
```

---

## Firebase Storage Security Rules

**File:** `storage.rules`

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    // Content files - public read, admin write
    match /content/{contentType}/{season}/{fileName} {
      // Anyone can read (for displaying on website)
      allow read: if true;

      // Only authenticated admins can upload/modify
      allow write: if request.auth != null &&
                     request.auth.token.role == 'admin';
    }

    // Temp uploads - admin only
    match /content/temp/{fileName} {
      allow read, write: if request.auth != null &&
                           request.auth.token.role == 'admin';
    }

    // Archived content - admin read only
    match /content/archived/{allPaths=**} {
      allow read: if request.auth != null &&
                    request.auth.token.role == 'admin';
      allow write: if false;
    }
  }
}
```

---

## Firestore Indexes

Required composite indexes for efficient queries.

**File:** `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "videos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "season", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "videos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "holiday", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "photos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "season", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "photos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "usageContext", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

---

## TypeScript Types

**File:** `src/types/content.ts`

```typescript
export type Season = 'winter' | 'spring' | 'summer' | 'autumn'
export type Holiday = 'christmas' | 'new-year' | 'valentines' | 'easter' |
                     'mothers-day' | 'fathers-day' | 'halloween' |
                     'edinburgh-festival' | null

export type ContentStatus = 'active' | 'archived' | 'pending' | 'error'
export type ContentType = 'video' | 'photo'
export type GeneratedBy = 'github-actions' | 'manual' | 'admin-studio'
export type RotationStrategy = 'sequential' | 'random' | 'weighted'
export type UsageContext = 'hero' | 'about' | 'blog' | 'testimonials'

export interface ContentMetadata {
  width: number
  height: number
  aspectRatio: string
  fileSize: number
  format: string
  duration?: number // Only for videos
}

export interface BaseContent {
  id: string
  url: string
  storagePath: string
  season: Season
  holiday: Holiday
  createdAt: Date
  status: ContentStatus
  prompt: string
  generatedBy: GeneratedBy
  metadata: ContentMetadata
  tags: string[]
}

export interface VideoContent extends BaseContent {
  type: 'video'
}

export interface PhotoContent extends BaseContent {
  type: 'photo'
  usageContext: UsageContext
}

export type Content = VideoContent | PhotoContent

export interface ContentPoolItem {
  id: string
  type: ContentType
  weight: number
  addedAt: Date
}

export interface RotationConfig {
  currentContentId: string
  currentContentType: ContentType
  rotationInterval: number
  activeContentPool: ContentPoolItem[]
  lastRotated: Date
  currentSeason: Season
  currentHoliday: Holiday
  autoRotate: boolean
  rotationStrategy: RotationStrategy
}
```

---

## Common Firestore Queries

### Fetch Active Videos for Current Season

```typescript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'

async function getActiveVideos(season: Season, maxResults = 10) {
  const videosRef = collection(db, 'content/videos')
  const q = query(
    videosRef,
    where('season', '==', season),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
```

### Fetch Active Content for Holiday

```typescript
async function getHolidayContent(holiday: Holiday, type: ContentType = 'video') {
  const contentRef = collection(db, `content/${type}s`)
  const q = query(
    contentRef,
    where('holiday', '==', holiday),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
```

### Get Current Rotation Config

```typescript
import { doc, getDoc } from 'firebase/firestore'

async function getRotationConfig(section: string = 'hero') {
  const configRef = doc(db, 'content-rotation-config', section)
  const configSnap = await getDoc(configRef)

  if (configSnap.exists()) {
    return configSnap.data() as RotationConfig
  }

  return null
}
```

### Update Rotation Config

```typescript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'

async function rotateContent(section: string, nextContentId: string, nextContentType: ContentType) {
  const configRef = doc(db, 'content-rotation-config', section)

  await updateDoc(configRef, {
    currentContentId: nextContentId,
    currentContentType: nextContentType,
    lastRotated: serverTimestamp()
  })
}
```

### Add New Content to Firestore

```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

async function addVideoContent(videoData: Omit<VideoContent, 'id' | 'createdAt'>) {
  const videosRef = collection(db, 'content/videos')

  const docRef = await addDoc(videosRef, {
    ...videoData,
    createdAt: serverTimestamp()
  })

  return docRef.id
}
```

---

## Firebase Admin SDK (for automation scripts)

Used by GitHub Actions and server-side content generation.

### Initialize Admin SDK

```typescript
import admin from 'firebase-admin'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'your-project.appspot.com'
})

const db = admin.firestore()
const storage = admin.storage()
```

### Upload Video to Storage

```typescript
async function uploadVideo(
  localFilePath: string,
  season: Season,
  contentId: string
): Promise<string> {
  const bucket = storage.bucket()
  const destination = `content/videos/${season}/${contentId}.mp4`

  await bucket.upload(localFilePath, {
    destination,
    metadata: {
      contentType: 'video/mp4',
      cacheControl: 'public, max-age=31536000'
    }
  })

  // Make file publicly readable
  const file = bucket.file(destination)
  await file.makePublic()

  // Get public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`

  return publicUrl
}
```

### Create Firestore Document (Admin SDK)

```typescript
async function createContentDocument(contentData: Omit<VideoContent, 'id'>) {
  const docRef = await db.collection('content/videos').add({
    ...contentData,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })

  console.log(`Created document with ID: ${docRef.id}`)
  return docRef.id
}
```

---

## Deployment Commands

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy all
firebase deploy --only firestore,storage
```

---

## Migration Guide

If you already have content in different structure, use this migration script:

**File:** `scripts/migrate_content.js`

```javascript
const admin = require('firebase-admin')

// Initialize Firebase Admin
// ... (initialization code)

async function migrateContent() {
  const oldContentRef = db.collection('old-content')
  const snapshot = await oldContentRef.get()

  for (const doc of snapshot.docs) {
    const oldData = doc.data()

    // Transform to new structure
    const newData = {
      url: oldData.imageUrl,
      storagePath: `/content/photos/winter/${doc.id}.jpg`,
      season: 'winter',
      holiday: null,
      status: 'active',
      prompt: oldData.description || '',
      generatedBy: 'manual',
      metadata: {
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
        fileSize: 0,
        format: 'jpg'
      },
      tags: [],
      usageContext: 'hero',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }

    // Add to new collection
    await db.collection('content/photos').doc(doc.id).set(newData)
    console.log(`Migrated: ${doc.id}`)
  }
}

migrateContent().then(() => console.log('Migration complete!'))
```

---

## Monitoring & Maintenance

### Check Storage Usage

```bash
# Via Firebase Console
# Go to Storage > Usage

# Via CLI (requires billing enabled)
firebase storage:usage
```

### Clean Up Old Content

Create a Cloud Function to archive content older than 6 months:

```typescript
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

export const archiveOldContent = functions.pubsub
  .schedule('0 0 1 * *') // First day of every month
  .onRun(async (context) => {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const videosRef = admin.firestore().collection('content/videos')
    const oldVideos = await videosRef
      .where('createdAt', '<', sixMonthsAgo)
      .where('status', '==', 'active')
      .get()

    const batch = admin.firestore().batch()

    oldVideos.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'archived' })
    })

    await batch.commit()
    console.log(`Archived ${oldVideos.size} old videos`)
  })
```

---

Update this schema as you evolve the content management system. Document any changes in `LESSONS_LEARNED.md`.
