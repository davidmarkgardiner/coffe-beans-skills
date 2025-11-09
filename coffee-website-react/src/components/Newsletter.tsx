import { motion } from 'framer-motion'
import { useState } from 'react'
import { newsletterOperations } from '../hooks/useFirestore'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const result = await newsletterOperations.subscribe(email, 'newsletter-section')

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
    <section className="py-24 bg-gradient-to-b from-heading to-accent-dark text-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-accent-light mb-4">
            Newsletter
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Stay Brew-tiful
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Subscribe to our newsletter for exclusive offers, brewing tips, and early access to new
            blends.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === 'loading'}
              aria-label="Email address"
              className="flex-1 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <motion.button
              type="submit"
              disabled={status === 'loading'}
              whileHover={status !== 'loading' ? { scale: 1.05 } : {}}
              whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
              className="px-8 py-3 rounded-full bg-white text-heading font-semibold text-sm tracking-wide uppercase shadow-large transition-all duration-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-heading disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Subscribing...' : status === 'success' ? (isAlreadySubscribed ? '✓ Already Subscribed!' : '✓ Subscribed!') : 'Subscribe'}
            </motion.button>
          </form>

          {status === 'error' && errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-200 mt-4 bg-red-500/20 px-4 py-2 rounded-lg"
            >
              {errorMessage}
            </motion.p>
          )}

          {status === 'success' && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-white/90 mt-4 bg-white/10 px-4 py-2 rounded-lg"
            >
              {isAlreadySubscribed
                ? "You're already on our list! We'll keep you updated."
                : "Welcome! Check your inbox for a confirmation email."}
            </motion.p>
          )}

          <p className="text-sm text-white/60 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
