#!/usr/bin/env tsx
/**
 * Set admin role for a user in Firestore
 * Usage: tsx scripts/set-admin-role.ts <userId>
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config()

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

async function setAdminRole(userId: string) {
  try {
    console.log(`Setting admin role for user: ${userId}`)

    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      role: 'admin',
    })

    console.log('✅ Successfully set user role to admin')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error setting admin role:', error)
    process.exit(1)
  }
}

// Get userId from command line argument
const userId = process.argv[2]

if (!userId) {
  console.error('Usage: tsx scripts/set-admin-role.ts <userId>')
  console.error('Example: tsx scripts/set-admin-role.ts XgxMrN2fn9PJw6URU7yNPY8BXWk1')
  process.exit(1)
}

setAdminRole(userId)
