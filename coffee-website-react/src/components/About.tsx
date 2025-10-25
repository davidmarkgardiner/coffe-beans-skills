import { motion, AnimatePresence } from 'framer-motion'
import { useContentRotation } from '../hooks/useContentRotation'

export function About() {
  const { currentContent } = useContentRotation({
    contentType: 'photo',
    rotationInterval: 30000, // 30 seconds
    preloadNext: true,
  })

  // Fallback to Unsplash if no content available
  const fallbackImage = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80'
  const displayImage = currentContent?.url || fallbackImage

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-4">
              Our Story
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-heading mb-6">
              Crafted With Passion Since 2010
            </h2>
            <p className="text-lg text-text leading-relaxed mb-6">
              At Stockbridge Coffee, we believe that great coffee starts with great relationships. We work
              directly with farmers across the globe to source the finest beans, ensuring fair trade and
              sustainable practices.
            </p>
            <p className="text-lg text-text leading-relaxed mb-6">
              Our master roasters bring decades of experience, carefully roasting each batch to bring out
              the unique flavors and characteristics of every origin. From the highlands of Ethiopia to
              the valleys of Colombia, we bring the world's best coffee to your cup.
            </p>
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <p className="font-display text-4xl font-bold text-accent mb-2">15+</p>
                <p className="text-sm text-text">Countries</p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl font-bold text-accent mb-2">50K+</p>
                <p className="text-sm text-text">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl font-bold text-accent mb-2">100%</p>
                <p className="text-sm text-text">Sustainable</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-large">
              <AnimatePresence mode="wait">
                <motion.img
                  key={displayImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  src={displayImage}
                  alt="Coffee roasting process"
                  loading="lazy"
                  className="w-full h-[500px] object-cover"
                />
              </AnimatePresence>
            </div>
            <div className="absolute -bottom-8 -left-8 bg-accent text-white p-8 rounded-2xl shadow-xl max-w-xs">
              <p className="font-display text-3xl font-bold mb-2">Artisan Roasted</p>
              <p className="text-sm opacity-90">Every batch is carefully crafted by hand</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
