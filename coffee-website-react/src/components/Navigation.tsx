import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import logoMark from '../assets/stockbridge-logo.png'

interface NavigationProps {
  itemCount: number
}

export function Navigation({ itemCount }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          ? 'bg-gradient-nav-strong backdrop-blur-md shadow-medium'
          : 'bg-gradient-nav-soft backdrop-blur-sm shadow-soft'
      }`}
    >
      <div className="container mx-auto px-8 py-6">
        <div className="flex items-center justify-between gap-8">
          <a
            href="#home"
            className="flex items-center gap-6 rounded-3xl bg-white/10 px-4 py-3 text-charcoal transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            aria-label="Stockbridge Coffee"
          >
            <img
              src={logoMark}
              alt="Stockbridge Coffee emblem"
              className="h-24 w-24 md:h-28 md:w-28 -mb-6 rounded-[52px] border border-white/20 bg-white/10 p-5 object-contain mix-blend-multiply shadow-[0_24px_42px_rgba(26,20,16,0.28)] transition-transform duration-300 group-hover:scale-105"
            />
            <span className="hidden sm:flex flex-col uppercase tracking-[0.5em]">
              <span className="font-display text-lg lg:text-xl leading-tight">
                Stockbridge Coffee
              </span>
              <span className="font-sans text-[0.7rem] tracking-[0.65em] text-coffee-600 mt-1">
                Edinburgh
              </span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            <a
              href="#products"
              className="text-base font-medium text-grey-700 hover:text-coffee-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2 rounded"
            >
              Shop
            </a>
            <a
              href="#blog"
              className="text-base font-medium text-grey-700 hover:text-coffee-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2 rounded"
            >
              Blog
            </a>
            <a
              href="#about"
              className="text-base font-medium text-grey-700 hover:text-coffee-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2 rounded"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-base font-medium text-grey-700 hover:text-coffee-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2 rounded"
            >
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="relative p-2 hover:bg-grey-100 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingCart className="w-5 h-5 text-grey-700" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-coffee-700 text-white text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-grey-100 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-grey-700" />
              ) : (
                <Menu className="w-5 h-5 text-grey-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-grey-200 mt-4"
            >
              <div className="py-4 space-y-4">
                <a
                  href="#products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-grey-700 hover:text-coffee-700 transition-colors duration-200 py-2"
                >
                  Shop
                </a>
                <a
                  href="#blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-grey-700 hover:text-coffee-700 transition-colors duration-200 py-2"
                >
                  Blog
                </a>
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-grey-700 hover:text-coffee-700 transition-colors duration-200 py-2"
                >
                  About
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-grey-700 hover:text-coffee-700 transition-colors duration-200 py-2"
                >
                  Contact
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
