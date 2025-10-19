import { motion } from 'framer-motion'
import type { Product } from '../types/product'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="group"
    >
      <div className="bg-white rounded-2xl overflow-hidden border border-grey-200 shadow-soft hover:shadow-large transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-64 overflow-hidden bg-grey-100">
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
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
            className="absolute inset-0 bg-black/70 flex items-center justify-center"
          >
            <motion.button
              onClick={() => onAddToCart(product)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-white text-coffee-700 hover:bg-grey-100 font-semibold text-sm tracking-wide uppercase rounded-full transition-colors duration-200"
            >
              Add to Cart
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
