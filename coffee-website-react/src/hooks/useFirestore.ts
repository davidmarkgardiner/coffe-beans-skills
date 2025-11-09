// src/hooks/useFirestore.ts
// React hooks for Firestore operations

import { useEffect, useState } from 'react'
import type { QueryConstraint, DocumentData } from 'firebase/firestore'
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
  onSnapshot,
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

// Gift Card operations
export const giftCardOperations = {
  // Generate unique gift card code
  generateCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude ambiguous characters
    const segments = 4
    const segmentLength = 4

    let code = 'GIFT'
    for (let i = 0; i < segments; i++) {
      let segment = ''
      for (let j = 0; j < segmentLength; j++) {
        segment += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      code += '-' + segment
    }
    return code
  },

  // Create a new gift card
  async createGiftCard(giftCardData: {
    amount: number
    currency: string
    senderName: string
    senderEmail: string
    recipientEmail: string
    recipientName?: string
    message?: string
    paymentIntentId: string
  }) {
    const code = this.generateCode()
    const now = Timestamp.now()
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 year expiry

    const giftCard = {
      code,
      amount: giftCardData.amount,
      balance: giftCardData.amount,
      currency: giftCardData.currency,
      status: 'active',
      senderName: giftCardData.senderName,
      senderEmail: giftCardData.senderEmail,
      recipientEmail: giftCardData.recipientEmail,
      recipientName: giftCardData.recipientName || '',
      message: giftCardData.message || '',
      paymentIntentId: giftCardData.paymentIntentId,
      createdAt: now,
      expiresAt: Timestamp.fromDate(expiresAt),
      redemptions: [],
    }

    const docRef = await addDoc(collection(db, 'giftCards'), giftCard)
    return { id: docRef.id, ...giftCard }
  },

  // Validate and get gift card by code
  async validateGiftCard(code: string): Promise<{ valid: boolean; giftCard?: any; error?: string }> {
    try {
      const giftCardsRef = collection(db, 'giftCards')
      const q = query(giftCardsRef, where('code', '==', code.toUpperCase()))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return { valid: false, error: 'Gift card not found' }
      }

      const giftCardDoc = snapshot.docs[0]
      const giftCard = { id: giftCardDoc.id, ...giftCardDoc.data() } as any

      // Check if expired
      const expiresAt = giftCard.expiresAt?.toDate() || new Date()
      if (expiresAt < new Date()) {
        return { valid: false, error: 'Gift card has expired' }
      }

      // Check if fully redeemed
      if (giftCard.balance <= 0) {
        return { valid: false, error: 'Gift card has no remaining balance' }
      }

      // Check status
      if (giftCard.status !== 'active') {
        return { valid: false, error: 'Gift card is not active' }
      }

      return { valid: true, giftCard }
    } catch (error) {
      console.error('Error validating gift card:', error)
      return { valid: false, error: 'Error validating gift card' }
    }
  },

  // Redeem gift card (partial or full)
  async redeemGiftCard(
    giftCardId: string,
    amount: number,
    orderId: string,
    userId: string
  ): Promise<{ success: boolean; remainingBalance?: number; error?: string }> {
    try {
      const giftCardRef = doc(db, 'giftCards', giftCardId)
      const giftCardSnap = await getDoc(giftCardRef)

      if (!giftCardSnap.exists()) {
        return { success: false, error: 'Gift card not found' }
      }

      const giftCard = giftCardSnap.data()
      const currentBalance = giftCard.balance

      if (amount > currentBalance) {
        return { success: false, error: 'Insufficient gift card balance' }
      }

      const newBalance = currentBalance - amount
      const redemption = {
        orderId,
        userId,
        amount,
        remainingBalance: newBalance,
        timestamp: Timestamp.now(),
      }

      // Update gift card
      await updateDoc(giftCardRef, {
        balance: newBalance,
        redemptions: [...(giftCard.redemptions || []), redemption],
        ...(newBalance === 0 && {
          status: 'redeemed',
          redeemedAt: Timestamp.now(),
          redeemedBy: userId,
        }),
        updatedAt: Timestamp.now(),
      })

      return { success: true, remainingBalance: newBalance }
    } catch (error) {
      console.error('Error redeeming gift card:', error)
      return { success: false, error: 'Error redeeming gift card' }
    }
  },

  // Get gift card by code (for lookup)
  async getGiftCardByCode(code: string) {
    const giftCardsRef = collection(db, 'giftCards')
    const q = query(giftCardsRef, where('code', '==', code.toUpperCase()))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const giftCardDoc = snapshot.docs[0]
    return { id: giftCardDoc.id, ...giftCardDoc.data() }
  },
}

// Hook to fetch gift cards by email (for user to see their purchased/received cards)
export function useUserGiftCards(email: string | null, type: 'sent' | 'received' = 'received', realtime = false) {
  const field = type === 'sent' ? 'senderEmail' : 'recipientEmail'
  const constraints = email
    ? [where(field, '==', email), orderBy('createdAt', 'desc')]
    : []

  return useCollection('giftCards', constraints, realtime)
}
