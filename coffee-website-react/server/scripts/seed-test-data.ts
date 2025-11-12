#!/usr/bin/env tsx
/**
 * Seed test data for admin dashboard
 * Creates sample orders, inventory logs, and notifications
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

async function seedTestData() {
  console.log('🌱 Seeding test data...\n')

  try {
    // 1. Create test products if they don't exist
    console.log('📦 Creating test products...')
    const products = [
      {
        id: 'ethiopian-yirgacheffe',
        name: 'Ethiopian Yirgacheffe',
        price: 19.99,
        stock: 45,
        sold: 15,
        active: true,
        category: 'Single Origin',
        weight: '250g',
        description: 'Bright citrus notes with floral undertones',
      },
      {
        id: 'colombian-supremo',
        name: 'Colombian Supremo',
        price: 18.49,
        stock: 8, // Low stock
        sold: 42,
        active: true,
        category: 'Single Origin',
        weight: '250g',
        description: 'Rich and balanced with caramel sweetness',
      },
      {
        id: 'house-blend',
        name: 'House Blend',
        price: 15.99,
        stock: 67,
        sold: 33,
        active: true,
        category: 'Signature Blend',
        weight: '250g',
        description: 'Our signature blend with chocolate notes',
      },
      {
        id: 'espresso-forte',
        name: 'Espresso Forte',
        price: 21.49,
        stock: 5, // Low stock
        sold: 25,
        active: true,
        category: 'Espresso',
        weight: '250g',
        description: 'Bold and intense with dark chocolate',
      },
    ]

    for (const product of products) {
      await db.collection('products').doc(product.id).set({
        ...product,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    }
    console.log(`✅ Created ${products.length} products\n`)

    // 2. Create test orders
    console.log('📋 Creating test orders...')
    const orders = [
      {
        customerEmail: 'john.doe@example.com',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_test_1',
        items: [
          { id: 'ethiopian-yirgacheffe', name: 'Ethiopian Yirgacheffe', price: 19.99, quantity: 2 },
          { id: 'house-blend', name: 'House Blend', price: 15.99, quantity: 1 },
        ],
        subtotal: 55.97,
        shipping: 5.00,
        tax: 3.36,
        total: 64.33,
        currency: 'gbp',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        trackingNumber: 'TN123456789GB',
      },
      {
        customerEmail: 'jane.smith@example.com',
        status: 'shipped',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_test_2',
        items: [
          { id: 'colombian-supremo', name: 'Colombian Supremo', price: 18.49, quantity: 3 },
        ],
        subtotal: 55.47,
        shipping: 5.00,
        tax: 3.33,
        total: 63.80,
        currency: 'gbp',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        trackingNumber: 'TN987654321GB',
      },
      {
        customerEmail: 'bob.jones@example.com',
        status: 'processing',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_test_3',
        items: [
          { id: 'espresso-forte', name: 'Espresso Forte', price: 21.49, quantity: 1 },
          { id: 'ethiopian-yirgacheffe', name: 'Ethiopian Yirgacheffe', price: 19.99, quantity: 1 },
        ],
        subtotal: 41.48,
        shipping: 5.00,
        tax: 2.49,
        total: 48.97,
        currency: 'gbp',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        customerEmail: 'alice.brown@example.com',
        status: 'pending',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_test_4',
        items: [
          { id: 'house-blend', name: 'House Blend', price: 15.99, quantity: 4 },
        ],
        subtotal: 63.96,
        shipping: 5.00,
        tax: 3.84,
        total: 72.80,
        currency: 'gbp',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        customerEmail: 'charlie.wilson@example.com',
        status: 'pending',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_test_5',
        items: [
          { id: 'colombian-supremo', name: 'Colombian Supremo', price: 18.49, quantity: 2 },
          { id: 'espresso-forte', name: 'Espresso Forte', price: 21.49, quantity: 1 },
        ],
        subtotal: 58.47,
        shipping: 5.00,
        tax: 3.51,
        total: 66.98,
        currency: 'gbp',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    ]

    for (const order of orders) {
      await db.collection('orders').add({
        ...order,
        createdAt: admin.firestore.Timestamp.fromDate(order.createdAt),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    }
    console.log(`✅ Created ${orders.length} orders\n`)

    // 3. Create inventory logs
    console.log('📊 Creating inventory logs...')
    const logs = [
      {
        productId: 'ethiopian-yirgacheffe',
        productName: 'Ethiopian Yirgacheffe',
        previousStock: 50,
        newStock: 45,
        change: -5,
        reason: 'sale',
        orderId: 'test_order_1',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        productId: 'colombian-supremo',
        productName: 'Colombian Supremo',
        previousStock: 50,
        newStock: 8,
        change: -42,
        reason: 'sale',
        orderId: 'test_order_2',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        productId: 'house-blend',
        productName: 'House Blend',
        previousStock: 100,
        newStock: 67,
        change: -33,
        reason: 'sale',
        orderId: 'test_order_3',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        productId: 'espresso-forte',
        productName: 'Espresso Forte',
        previousStock: 30,
        newStock: 5,
        change: -25,
        reason: 'sale',
        orderId: 'test_order_4',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        productId: 'ethiopian-yirgacheffe',
        productName: 'Ethiopian Yirgacheffe',
        previousStock: 45,
        newStock: 95,
        change: 50,
        reason: 'restock',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ]

    for (const log of logs) {
      await db.collection('inventory_logs').add({
        ...log,
        timestamp: admin.firestore.Timestamp.fromDate(log.timestamp),
      })
    }
    console.log(`✅ Created ${logs.length} inventory logs\n`)

    // 4. Create admin notifications for pending orders
    console.log('🔔 Creating admin notifications...')
    const notifications = [
      {
        type: 'new_order',
        orderId: 'test_order_4',
        customerEmail: 'alice.brown@example.com',
        total: 72.80,
        currency: 'gbp',
        itemCount: 1,
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        type: 'new_order',
        orderId: 'test_order_5',
        customerEmail: 'charlie.wilson@example.com',
        total: 66.98,
        currency: 'gbp',
        itemCount: 2,
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ]

    for (const notification of notifications) {
      await db.collection('admin_notifications').add({
        ...notification,
        createdAt: admin.firestore.Timestamp.fromDate(notification.createdAt),
      })
    }
    console.log(`✅ Created ${notifications.length} notifications\n`)

    console.log('✨ Test data seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - ${products.length} products`)
    console.log(`   - ${orders.length} orders`)
    console.log(`   - ${logs.length} inventory logs`)
    console.log(`   - ${notifications.length} admin notifications`)
    console.log('\n💡 View admin dashboard at: http://localhost:5173/admin\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    process.exit(1)
  }
}

seedTestData()
