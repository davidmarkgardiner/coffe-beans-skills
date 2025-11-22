import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { ProductCard } from './ProductCard'
import { ProductDetail } from './ProductDetail'
import { ProductFilters } from './ProductFilters'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('default')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Sort
    const sorted = [...filtered]
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    return sorted
  }, [products, searchTerm, selectedCategory, sortBy])

  return (
    <>
      <section className="py-20 bg-surface" id="products">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4">
              Our Collection
            </p>
            <h2 className="font-logo text-5xl md:text-6xl font-bold text-heading mb-6 leading-tight">
              STOCKBRIDGE COFFEE
            </h2>
            <p className="text-lg text-text/70 max-w-2xl mx-auto leading-relaxed">
              Each blend is carefully crafted to deliver a unique and memorable coffee experience.
            </p>
          </motion.div>

          {/* Filters */}
          <ProductFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Results count */}
          {filteredAndSortedProducts.length > 0 && (
            <p className="text-text/60 mb-6 text-sm">
              Showing {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product' : 'products'}
            </p>
          )}

          {/* Grid */}
          {filteredAndSortedProducts.length > 0 ? (
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onViewDetails={setSelectedProduct}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text text-lg">No products found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('All')
                  setSortBy('default')
                }}
                className="mt-4 px-6 py-3 rounded-xl bg-accent-dark text-background font-semibold hover:bg-accent-dark/90 transition-all duration-200 shadow-lg"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onAddToCart={onAddToCart}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
