import { useState } from 'react'
import { motion } from 'framer-motion'
import { newsletterOperations } from '../hooks/useFirestore'

export function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const result = await newsletterOperations.subscribe(email, 'footer')

      if (result.success) {
        setStatus('success')
        setIsAlreadySubscribed(result.alreadySubscribed)

        // Reset form after 3 seconds
        setTimeout(() => {
          setEmail('')
          setStatus('idle')
          setIsAlreadySubscribed(false)
        }, 3000)
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.')

      // Reset error after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setErrorMessage('')
      }, 5000)
    }
  }
  return (
    <footer className="bg-white dark:bg-grey-900 text-text dark:text-grey-100 py-16 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1 */}
          <div>
            <img
              src="/images/stockbridge-fox-logo.png"
              alt="Stockbridge Coffee"
              className="h-20 w-auto mb-4 opacity-90"
            />
            <p className="text-sm leading-relaxed dark:text-grey-300">
              Bringing you the world's finest coffee beans, roasted to perfection.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold text-heading dark:text-accent-light mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-sm dark:text-grey-300 hover:text-accent dark:hover:text-accent-light transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="text-sm dark:text-grey-300 hover:text-accent dark:hover:text-accent-light transition-colors duration-200">
                  Products
                </a>
              </li>
              <li>
                <a href="#blog" className="text-sm dark:text-grey-300 hover:text-accent dark:hover:text-accent-light transition-colors duration-200">
                  Blog
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm dark:text-grey-300 hover:text-accent dark:hover:text-accent-light transition-colors duration-200">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm dark:text-grey-300 hover:text-accent dark:hover:text-accent-light transition-colors duration-200">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-semibold text-heading dark:text-accent-light mb-4">Contact</h3>
            <ul className="space-y-2 text-sm dark:text-grey-300">
              <li>Email: hello@stockbridgecoffee.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Hours: Mon-Fri 8am-6pm</li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="font-semibold text-heading dark:text-accent-light mb-4">Newsletter</h3>
            <p className="text-sm dark:text-grey-300 mb-4">Subscribe for updates and special offers.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                disabled={status === 'loading'}
                aria-label="Email address for newsletter"
                className="px-4 py-2 rounded-lg bg-surface dark:bg-grey-800 border border-accent dark:border-accent text-heading dark:text-grey-100 placeholder-text/50 dark:placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <motion.button
                type="submit"
                disabled={status === 'loading'}
                whileHover={status !== 'loading' ? { scale: 1.02 } : {}}
                whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
                className="px-4 py-2 rounded-lg bg-gradient-cta text-white font-semibold text-sm tracking-wide uppercase shadow-medium transition-all duration-200 hover:bg-gradient-cta-hover hover:shadow-large focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Subscribing...' : status === 'success' ? (isAlreadySubscribed ? '✓ Already Subscribed!' : '✓ Subscribed!') : 'Subscribe'}
              </motion.button>
            </form>
            {status === 'error' && errorMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-300 mt-2"
              >
                {errorMessage}
              </motion.p>
            )}
            {status === 'success' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-accent-light mt-2"
              >
                {isAlreadySubscribed ? "You're already subscribed!" : 'Thanks for subscribing!'}
              </motion.p>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-accent/20 dark:border-accent/30 text-center">
          <p className="text-sm dark:text-grey-300">&copy; 2025 Stockbridge Coffee. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
