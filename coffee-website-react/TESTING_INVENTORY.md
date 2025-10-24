# Quick Inventory Testing Guide

Simple guide to test Firebase inventory management in action.

## Prerequisites

- Firebase project set up (coffee-65c46)
- `.env.local` file configured with Firebase credentials

## Quick Test (5 minutes)

### 1. Start the Development Server

```bash
cd coffee-website-react
npm install  # If not already installed
npm run dev
```

Open browser: http://localhost:5173

### 2. Add Test Products (Firebase Console)

Visit: https://console.firebase.google.com/project/coffee-65c46/firestore/data/products

Click "Add document" and create these products:

**Product 1: Test Ethiopian**
- Document ID: (auto-generate)
- Fields:
  - `name` (string): "Test Ethiopian Coffee"
  - `price` (number): 24.99
  - `stock` (number): **50**
  - `active` (boolean): true
  - `category` (string): "Single Origin"
  - `weight` (string): "250g"
  - `description` (string): "Test coffee"
  - `image` (string): "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80"
  - `createdAt` (timestamp): [Current timestamp]
  - `updatedAt` (timestamp): [Current timestamp]

**Product 2: Test Colombian**
- Same fields as above, but:
  - `name`: "Test Colombian Coffee"
  - `price`: 22.99
  - `stock`: **30**
  - `image`: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80"

### 3. Test Shopping Cart

1. Go to http://localhost:5173
2. Scroll to Products section
3. Click "Add to Cart" 3 times on Test Ethiopian
4. Click "Add to Cart" 2 times on Test Colombian
5. **See cart badge show: 5 items** ✅

### 4. Simulate Purchase (Decrease Inventory)

1. Go to Firebase Console → Products
2. Click on "Test Ethiopian Coffee"
3. Edit `stock` field: Change from **50 to 47** (-3 sold)
4. Click Save
5. Click on "Test Colombian Coffee"
6. Edit `stock` field: Change from **30 to 28** (-2 sold)
7. Click Save

**Result:** Inventory decreased! 📉

### 5. Verify Stock Decreased

1. Refresh the website (http://localhost:5173)
2. Open Firebase Console in another tab
3. Verify products show updated stock:
   - Ethiopian: 47 ✅
   - Colombian: 28 ✅

### 6. Simulate Restock (Increase Inventory)

1. Go to Firebase Console → Products
2. Click on "Test Ethiopian Coffee"
3. Edit `stock` field: Change from **47 to 60** (+13 restocked)
4. Click Save
5. Click on "Test Colombian Coffee"
6. Edit `stock` field: Change from **28 to 50** (+22 restocked)
7. Click Save

**Result:** Inventory increased! 📈

### 7. Verify Stock Increased

1. Refresh the website
2. Open Firebase Console
3. Verify:
   - Ethiopian: 60 ✅
   - Colombian: 50 ✅

---

## What's Happening Behind the Scenes?

### Cart Management (Client-Side)
```typescript
// src/hooks/useCart.ts
const addToCart = (product: Product) => {
  // Adds product to local state
  // Increments quantity if already in cart
}
```

**Result:** Cart count updates instantly in UI

### Inventory Management (Firebase)

When you manually update stock in Firebase Console, you're simulating what happens during checkout:

```typescript
// src/hooks/useFirestore.ts
await productOperations.updateStock(productId, -quantity)
// Decreases stock
// Logs change to inventory_logs collection
// Prevents negative stock
```

### Full Checkout Flow (To Be Implemented)

When payment is integrated, the checkout will:
1. Validate cart items
2. Check stock availability
3. Create order in Firestore
4. **Automatically decrease inventory** using `productOperations.updateStock()`
5. Log all changes to `inventory_logs`
6. Send confirmation email

---

## Testing Inventory with Real Checkout

To test with actual checkout (requires payment integration):

### Option 1: Stripe Integration

See: `STRIPE_INTEGRATION.md` (coming soon)

### Option 2: Manual Order Creation

Create order manually in Firebase Console:

1. Go to: https://console.firebase.google.com/project/coffee-65c46/firestore/data/orders
2. Click "Add document"
3. Use this structure:

```json
{
  "userId": "test-user-123",
  "status": "pending",
  "paymentStatus": "paid",
  "items": [
    {
      "productId": "[ethiopian-coffee-id]",
      "productName": "Test Ethiopian Coffee",
      "price": 24.99,
      "quantity": 3
    }
  ],
  "subtotal": 74.97,
  "tax": 6.00,
  "total": 80.97,
  "shippingAddress": {
    "name": "Test Customer",
    "street": "123 Coffee St",
    "city": "Seattle",
    "state": "WA",
    "zipCode": "98101"
  },
  "createdAt": [Current timestamp],
  "updatedAt": [Current timestamp]
}
```

Then manually decrease stock as shown above.

---

## Viewing Inventory Logs

To see the audit trail of inventory changes:

1. Go to: https://console.firebase.google.com/project/coffee-65c46/firestore/data/inventory_logs
2. You'll see all stock changes with:
   - Product ID & Name
   - Previous stock
   - New stock
   - Change amount (+/-)
   - Reason (sale/restock)
   - Timestamp

**Note:** Currently, manual stock updates don't create logs. Logs are only created when using `productOperations.updateStock()` from code.

---

## Real Products: When You're Ready

### 1. Remove Test Products

Go to Firebase Console → Products → Delete test products

### 2. Add Real Products

Use the same process as above, but with:
- Real product names
- Real photos (upload to Firebase Storage or use CDN)
- Real pricing
- Actual initial stock quantities

### 3. Update App.tsx

Remove hardcoded products and fetch from Firebase:

```typescript
// src/App.tsx
import { useProducts } from './hooks/useFirestore'

function App() {
  const { data: products, loading } = useProducts(true, true) // real-time updates

  if (loading) return <div>Loading...</div>

  return (
    <>
      <ProductGrid products={products} onAddToCart={addToCart} />
    </>
  )
}
```

### 4. Implement Checkout Flow

Create `src/components/Checkout.tsx`:

```typescript
import { productOperations, orderOperations } from '../hooks/useFirestore'

async function handleCheckout(cart, userId) {
  // 1. Validate stock availability
  for (const item of cart) {
    const product = await firestoreOperations.get('products', item.id)
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`)
    }
  }

  // 2. Create order
  const order = await orderOperations.createOrder(userId, {
    items: cart,
    total: calculateTotal(cart),
    // ... other order data
  })

  // 3. Decrease inventory
  for (const item of cart) {
    await productOperations.updateStock(item.id, -item.quantity)
  }

  // 4. Clear cart
  clearCart()

  return order
}
```

---

## Summary

**What You Tested:**
- ✅ Adding products to cart (client-side state)
- ✅ Decreasing inventory (manual simulation)
- ✅ Increasing inventory (restocking)
- ✅ Firebase real-time updates
- ✅ Data persistence

**What's Working:**
- Cart management (useCart hook)
- Product display from Firebase
- Inventory tracking in Firestore
- Security rules preventing unauthorized writes

**What's Next:**
- Implement checkout page
- Integrate payment (Stripe)
- Automatic inventory updates on purchase
- Order confirmation emails
- Admin dashboard for inventory management

---

## Quick Reference Links

| Resource | URL |
|----------|-----|
| Products | https://console.firebase.google.com/project/coffee-65c46/firestore/data/products |
| Orders | https://console.firebase.google.com/project/coffee-65c46/firestore/data/orders |
| Inventory Logs | https://console.firebase.google.com/project/coffee-65c46/firestore/data/inventory_logs |
| Dev Server | http://localhost:5173 |

---

**Testing Time:** ~5 minutes
**Difficulty:** Easy
**Prerequisites:** Firebase Console access

Have questions? Check `PRODUCT_MANAGEMENT.md` for detailed documentation.
