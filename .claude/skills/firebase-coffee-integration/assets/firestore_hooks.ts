// src/hooks/useFirestore.ts
// React hooks for Firestore operations

import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Generic hook to fetch a single document
export function useDocument<T = DocumentData>(collectionName: string, documentId: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!documentId) {
      setData(null)
      setLoading(false)
      return
    }

    const fetchDocument = async () => {
      try {
        setLoading(true)
        const docRef = doc(db, collectionName, documentId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as T)
        } else {
          setData(null)
        }
        setError(null)
      } catch (err) {
        setError(err as Error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [collectionName, documentId])

  return { data, loading, error }
}

// Generic hook to fetch a collection with optional real-time updates
export function useCollection<T = DocumentData>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = [],
  realtime = false
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, ...queryConstraints)

    if (realtime) {
      // Real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[]
          setData(items)
          setLoading(false)
          setError(null)
        },
        (err) => {
          setError(err as Error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } else {
      // One-time fetch
      const fetchCollection = async () => {
        try {
          setLoading(true)
          const snapshot = await getDocs(q)
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[]
          setData(items)
          setError(null)
        } catch (err) {
          setError(err as Error)
          setData([])
        } finally {
          setLoading(false)
        }
      }

      fetchCollection()
    }
  }, [collectionName, JSON.stringify(queryConstraints), realtime])

  return { data, loading, error }
}

// Hook for products
export function useProducts(activeOnly = true, realtime = false) {
  const constraints = activeOnly ? [where('active', '==', true), orderBy('name')] : [orderBy('name')]
  return useCollection('products', constraints, realtime)
}

// Hook for user orders
export function useUserOrders(userId: string | null, realtime = false) {
  const constraints = userId
    ? [where('userId', '==', userId), orderBy('createdAt', 'desc')]
    : []

  return useCollection('orders', constraints, realtime)
}

// Hook for user cart
export function useCart(userId: string | null) {
  return useDocument('cart', userId)
}

// CRUD operations
export const firestoreOperations = {
  // Add document
  async add(collectionName: string, data: DocumentData) {
    const collectionRef = collection(db, collectionName)
    return await addDoc(collectionRef, {
      ...data,
      createdAt: Timestamp.now(),
    })
  },

  // Update document
  async update(collectionName: string, documentId: string, data: Partial<DocumentData>) {
    const docRef = doc(db, collectionName, documentId)
    return await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  },

  // Delete document
  async delete(collectionName: string, documentId: string) {
    const docRef = doc(db, collectionName, documentId)
    return await deleteDoc(docRef)
  },

  // Get single document
  async get(collectionName: string, documentId: string) {
    const docRef = doc(db, collectionName, documentId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  },
}

// Product-specific operations
export const productOperations = {
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

// Order operations
export const orderOperations = {
  async createOrder(userId: string, orderData: DocumentData) {
    return await firestoreOperations.add('orders', {
      ...orderData,
      userId,
      status: 'pending',
      paymentStatus: 'pending',
    })
  },

  async updateOrderStatus(orderId: string, status: string) {
    return await firestoreOperations.update('orders', orderId, { status })
  },
}
