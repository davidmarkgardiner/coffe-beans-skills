// src/components/OrderCard.tsx
// Display a single order in a card format

import { Link } from 'react-router-dom'
import { ShoppingCart, Calendar, Package, ChevronRight } from 'lucide-react'
import type { Order } from '../types/product'

interface OrderCardProps {
  order: Order
  onRepeatClick?: (order: Order) => void
}

export function OrderCard({ order, onRepeatClick }: OrderCardProps) {
  const createdDate = order.createdAt instanceof Date
    ? order.createdAt
    : new Date(order.createdAt)

  const formattedDate = createdDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const paymentStatusColors = {
    pending: 'text-yellow-600',
    paid: 'text-green-600',
    failed: 'text-red-600',
    refunded: 'text-orange-600',
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
      {/* Header with order ID and date */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="font-mono text-sm font-semibold text-gray-900">{order.id.slice(0, 12)}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-gray-600 mb-2">
            <Calendar size={16} />
            <span className="text-sm">{formattedDate}</span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Items preview */}
      <div className="border-t border-b border-gray-200 py-3 mb-4">
        <p className="text-sm text-gray-600 mb-2 font-medium">Items ({order.items.length})</p>
        <ul className="space-y-1">
          {order.items.slice(0, 3).map((item, idx) => (
            <li key={idx} className="text-sm text-gray-700">
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-500 ml-2">×{item.quantity}</span>
              <span className="text-gray-500 ml-2">£{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
          {order.items.length > 3 && (
            <li className="text-sm text-gray-500 italic">
              +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
            </li>
          )}
        </ul>
      </div>

      {/* Total and payment status */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">£{order.total.toFixed(2)}</p>
          <p className={`text-xs font-medium capitalize mt-1 ${paymentStatusColors[order.paymentStatus]}`}>
            Payment: {order.paymentStatus}
          </p>
        </div>
        {order.trackingNumber && (
          <div className="text-right">
            <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
              <Package size={14} />
              Tracking
            </p>
            <p className="font-mono text-xs text-gray-900">{order.trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link
          to={`/orders/${order.id}`}
          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          View Details
          <ChevronRight size={16} />
        </Link>
        {onRepeatClick && (
          <button
            onClick={() => onRepeatClick(order)}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            Repeat Order
          </button>
        )}
      </div>
    </div>
  )
}
