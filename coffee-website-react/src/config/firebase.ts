// src/config/firebase.ts
// Firebase configuration and initialization

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Validate configuration - fail fast if critical env vars are missing
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig])

if (missingKeys.length > 0) {
  const envVarNames = missingKeys.map(key => {
    const envVarMap: Record<string, string> = {
      apiKey: 'VITE_FIREBASE_API_KEY',
      authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
      projectId: 'VITE_FIREBASE_PROJECT_ID',
      storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
      messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
      appId: 'VITE_FIREBASE_APP_ID',
    }
    return envVarMap[key] || key
  })

  throw new Error(
    `Missing required Firebase environment variables: ${envVarNames.join(', ')}. ` +
    'Please check your .env.local file and ensure all Firebase configuration values are set.'
  )
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize analytics (only in production)
export const analytics = typeof window !== 'undefined' && import.meta.env.PROD
  ? getAnalytics(app)
  : null
