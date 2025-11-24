import { motion, AnimatePresence } from 'framer-motion'

export function About() {
  // Use static seasonal coffee cup image instead of Firebase rotation
  const displayImage = '/images/coffee-cup-seasonal.png'

  return (
    <section id="about" className="relative py-32 bg-background dark:bg-grey-900 overflow-hidden transition-colors duration-300" aria-label="About Stockbridge Coffee">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" aria-hidden="true" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(33, 47, 31, 0.15) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-6 relative">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            {/* Label Badge with refined styling */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block px-4 py-1.5 bg-white/60 dark:bg-grey-800/60 border border-heading/10 dark:border-grey-700/30 rounded-full text-xs font-sans font-medium text-accent-dark dark:text-accent-light tracking-[0.25em] uppercase mb-8 shadow-sm"
            >
              Our Story
            </motion.span>

            {/* Title with enhanced hierarchy */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-serif text-5xl md:text-6xl font-bold text-heading dark:text-grey-100 mb-8 leading-[1.1]"
            >
              Crafted With
              <br />
              <span className="text-accent-dark dark:text-accent-light">Passion</span>
            </motion.h2>

            {/* Body text with refined spacing */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-6 text-base text-text/80 dark:text-grey-300 leading-relaxed"
            >
              <p>
                At Stockbridge Coffee, we believe great coffee starts with great relationships. Our journey begins in Latin America, where we work directly with farmers to source the finest beans, supporting fair trade and sustainable practices.
              </p>
              <p>
                Based in Stockbridge, Edinburgh, our small-batch roasters bring decades of experience and a passion for craft to each bean. Every batch is carefully roasted to highlight the unique flavours, aromas, and character of its origin.
              </p>
              <p className="font-medium text-heading/90 dark:text-grey-200">
                For us, coffee is more than a drink. It's about connecting communities, celebrating craftsmanship, and sharing the warmth behind every cup.
              </p>
            </motion.div>

            {/* Stats with enhanced visual design */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-heading/10"
              role="list"
              aria-label="Company statistics"
            >
              {[
                { value: '15+', label: 'Countries' },
                { value: '50K+', label: 'Happy Customers' },
                { value: '100%', label: 'Sustainable' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  className="text-center group hover-scale"
                  role="listitem"
                  aria-label={`${stat.value} ${stat.label}`}
                >
                  <p className="font-serif text-4xl md:text-5xl font-bold text-accent-dark dark:text-accent-light mb-2 transition-transform duration-300 group-hover:scale-110">
                    {stat.value}
                  </p>
                  <p className="text-xs font-sans font-medium tracking-wider uppercase text-text/60 dark:text-grey-400">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Asymmetric Image Layout */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative h-[600px]"
          >
            {/* Main Image Container */}
            <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl hover-lift">
              <AnimatePresence mode="wait">
                <motion.img
                  key={displayImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  src={displayImage}
                  alt="Coffee roasting process - artisan coffee beans being carefully roasted"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-heading/20 via-transparent to-transparent" />
            </div>

            {/* Floating Badge - Repositioned for asymmetry */}
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: -2 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ rotate: 0, y: -4 }}
              className="absolute -bottom-6 -left-6 lg:-left-12 bg-heading text-background p-8 rounded-2xl shadow-2xl max-w-xs z-20 border-4 border-background hover-lift"
              role="complementary"
              aria-label="Artisan roasted badge"
            >
              <p className="font-serif text-3xl font-bold mb-2 leading-tight">
                Artisan
                <br />
                Roasted
              </p>
              <p className="text-sm opacity-80 font-sans">
                Every batch is carefully crafted by hand
              </p>

              {/* Decorative element */}
              <div className="absolute top-4 right-4 w-16 h-16 opacity-10">
                <svg viewBox="0 0 100 100" fill="currentColor">
                  <circle cx="50" cy="50" r="40" />
                </svg>
              </div>
            </motion.div>

            {/* Decorative blur accent */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-accent-light/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
