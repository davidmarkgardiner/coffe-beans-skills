# Firestore Schema for Coffee E-Commerce

This document defines the Firestore database schema for a coffee beans e-commerce application.

## Collections

### `products`

Stores coffee product information.

```typescript
products/{productId}
{
  id: string                    // Unique product identifier
  name: string                  // Product name (e.g., "Ethiopian Yirgacheffe")
  description: string           // Product description
  price: number                 // Price in USD
  weight: string                // Weight (e.g., "250g")
  category: string              // Category (e.g., "Single Origin", "Espresso")
  image: string                 // Image URL
  badge?: string                // Optional badge (e.g., "Best Seller", "New")
  stock: number                 // Current inventory count
  sold: number                  // Total units sold
  createdAt: Timestamp          // When product was added
  updatedAt: Timestamp          // Last update timestamp
  featured: boolean             // Whether to feature on homepage
  active: boolean               // Whether product is available for purchase
}
```

### `users`

Stores user account information.

```typescript
users/{userId}
{
  uid: string                   // Firebase Auth UID
  email: string                 // User email
  displayName?: string          // Optional display name
  photoURL?: string             // Optional profile photo
  role: 'customer' | 'admin'    // User role
  createdAt: Timestamp          // Account creation date
  lastLogin: Timestamp          // Last login timestamp
  shippingAddresses: Array<{
    id: string
    name: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    isDefault: boolean
  }>
  preferences: {
    newsletter: boolean         // Newsletter subscription
    emailNotifications: boolean
  }
}
```

### `orders`

Stores customer orders.

```typescript
orders/{orderId}
{
  id: string                    // Order ID
  userId: string                // Reference to users collection
  userEmail: string             // User email (denormalized)
  items: Array<{
    productId: string           // Reference to products collection
    productName: string         // Product name (denormalized)
    quantity: number
    price: number               // Price at time of purchase
    image: string
  }>
  subtotal: number              // Subtotal before tax
  tax: number                   // Tax amount
  shipping: number              // Shipping cost
  total: number                 // Total amount charged
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentIntentId?: string      // Stripe payment intent ID
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  trackingNumber?: string       // Shipping tracking number
  createdAt: Timestamp          // Order creation date
  updatedAt: Timestamp          // Last update
  completedAt?: Timestamp       // When order was completed
}
```

### `cart`

Stores shopping cart data (per user).

```typescript
cart/{userId}
{
  userId: string                // Reference to users collection
  items: Array<{
    productId: string           // Reference to products collection
    quantity: number
    addedAt: Timestamp
  }>
  updatedAt: Timestamp
}
```

### `newsletter`

Stores newsletter subscribers.

```typescript
newsletter/{email}
{
  email: string
  subscribedAt: Timestamp
  active: boolean
  source: 'website' | 'checkout' | 'admin'
}
```

### `inventory_logs`

Tracks inventory changes for auditing.

```typescript
inventory_logs/{logId}
{
  productId: string             // Reference to products collection
  productName: string           // Product name (denormalized)
  previousStock: number         // Stock before change
  newStock: number              // Stock after change
  change: number                // Quantity changed (+ or -)
  reason: 'sale' | 'restock' | 'adjustment' | 'return'
  orderId?: string              // If related to an order
  adminId?: string              // If manual adjustment
  timestamp: Timestamp
}
```

## Indexes

### Composite Indexes Required

1. **Orders by user and status**
   - Collection: `orders`
   - Fields: `userId` (Ascending), `status` (Ascending), `createdAt` (Descending)

2. **Products by category and active**
   - Collection: `products`
   - Fields: `category` (Ascending), `active` (Ascending), `name` (Ascending)

3. **Products by featured and active**
   - Collection: `products`
   - Fields: `featured` (Ascending), `active` (Ascending), `createdAt` (Descending)

## Security Rules Considerations

- Users can only read/write their own cart
- Users can only read their own orders
- Only admins can write to products, inventory_logs
- All users can read active products
- Newsletter collection has special write rules
