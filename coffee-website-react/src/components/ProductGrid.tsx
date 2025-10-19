import { motion } from 'framer-motion'
import { ProductCard } from './ProductCard'
import type { Product } from '../types/product'

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <section className="py-20 bg-white" id="products">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-coffee-700 mb-4">
            Our Collection
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-grey-900 mb-6">
            Premium Coffee Beans
          </h2>
          <p className="text-lg text-grey-600 max-w-2xl mx-auto leading-relaxed">
            Each blend is carefully crafted to deliver a unique and memorable coffee experience.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
