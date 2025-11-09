import { useState } from 'react'
import type { Product, CartItem, DiscountCode, AppliedDiscount } from '../types/product'

// Sample discount codes - in a real app, these would come from a backend
const DISCOUNT_CODES: DiscountCode[] = [
  { code: 'WELCOME10', type: 'percentage', value: 10, description: '10% off your order' },
  { code: 'SAVE5', type: 'fixed', value: 5, description: '£5 off your order' },
  { code: 'COFFEE20', type: 'percentage', value: 20, description: '20% off your order' },
]

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null)

  const addToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id)

      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId)
      return
    }

    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const applyDiscount = (code: string): { success: boolean; message: string } => {
    const discountCode = DISCOUNT_CODES.find(
      d => d.code.toLowerCase() === code.toLowerCase()
    )

    if (!discountCode) {
      return { success: false, message: 'Invalid discount code' }
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    let discountAmount = 0
    if (discountCode.type === 'percentage') {
      discountAmount = (subtotal * discountCode.value) / 100
    } else {
      discountAmount = Math.min(discountCode.value, subtotal) // Don't discount more than subtotal
    }

    setAppliedDiscount({
      code: discountCode.code,
      amount: discountAmount,
      description: discountCode.description,
    })

    return { success: true, message: 'Discount applied successfully!' }
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = appliedDiscount?.amount || 0
  const total = Math.max(0, subtotal - discountAmount) // Ensure total doesn't go negative
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyDiscount,
    removeDiscount,
    appliedDiscount,
    subtotal,
    discountAmount,
    total,
    itemCount,
  }
}
