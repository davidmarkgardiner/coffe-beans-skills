import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import logoMark from '../assets/stockbridge-logo.png'
import { useAuth } from '../contexts/AuthContext'

interface NavigationProps {
  itemCount: number
  onOpenLogin: () => void
  onOpenCart: () => void
}

export function Navigation({ itemCount, onOpenLogin, onOpenCart }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { currentUser, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setUserMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

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
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          <a
            href="#home"
            className="flex items-center gap-4 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2 rounded-lg"
            aria-label="Stockbridge Coffee"
          >
            <div className="relative">
              <img
                src={logoMark}
                alt="Stockbridge Coffee emblem"
                className="h-14 w-14 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="hidden sm:flex flex-col uppercase tracking-[0.35em]">
              <span className="font-display text-base lg:text-lg leading-tight text-charcoal">
                Stockbridge Coffee
              </span>
              <span className="font-sans text-[0.65rem] tracking-[0.4em] text-coffee-600 mt-0.5">
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
            {/* User Menu / Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-grey-100 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2"
                  aria-label="User menu"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-coffee-700 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-grey-700 max-w-[100px] truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-grey-200 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-grey-200">
                        <p className="text-sm font-medium text-grey-900 truncate">
                          {currentUser.displayName || 'User'}
                        </p>
                        <p className="text-xs text-grey-500 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-grey-700 hover:bg-grey-50 transition-colors duration-200 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-coffee-700 text-white rounded-lg hover:bg-coffee-800 transition-colors duration-200 font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}

            {/* Shopping Cart */}
            <button
              onClick={onOpenCart}
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

            {/* Mobile Menu Toggle */}
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
                {!currentUser && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      onOpenLogin()
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-coffee-700 text-white rounded-lg hover:bg-coffee-800 transition-colors duration-200 font-medium text-sm"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </button>
                )}
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
                {currentUser && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-grey-700 border border-grey-300 rounded-lg hover:bg-grey-50 transition-colors duration-200 font-medium text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
