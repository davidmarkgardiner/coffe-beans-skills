import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

interface NavigationProps {
  itemCount: number
}

export function Navigation({ itemCount }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-medium'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="font-display text-2xl font-bold text-grey-900 tracking-tight">
            Premium Coffee
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#products"
              className="text-sm font-medium text-grey-700 hover:text-coffee-700 transition-colors duration-200"
            >
              Shop
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-grey-700 hover:text-coffee-700 transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-grey-700 hover:text-coffee-700 transition-colors duration-200"
            >
              Contact
            </a>
          </div>

          <button className="relative p-2 hover:bg-grey-100 rounded-full transition-colors duration-200">
            <ShoppingCart className="w-5 h-5 text-grey-700" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-coffee-700 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
