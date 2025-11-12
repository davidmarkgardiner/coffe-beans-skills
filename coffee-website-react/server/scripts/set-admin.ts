#!/usr/bin/env tsx
/**
 * Set admin role for a user using Firebase Admin SDK
 * Usage: tsx server/scripts/set-admin.ts <userId>
 */

import 'dotenv/config'
import admin from 'firebase-admin'

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
}

const db = admin.firestore()

async function setAdminRole(userId: string) {
  try {
    console.log(`Setting admin role for user: ${userId}`)

    await db.collection('users').doc(userId).update({
      role: 'admin',
    })

    console.log('✅ Successfully set user role to admin!')
    console.log(`   User ${userId} can now access /admin dashboard`)
    process.exit(0)
  } catch (error: any) {
    if (error.code === 'not-found') {
      console.error(`❌ User document not found: ${userId}`)
      console.error('   Make sure this user has logged in at least once')
    } else {
      console.error('❌ Error setting admin role:', error.message)
    }
    process.exit(1)
  }
}

// Get userId from command line argument
const userId = process.argv[2]

if (!userId) {
  console.error('Usage: tsx server/scripts/set-admin.ts <userId>')
  console.error('Example: tsx server/scripts/set-admin.ts XgxMrN2fn9PJw6URU7yNPY8BXWk1')
  process.exit(1)
}

setAdminRole(userId)
