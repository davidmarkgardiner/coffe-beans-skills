import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import stockbridgeLogoBright from '../assets/logo-variants/logo-stockbridge-bright.png'

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

      {/* Content - Massive Centered Logo Fills Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 flex items-center justify-center px-4 w-full"
      >
        <img
          src={stockbridgeLogoBright}
          alt="Stockbridge Coffee Edinburgh - Bridge and Bean Logo"
          className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.65)] w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[82vw] xl:w-[78vw] 2xl:w-[72vw] max-w-[1680px]"
          style={{
            imageRendering: 'crisp-edges',
            filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 0.15))'
          }}
          loading="eager"
        />
      </motion.div>
    </section>
  )
}
