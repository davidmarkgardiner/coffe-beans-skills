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
      {/* Background with soft overlay and blur */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px]"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
        />
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
          <h1 className="font-display text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight leading-[0.95] drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
            STOCKBRIDGE COFFEE
            <br />
            EDINBURGH
          </h1>
          <p className="text-xl md:text-2xl text-grey-200 mb-8 font-light tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
            Premium Single-Origin Beans
          </p>
          <motion.a
            href="#products"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-white text-grey-900 px-8 py-4 rounded-sm font-semibold text-lg hover:bg-grey-100 transition-colors shadow-xl hover:shadow-2xl"
          >
            Explore Our Collection
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
