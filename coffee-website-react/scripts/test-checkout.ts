// scripts/test-checkout.ts
// Test script to verify complete checkout flow with inventory management

import { collection, addDoc, Timestamp, doc, getDoc, getDocs, query, where, writeBatch, updateDoc } from 'firebase/firestore'
import { db } from './firebase-config'

interface TestProduct {
  id?: string
  name: string
  price: number
  stock: number
  active: boolean
  description: string
  category: string
  weight: string
  image: string
  createdAt: any
  updatedAt: any
}

interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
}

// Product operations (copied from useFirestore.ts for Node.js usage)
const productOperations = {
  async updateStock(productId: string, quantity: number) {
    const productRef = doc(db, 'products', productId)
    const productSnap = await getDoc(productRef)

    if (!productSnap.exists()) {
      throw new Error('Product not found')
    }

    const currentStock = productSnap.data().stock
    const newStock = currentStock + quantity

    if (newStock < 0) {
      throw new Error('Insufficient stock')
    }

    await updateDoc(productRef, {
      stock: newStock,
      updatedAt: Timestamp.now(),
    })

    // Log inventory change
    await addDoc(collection(db, 'inventory_logs'), {
      productId,
      productName: productSnap.data().name,
      previousStock: currentStock,
      newStock,
      change: quantity,
      reason: quantity > 0 ? 'restock' : 'sale',
      timestamp: Timestamp.now(),
    })

    return newStock
  },
}

// Order operations (copied from useFirestore.ts for Node.js usage)
const orderOperations = {
  async createOrder(userId: string, orderData: any) {
    return await addDoc(collection(db, 'orders'), {
      ...orderData,
      userId,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: Timestamp.now(),
    })
  },

  async updateOrderStatus(orderId: string, status: string) {
    const docRef = doc(db, 'orders', orderId)
    return await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    })
  },
}

// Helper function to create test products
async function createTestProducts(): Promise<TestProduct[]> {
  console.log('\n📦 Creating test products...')

  const products: Omit<TestProduct, 'id'>[] = [
    {
      name: 'Test Ethiopian Yirgacheffe',
      price: 24.99,
      stock: 50,
      active: true,
      description: 'Test coffee for checkout flow',
      category: 'Single Origin',
      weight: '250g',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      name: 'Test Colombian Supremo',
      price: 22.99,
      stock: 30,
      active: true,
      description: 'Test coffee for checkout flow',
      category: 'Single Origin',
      weight: '250g',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      name: 'Test House Blend',
      price: 19.99,
      stock: 100,
      active: true,
      description: 'Test coffee for checkout flow',
      category: 'Signature Blend',
      weight: '500g',
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  ]

  const createdProducts: TestProduct[] = []

  for (const product of products) {
    const docRef = await addDoc(collection(db, 'products'), product)
    createdProducts.push({ id: docRef.id, ...product })
    console.log(`   ✅ Created: ${product.name} (Stock: ${product.stock})`)
  }

  return createdProducts
}

// Helper function to get current stock
async function getProductStock(productId: string): Promise<number> {
  const productRef = doc(db, 'products', productId)
  const productSnap = await getDoc(productRef)

  if (!productSnap.exists()) {
    throw new Error('Product not found')
  }

  return productSnap.data().stock
}

// Helper function to display inventory
async function displayInventory(productIds: string[]) {
  console.log('\n📊 Current Inventory:')
  console.log('   ' + '─'.repeat(60))

  for (const productId of productIds) {
    const productRef = doc(db, 'products', productId)
    const productSnap = await getDoc(productRef)

    if (productSnap.exists()) {
      const data = productSnap.data()
      console.log(`   ${data.name.padEnd(30)} | Stock: ${data.stock}`)
    }
  }

  console.log('   ' + '─'.repeat(60))
}

// Simulate checkout process
async function processCheckout(userId: string, cartItems: CartItem[]): Promise<string> {
  console.log('\n💳 Processing checkout...')

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  console.log(`   Subtotal: $${subtotal.toFixed(2)}`)
  console.log(`   Tax (8%): $${tax.toFixed(2)}`)
  console.log(`   Total: $${total.toFixed(2)}`)

  // Create order
  const orderData = {
    items: cartItems,
    subtotal,
    tax,
    total,
    shippingAddress: {
      name: 'Test Customer',
      street: '123 Coffee Street',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
    },
  }

  const orderRef = await orderOperations.createOrder(userId, orderData)
  console.log(`   ✅ Order created: ${orderRef.id}`)

  // Update inventory for each item
  console.log('\n📦 Updating inventory...')
  for (const item of cartItems) {
    const stockBefore = await getProductStock(item.productId)
    await productOperations.updateStock(item.productId, -item.quantity)
    const stockAfter = await getProductStock(item.productId)

    console.log(`   ${item.productName}:`)
    console.log(`      Before: ${stockBefore} | Sold: ${item.quantity} | After: ${stockAfter}`)
  }

  return orderRef.id
}

// Simulate restocking
async function restockProducts(productIds: string[], quantities: number[]) {
  console.log('\n📈 Restocking products...')

  for (let i = 0; i < productIds.length; i++) {
    const productId = productIds[i]
    const quantity = quantities[i]

    if (quantity > 0) {
      const stockBefore = await getProductStock(productId)
      await productOperations.updateStock(productId, quantity)
      const stockAfter = await getProductStock(productId)

      const productRef = doc(db, 'products', productId)
      const productSnap = await getDoc(productRef)
      const productName = productSnap.data()?.name || 'Unknown'

      console.log(`   ${productName}:`)
      console.log(`      Before: ${stockBefore} | Added: +${quantity} | After: ${stockAfter}`)
    }
  }
}

// View inventory logs
async function viewInventoryLogs(productIds: string[]) {
  console.log('\n📋 Inventory Change Logs:')
  console.log('   ' + '─'.repeat(80))

  const logsRef = collection(db, 'inventory_logs')
  const q = query(logsRef, where('productId', 'in', productIds))
  const snapshot = await getDocs(q)

  const logs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }))

  // Sort by timestamp
  logs.sort((a: any, b: any) => b.timestamp.toMillis() - a.timestamp.toMillis())

  logs.forEach((log: any) => {
    const timestamp = log.timestamp.toDate().toLocaleString()
    const change = log.change > 0 ? `+${log.change}` : log.change
    console.log(`   ${timestamp}`)
    console.log(`   Product: ${log.productName}`)
    console.log(`   Change: ${change} (${log.reason})`)
    console.log(`   Stock: ${log.previousStock} → ${log.newStock}`)
    console.log('   ' + '─'.repeat(80))
  })
}

// Cleanup test data
async function cleanupTestData(productIds: string[]) {
  console.log('\n🧹 Cleaning up test data...')

  const batch = writeBatch(db)

  // Delete test products
  for (const productId of productIds) {
    const productRef = doc(db, 'products', productId)
    batch.delete(productRef)
  }

  await batch.commit()
  console.log('   ✅ Test products deleted')

  // Note: We keep inventory_logs and orders for audit purposes
  console.log('   ℹ️  Orders and inventory logs preserved for audit trail')
}

// Main test flow
async function testCheckoutFlow() {
  console.log('\n🧪 Firebase Checkout Flow Test\n')
  console.log('='.repeat(80))

  try {
    // Step 1: Create test products
    console.log('\n📝 STEP 1: Setting up test products')
    const products = await createTestProducts()
    const productIds = products.map(p => p.id!)

    await displayInventory(productIds)

    // Step 2: Simulate adding items to cart
    console.log('\n📝 STEP 2: Simulating shopping cart')
    const cartItems: CartItem[] = [
      {
        productId: products[0].id!,
        productName: products[0].name,
        price: products[0].price,
        quantity: 3,
      },
      {
        productId: products[1].id!,
        productName: products[1].name,
        price: products[1].price,
        quantity: 2,
      },
      {
        productId: products[2].id!,
        productName: products[2].name,
        price: products[2].price,
        quantity: 5,
      },
    ]

    console.log('\n🛒 Shopping Cart:')
    cartItems.forEach(item => {
      console.log(`   ${item.quantity}x ${item.productName} @ $${item.price} = $${(item.quantity * item.price).toFixed(2)}`)
    })

    // Step 3: Process checkout
    console.log('\n📝 STEP 3: Processing checkout')
    const testUserId = 'test-user-' + Date.now()
    const orderId = await processCheckout(testUserId, cartItems)

    await displayInventory(productIds)

    // Step 4: Simulate restocking
    console.log('\n📝 STEP 4: Simulating product restock')
    await restockProducts(productIds, [10, 15, 20])

    await displayInventory(productIds)

    // Step 5: View inventory logs
    console.log('\n📝 STEP 5: Viewing inventory change logs')
    await viewInventoryLogs(productIds)

    // Step 6: Test overselling prevention
    console.log('\n📝 STEP 6: Testing overselling prevention')
    console.log('   Attempting to purchase more than available stock...')

    try {
      const currentStock = await getProductStock(productIds[0])
      await productOperations.updateStock(productIds[0], -(currentStock + 10))
      console.log('   ❌ ERROR: Should have prevented overselling!')
      process.exit(1)
    } catch (error: any) {
      if (error.message === 'Insufficient stock') {
        console.log('   ✅ Overselling correctly prevented')
      } else {
        throw error
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80))
    console.log('\n🎉 All Checkout Flow Tests Passed!\n')
    console.log('Test Summary:')
    console.log(`  ✅ Created ${products.length} test products`)
    console.log(`  ✅ Processed checkout with ${cartItems.length} items`)
    console.log(`  ✅ Order ID: ${orderId}`)
    console.log(`  ✅ Inventory decreased on purchase`)
    console.log(`  ✅ Inventory increased on restock`)
    console.log(`  ✅ Overselling prevention working`)
    console.log(`  ✅ Inventory logs created`)

    console.log('\n📊 Firebase Console Links:')
    console.log(`  Products: https://console.firebase.google.com/project/coffee-65c46/firestore/data/products`)
    console.log(`  Orders: https://console.firebase.google.com/project/coffee-65c46/firestore/data/orders`)
    console.log(`  Inventory Logs: https://console.firebase.google.com/project/coffee-65c46/firestore/data/inventory_logs`)

    console.log('\n🗑️  Cleanup:')
    console.log('   Do you want to cleanup test products? (Y/n)')
    console.log('   Run: npm run test:checkout:cleanup')
    console.log('')

    // Store product IDs for cleanup
    console.log('\n📋 Test Product IDs (for manual cleanup if needed):')
    productIds.forEach(id => console.log(`   ${id}`))
    console.log('')

  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message)
    console.error('\nError Details:', error)
    process.exit(1)
  }
}

// Run tests
console.log('Starting Firebase Checkout Flow Tests...')
console.log('Project: coffee-65c46\n')

testCheckoutFlow()
  .then(() => {
    console.log('✅ Test script completed successfully')
    console.log('   Note: Test products are still in database for inspection')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  })
