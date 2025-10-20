# Firebase Coffee Integration Skill - Quick Start

## 🎯 What is this?

The **firebase-coffee-integration** skill helps you integrate Firebase into React/Vite coffee e-commerce applications. It provides authentication, database (Firestore), storage, and real-time inventory management.

## 📍 Skill Location

`.claude/skills/firebase-coffee-integration/`

## 🚀 How to Use This Skill

### Option 1: Manual Setup (Recommended for Learning)

Follow the setup guide in your coffee website:
```
coffee-website-react/FIREBASE_SETUP.md
```

### Option 2: Use the Firebase Skill Directly

When working with Claude Code, you can reference this skill:

```
"Use the firebase-coffee-integration skill to add user authentication to my coffee website"
```

## 📦 What's Already Set Up

Your `coffee-website-react` project now has:

✅ Firebase SDK installed
✅ Firebase configuration file (`src/config/firebase.ts`)
✅ Authentication context (`src/contexts/AuthContext.tsx`)
✅ Firestore hooks (`src/hooks/useFirestore.ts`)
✅ Environment variables template (`.env.local`)
✅ Setup documentation (`FIREBASE_SETUP.md`)

## 🔧 Next Steps

### 1. Get Firebase Credentials

1. Go to https://console.firebase.google.com
2. Create/select your project
3. Go to Project Settings > Your apps > Web app
4. Copy the Firebase config
5. Update `coffee-website-react/.env.local`

### 2. Enable Firebase Services

In Firebase Console:
- Enable **Firestore Database**
- Enable **Authentication** (Email/Password, Google)
- (Optional) Enable **Storage**

### 3. Start Using Firebase

```typescript
// Authentication
import { useAuth } from './contexts/AuthContext'

const { currentUser, login, logout, loginWithGoogle } = useAuth()

// Fetch products from Firestore
import { useProducts } from './hooks/useFirestore'

const { data: products, loading } = useProducts(true, true)
```

## 📚 Skill Components

The Firebase skill includes:

### Assets
- `firebase_config.ts` - Firebase initialization ✅ Copied
- `auth_context.tsx` - Authentication provider ✅ Copied
- `firestore_hooks.ts` - Database hooks ✅ Copied

### Scripts
- `init_firebase_project.sh` - Automated setup script

### References
- `firebase_setup_guide.md` - Complete setup instructions
- `firestore_schema.md` - Database schema
- `security_rules.md` - Firestore security rules
- `api_reference.md` - API documentation

## 🎓 Common Use Cases

### Add Authentication to Your Website

```typescript
import { useAuth } from './contexts/AuthContext'

function LoginButton() {
  const { login, loginWithGoogle } = useAuth()

  return (
    <button onClick={() => loginWithGoogle()}>
      Sign in with Google
    </button>
  )
}
```

### Fetch Products from Database

```typescript
import { useProducts } from './hooks/useFirestore'

function ProductList() {
  const { data: products, loading } = useProducts(true, true)

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

### Create an Order

```typescript
import { orderOperations } from './hooks/useFirestore'

await orderOperations.createOrder(userId, {
  items: cartItems,
  total: 99.99,
  shippingAddress: {...}
})
```

### Update Product Stock

```typescript
import { productOperations } from './hooks/useFirestore'

// Decrease stock by 5
await productOperations.updateStock(productId, -5)
```

## 🔐 Security

The skill includes production-ready security rules for:
- ✅ User authentication
- ✅ Role-based access control (customer/admin)
- ✅ Protected routes
- ✅ Firestore security rules

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## 📖 Documentation

Full documentation available at:

1. **Coffee Website Setup**: `coffee-website-react/FIREBASE_SETUP.md`
2. **Integration Summary**: `coffee-website-react/FIREBASE_INTEGRATION_SUMMARY.md`
3. **Skill Documentation**: `.claude/skills/firebase-coffee-integration/SKILL.md`
4. **Reference Docs**: `.claude/skills/firebase-coffee-integration/references/`

## 🎯 Firestore Collections

The skill sets up these collections:

- **products** - Coffee products with inventory
- **users** - User profiles and roles
- **orders** - Customer orders
- **cart** - Shopping carts
- **newsletter** - Email subscribers
- **inventory_logs** - Stock change history

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Vercel/Netlify
Add environment variables from `.env.local` to your hosting platform.

## ⚡ Quick Commands

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy to Firebase Hosting
firebase deploy
```

## 📞 Getting Help

If you need assistance:

1. Check `FIREBASE_SETUP.md` for step-by-step instructions
2. Review Firebase Console for service configuration
3. Check Firebase documentation: https://firebase.google.com/docs
4. Ask Claude Code: "Help me debug Firebase authentication"

## ✅ Integration Status

Your coffee website (`coffee-website-react/`) is ready for Firebase integration!

**Completed:**
- ✅ Firebase SDK installed
- ✅ Configuration files created
- ✅ Authentication context set up
- ✅ Firestore hooks ready
- ✅ Documentation added

**Next Steps:**
- ⏳ Configure Firebase credentials in `.env.local`
- ⏳ Enable Firebase services in Console
- ⏳ Deploy security rules
- ⏳ Test authentication and database

---

**Happy building! ☕🔥**

For advanced features and customization, see `.claude/skills/firebase-coffee-integration/SKILL.md`
