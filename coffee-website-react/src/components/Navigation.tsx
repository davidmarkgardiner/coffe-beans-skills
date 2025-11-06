import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [imageError, setImageError] = useState(false)
  const { currentUser, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false)
  }, [currentUser?.photoURL])

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
          : 'bg-gradient-nav-soft/80 backdrop-blur-sm shadow-soft'
      }`}
    >
      <div className="container mx-auto px-6 py-2 md:py-3">
        <div className="flex items-center justify-between gap-8">
          <a
            href="#home"
            className="flex items-center transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-700 focus-visible:ring-offset-2 rounded-lg relative z-50"
            aria-label="Stockbridge Coffee"
          >
            <img
              src="/images/stockbridge-logo2.png"
              alt="Stockbridge Coffee"
              className="h-24 md:h-32 w-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-lg"
            />
          </a>

          <div className="hidden md:flex items-center gap-10">
            <a
              href="#products"
              className="text-2xl font-logo text-white hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded tracking-wider"
            >
              SHOP
            </a>
            <a
              href="#blog"
              className="text-2xl font-logo text-white hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded tracking-wider"
            >
              BLOG
            </a>
            <a
              href="#about"
              className="text-2xl font-logo text-white hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded tracking-wider"
            >
              ABOUT
            </a>
            <a
              href="#contact"
              className="text-2xl font-logo text-white hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded tracking-wider"
            >
              CONTACT
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* User Menu / Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-heading/10 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  aria-label="User menu"
                >
                  {currentUser.photoURL && !imageError ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-accent-light"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-dark rounded-full flex items-center justify-center shadow-sm border-2 border-accent-light">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-white max-w-[100px] truncate">
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
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors duration-200 font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}

            {/* Shopping Cart */}
            <button
              onClick={onOpenCart}
              className="relative p-2 hover:bg-heading/10 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-heading/10 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors duration-200 font-medium text-sm"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </button>
                )}
                <a
                  href="#products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xl font-logo text-white hover:text-accent transition-colors duration-200 py-2 tracking-wider"
                >
                  SHOP
                </a>
                <a
                  href="#blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xl font-logo text-white hover:text-accent transition-colors duration-200 py-2 tracking-wider"
                >
                  BLOG
                </a>
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xl font-logo text-white hover:text-accent transition-colors duration-200 py-2 tracking-wider"
                >
                  ABOUT
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xl font-logo text-white hover:text-accent transition-colors duration-200 py-2 tracking-wider"
                >
                  CONTACT
                </a>
                {currentUser && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-surface border border-accent-light rounded-lg hover:bg-heading/10 transition-colors duration-200 font-medium text-sm"
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
