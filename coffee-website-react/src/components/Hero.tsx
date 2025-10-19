import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden mt-20">
      {/* Background with parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 text-center text-white px-6"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-sm font-semibold tracking-widest uppercase mb-4"
        >
          Artisan Roasted
        </motion.p>

        <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          Experience Coffee
          <br />
          At Its Finest
        </h1>

        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Carefully sourced from the world's finest coffee regions, roasted to perfection, delivered
          to your door.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <motion.a
            href="#products"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-8 py-3 bg-coffee-700 hover:bg-coffee-800 text-white font-semibold text-sm tracking-wide uppercase rounded-full transition-colors duration-200"
          >
            Shop Collection
          </motion.a>
          <motion.a
            href="#about"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-8 py-3 border-2 border-white text-white hover:bg-white/10 font-semibold text-sm tracking-wide uppercase rounded-full transition-colors duration-200"
          >
            Learn More
          </motion.a>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-center"
      >
        <p className="text-xs tracking-widest uppercase mb-2">Scroll to explore</p>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-white/50 mx-auto"
        />
      </motion.div>
    </section>
  )
}
