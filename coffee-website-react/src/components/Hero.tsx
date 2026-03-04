import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      setVideoLoaded(true)
      video.play().catch(() => {
        // Autoplay blocked - poster will show instead
      })
    }

    video.addEventListener('canplay', handleCanPlay)
    return () => video.removeEventListener('canplay', handleCanPlay)
  }, [])

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Poster fallback image - always visible until video loads */}
        <img
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1280&q=70"
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
          aria-hidden="true"
        />
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          poster="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1280&q=70"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/video/hero-optimised.mp4" type="video/mp4" />
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
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-logo font-bold text-white mb-6 leading-tight drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
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
