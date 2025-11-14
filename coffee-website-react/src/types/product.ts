export interface Product {
  id: string
  name: string
  description: string
  price: number
  weight: string
  category: string
  image: string
  badge?: string
}

export interface CartItem extends Product {
  quantity: number
}

// Discount Code Types
export interface DiscountCode {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  description?: string
}

export interface AppliedDiscount {
  code: string
  amount: number
  description?: string
}

// Gift Card Types
export interface GiftCard {
  id: string
  code: string
  amount: number            // Original amount in cents
  balance: number           // Remaining balance in cents
  currency: string          // "gbp" or "usd"
  status: 'active' | 'redeemed' | 'expired' | 'pending'

  // Sender info
  senderName: string
  senderEmail: string

  // Recipient info
  recipientEmail: string
  recipientName?: string
  message?: string

  // Metadata
  createdAt: Date
  expiresAt: Date

  // Payment info
  paymentIntentId: string
  purchaseOrderId?: string

  // Redemption tracking
  redeemedAt?: Date
  redeemedBy?: string
  redemptions: GiftCardRedemption[]
}

export interface GiftCardRedemption {
  orderId: string
  userId: string
  amount: number
  remainingBalance: number
  timestamp: Date
}

export interface GiftCardPurchaseData {
  amount: number
  senderName: string
  senderEmail: string
  recipientEmail: string
  recipientName?: string
  message?: string
}

export interface GiftCardValidation {
  valid: boolean
  giftCard?: GiftCard
  error?: string
}

// Order Types
export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  weight: string
  category: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress?: {
    name: string
    address: string
    city: string
    postcode: string
    country: string
  }
  createdAt: Date
  updatedAt?: Date
  paymentIntentId?: string
  trackingNumber?: string
}
