import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Product } from '../types/product'

interface ProductDetailProps {
  product: Product
  onAddToCart: (product: Product) => void
  onClose: () => void
}

// Coffee roast variants
const roastVariants = [
  {
    id: 'light',
    name: 'Calm',
    roast: 'Light Roast',
    description: 'Delicate and bright with subtle sweetness',
    imageBg: 'from-amber-100/80 to-yellow-50/80',
  },
  {
    id: 'medium',
    name: 'Daily',
    roast: 'Medium Roast',
    description: 'Balanced and smooth, perfect for every day',
    imageBg: 'from-amber-700/20 to-orange-700/20',
  },
  {
    id: 'bold',
    name: 'Bold',
    roast: 'Medium-Dark Roast',
    description: 'Rich and robust with deep complexity',
    imageBg: 'from-amber-900/30 to-stone-900/30',
  },
]

export function ProductDetail({ product, onAddToCart, onClose }: ProductDetailProps) {
  const [selectedRoast, setSelectedRoast] = useState('medium')
  const [purchaseType, setPurchaseType] = useState<'one-time' | 'subscribe'>('subscribe')
  const [quantity, setQuantity] = useState(1)
  const [deliveryFrequency, setDeliveryFrequency] = useState('every-2-weeks')

  const subscriptionPrice = product.price * 0.9 // 10% off for subscription
  // const currentPrice = purchaseType === 'subscribe' ? subscriptionPrice : product.price
  // const savings = product.price - subscriptionPrice

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-background rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left side - Product imagery */}
          <div className="bg-surface/50 p-8 lg:p-12 flex flex-col gap-6">
            {/* Main product image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-surface to-background shadow-xl"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Secondary lifestyle images */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="aspect-square rounded-xl overflow-hidden shadow-lg"
              >
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80"
                  alt="Brewing coffee"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="aspect-square rounded-xl overflow-hidden shadow-lg"
              >
                <img
                  src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80"
                  alt="Coffee beans"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </div>
          </div>

          {/* Right side - Product details */}
          <div className="p-8 lg:p-12 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Category badge */}
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-3">
                {product.category}
              </p>

              {/* Product name */}
              <h2 className="font-serif text-5xl md:text-6xl font-bold text-heading mb-4 leading-[1.1]">
                {product.name}
              </h2>

              {/* Subtitle */}
              <div className="flex items-center gap-2 text-base text-text/70 mb-6">
                <span>Balanced</span>
                <span className="text-accent">•</span>
                <span>Smooth</span>
                <span className="text-accent">•</span>
                <span>Versatile</span>
              </div>

              {/* Description */}
              <p className="text-lg text-text/80 leading-relaxed mb-10">
                {product.description} Whether it's work, journaling, or your second cup before noon, this one's your go-to.
              </p>

              {/* Roast selection */}
              <div className="mb-10">
                <h3 className="font-serif text-2xl font-semibold text-heading mb-6">Select Your Roast</h3>
                <div className="grid grid-cols-3 gap-4">
                  {roastVariants.map((variant, index) => (
                    <motion.button
                      key={variant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => setSelectedRoast(variant.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedRoast === variant.id
                          ? 'border-accent-dark bg-accent-dark/5 shadow-md scale-105'
                          : 'border-surface hover:border-accent/50 bg-white/50'
                      }`}
                    >
                      {/* Mini coffee bag illustration */}
                      <div className={`aspect-[3/4] rounded-lg bg-gradient-to-br ${variant.imageBg} mb-3 flex items-center justify-center overflow-hidden`}>
                        <div className={`w-16 h-20 rounded ${selectedRoast === variant.id ? 'bg-accent-dark' : 'bg-accent'} flex items-center justify-center`}>
                          <div className="w-12 h-14 rounded border-2 border-background/30 flex flex-col items-center justify-center p-1">
                            <div className="text-[8px] font-bold text-background leading-tight text-center">
                              {variant.name.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-semibold text-heading text-sm mb-1">{variant.name}</h4>
                      <p className="text-xs text-text/60">{variant.roast}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Purchase options */}
              <div className="space-y-4 mb-8">
                {/* One-time purchase */}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setPurchaseType('one-time')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
                    purchaseType === 'one-time'
                      ? 'border-accent-dark bg-accent-dark/5'
                      : 'border-grey-200 hover:border-accent/50 bg-white/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      purchaseType === 'one-time' ? 'border-accent-dark' : 'border-grey-400'
                    }`}>
                      {purchaseType === 'one-time' && (
                        <div className="w-3 h-3 rounded-full bg-accent-dark" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-heading">One time purchase</p>
                      <p className="text-sm text-text/60">{product.weight}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-heading">£{product.price.toFixed(2)}</p>
                </motion.button>

                {/* Subscribe */}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => setPurchaseType('subscribe')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
                    purchaseType === 'subscribe'
                      ? 'border-accent-dark bg-accent-dark/5'
                      : 'border-grey-200 hover:border-accent/50 bg-white/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      purchaseType === 'subscribe' ? 'border-accent-dark' : 'border-grey-400'
                    }`}>
                      {purchaseType === 'subscribe' && (
                        <div className="w-3 h-3 rounded-full bg-accent-dark" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-heading">Subscribe</p>
                      <p className="text-sm text-text/60">{product.weight}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text/60 line-through">£{product.price.toFixed(2)}</p>
                    <p className="text-xl font-bold text-accent-dark">£{subscriptionPrice.toFixed(2)}</p>
                  </div>
                </motion.button>

                {/* Delivery frequency dropdown - only show if subscribe is selected */}
                {purchaseType === 'subscribe' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <select
                      value={deliveryFrequency}
                      onChange={(e) => setDeliveryFrequency(e.target.value)}
                      className="w-full p-4 rounded-xl border-2 border-grey-200 bg-white/50 text-heading font-medium focus:outline-none focus:border-accent-dark transition-colors"
                    >
                      <option value="every-week">Deliver every week</option>
                      <option value="every-2-weeks">Deliver every 2 weeks</option>
                      <option value="every-month">Deliver every month</option>
                      <option value="every-6-weeks">Deliver every 6 weeks</option>
                    </select>
                  </motion.div>
                )}
              </div>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-between text-sm text-text/70 py-4 border-y border-grey-200 mb-8"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>Free shipping on orders over $25</span>
                </div>
                {purchaseType === 'subscribe' && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Save 10%</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Cancel or skip anytime</span>
                </div>
              </motion.div>

              {/* Quantity and Add to Cart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-4"
              >
                {/* Quantity selector */}
                <div className="flex items-center border-2 border-grey-200 rounded-xl overflow-hidden bg-white/50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-surface transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-6 py-3 font-semibold text-heading min-w-[4rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-surface transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Add to cart button */}
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex-1 py-4 px-8 bg-accent-dark text-background font-semibold rounded-xl hover:bg-accent-dark/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  Add to cart
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
