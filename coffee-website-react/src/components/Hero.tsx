import { motion, AnimatePresence } from 'framer-motion'
import { useContentRotation } from '../hooks/useContentRotation'

export function Hero() {
  const { currentContent, isLoading } = useContentRotation({
    contentType: 'video', // Hero section uses videos
    rotationInterval: 30000, // 30 seconds
    preloadNext: true,
    refreshInterval: 5 * 60 * 1000, // Refresh content pool every 5 minutes to pick up newly generated videos
  })

  // Static poster image for instant display (low-res placeholder)
  const posterImage = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=60&blur=10'

  // Fallback to Unsplash image if no video content available
  const fallbackImage = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80'

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
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
              className="absolute inset-0 w-full h-full object-cover"
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
        {/* Dark overlay for rich, roasted bean appearance */}
        <div className="absolute inset-0 bg-gradient-to-b from-grey-900/70 via-grey-900/60 to-grey-900/70" />
      </div>

      {/* Content - Text overlay */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center px-4"
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-logo text-white mb-4 leading-tight drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]" style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)' }}>
            STOCKBRIDGE COFFEE
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl font-logo text-surface drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)]" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
            Edinburgh
          </p>
        </motion.div>
      </div>
    </section>
  )
}
