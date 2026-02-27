import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=60"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-grey-900/80 via-grey-900/70 to-grey-900/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-logo font-bold text-white mb-6 leading-tight drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.03em', textShadow: '4px 4px 8px rgba(0,0,0,0.8)' }}
          >
            STOCKBRIDGE COFFEE
          </h1>
          <p
            className="text-xl md:text-2xl lg:text-3xl font-logo text-white/90 tracking-[0.3em] uppercase drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)]"
            style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}
          >
            Edinburgh
          </p>
        </motion.div>
      </div>
    </section>
  )
}
