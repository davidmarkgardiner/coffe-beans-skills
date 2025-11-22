import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Product } from '../types/product'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onViewDetails?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [added, setAdded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API call
      onAddToCart(product)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="group cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="relative rounded-2xl overflow-hidden bg-white/60 backdrop-blur-sm shadow-medium transition-all duration-300 hover:shadow-large border border-surface/50 hover:border-accent/20">
        {/* Image */}
        <div className="relative h-80 overflow-hidden bg-surface/30">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-surface/50">
              <div className="w-full h-full bg-gradient-to-br from-surface via-accent-light/20 to-surface" />
            </div>
          )}
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />

          {product.badge && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-accent-dark text-background text-xs font-semibold tracking-[0.15em] uppercase rounded-md shadow-lg">
              {product.badge}
            </div>
          )}

          {/* Quick add button on hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 right-4"
          >
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                handleAddToCart()
              }}
              disabled={isLoading || added}
              whileHover={!isLoading && !added ? { scale: 1.05 } : {}}
              whileTap={!isLoading && !added ? { scale: 0.95 } : {}}
              aria-label={`Add ${product.name} to cart`}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm shadow-xl transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed ${
                isLoading
                  ? 'bg-accent-dark text-background'
                  : added
                  ? 'bg-green-600 text-white'
                  : 'bg-accent-dark text-background hover:bg-accent-dark/90'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding
                </span>
              ) : added ? (
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
                  Added
                </span>
              ) : (
                'Quick Add'
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-2">
            {product.category}
          </p>

          <h3 className="font-serif text-3xl font-bold text-heading mb-3 leading-tight">
            {product.name}
          </h3>

          <p className="text-base text-text/70 leading-relaxed mb-5">{product.description}</p>

          <div className="flex items-baseline justify-between pt-4 border-t border-grey-200">
            <div>
              <span className="font-serif text-4xl font-bold text-heading">
                £{product.price.toFixed(2)}
              </span>
              <span className="text-sm text-text/50 ml-2">/ {product.weight}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleViewDetails()
              }}
              className="text-sm font-medium text-accent-dark hover:text-accent transition-colors flex items-center gap-1 group"
            >
              View Details
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
