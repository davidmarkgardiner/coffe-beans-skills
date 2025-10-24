import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { ProductCard } from './ProductCard'
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
          <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-4">
            Our Collection
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-heading mb-6">
            Stockbridge Coffee Beans
          </h2>
          <p className="text-lg text-text max-w-2xl mx-auto leading-relaxed">
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
          <p className="text-text mb-6">
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
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
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
              className="mt-4 px-6 py-2 rounded-full bg-accent text-white font-semibold hover:bg-accent-hover transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
