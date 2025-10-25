import { motion, AnimatePresence } from 'framer-motion'
import { useContentRotation } from '../hooks/useContentRotation'

export function Hero() {
  const { currentContent } = useContentRotation({
    contentType: 'video', // Hero section uses videos
    rotationInterval: 30000, // 30 seconds
    preloadNext: true,
  })

  // Fallback to Unsplash image if no video content available
  const fallbackImage = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80'

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden mt-20 pb-24">
      {/* Background with soft overlay and blur */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentContent?.type === 'video' ? (
            // Video background
            <motion.video
              key={currentContent.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px]"
              src={currentContent.url}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            // Fallback image
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px]"
              style={{
                backgroundImage: `url(${fallbackImage})`,
              }}
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0,transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-grey-900/60 via-grey-900/70 to-grey-900/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-display text-6xl md:text-8xl font-bold text-cream mb-6 tracking-tight leading-[0.95] drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
            STOCKBRIDGE COFFEE
            <br />
            EDINBURGH
          </h1>
          <p className="font-serif text-sm md:text-base text-grey-200 mb-4 tracking-widest uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            Est. 2025 · Stockbridge
          </p>
          <p className="font-sans text-base md:text-lg text-grey-100 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            Independent roastery rooted in the cobbled lanes of Stockbridge. Seasonal beans, heritage blends, and warm community spirit in every cup.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
