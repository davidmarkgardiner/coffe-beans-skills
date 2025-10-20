import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Product } from '../types/product'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    onAddToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="group"
    >
      <div className="relative rounded-2xl overflow-hidden bg-gradient-surface shadow-medium transition-all duration-300 hover:bg-gradient-surface-hover hover:shadow-large before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/70 before:content-['']">
        {/* Image */}
        <div className="relative h-64 overflow-hidden bg-grey-100">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-grey-200">
              <div className="w-full h-full bg-gradient-to-r from-grey-200 via-grey-300 to-grey-200" />
            </div>
          )}
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />

          {product.badge && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-coffee-700 text-white text-xs font-semibold tracking-wider uppercase rounded-full">
              {product.badge}
            </div>
          )}

          {/* Overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Add ${product.name} to cart`}
              className={`px-6 py-2 rounded-full font-semibold text-sm tracking-wide uppercase shadow-soft transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-surface text-coffee-700 hover:bg-gradient-surface-hover hover:shadow-medium'
              }`}
            >
              {added ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Added!
                </span>
              ) : (
                'Add to Cart'
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-grey-500 mb-2">
            {product.category}
          </p>

          <h3 className="font-display text-2xl font-semibold tracking-tight text-grey-900 mb-2">
            {product.name}
          </h3>

          <p className="text-sm text-grey-600 leading-relaxed mb-4">{product.description}</p>

          <div className="flex items-center justify-between pt-4 border-t border-grey-200">
            <span className="font-display text-3xl font-bold tracking-tight text-coffee-700">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-grey-500">{product.weight}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
