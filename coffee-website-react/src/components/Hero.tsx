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
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center"
        >
          {/* Logo - centered and proportional */}
          <img
            src="/images/stockbridge-logo.png"
            alt="Stockbridge Coffee Edinburgh"
            className="w-[80vw] sm:w-[70vw] md:w-[60vw] lg:w-[50vw] xl:w-[45vw] max-w-[800px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.1))'
            }}
            loading="eager"
          />
        </motion.div>
      </div>
    </section>
  )
}
