import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

interface ProductFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

const categories = ['All', 'Single Origin', 'Signature Blend', 'Espresso', 'Decaffeinated']
const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
]

export function ProductFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search coffee..."
            aria-label="Search products"
            className="w-full pl-12 pr-4 py-3 rounded-full border border-grey-200 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-700 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort products"
          className="px-4 py-3 rounded-full border border-grey-200 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-700 focus:border-transparent transition-all duration-200 cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => onCategoryChange(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2 ${
              selectedCategory === category
                ? 'bg-coffee-700 text-white shadow-medium'
                : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
            }`}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
