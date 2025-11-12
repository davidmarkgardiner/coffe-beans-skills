import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'react-hot-toast'

interface Order {
  id: string
  customerEmail: string
  status: string
  paymentStatus: string
  total: number
  currency: string
  items: any[]
  createdAt: string
  trackingNumber?: string
}

interface Stats {
  totalRevenue: number
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  totalOrders: number
  todayOrders: number
  weekOrders: number
  monthOrders: number
  pendingOrders: number
  averageOrderValue: number
}

interface Product {
  id: string
  name: string
  stock: number
  price: number
}

interface InventoryLog {
  id: string
  productName: string
  previousStock: number
  newStock: number
  change: number
  reason: string
  timestamp: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function AdminDashboard() {
  const { currentUser, userRole } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory'>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)

  // Redirect if not admin
  if (!currentUser || userRole !== 'admin') {
    return <Navigate to="/" replace />
  }

  // Fetch admin data
  useEffect(() => {
    fetchAdminData()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchAdminData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch stats and low stock products
      const statsRes = await fetch(`${API_URL}/api/admin/stats`)
      const statsData = await statsRes.json()
      setStats(statsData.stats)
      setLowStockProducts(statsData.lowStockProducts)
      setNotificationCount(statsData.unreadNotifications)

      // Fetch orders
      const ordersRes = await fetch(`${API_URL}/api/admin/orders?limit=50`)
      const ordersData = await ordersRes.json()
      setOrders(ordersData.orders)

      // Fetch inventory logs
      const logsRes = await fetch(`${API_URL}/api/admin/inventory-logs?limit=50`)
      const logsData = await logsRes.json()
      setInventoryLogs(logsData.logs)

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      toast.error('Failed to load dashboard data')
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber }),
      })

      if (!res.ok) throw new Error('Failed to update order')

      toast.success(`Order ${status}`)
      fetchAdminData()
      setSelectedOrder(null)
    } catch (error) {
      toast.error('Failed to update order')
    }
  }

  const adjustInventory = async (productId: string, quantity: number, reason: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/inventory/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, reason }),
      })

      if (!res.ok) throw new Error('Failed to adjust inventory')

      toast.success('Inventory updated')
      fetchAdminData()
    } catch (error) {
      toast.error('Failed to adjust inventory')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-heading text-2xl font-heading">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text pt-24 pb-12">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-heading mb-2 text-heading">Admin Dashboard</h1>
          <p className="text-accent-dark text-lg">Manage orders, inventory, and view analytics</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-surface">
          {(['overview', 'orders', 'inventory'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize transition-colors relative ${
                activeTab === tab
                  ? 'text-accent-light'
                  : 'text-accent hover:text-heading'
              }`}
            >
              {tab}
              {tab === 'orders' && notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-light"
                />
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Today's Revenue"
                value={`£${stats.todayRevenue.toFixed(2)}`}
                subtitle={`${stats.todayOrders} orders`}
                trend={stats.todayRevenue > 0 ? 'up' : 'neutral'}
              />
              <StatCard
                title="This Week"
                value={`£${stats.weekRevenue.toFixed(2)}`}
                subtitle={`${stats.weekOrders} orders`}
                trend="up"
              />
              <StatCard
                title="This Month"
                value={`£${stats.monthRevenue.toFixed(2)}`}
                subtitle={`${stats.monthOrders} orders`}
                trend="up"
              />
              <StatCard
                title="Avg Order Value"
                value={`£${stats.averageOrderValue.toFixed(2)}`}
                subtitle={`${stats.totalOrders} total orders`}
                trend="neutral"
              />
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
              <div className="bg-surface rounded-lg p-6 shadow-medium border border-accent/20">
                <h2 className="text-2xl font-heading mb-4 text-red-600">⚠️ Low Stock Alerts</h2>
                <div className="space-y-3">
                  {lowStockProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-background rounded-lg shadow-soft border border-accent/10"
                    >
                      <div>
                        <p className="font-semibold text-heading">{product.name}</p>
                        <p className="text-sm text-accent">
                          Only {product.stock} units remaining
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const qty = prompt('Add quantity:')
                          if (qty) adjustInventory(product.id, parseInt(qty), 'restock')
                        }}
                        className="px-4 py-2 bg-accent-light hover:bg-accent text-white rounded-lg transition-colors shadow-soft font-semibold"
                      >
                        Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-surface rounded-lg p-6 shadow-medium border border-accent/20">
              <h2 className="text-2xl font-heading mb-4 text-heading">Recent Activity</h2>
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg shadow-soft border border-accent/10 hover:shadow-medium transition-all cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div>
                      <p className="font-semibold text-heading">{order.customerEmail}</p>
                      <p className="text-sm text-accent">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent-light text-lg">
                        £{order.total.toFixed(2)}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-lg p-6 shadow-medium border border-accent/20"
          >
            <h2 className="text-2xl font-heading mb-4 text-heading">All Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-accent/30">
                    <th className="text-left py-3 px-4 text-heading font-semibold">Order ID</th>
                    <th className="text-left py-3 px-4 text-heading font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 text-heading font-semibold">Items</th>
                    <th className="text-left py-3 px-4 text-heading font-semibold">Total</th>
                    <th className="text-left py-3 px-4 text-heading font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-heading font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-heading font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr
                      key={order.id}
                      className="border-b border-accent/20 hover:bg-background transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-sm text-accent">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-text">{order.customerEmail}</td>
                      <td className="py-3 px-4 text-text">{order.items.length} items</td>
                      <td className="py-3 px-4 font-bold text-accent-light">
                        £{order.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-sm text-accent">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-accent-light hover:text-heading text-sm font-semibold transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-lg p-6 shadow-medium border border-accent/20"
          >
            <h2 className="text-2xl font-heading mb-4 text-heading">Inventory History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-accent/30">
                    <th className="text-left py-3 px-4 text-heading font-semibold">Product</th>
                    <th className="text-left py-3 px-4 text-heading font-semibold">Previous</th>
                    <th className="text-left py-3 px-4 text-heading font-semibold">Change</th>
                    <th className="text-left py-3 px-4 text-heading font-semibold">New Stock</th>
                    <th className="text-left py-3 px-4 text-heading font-semibold">Reason</th>
                    <th className="text-left py-3 px-4 text-heading font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryLogs.map(log => (
                    <tr
                      key={log.id}
                      className="border-b border-accent/20 hover:bg-background transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-heading">{log.productName}</td>
                      <td className="py-3 px-4 text-text">{log.previousStock}</td>
                      <td className={`py-3 px-4 font-bold ${
                        log.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {log.change > 0 ? '+' : ''}{log.change}
                      </td>
                      <td className="py-3 px-4 text-text">{log.newStock}</td>
                      <td className="py-3 px-4 capitalize text-accent">
                        {log.reason.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-sm text-accent">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Order Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <OrderDetailModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onUpdateStatus={updateOrderStatus}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  trend,
}: {
  title: string
  value: string
  subtitle: string
  trend: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="bg-surface rounded-lg p-6 shadow-medium border border-accent/20 hover:shadow-large transition-all">
      <p className="text-accent text-sm mb-2 font-semibold">{title}</p>
      <p className="text-3xl font-bold mb-1 text-heading">{value}</p>
      <div className="flex items-center gap-2">
        {trend === 'up' && <span className="text-green-600 text-lg">↑</span>}
        {trend === 'down' && <span className="text-red-600 text-lg">↓</span>}
        <p className="text-accent-dark text-sm">{subtitle}</p>
      </div>
    </div>
  )
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    processing: 'bg-blue-500/20 text-blue-500',
    shipped: 'bg-purple-500/20 text-purple-500',
    delivered: 'bg-green-500/20 text-green-500',
    cancelled: 'bg-red-500/20 text-red-500',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status as keyof typeof colors] || colors.pending}`}>
      {status}
    </span>
  )
}

// Order Detail Modal Component
function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: Order
  onClose: () => void
  onUpdateStatus: (orderId: string, status: string, trackingNumber?: string) => void
}) {
  const [newStatus, setNewStatus] = useState(order.status)
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-heading/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-xl border border-accent/30"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-heading text-heading">Order Details</h2>
            <p className="text-accent text-sm mt-1">ID: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-accent hover:text-heading text-3xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-heading text-lg">Customer</h3>
          <p className="text-text">{order.customerEmail}</p>
          <p className="text-sm text-accent mt-1">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-heading text-lg">Items</h3>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between p-3 bg-surface rounded shadow-soft border border-accent/10">
                <div>
                  <p className="font-medium text-heading">{item.name}</p>
                  <p className="text-sm text-accent">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold text-accent-light">£{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mb-6 pb-6 border-b border-accent/30">
          <div className="flex justify-between text-xl font-bold">
            <span className="text-heading">Total</span>
            <span className="text-accent-light">£{order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Status Update */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-heading">Update Status</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="w-full bg-surface border border-accent/30 rounded-lg px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-accent-light"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {(newStatus === 'shipped' || newStatus === 'delivered') && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-heading">Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full bg-surface border border-accent/30 rounded-lg px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-accent-light"
              />
            </div>
          )}

          <button
            onClick={() => onUpdateStatus(order.id, newStatus, trackingNumber)}
            className="w-full bg-accent-light hover:bg-accent text-white font-semibold py-3 rounded-lg transition-colors shadow-medium"
          >
            Update Order
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
