---
name: firebase-coffee-integration
description: Integrate Firebase into React/Vite coffee e-commerce applications for inventory management, user authentication, order tracking, and real-time database operations. Use this skill when implementing Firebase Firestore, Firebase Auth, product/order management, shopping cart functionality, or admin dashboards for coffee beans e-commerce sites.
---

# Firebase Coffee E-Commerce Integration

Integrate Firebase into React + Vite coffee e-commerce applications to add real-time inventory management, user authentication, order tracking, and database operations.

## When to Use This Skill

Use this skill when:
- Setting up Firebase in a React/Vite coffee e-commerce project
- Implementing product inventory management with Firestore
- Adding user authentication (email/password, Google OAuth)
- Creating shopping cart functionality
- Building order management systems
- Setting up admin dashboards for product management
- Configuring Firestore security rules
- Integrating real-time stock tracking

## Prerequisites

Before using this skill, ensure:
- A React + Vite project exists
- A Firebase project is created at https://console.firebase.google.com
- Node.js and npm are installed
- Basic understanding of React hooks and context

## Quick Start

### 1. Initialize Firebase in Project

Run the initialization script to set up Firebase dependencies and directory structure:

```bash
bash scripts/init_firebase_project.sh
```

This script will:
- Install `firebase` package
- Create necessary directories (`src/config`, `src/lib/firebase`, `src/hooks`)
- Generate `.env.local` template
- Optionally initialize Firebase CLI

### 2. Configure Environment Variables

Copy Firebase credentials from Firebase Console > Project Settings > Your Apps > SDK setup and configuration.

Update `.env.local` with your project values:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Set Up Firebase Configuration

Copy `assets/firebase_config.ts` to `src/config/firebase.ts`:

```bash
cp assets/firebase_config.ts src/config/firebase.ts
```

This file initializes Firebase services (Auth, Firestore, Storage, Analytics).

### 4. Enable Firebase Services

In Firebase Console:

**Firestore Database:**
1. Go to Firestore Database
2. Click "Create database"
3. Start in test mode (update security rules later)
4. Choose a location

**Authentication:**
1. Go to Authentication > Sign-in method
2. Enable "Email/Password"
3. (Optional) Enable "Google" for OAuth

### 5. Set Up Firestore Schema

Reference `references/firestore_schema.md` for the complete database structure. Key collections:

- `products` - Coffee products with inventory
- `users` - User accounts and profiles
- `orders` - Customer orders
- `cart` - Shopping carts
- `newsletter` - Email subscribers
- `inventory_logs` - Stock change auditing

### 6. Deploy Security Rules

Copy security rules from `references/security_rules.md` to your project:

```bash
# Create firestore.rules file
cat references/security_rules.md | sed -n '/^```javascript$/,/^```$/p' | sed '1d;$d' > firestore.rules

# Deploy rules
npx firebase deploy --only firestore:rules
```

### 7. Add Authentication Context

Copy `assets/auth_context.tsx` to `src/contexts/AuthContext.tsx`:

```bash
mkdir -p src/contexts
cp assets/auth_context.tsx src/contexts/AuthContext.tsx
```

Wrap your app with AuthProvider in `src/main.tsx` or `src/App.tsx`:

```typescript
import { AuthProvider } from './contexts/AuthContext'

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
```

### 8. Add Firestore Hooks

Copy `assets/firestore_hooks.ts` to `src/hooks/useFirestore.ts`:

```bash
mkdir -p src/hooks
cp assets/firestore_hooks.ts src/hooks/useFirestore.ts
```

## Usage Examples

### Fetch Products with Real-Time Updates

```typescript
import { useProducts } from './hooks/useFirestore'

function ProductList() {
  const { data: products, loading, error } = useProducts(true, true) // activeOnly, realtime

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### User Authentication

**Full Login Modal Implementation:**

Create `src/components/LoginModal.tsx` with complete authentication UI including:
- Login form with email/password
- Signup form with display name
- Password reset functionality
- Google OAuth integration
- Animated modal with Framer Motion
- Error handling and loading states

```typescript
import { useAuth } from './contexts/AuthContext'

function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login, signup, loginWithGoogle, resetPassword } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode === 'login') {
        await login(email, password)
      } else if (mode === 'signup') {
        await signup(email, password, displayName)
      } else {
        await resetPassword(email)
      }
      onClose()
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div>
          {/* Modal with forms */}
          <button onClick={loginWithGoogle}>Continue with Google</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Navigation Integration:**

Add authentication to navigation with user menu:

```typescript
import { useAuth } from '../contexts/AuthContext'
import { LoginModal } from './LoginModal'

function Navigation() {
  const { currentUser, logout } = useAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  return (
    <nav>
      {currentUser ? (
        <div className="user-menu">
          <img src={currentUser.photoURL} alt={currentUser.displayName} />
          <button onClick={logout}>Sign Out</button>
        </div>
      ) : (
        <button onClick={() => setLoginModalOpen(true)}>Sign In</button>
      )}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </nav>
  )
}
```

### Update Product Stock

```typescript
import { productOperations } from './hooks/useFirestore'

async function handlePurchase(productId: string, quantity: number) {
  try {
    // Decrease stock (negative quantity)
    const newStock = await productOperations.updateStock(productId, -quantity)
    console.log(`New stock: ${newStock}`)
  } catch (error) {
    console.error('Failed to update stock:', error)
  }
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
      // Clear cart, redirect to success page
    } catch (error) {
      console.error('Order failed:', error)
    }
  }

  return <button onClick={handleCheckout}>Place Order</button>
}
```

### Protected Admin Routes

```typescript
import { ProtectedRoute } from './contexts/AuthContext'

function App() {
  return (
    <Router>
      <Route path="/admin" element={
        <ProtectedRoute adminOnly={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Router>
  )
}
```

## Common Implementation Patterns

### Migrating Existing Products

To migrate hardcoded products to Firestore:

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from './config/firebase'

const existingProducts = [ /* your hardcoded products */ ]

async function migrateProducts() {
  for (const product of existingProducts) {
    await addDoc(collection(db, 'products'), {
      ...product,
      stock: 100, // Add initial stock
      sold: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      featured: false,
      active: true,
    })
  }
  console.log('Migration complete')
}
```

### Real-Time Cart Sync

```typescript
import { useCart } from './hooks/useFirestore'
import { useAuth } from './contexts/AuthContext'

function ShoppingCart() {
  const { currentUser } = useAuth()
  const { data: cart } = useCart(currentUser?.uid || null)

  // Cart updates automatically when Firestore changes
  return (
    <div>
      {cart?.items.map(item => (
        <CartItem key={item.productId} {...item} />
      ))}
    </div>
  )
}
```

## References

For detailed information, refer to:

- **Setup Guide**: `references/firebase_setup_guide.md` - Complete Firebase setup instructions with code examples
- **Database Schema**: `references/firestore_schema.md` - Full Firestore collections and field definitions
- **Security Rules**: `references/security_rules.md` - Production-ready Firestore and Storage rules

## Troubleshooting

### Environment Variables Not Loading

Ensure .env.local uses `VITE_` prefix for Vite projects. Restart dev server after changing environment variables.

### Authentication Errors

Check Firebase Console > Authentication is enabled for your chosen methods (Email/Password, Google, etc.).

### Permission Denied Errors

Verify Firestore security rules are deployed and match your access patterns. Test rules in Firebase Console > Firestore > Rules tab.

### Stock Tracking Not Working

Ensure `inventory_logs` collection exists and `productOperations.updateStock()` is used for all stock changes.

## Next Steps

After Firebase integration:
1. Add Stripe payment processing
2. Implement email notifications (Firebase Functions)
3. Set up Cloud Functions for order processing
4. Add Firebase Storage for product image uploads
5. Create admin dashboard for product management
6. Set up Firebase Analytics for tracking

## Testing

### Verify Inventory Management

Run the inventory test script to verify stock tracking works correctly:

```bash
npm run test:inventory
```

This tests:
- Stock decrease (purchases)
- Stock increase (restocking)
- Overselling prevention
- Inventory logging

See `scripts/test-inventory.ts` for implementation.

## Deployment & Verification

### Complete Deployment Workflow

Follow this workflow for bug-free deployments:

**1. Pre-Deployment Checks**
```bash
# Review comprehensive checklist
cat references/pre-deployment-checklist.md

# Verify configuration
firebase use

# Build project
npm run build

# Verify Firebase config embedded in build
grep -q "$(firebase use | tail -1)" dist/assets/*.js && echo "✓ Config OK" || echo "✗ Config missing!"
```

**2. Deploy to Firebase**
```bash
# Deploy Firestore rules first
firebase deploy --only firestore:rules

# Deploy hosting
firebase deploy --only hosting

# Or deploy everything at once
firebase deploy
```

**3. Post-Deployment Verification**
```bash
# Run comprehensive verification
bash scripts/verify-firebase-deployment.sh

# Check service status
bash scripts/firebase-status.sh

# Verify site is live
curl -I https://$(firebase use | tail -1).web.app
```

### Quick Verification Commands

**Check if all services are enabled:**
```bash
# Authentication
firebase auth:export /tmp/check.json && echo "✓ Auth enabled" || echo "✗ Auth disabled"

# Firestore
firebase firestore:databases:list

# Hosting
firebase hosting:sites:list
```

**Verify deployment is live:**
```bash
PROJECT_ID=$(firebase use | tail -1)
curl -I https://${PROJECT_ID}.web.app | grep "200 OK" && echo "✓ Live" || echo "✗ Not accessible"
```

### Verification Scripts

The skill includes automated verification scripts:

- **`scripts/verify-firebase-deployment.sh`** - Comprehensive post-deployment verification
  - Checks web app exists
  - Verifies Authentication is enabled
  - Confirms Firestore databases are created
  - Validates security rules compile
  - Tests hosting deployment is live
  - Verifies Firebase APIs are enabled
  - Checks build configuration

- **`scripts/firebase-status.sh`** - Service status dashboard
  - Shows Authentication status and user count
  - Lists Firestore databases
  - Displays hosting deployment info
  - Lists enabled Firebase APIs
  - Provides quick links to Firebase Console

### CLI Commands Reference

For a complete reference of all useful Firebase CLI commands, see:
- **`references/cli-commands-reference.md`** - Comprehensive CLI command reference

## Production Checklist

Before deploying to production, follow the comprehensive checklist:

**See: `references/pre-deployment-checklist.md`**

**Quick checklist:**
- [ ] Run `bash references/pre-deployment-checklist.md` review
- [ ] Update Firestore rules from test mode to production rules
- [ ] Enable security rules for Storage
- [ ] Add proper error handling and loading states
- [ ] Set up Firebase App Check for API protection
- [ ] Configure proper indexes for Firestore queries
- [ ] Enable email verification for new users
- [ ] Set up monitoring and alerts in Firebase Console
- [ ] Remove console.log statements from firebase_config.ts
- [ ] Test all CRUD operations with production data
- [ ] Run inventory test script (`npm run test:inventory`)
- [ ] Verify all environment variables are set in hosting platform
- [ ] **Run post-deployment verification**: `bash scripts/verify-firebase-deployment.sh`
- [ ] **Check service status**: `bash scripts/firebase-status.sh`
- [ ] Test critical user flows on live site
- [ ] Monitor Firebase Console for errors after deployment

## Advanced Topics

### CLI Automation

For automated Firebase setup using CLI commands, see:
- **CLI Automation Guide**: `references/cli_automation.md`

Key benefits:
- No manual credential copying
- Automated security rule deployment
- Scriptable for CI/CD pipelines
- Reduces configuration errors

### Lessons Learned

For best practices and lessons from real implementations, see:
- **Lessons Learned**: `LESSONS_LEARNED.md`

Key takeaways from production deployments:

**Setup & Configuration (2025-10-19)**:
- Use CLI for initial setup (10x faster)
- Proper TypeScript type imports are critical
- Test inventory logic before production
- Deploy security rules immediately
- Use Firebase emulators for local development

**Deployment & Verification (2025-10-20)**:
- Always verify services via CLI after setup
- Build → Verify → Deploy → Verify (two verification steps prevent bugs)
- Automate verification with scripts (can run in CI/CD)
- Firebase projects can have multiple Firestore databases
- Storage bucket must be initialized via Console before CLI rules deployment
- Check that Firebase config is embedded in production builds
- Test hosting URL with curl to verify HTTP 200

### Best Practices Summary

1. **CLI-First Approach** - Use Firebase CLI for all configuration tasks
2. **Automated Verification** - Run verification scripts after every deployment
3. **Security by Default** - Deploy production rules from day one
4. **Test Everything** - Use emulators and test scripts before production
5. **Monitor Continuously** - Set up alerts and check Firebase Console regularly
6. **Document Everything** - Keep deployment checklists and runbooks updated
