# Firebase CLI Automation Guide

## Overview

This guide documents CLI-first approaches to Firebase configuration, based on lessons learned from the coffee-65c46 integration.

## Automated Setup Script

### Complete Setup in One Command

Create `scripts/auto-configure-firebase.sh`:

```bash
#!/bin/bash
# Auto-configure Firebase for React/Vite projects
# Usage: ./scripts/auto-configure-firebase.sh <PROJECT_ID> [APP_NAME]

set -e

PROJECT_ID=$1
APP_NAME=${2:-"Coffee Website"}

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: PROJECT_ID required"
  echo "Usage: $0 <PROJECT_ID> [APP_NAME]"
  echo ""
  echo "Available projects:"
  firebase projects:list
  exit 1
fi

echo "🔥 Auto-Configuring Firebase..."
echo "Project: $PROJECT_ID"
echo "App Name: $APP_NAME"
echo ""

# Step 1: Check if app already exists
echo "📱 Step 1: Checking for existing web apps..."
EXISTING_APPS=$(firebase apps:list --project $PROJECT_ID 2>&1)

if echo "$EXISTING_APPS" | grep -q "No apps found"; then
  echo "   Creating new web app..."
  APP_OUTPUT=$(firebase apps:create WEB "$APP_NAME" --project $PROJECT_ID 2>&1)
  APP_ID=$(echo "$APP_OUTPUT" | grep "App ID:" | awk '{print $4}')
  echo "   ✅ App created: $APP_ID"
else
  echo "   ⚠️  Existing apps found. Using first available app."
  APP_ID=$(echo "$EXISTING_APPS" | grep -oE '1:[0-9]+:web:[a-z0-9]+' | head -1)
  echo "   App ID: $APP_ID"
fi

# Step 2: Get SDK configuration
echo ""
echo "⚙️  Step 2: Fetching SDK configuration..."
firebase apps:sdkconfig WEB $APP_ID --project $PROJECT_ID > .firebase-config.json

# Step 3: Write to .env.local
echo ""
echo "📝 Step 3: Writing to .env.local..."
cat > .env.local << EOF
# Firebase Configuration - Auto-generated
# Project: $PROJECT_ID
# App: $APP_NAME
# Generated: $(date)

VITE_FIREBASE_API_KEY=$(jq -r '.apiKey' .firebase-config.json)
VITE_FIREBASE_AUTH_DOMAIN=$(jq -r '.authDomain' .firebase-config.json)
VITE_FIREBASE_PROJECT_ID=$(jq -r '.projectId' .firebase-config.json)
VITE_FIREBASE_STORAGE_BUCKET=$(jq -r '.storageBucket' .firebase-config.json)
VITE_FIREBASE_MESSAGING_SENDER_ID=$(jq -r '.messagingSenderId' .firebase-config.json)
VITE_FIREBASE_APP_ID=$(jq -r '.appId' .firebase-config.json)
VITE_FIREBASE_MEASUREMENT_ID=$(jq -r '.measurementId' .firebase-config.json)
EOF

rm .firebase-config.json
echo "   ✅ Environment variables configured"

# Step 4: Create .firebaserc
echo ""
echo "🔧 Step 4: Creating .firebaserc..."
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF
echo "   ✅ Firebase project configured"

# Step 5: Deploy Firestore rules
echo ""
echo "🔐 Step 5: Deploying Firestore security rules..."
if [ -f "firestore.rules" ]; then
  firebase deploy --only firestore:rules --project $PROJECT_ID
  echo "   ✅ Security rules deployed"
else
  echo "   ⚠️  firestore.rules not found, skipping..."
fi

# Summary
echo ""
echo "=" "=" "=" "=" "=" "=" "=" "=" "=" "="
echo "✅ Firebase Configuration Complete!"
echo ""
echo "Project: $PROJECT_ID"
echo "App ID: $APP_ID"
echo "Config: .env.local"
echo ""
echo "Next steps:"
echo "1. Enable Authentication: https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
echo "2. Enable Firestore: https://console.firebase.google.com/project/$PROJECT_ID/firestore"
echo "3. Run: npm run dev"
echo ""
```

### Make script executable:

```bash
chmod +x scripts/auto-configure-firebase.sh
```

### Usage:

```bash
# Auto-configure with default app name
./scripts/auto-configure-firebase.sh coffee-65c46

# Auto-configure with custom app name
./scripts/auto-configure-firebase.sh coffee-65c46 "My Coffee Shop"
```

## CLI Commands Reference

### Project Commands

```bash
# List all projects
firebase projects:list

# Get project info
firebase projects:info --project PROJECT_ID
```

### App Commands

```bash
# List apps in project
firebase apps:list --project PROJECT_ID

# Create web app
firebase apps:create WEB "App Name" --project PROJECT_ID

# Get SDK config (JSON)
firebase apps:sdkconfig WEB APP_ID --project PROJECT_ID

# Get SDK config (copy-paste format)
firebase apps:sdkconfig WEB APP_ID --project PROJECT_ID --out .firebase-config.json
```

### Deployment Commands

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules --project PROJECT_ID

# Deploy all
firebase deploy --project PROJECT_ID

# Deploy hosting
firebase deploy --only hosting --project PROJECT_ID
```

### Extraction Script for Credentials

If you need to extract credentials from CLI output to .env.local:

```bash
#!/bin/bash
# extract-firebase-config.sh

APP_ID=$1
PROJECT_ID=$2

firebase apps:sdkconfig WEB $APP_ID --project $PROJECT_ID | \
  jq -r '. | to_entries | .[] | "VITE_FIREBASE_\(.key | ascii_upcase)=\(.value)"' | \
  sed 's/VITE_FIREBASE_APIKEY/VITE_FIREBASE_API_KEY/' | \
  sed 's/VITE_FIREBASE_AUTHDOMAIN/VITE_FIREBASE_AUTH_DOMAIN/' | \
  sed 's/VITE_FIREBASE_PROJECTID/VITE_FIREBASE_PROJECT_ID/' | \
  sed 's/VITE_FIREBASE_STORAGEBUCKET/VITE_FIREBASE_STORAGE_BUCKET/' | \
  sed 's/VITE_FIREBASE_MESSAGINGSENDERID/VITE_FIREBASE_MESSAGING_SENDER_ID/' | \
  sed 's/VITE_FIREBASE_APPID/VITE_FIREBASE_APP_ID/' | \
  sed 's/VITE_FIREBASE_MEASUREMENTID/VITE_FIREBASE_MEASUREMENT_ID/' \
  > .env.local
```

## TypeScript Configuration Fix

### Issue: verbatimModuleSyntax Errors

When using TypeScript with `verbatimModuleSyntax: true`, type imports must be explicit.

**Wrong:**
```typescript
import { User, ReactNode } from 'react'
import { DocumentData, QueryConstraint } from 'firebase/firestore'
```

**Correct:**
```typescript
import type { User } from 'firebase/auth'
import type { ReactNode } from 'react'
import type { DocumentData, QueryConstraint } from 'firebase/firestore'
```

### Updated firebase.ts Template

```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Validate configuration
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig])

if (missingKeys.length > 0) {
  const errorMsg = `Missing Firebase config: ${missingKeys.join(', ')}`
  if (import.meta.env.DEV) {
    throw new Error(`${errorMsg}\nCheck your .env.local file`)
  }
  console.error(errorMsg)
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = typeof window !== 'undefined' && import.meta.env.PROD
  ? getAnalytics(app)
  : null

if (import.meta.env.DEV) {
  console.log('Firebase initialized with project:', firebaseConfig.projectId)
}
```

## Testing Script

### Inventory Test Script

Create `scripts/test-inventory.ts` to verify stock tracking works:

```typescript
import { productOperations } from '../src/hooks/useFirestore'

async function testInventory() {
  const productId = 'your-test-product-id'

  // Test decrease
  const newStock1 = await productOperations.updateStock(productId, -5)
  console.log('Stock after sale:', newStock1)

  // Test increase
  const newStock2 = await productOperations.updateStock(productId, 10)
  console.log('Stock after restock:', newStock2)

  // Test overselling prevention
  try {
    await productOperations.updateStock(productId, -999)
    console.error('ERROR: Should have thrown!')
  } catch (err: any) {
    console.log('Correctly prevented overselling:', err.message)
  }
}

testInventory()
```

Add to `package.json`:
```json
{
  "scripts": {
    "test:inventory": "tsx scripts/test-inventory.ts"
  },
  "devDependencies": {
    "tsx": "^4.20.6"
  }
}
```

## Best Practices

1. **Always use CLI for initial setup** - Reduces manual errors
2. **Deploy rules immediately** - Avoid permission errors during development
3. **Test builds after integration** - Catch TypeScript errors early
4. **Use type imports** - Required for verbatimModuleSyntax
5. **Automate testing** - Verify critical functionality like inventory

## Lessons Learned

- CLI automation is 10x faster than manual setup
- Type imports are critical for TypeScript strict mode
- Deploy security rules before enabling services
- Test inventory logic before going live
- Document everything for future reference

---

**Last Updated**: 2025-10-19
**Based on Project**: coffee-65c46
