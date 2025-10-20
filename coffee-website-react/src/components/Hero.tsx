import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function Hero() {
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    const updateImageUrl = () => {
      const width = window.innerWidth
      const imageWidth = width < 768 ? 800 : width < 1200 ? 1200 : 1600
      setImageUrl(`https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=${imageWidth}&q=80`)
    }

    updateImageUrl()
    window.addEventListener('resize', updateImageUrl)
    return () => window.removeEventListener('resize', updateImageUrl)
  }, [])

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden mt-20 pb-24">
      {/* Background with parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18)_0,transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-grey-900/70 via-grey-900/75 to-grey-900/85" />
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
          className="text-xs md:text-sm font-semibold tracking-[0.45em] uppercase mb-5 text-coffee-200"
        >
          Est. 2005 · Stockbridge · Edinburgh
        </motion.p>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-[0.35em] uppercase mb-6 leading-[1.15]">
          Stockbridge Coffee
        </h1>

        <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Independent roastery rooted in the cobbled lanes of Stockbridge. Seasonal beans, heritage blends,
          and warm community spirit in every cup.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-12">
          <motion.a
            href="#products"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-8 py-3 rounded-full bg-gradient-cta text-white font-semibold text-sm tracking-wide uppercase shadow-large transition-all duration-200 hover:bg-gradient-cta-hover hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Explore Roasts
          </motion.a>
          <motion.a
            href="#about"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-8 py-3 rounded-full border border-white/40 bg-white/10 text-white font-semibold text-sm tracking-wide uppercase shadow-soft backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:shadow-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Neighbourhood Story
          </motion.a>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-lg p-2"
        role="button"
        tabIndex={0}
        aria-label="Scroll to explore content"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          }
        }}
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
