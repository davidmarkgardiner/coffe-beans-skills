import { motion } from 'framer-motion'
import { useState } from 'react'

interface ProductShowcaseProps {
  onAddToCart: (item: {
    format: 'whole' | 'ground'
    size: '250g' | '1kg'
    quantity: number
    price: number
  }) => void
}

const prices = {
  '250g': 8.50,
  '1kg': 28.00,
}

export function ProductShowcase({ onAddToCart }: ProductShowcaseProps) {
  const [format, setFormat] = useState<'whole' | 'ground'>('whole')
  const [size, setSize] = useState<'250g' | '1kg'>('250g')
  const [quantity, setQuantity] = useState(1)

  const currentPrice = prices[size]
  const totalPrice = (currentPrice * quantity).toFixed(2)

  const handleAddToCart = () => {
    onAddToCart({
      format,
      size,
      quantity,
      price: parseFloat(totalPrice),
    })
  }

  return (
    <section className="py-20 bg-surface" id="products">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-16 lg:mb-24"
        >
          {/* Label Badge */}
          <span className="inline-block px-4 py-1.5 bg-background border border-heading/10 rounded-full text-xs font-sans font-medium text-text/70 tracking-wider uppercase mb-6">
            Our Collection
          </span>

          {/* Title */}
          <h2 className="text-5xl lg:text-6xl font-serif font-semibold text-heading mb-6">
            Today's Offering
          </h2>

          {/* Description */}
          <p className="text-lg font-sans text-text/70 leading-relaxed">
            We believe in doing one thing extraordinarily well. Our single-origin coffee is carefully
            selected, expertly roasted, and available in your preferred format.
          </p>
        </motion.div>

        {/* Product Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Product Visual (Left Column) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] bg-gradient-to-br from-heading/5 to-accent/5 rounded-3xl overflow-hidden">
              {/* Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute top-6 right-6 z-10"
              >
                <div className="px-4 py-2 bg-background border border-heading/20 rounded-full shadow-lg">
                  <span className="text-xs font-sans font-medium text-heading tracking-wider uppercase">
                    Single Origin
                  </span>
                </div>
              </motion.div>

              {/* Coffee bag illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="relative w-64 h-80"
                >
                  {/* Bag shape */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-dark/10 to-accent-dark/20 border-2 border-heading/20 rounded-2xl shadow-xl" />

                  {/* Top seal */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-accent/20 border-2 border-heading/20 rounded-t-2xl" />

                  {/* Logo circle */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent-light/30 to-accent/30 flex items-center justify-center border-2 border-heading/20 shadow-lg">
                      <span className="text-6xl font-logo font-bold text-heading/60">S</span>
                    </div>
                  </div>

                  {/* Label section */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="px-4 py-2 bg-background/80 backdrop-blur-sm border border-heading/10 rounded-lg">
                      <p className="text-xs font-sans font-semibold text-heading tracking-wider">
                        STOCKBRIDGE
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Decorative blur element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-accent-light/10 rounded-full blur-3xl -z-10" />
          </motion.div>

          {/* Product Details (Right Column) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="space-y-8"
          >
            {/* Product Info */}
            <div>
              <h3 className="text-4xl font-serif font-semibold text-heading mb-2">
                Stockbridge Signature
              </h3>
              <p className="text-xl font-sans text-accent font-medium">
                Ethiopian Yirgacheffe
              </p>
            </div>

            {/* Tasting Notes */}
            <div>
              <span className="text-sm font-sans font-medium text-text/60 tracking-wider uppercase mb-3 block">
                Tasting Notes
              </span>
              <div className="flex flex-wrap gap-2">
                {['Floral', 'Citrus', 'Honey', 'Tea-like'].map((note, index) => (
                  <motion.span
                    key={note}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + 0.1 * index, duration: 0.5 }}
                    className="px-4 py-2 bg-background border border-heading/10 rounded-full text-sm font-sans text-heading"
                  >
                    {note}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-base font-sans text-text/70 leading-relaxed">
              A bright, clean coffee with delicate floral aromatics and vibrant citrus acidity.
              This naturally processed Ethiopian coffee delivers a tea-like body with sweet honey
              notes that linger beautifully on the palate.
            </p>

            {/* Specifications Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Altitude', value: '1,800-2,000m' },
                { label: 'Process', value: 'Washed' },
                { label: 'Roast', value: 'Light-Medium' },
              ].map((spec, index) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + 0.1 * index, duration: 0.5 }}
                  className="p-4 bg-background border border-heading/10 rounded-xl"
                >
                  <span className="text-xs font-sans text-text/50 tracking-wider uppercase block mb-1">
                    {spec.label}
                  </span>
                  <span className="text-sm font-sans font-medium text-heading">
                    {spec.value}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Format Selection */}
            <div>
              <label className="text-sm font-sans font-medium text-text/70 tracking-wider uppercase mb-3 block">
                Format
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'whole', label: 'Whole Bean' },
                  { value: 'ground', label: 'Ground' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormat(option.value as 'whole' | 'ground')}
                    className={`flex-1 px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                      format === option.value
                        ? 'bg-heading text-background border-heading'
                        : 'bg-background text-heading border-heading/20 hover:border-heading/40'
                    }`}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="text-sm font-sans font-medium text-text/70 tracking-wider uppercase mb-3 block">
                Size
              </label>
              <div className="flex gap-3">
                {[
                  { value: '250g', price: 8.50 },
                  { value: '1kg', price: 28.00 },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSize(option.value as '250g' | '1kg')}
                    className={`flex-1 px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                      size === option.value
                        ? 'bg-heading text-background border-heading'
                        : 'bg-background text-heading border-heading/20 hover:border-heading/40'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-medium">{option.value}</span>
                      <span className="text-xs opacity-70">£{option.price.toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4 px-6 py-3 bg-background border border-heading/20 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-heading hover:text-accent transition-colors"
                  aria-label="Decrease quantity"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>

                <span className="text-lg font-medium text-heading w-8 text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-heading hover:text-accent transition-colors"
                  aria-label="Increase quantity"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 px-8 py-4 bg-heading text-background rounded-xl hover:bg-heading/90 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Add to Cart</span>
                  <span className="text-lg font-semibold">£{totalPrice}</span>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
