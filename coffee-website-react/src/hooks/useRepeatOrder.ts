// src/hooks/useRepeatOrder.ts
// Hook for managing repeat order functionality

import { useState } from 'react'
import type { Order, OrderItem } from '../types/product'

interface RepeatOrderResult {
  success: boolean
  message: string
  addedItems?: OrderItem[]
}

export function useRepeatOrder(onAddToCart?: (product: any) => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const repeatOrder = async (order: Order): Promise<RepeatOrderResult> => {
    try {
      setLoading(true)
      setError(null)

      if (!order.items || order.items.length === 0) {
        return {
          success: false,
          message: 'This order has no items to repeat',
        }
      }

      // If callback is provided, add all items to cart
      if (onAddToCart) {
        order.items.forEach(item => {
          for (let i = 0; i < item.quantity; i++) {
            onAddToCart({
              id: item.id,
              name: item.name,
              price: item.price,
              weight: item.weight,
              category: item.category,
              description: '',
              image: '', // Will be populated by product grid
            })
          }
        })
      }

      return {
        success: true,
        message: `Successfully added ${order.items.length} item(s) to your cart`,
        addedItems: order.items,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to repeat order'
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    repeatOrder,
    loading,
    error,
  }
}
