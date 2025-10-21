# Firebase Setup Guide for Coffee Website

This guide will help you integrate Firebase into your premium coffee website for authentication, database, and storage.

## 📋 Prerequisites

- Node.js installed
- Firebase account (create one at https://console.firebase.google.com)
- Firebase CLI installed globally: `npm install -g firebase-tools`

## 🚀 Quick Start

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "coffee-website-prod")
4. Choose whether to enable Google Analytics
5. Click "Create project"

### Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (`</>`)
2. Register app with nickname (e.g., "Coffee Website")
3. **Copy the Firebase configuration** - you'll need this for `.env.local`
4. Click "Continue to console"

### Step 3: Enable Firebase Services

#### Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **production mode** (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Click "Enable"

#### Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
   - Toggle "Enable"
   - Click "Save"
5. (Optional) Enable **Google** sign-in
   - Toggle "Enable"
   - Add support email
   - Click "Save"

#### Enable Storage (Optional)

1. In Firebase Console, go to **Storage**
2. Click "Get started"
3. Start in **production mode**
4. Choose a location
5. Click "Done"

### Step 4: Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important:** Never commit `.env.local` to Git! It's already in `.gitignore`.

### Step 5: Initialize Firebase CLI

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
```

When prompted:
- Select **Firestore** and **Hosting** (use spacebar to select)
- Choose "Use an existing project" and select your project
- Accept default for `firestore.rules` and `firestore.indexes.json`
- Set public directory to **dist** (for Vite builds)
- Configure as single-page app: **Yes**
- Don't overwrite `index.html`: **No**

### Step 6: Set Up Firestore Security Rules

Create or edit `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Products collection
    match /products/{productId} {
      allow read: if true; // Public read
      allow write: if isAdmin();
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create: if isSignedIn();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Cart collection
    match /cart/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Newsletter collection
    match /newsletter/{email} {
      allow create: if true; // Anyone can subscribe
      allow read, update, delete: if isAdmin();
    }

    // Inventory logs (read-only for non-admins)
    match /inventory_logs/{logId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

### Step 7: Seed Initial Product Data (Optional)

Create a script to add your coffee products to Firestore. Create `scripts/seed-products.ts`:

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../src/config/firebase'

const products = [
  {
    name: 'Ethiopian Yirgacheffe',
    description: 'Bright citrus notes with floral undertones and a smooth finish.',
    price: 24.99,
    weight: '250g',
    category: 'Single Origin',
    origin: 'Ethiopia',
    roastLevel: 'Light',
    tastingNotes: ['Citrus', 'Floral', 'Berry'],
    stock: 100,
    sold: 0,
    active: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Colombian Supremo',
    description: 'Rich, balanced flavor with notes of caramel and nuts.',
    price: 22.99,
    weight: '250g',
    category: 'Single Origin',
    origin: 'Colombia',
    roastLevel: 'Medium',
    tastingNotes: ['Caramel', 'Nuts', 'Chocolate'],
    stock: 150,
    sold: 0,
    active: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  // Add more products...
]

async function seedProducts() {
  try {
    for (const product of products) {
      const docRef = await addDoc(collection(db, 'products'), product)
      console.log('Product added with ID:', docRef.id)
    }
    console.log('✅ All products seeded successfully!')
  } catch (error) {
    console.error('Error seeding products:', error)
  }
}

seedProducts()
```

Run the script:
```bash
npx tsx scripts/seed-products.ts
```

### Step 8: Test Firebase Connection

Start your development server:
```bash
npm run dev
```

Check the browser console - you should see:
```
Firebase initialized with project: your-project-id
```

If you see errors about missing configuration, verify your `.env.local` values.

## 🎯 Usage Examples

### Authentication

```typescript
import { useAuth } from './contexts/AuthContext'

function LoginForm() {
  const { login, loginWithGoogle, signup } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <button onClick={() => loginWithGoogle()}>
      Sign in with Google
    </button>
  )
}
```

### Fetch Products

```typescript
import { useProducts } from './hooks/useFirestore'

function ProductList() {
  const { data: products, loading, error } = useProducts(true, true) // active only, realtime

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Create Order

```typescript
import { orderOperations } from './hooks/useFirestore'
import { useAuth } from './contexts/AuthContext'

function CheckoutButton({ cartItems, total }) {
  const { currentUser } = useAuth()

  const handleCheckout = async () => {
    if (!currentUser) return

    try {
      await orderOperations.createOrder(currentUser.uid, {
        items: cartItems,
        total,
        shippingAddress: { /* ... */ },
      })
      alert('Order placed successfully!')
    } catch (error) {
      console.error('Checkout failed:', error)
    }
  }

  return <button onClick={handleCheckout}>Place Order</button>
}
```

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - It contains sensitive API keys
2. **Use Firestore Security Rules** - Always validate on the server side
3. **Enable App Check** - Protect your backend from abuse (in Firebase Console)
4. **Set up billing alerts** - Monitor Firebase usage
5. **Use environment variables** - Different configs for dev/staging/prod

## 📊 Firestore Database Schema

### Collections

- **users** - User profiles and preferences
- **products** - Coffee products (name, price, stock, etc.)
- **orders** - Customer orders
- **cart** - Shopping cart items (one doc per user)
- **newsletter** - Email subscribers
- **inventory_logs** - Stock change history

For detailed schema, see `.claude/skills/firebase-coffee-integration/references/firestore_schema.md`

## 🚢 Deployment

### Deploy to Firebase Hosting

```bash
# Build your app
npm run build

# Deploy to Firebase
firebase deploy
```

Your site will be live at: `https://your-project-id.web.app`

### Deploy to Vercel/Netlify

Just add your `.env.local` variables in the hosting platform's environment settings.

## 🐛 Troubleshooting

### Error: Missing Firebase configuration

**Solution:** Verify all values in `.env.local` are filled in and restart dev server.

### Error: Permission denied (Firestore)

**Solution:** Check Firestore security rules. Make sure you're signed in if rules require authentication.

### Error: Firebase not initialized

**Solution:** Ensure `AuthProvider` wraps your App in `main.tsx`

### Environment variables not loading

**Solution:** Restart the dev server after changing `.env.local`

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- Firebase Coffee Integration Skill: `.claude/skills/firebase-coffee-integration/SKILL.md`

## ✅ Setup Checklist

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Firestore enabled
- [ ] Authentication enabled (Email/Password + Google)
- [ ] Storage enabled (optional)
- [ ] `.env.local` configured with Firebase credentials
- [ ] Firebase CLI initialized
- [ ] Security rules deployed
- [ ] Products seeded to Firestore
- [ ] Dev server running successfully
- [ ] Firebase connection verified in console

## 🎉 You're Ready!

Your coffee website is now powered by Firebase! You can:
- Sign up/login users
- Store products in Firestore
- Track orders in real-time
- Manage inventory
- Deploy globally with Firebase Hosting

For advanced features, check out the Firebase Coffee Integration skill documentation.
