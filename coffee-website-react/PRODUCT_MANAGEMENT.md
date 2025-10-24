# Product Management Guide

Complete guide for managing coffee products with Firebase inventory integration.

## Table of Contents

1. [Overview](#overview)
2. [Testing Inventory System](#testing-inventory-system)
3. [Adding Real Products](#adding-real-products)
4. [Updating Product Stock](#updating-product-stock)
5. [Managing Orders](#managing-orders)
6. [Firebase Console Access](#firebase-console-access)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This coffee e-commerce platform uses Firebase Firestore for:
- **Product catalog** with real-time stock management
- **Order processing** with automatic inventory updates
- **Inventory audit logs** tracking all stock changes
- **User authentication** and shopping carts

### Key Features

✅ **Automatic Inventory Management**: Stock decreases on purchase, increases on restock
✅ **Overselling Prevention**: Cannot sell more items than available in stock
✅ **Audit Trail**: All inventory changes are logged with timestamps
✅ **Real-time Updates**: Inventory syncs across all connected clients

---

## Testing Inventory System

### Important Note About Firebase Security

The test scripts require **admin authentication** to write to the database due to Firestore security rules. For testing the inventory system, you have two options:

**Option 1: Manual Testing via Web Interface (Recommended)**
- Start the dev server and test through the UI
- See "Manual Testing Guide" below

**Option 2: Automated Testing (Requires Admin Setup)**
- Requires Firebase Admin SDK setup
- See "Setting Up Admin Testing" below

### Manual Testing Guide (Recommended)

Test the complete checkout flow through the web interface:

```bash
cd coffee-website-react
npm run dev
```

Then follow these steps in your browser:

#### Step 1: Add Products to Firebase Console

First, manually add test products via Firebase Console:
1. Go to https://console.firebase.google.com/project/coffee-65c46/firestore/data/products
2. Click "Add document"
3. Use these test products:

**Product 1:**
```json
{
  "name": "Test Ethiopian Coffee",
  "description": "Test product for checkout",
  "price": 24.99,
  "stock": 50,
  "active": true,
  "category": "Single Origin",
  "weight": "250g",
  "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80",
  "badge": "Test",
  "createdAt": [Click "Current timestamp"],
  "updatedAt": [Click "Current timestamp"]
}
```

**Product 2:**
```json
{
  "name": "Test Colombian Coffee",
  "description": "Test product for checkout",
  "price": 22.99,
  "stock": 30,
  "active": true,
  "category": "Single Origin",
  "weight": "250g",
  "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
  "badge": "Test",
  "createdAt": [Click "Current timestamp"],
  "updatedAt": [Click "Current timestamp"]
}
```

#### Step 2: Note Initial Stock Levels

Write down the initial stock for each product:
- Ethiopian: 50 units
- Colombian: 30 units

#### Step 3: Access the Website

Open http://localhost:5173 in your browser

#### Step 4: Create a User Account

1. Click "Login" in the navigation
2. Click "Sign Up"
3. Create a test account (e.g., test@example.com)
4. You'll be automatically logged in

#### Step 5: Add Items to Cart

**This demonstrates client-side cart management:**
1. Scroll to the Products section
2. Click "Add to Cart" on Test Ethiopian Coffee (3 times)
3. Click "Add to Cart" on Test Colombian Coffee (2 times)
4. See cart count increase in the navigation (5 items total)

#### Step 6: Simulate Checkout

**Note:** Since payment integration isn't yet complete, we'll manually simulate the checkout process:

1. Open Firebase Console → Firestore
2. Manually update product stocks to simulate purchase:
   - **Test Ethiopian Coffee**: Change stock from 50 to 47 (-3 units)
   - **Test Colombian Coffee**: Change stock from 30 to 28 (-2 units)
3. Manually create an order document in `orders` collection:

```json
{
  "userId": "[your-user-id-from-auth]",
  "status": "pending",
  "paymentStatus": "pending",
  "items": [
    {
      "productId": "[ethiopian-product-id]",
      "productName": "Test Ethiopian Coffee",
      "price": 24.99,
      "quantity": 3
    },
    {
      "productId": "[colombian-product-id]",
      "productName": "Test Colombian Coffee",
      "price": 22.99,
      "quantity": 2
    }
  ],
  "subtotal": 120.95,
  "tax": 9.68,
  "total": 130.63,
  "createdAt": [Current timestamp]
}
```

#### Step 7: Verify Inventory Decreased

1. Refresh the website
2. Check Firebase Console → Products
3. Verify stock levels decreased:
   - Ethiopian: 50 → 47 ✅
   - Colombian: 30 → 28 ✅

#### Step 8: Simulate Restocking

1. Go to Firebase Console → Products
2. Update stocks (simulate restocking):
   - **Test Ethiopian Coffee**: 47 → 60 (+13 units)
   - **Test Colombian Coffee**: 28 → 45 (+17 units)
3. Refresh website to see updated stock

#### Step 9: Test Overselling Prevention

1. Try to manually set stock to negative number in Firebase Console
2. The Firestore rules will prevent this
3. Or create a small script to test:

```typescript
// This should throw "Insufficient stock" error
await productOperations.updateStock('product-id', -1000)
```

### Expected Results

**What you should observe:**
- ✅ Cart adds items correctly (client-side state)
- ✅ Stock decreases when order is created
- ✅ Stock increases when restocked
- ✅ Firestore rules prevent unauthorized writes
- ✅ Real-time updates across browser tabs

### Sample Output (Console Logs):
```
🧪 Firebase Checkout Flow Test
================================================================================

📝 STEP 1: Setting up test products
   ✅ Created: Test Ethiopian Yirgacheffe (Stock: 50)
   ✅ Created: Test Colombian Supremo (Stock: 30)
   ✅ Created: Test House Blend (Stock: 100)

📊 Current Inventory:
   ────────────────────────────────────────────────────────────
   Test Ethiopian Yirgacheffe    | Stock: 50
   Test Colombian Supremo        | Stock: 30
   Test House Blend              | Stock: 100
   ────────────────────────────────────────────────────────────

📝 STEP 2: Simulating shopping cart

🛒 Shopping Cart:
   3x Test Ethiopian Yirgacheffe @ $24.99 = $74.97
   2x Test Colombian Supremo @ $22.99 = $45.98
   5x Test House Blend @ $19.99 = $99.95

📝 STEP 3: Processing checkout
   Subtotal: $220.90
   Tax (8%): $17.67
   Total: $238.57
   ✅ Order created: [order-id]

📦 Updating inventory...
   Test Ethiopian Yirgacheffe:
      Before: 50 | Sold: 3 | After: 47
   Test Colombian Supremo:
      Before: 30 | Sold: 2 | After: 28
   Test House Blend:
      Before: 100 | Sold: 5 | After: 95

🎉 All Checkout Flow Tests Passed!
```

### Run Basic Inventory Test

Test basic stock operations:

```bash
npm run test:inventory
```

This tests:
- Creating products
- Decreasing stock (sales)
- Increasing stock (restocking)
- Preventing negative stock

---

## Adding Real Products

### Method 1: Firebase Console (Recommended for First Setup)

1. **Open Firebase Console**
   ```
   https://console.firebase.google.com/project/coffee-65c46/firestore/data/products
   ```

2. **Add a New Product Document**
   - Click "Add document"
   - Set Document ID: (auto-generate or use custom ID like `ethiopian-yirgacheffe`)

3. **Add Product Fields**

   | Field | Type | Example Value |
   |-------|------|---------------|
   | `name` | string | `"Ethiopian Yirgacheffe"` |
   | `description` | string | `"Bright citrus notes with floral undertones"` |
   | `price` | number | `24.99` |
   | `stock` | number | `100` |
   | `active` | boolean | `true` |
   | `category` | string | `"Single Origin"` |
   | `weight` | string | `"250g"` |
   | `image` | string | `"https://your-image-url.com/coffee.jpg"` |
   | `badge` | string | `"Best Seller"` (optional) |
   | `createdAt` | timestamp | (Click "Current timestamp") |
   | `updatedAt` | timestamp | (Click "Current timestamp") |

4. **Click "Save"**

### Method 2: Using Firebase Admin SDK (Bulk Import)

Create a script `scripts/add-products.ts`:

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../src/config/firebase'

const realProducts = [
  {
    name: 'Ethiopian Yirgacheffe',
    description: 'Bright citrus notes with floral undertones and a smooth finish.',
    price: 24.99,
    stock: 100,
    active: true,
    category: 'Single Origin',
    weight: '250g',
    image: 'https://your-cdn.com/ethiopian-yirgacheffe.jpg',
    badge: 'Best Seller',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    name: 'Colombian Supremo',
    description: 'Rich and balanced with caramel sweetness.',
    price: 22.99,
    stock: 150,
    active: true,
    category: 'Single Origin',
    weight: '250g',
    image: 'https://your-cdn.com/colombian-supremo.jpg',
    badge: 'New',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  // Add more products...
]

async function addProducts() {
  for (const product of realProducts) {
    const docRef = await addDoc(collection(db, 'products'), product)
    console.log(`✅ Added: ${product.name} (ID: ${docRef.id})`)
  }
}

addProducts()
```

Run it:
```bash
tsx scripts/add-products.ts
```

### Product Image Guidelines

**Image Requirements:**
- Format: JPG, PNG, or WebP
- Recommended size: 800x800px (1:1 aspect ratio)
- Max file size: 500KB for fast loading
- Use CDN for production (Firebase Storage, Cloudinary, etc.)

**Free Stock Photo Sources:**
- Unsplash: https://unsplash.com/s/photos/coffee-beans
- Pexels: https://www.pexels.com/search/coffee/

---

## Updating Product Stock

### Manual Stock Update (Firebase Console)

1. Go to Firebase Console → Firestore → `products` collection
2. Click on the product document
3. Update the `stock` field
4. Update `updatedAt` to current timestamp
5. Save

⚠️ **Note:** Manual updates won't create inventory logs. Use the API for proper tracking.

### Programmatic Stock Update (Recommended)

Use the `productOperations.updateStock()` function:

```typescript
import { productOperations } from './hooks/useFirestore'

// Decrease stock (after a sale)
await productOperations.updateStock('product-id', -5)  // Sold 5 units

// Increase stock (restock)
await productOperations.updateStock('product-id', 20)  // Added 20 units
```

**Benefits:**
- ✅ Automatically logs changes to `inventory_logs` collection
- ✅ Prevents overselling (throws error if stock would go negative)
- ✅ Records reason ("sale" or "restock")
- ✅ Maintains audit trail

### Bulk Stock Update

Create a script for restocking multiple products:

```typescript
import { productOperations } from '../src/hooks/useFirestore'

const restockList = [
  { productId: 'ethiopian-yirgacheffe', quantity: 50 },
  { productId: 'colombian-supremo', quantity: 30 },
  { productId: 'house-blend', quantity: 100 },
]

async function bulkRestock() {
  for (const item of restockList) {
    try {
      const newStock = await productOperations.updateStock(
        item.productId,
        item.quantity
      )
      console.log(`✅ ${item.productId}: Added ${item.quantity}, New stock: ${newStock}`)
    } catch (error) {
      console.error(`❌ Failed to restock ${item.productId}:`, error)
    }
  }
}

bulkRestock()
```

---

## Managing Orders

### View Orders in Firebase Console

```
https://console.firebase.google.com/project/coffee-65c46/firestore/data/orders
```

### Order Document Structure

```typescript
{
  id: string                    // Auto-generated
  userId: string                // Customer ID
  status: string                // 'pending', 'processing', 'shipped', 'delivered'
  paymentStatus: string         // 'pending', 'paid', 'failed'
  items: [
    {
      productId: string
      productName: string
      price: number
      quantity: number
    }
  ]
  subtotal: number
  tax: number
  total: number
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Update Order Status

```typescript
import { orderOperations } from './hooks/useFirestore'

// Update status
await orderOperations.updateOrderStatus('order-id', 'shipped')
```

**Available Statuses:**
- `pending` - Order received, payment pending
- `processing` - Payment confirmed, preparing shipment
- `shipped` - Package sent to customer
- `delivered` - Package received by customer
- `cancelled` - Order cancelled

---

## Firebase Console Access

### Important Collections

| Collection | URL | Purpose |
|------------|-----|---------|
| Products | [Link](https://console.firebase.google.com/project/coffee-65c46/firestore/data/products) | Product catalog with stock |
| Orders | [Link](https://console.firebase.google.com/project/coffee-65c46/firestore/data/orders) | Customer orders |
| Inventory Logs | [Link](https://console.firebase.google.com/project/coffee-65c46/firestore/data/inventory_logs) | Stock change history |
| Cart | [Link](https://console.firebase.google.com/project/coffee-65c46/firestore/data/cart) | User shopping carts |
| Users | [Link](https://console.firebase.google.com/project/coffee-65c46/firestore/data/users) | Customer profiles |

### Inventory Logs

Track all stock changes for auditing:

```typescript
{
  productId: string
  productName: string
  previousStock: number
  newStock: number
  change: number              // Negative for sales, positive for restocks
  reason: "sale" | "restock"
  timestamp: Timestamp
}
```

**View logs for a specific product:**
1. Go to `inventory_logs` collection
2. Click "Start Collection"
3. Add filter: `productId == your-product-id`
4. Sort by `timestamp` descending

---

## Troubleshooting

### Issue: "Insufficient stock" Error

**Cause:** Attempting to sell more units than available

**Solution:**
1. Check current stock:
   ```typescript
   const product = await firestoreOperations.get('products', 'product-id')
   console.log('Current stock:', product.stock)
   ```

2. Restock if needed:
   ```typescript
   await productOperations.updateStock('product-id', 50)  // Add 50 units
   ```

### Issue: Products Not Showing on Website

**Possible Causes:**
1. Product `active` field is `false`
2. Product missing from database
3. Firebase not initialized properly

**Solution:**
1. Check Firebase Console → Products collection
2. Verify product has `active: true`
3. Check browser console for Firebase errors
4. Verify `.env.local` has correct Firebase credentials

### Issue: Cart Not Persisting

**Cause:** User not logged in (cart uses client-side state)

**Solution:**
- For authenticated users, cart persists to Firestore
- For guests, cart is stored in browser memory only

### Issue: Inventory Not Updating After Purchase

**Check:**
1. Is `productOperations.updateStock()` being called in checkout flow?
2. Check inventory logs to see if changes are being recorded
3. Verify Firebase rules allow write access to `products` collection

### Firebase Security Rules

Make sure your Firestore rules allow proper access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - read for all, write for authenticated admin
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Orders - read/write for owner
    match /orders/{orderId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }

    // Inventory logs - read for admin
    match /inventory_logs/{logId} {
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow write: if false;  // Only server-side updates
    }
  }
}
```

---

## When You're Ready for Real Products

### Checklist

- [ ] Remove all test products from Firebase Console
- [ ] Add real product photos to CDN/Firebase Storage
- [ ] Create product documents with real data
- [ ] Set initial stock quantities
- [ ] Verify all products have `active: true`
- [ ] Test checkout flow with real products
- [ ] Set up payment processing (Stripe, PayPal, etc.)
- [ ] Configure shipping rates
- [ ] Update Firebase security rules for production

### Production Deployment Steps

1. **Remove Test Data**
   ```typescript
   // Script to delete test products
   const testProducts = await getDocs(
     query(collection(db, 'products'), where('category', '==', 'Test'))
   )
   testProducts.forEach(doc => deleteDoc(doc.ref))
   ```

2. **Add Real Products** (see "Adding Real Products" section)

3. **Configure Environment**
   - Update `.env.local` with production Firebase config
   - Set up production domain in Firebase Console
   - Enable Firebase Analytics (optional)

4. **Test Everything**
   ```bash
   npm run test:checkout  # With real product IDs
   ```

5. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

---

## API Reference

### Product Operations

```typescript
import { productOperations } from './hooks/useFirestore'

// Update stock (with logging)
await productOperations.updateStock(productId: string, quantity: number)
  // quantity: negative for sales, positive for restock
  // Returns: new stock level
  // Throws: 'Insufficient stock' if would go negative
```

### Order Operations

```typescript
import { orderOperations } from './hooks/useFirestore'

// Create order
await orderOperations.createOrder(userId: string, orderData: DocumentData)
  // Returns: Document reference with order ID

// Update order status
await orderOperations.updateOrderStatus(orderId: string, status: string)
  // status: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
```

### Firestore Operations

```typescript
import { firestoreOperations } from './hooks/useFirestore'

// Generic CRUD
await firestoreOperations.add(collection: string, data: DocumentData)
await firestoreOperations.update(collection: string, id: string, data: Partial<DocumentData>)
await firestoreOperations.delete(collection: string, id: string)
await firestoreOperations.get(collection: string, id: string)
```

---

## Support

For issues or questions:
- Check Firebase Console for errors
- Review inventory logs for stock discrepancies
- Test with `npm run test:checkout` to verify system functionality
- Check browser console for client-side errors

---

**Last Updated:** 2025-10-23
**Firebase Project:** coffee-65c46
**Environment:** Development
