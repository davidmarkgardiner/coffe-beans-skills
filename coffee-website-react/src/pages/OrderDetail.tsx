// src/pages/OrderDetail.tsx
// Display detailed information about a specific order

import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDocument } from '../hooks/useFirestore'
import { useCart } from '../hooks/useCart'
import { useRepeatOrder } from '../hooks/useRepeatOrder'
import { AlertCircle, ArrowLeft, ShoppingCart, Calendar, MapPin, Truck, Loader } from 'lucide-react'
import type { Order } from '../types/product'
import { useState, useEffect } from 'react'

export function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { currentUser, loading: authLoading } = useAuth()
  const { data: order, loading: orderLoading, error: orderError } = useDocument<Order>('orders', orderId || null)
  const { addToCart } = useCart()
  const { repeatOrder, loading: repeatLoading } = useRepeatOrder(addToCart)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  const handleRepeatOrder = async () => {
    if (!order) return

    const result = await repeatOrder(order as Order)
    if (result.success) {
      setSuccessMessage(result.message)
      setErrorMessage(null)
    } else {
      setErrorMessage(result.message)
      setSuccessMessage(null)
    }
  }

  if (authLoading || orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
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
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-yellow-600" size={48} />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Sign In Required</h2>
            <p className="text-gray-600">Please log in to view order details.</p>
          </div>
        </div>
      </div>
    )
  }

  if (orderError || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              {orderError?.message || 'The order you are looking for does not exist.'}
            </p>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium transition-colors"
            >
              Back to Order History
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check if user owns this order
  if (order.userId !== currentUser.uid) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Unauthorized</h2>
            <p className="text-gray-600">You do not have permission to view this order.</p>
          </div>
        </div>
      </div>
    )
  }

  const createdDate = order.createdAt instanceof Date
    ? order.createdAt
    : new Date(order.createdAt)

  const formattedDate = createdDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>

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

        {/* Order Header */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
              <p className="text-gray-600 font-mono text-sm">{order.id}</p>
            </div>
            <span className={`inline-block px-4 py-2 rounded-lg font-medium capitalize mt-4 md:mt-0 ${statusColors[order.status]}`}>
              {order.status}
            </span>
          </div>

          {/* Order metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Order Date</p>
              <div className="flex items-center gap-2 text-gray-900">
                <Calendar size={16} />
                <span>{formattedDate}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">£{order.total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Items</p>
              <p className="text-xl font-bold text-gray-900">{order.items.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Payment Status</p>
              <p className="text-sm font-medium capitalize text-gray-900">{order.paymentStatus}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.weight} • {item.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">×{item.quantity}</p>
                    <p className="text-lg font-bold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>£{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span>£{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={20} className="text-gray-900" />
                  <h3 className="font-bold text-gray-900">Shipping Address</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.postcode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck size={20} className="text-gray-900" />
                  <h3 className="font-bold text-gray-900">Tracking Number</h3>
                </div>
                <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                  {order.trackingNumber}
                </p>
              </div>
            )}

            {/* Repeat Order Button */}
            <button
              onClick={handleRepeatOrder}
              disabled={repeatLoading}
              className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              {repeatLoading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  Repeat Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
