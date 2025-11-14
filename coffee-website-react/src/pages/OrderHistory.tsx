// src/pages/OrderHistory.tsx
// Display user's order history and enable repeat orders

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserOrders } from '../hooks/useFirestore'
import { useCart } from '../hooks/useCart'
import { useRepeatOrder } from '../hooks/useRepeatOrder'
import { OrderCard } from '../components/OrderCard'
import { AlertCircle, ShoppingBag, ArrowRight, Loader } from 'lucide-react'
import type { Order } from '../types/product'

export function OrderHistory() {
  const { currentUser, loading: authLoading } = useAuth()
  const { data: orders, loading: ordersLoading, error: ordersError } = useUserOrders(currentUser?.uid || null, true)
  const { addToCart } = useCart()
  const { repeatOrder, loading: repeatLoading } = useRepeatOrder(addToCart)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  const handleRepeatOrder = async (order: Order) => {
    const result = await repeatOrder(order)
    if (result.success) {
      setSuccessMessage(result.message)
      setErrorMessage(null)
    } else {
      setErrorMessage(result.message)
      setSuccessMessage(null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <Loader className="animate-spin text-amber-600" size={32} />
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-yellow-600" size={48} />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to view your order history and repeat your favorite orders.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium transition-colors">
              Sign In
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <Loader className="animate-spin text-amber-600" size={32} />
          </div>
        </div>
      </div>
    )
  }

  if (ordersError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Error Loading Orders</h2>
            <p className="text-gray-600">
              {ordersError.message || 'An error occurred while loading your orders.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const typedOrders = (orders as unknown as Order[]) || []

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">
            View your past orders and easily repeat your favorites.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Loading state for repeat order */}
        {repeatLoading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <Loader className="animate-spin text-blue-600" size={20} />
            <p className="text-blue-800 font-medium">Adding items to cart...</p>
          </div>
        )}

        {/* Empty state */}
        {typedOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 text-gray-400" size={48} />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to build your order history!
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium transition-colors"
            >
              Start Shopping
              <ArrowRight size={20} />
            </a>
          </div>
        ) : (
          <>
            {/* Orders grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {typedOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onRepeatClick={handleRepeatOrder}
                />
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg p-6 text-center">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{typedOrders.length}</span> order{typedOrders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
