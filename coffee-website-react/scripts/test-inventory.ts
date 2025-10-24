// scripts/test-inventory.ts
// Test script to verify inventory management functionality

import { collection, addDoc, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase-config'

interface TestProduct {
  id?: string
  name: string
  price: number
  stock: number
  active: boolean
  description: string
  category: string
  createdAt: any
  updatedAt: any
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

async function createTestProduct(): Promise<string> {
  const testProduct: Omit<TestProduct, 'id'> = {
    name: 'Test Coffee - Inventory Check',
    price: 19.99,
    stock: 100,
    active: true,
    description: 'Test product for inventory verification',
    category: 'Test',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, 'products'), testProduct)
  console.log(`✅ Test product created with ID: ${docRef.id}`)
  return docRef.id
}

async function getProductStock(productId: string): Promise<number> {
  const productRef = doc(db, 'products', productId)
  const productSnap = await getDoc(productRef)

  if (!productSnap.exists()) {
    throw new Error('Product not found')
  }

  return productSnap.data().stock
}

async function testInventoryManagement() {
  console.log('🧪 Firebase Inventory Management Test\n')
  console.log('=' .repeat(50))

  try {
    // Step 1: Create test product
    console.log('\n📦 Step 1: Creating test product...')
    const productId = await createTestProduct()
    const initialStock = await getProductStock(productId)
    console.log(`   Initial stock: ${initialStock}`)

    // Step 2: Decrease stock (simulate purchase)
    console.log('\n📉 Step 2: Testing stock decrease (purchase of 5 units)...')
    const stockAfterSale = await productOperations.updateStock(productId, -5)
    console.log(`   ✅ Stock decreased successfully`)
    console.log(`   New stock: ${stockAfterSale}`)
    console.log(`   Expected: ${initialStock - 5}`)

    if (stockAfterSale !== initialStock - 5) {
      throw new Error(`Stock mismatch! Expected ${initialStock - 5}, got ${stockAfterSale}`)
    }

    // Step 3: Increase stock (simulate restock)
    console.log('\n📈 Step 3: Testing stock increase (restock of 20 units)...')
    const stockAfterRestock = await productOperations.updateStock(productId, 20)
    console.log(`   ✅ Stock increased successfully`)
    console.log(`   New stock: ${stockAfterRestock}`)
    console.log(`   Expected: ${stockAfterSale + 20}`)

    if (stockAfterRestock !== stockAfterSale + 20) {
      throw new Error(`Stock mismatch! Expected ${stockAfterSale + 20}, got ${stockAfterRestock}`)
    }

    // Step 4: Test insufficient stock error
    console.log('\n⚠️  Step 4: Testing insufficient stock prevention...')
    try {
      await productOperations.updateStock(productId, -200) // Try to remove more than available
      console.log('   ❌ ERROR: Should have thrown insufficient stock error!')
      process.exit(1)
    } catch (error: any) {
      if (error.message === 'Insufficient stock') {
        console.log(`   ✅ Correctly prevented overselling`)
        console.log(`   Error message: "${error.message}"`)
      } else {
        throw error
      }
    }

    // Step 5: Verify final stock
    console.log('\n🔍 Step 5: Verifying final stock...')
    const finalStock = await getProductStock(productId)
    console.log(`   Final stock: ${finalStock}`)
    console.log(`   Expected: ${stockAfterRestock}`)

    if (finalStock !== stockAfterRestock) {
      throw new Error(`Final stock mismatch! Expected ${stockAfterRestock}, got ${finalStock}`)
    }

    // Success summary
    console.log('\n' + '='.repeat(50))
    console.log('\n🎉 All Inventory Tests Passed!\n')
    console.log('Test Summary:')
    console.log(`  - Test product ID: ${productId}`)
    console.log(`  - Initial stock: ${initialStock}`)
    console.log(`  - After sale (-5): ${stockAfterSale}`)
    console.log(`  - After restock (+20): ${stockAfterRestock}`)
    console.log(`  - Final stock: ${finalStock}`)
    console.log(`  - Overselling prevention: ✅`)
    console.log('\n📊 Check Firebase Console:')
    console.log(`  - Products: https://console.firebase.google.com/project/coffee-65c46/firestore/data/products/${productId}`)
    console.log(`  - Inventory Logs: https://console.firebase.google.com/project/coffee-65c46/firestore/data/inventory_logs`)
    console.log('\nInventory logs should show:')
    console.log('  1. Sale: -5 units (reason: sale)')
    console.log('  2. Restock: +20 units (reason: restock)')
    console.log('')

  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message)
    console.error('\nError Details:', error)
    process.exit(1)
  }
}

// Run tests
console.log('Starting Firebase Inventory Tests...')
console.log('Project: coffee-65c46\n')

testInventoryManagement()
  .then(() => {
    console.log('✅ Test script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  })
