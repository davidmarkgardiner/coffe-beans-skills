import { motion, AnimatePresence } from 'framer-motion'
import { useContentRotation } from '../hooks/useContentRotation'

export function Hero() {
  const { currentContent, isLoading } = useContentRotation({
    contentType: 'video', // Hero section uses videos
    rotationInterval: 30000, // 30 seconds
    preloadNext: true,
  })

  // Static poster image for instant display (low-res placeholder)
  const posterImage = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=60&blur=10'

  // Fallback to Unsplash image if no video content available
  const fallbackImage = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80'

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden mt-20 pb-24">
      {/* Background with soft overlay and blur */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentContent?.type === 'video' ? (
            // Video background with poster for instant display
            <motion.video
              key={currentContent.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px]"
              src={currentContent.url}
              poster={posterImage}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          ) : isLoading ? (
            // Loading state with static poster
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px]"
              style={{
                backgroundImage: `url(${posterImage})`,
              }}
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
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <img
            src="/images/stockbridge-logo.png"
            alt="Stockbridge Coffee Edinburgh"
            className="w-[90vw] sm:w-[85vw] md:w-[70vw] lg:w-[60vw] xl:w-[55vw] max-w-[1000px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] mb-2 md:mb-3"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.1))'
            }}
            loading="eager"
          />

          <p className="font-sans text-sm sm:text-base md:text-lg text-grey-200 mb-2 md:mb-3 tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Est. 2025 · Stockbridge
          </p>
          <p className="font-sans text-base sm:text-lg md:text-xl text-grey-100 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] px-4">
            Independent roastery rooted in the cobbled lanes of Stockbridge. Seasonal beans, heritage blends, and warm community spirit in every cup.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
