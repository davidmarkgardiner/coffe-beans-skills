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
    <section className="py-20 bg-surface" id="products" aria-label="Coffee products">
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
          <h2 className="text-5xl lg:text-6xl font-serif font-semibold text-heading mb-6 tracking-normal">
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
            whileHover={{ scale: 1.02 }}
            className="relative group"
          >
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover-lift">
              {/* Rotating bag video */}
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/video/rotating-bag.mp4" type="video/mp4" />
              </video>

              {/* Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ scale: 1.1, rotate: 2 }}
                className="absolute top-6 right-6 z-10"
              >
                <div className="px-4 py-2 bg-background/90 backdrop-blur-sm border border-heading/20 rounded-full shadow-lg group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                  <span className="text-xs font-sans font-medium text-heading group-hover:text-background tracking-wider uppercase transition-colors duration-300">
                    Single Origin
                  </span>
                </div>
              </motion.div>

              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-heading/20 via-transparent to-transparent group-hover:from-heading/10 transition-all duration-500" />

              {/* Animated overlay on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            </div>

            {/* Decorative blur element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-accent-light/10 rounded-full blur-3xl -z-10 group-hover:bg-accent-light/20 transition-all duration-500" />
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
                    whileHover={{ scale: 1.1, y: -3 }}
                    className="px-4 py-2 bg-background border border-heading/10 rounded-full text-sm font-sans text-heading hover:bg-accent hover:text-background hover:border-accent cursor-pointer transition-all duration-300 hover-lift"
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
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="p-4 bg-background border border-heading/10 rounded-xl hover:bg-accent/5 hover:border-accent/30 hover:shadow-md transition-all duration-300 hover-lift cursor-pointer group"
                >
                  <span className="text-xs font-sans text-text/50 tracking-wider uppercase block mb-1 group-hover:text-accent transition-colors duration-300">
                    {spec.label}
                  </span>
                  <span className="text-sm font-sans font-medium text-heading group-hover:text-accent transition-colors duration-300">
                    {spec.value}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Format Selection - Enhanced with micro-interactions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label
                id="format-label"
                className="text-sm font-sans font-medium text-text/60 tracking-[0.2em] uppercase mb-4 block"
              >
                Format
              </label>
              <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="format-label">
                {[
                  { value: 'whole', label: 'Whole Bean', icon: '◯' },
                  { value: 'ground', label: 'Ground', icon: '◐' },
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => setFormat(option.value as 'whole' | 'ground')}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`group relative px-6 py-4 rounded-xl border-2 transition-all duration-300 overflow-hidden hover-lift ${
                      format === option.value
                        ? 'bg-heading text-background border-heading shadow-lg'
                        : 'bg-white/60 text-heading border-heading/15 hover:border-heading/30 hover:shadow-md'
                    }`}
                    aria-pressed={format === option.value}
                    aria-label={`Select ${option.label} format`}
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-semibold">{option.label}</span>
                    </div>
                    {/* Subtle background effect */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                      format === option.value ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-heading/5 to-transparent" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Size Selection - Enhanced visual hierarchy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <label
                id="size-label"
                className="text-sm font-sans font-medium text-text/60 tracking-[0.2em] uppercase mb-4 block"
              >
                Size & Price
              </label>
              <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="size-label">
                {[
                  { value: '250g', price: 8.50, label: 'Small Batch' },
                  { value: '1kg', price: 28.00, label: 'Value Pack' },
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => setSize(option.value as '250g' | '1kg')}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`group relative px-6 py-5 rounded-xl border-2 transition-all duration-300 overflow-hidden hover-lift ${
                      size === option.value
                        ? 'bg-heading text-background border-heading shadow-lg'
                        : 'bg-white/60 text-heading border-heading/15 hover:border-heading/30 hover:shadow-md'
                    }`}
                    aria-pressed={size === option.value}
                    aria-label={`Select ${option.value} - £${option.price.toFixed(2)}`}
                  >
                    <div className="relative z-10">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-base font-bold">{option.value}</span>
                        <span className={`text-xs font-medium tracking-wide ${
                          size === option.value ? 'opacity-80' : 'opacity-60'
                        }`}>
                          {option.label}
                        </span>
                        <span className={`text-lg font-bold mt-1 ${
                          size === option.value ? 'text-background' : 'text-accent-dark'
                        }`}>
                          £{option.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {/* Animated background */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                      size === option.value ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Quantity & Add to Cart - Premium feel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex gap-4 pt-4"
            >
              {/* Quantity Selector - Enhanced design */}
              <div className="flex items-center gap-5 px-7 py-4 bg-white/60 border border-heading/15 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-heading hover:text-accent transition-colors"
                  aria-label="Decrease quantity"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                </motion.button>

                <span className="text-xl font-bold text-heading w-10 text-center tabular-nums">
                  {quantity}
                </span>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-heading hover:text-accent transition-colors"
                  aria-label="Increase quantity"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </motion.button>
              </div>

              {/* Add to Cart Button - Premium CTA */}
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.96 }}
                className="flex-1 px-8 py-4 bg-gradient-to-br from-heading to-heading/90 text-background rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group relative overflow-hidden hover-lift focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                aria-label={`Add ${quantity} ${format} ${size} coffee to cart for £${totalPrice}`}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                {/* Pulsing glow effect on hover */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{
                    boxShadow: [
                      '0 0 0px rgba(168, 145, 117, 0)',
                      '0 0 20px rgba(168, 145, 117, 0.4)',
                      '0 0 0px rgba(168, 145, 117, 0)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <div className="relative flex items-center justify-between">
                  <motion.span
                    className="text-base font-semibold tracking-wide"
                    animate={{ x: [0, 2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Add to Cart
                  </motion.span>
                  <motion.div
                    className="flex items-baseline gap-1"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-xs opacity-70">£</span>
                    <span className="text-2xl font-bold tabular-nums">{totalPrice}</span>
                  </motion.div>
                </div>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
