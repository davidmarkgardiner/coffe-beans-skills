import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

export function OrderConfirmation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <>
      <Helmet>
        <title>Order Confirmed | Stockbridge Coffee</title>
        <meta name="description" content="Thank you for your order! Your premium coffee is being prepared with care." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="relative min-h-screen py-32 bg-background dark:bg-grey-900 overflow-hidden transition-colors duration-300">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" aria-hidden="true" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(33, 47, 31, 0.15) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent-light/20 dark:bg-accent-dark/20 mb-6">
              <svg className="w-12 h-12 text-accent-dark dark:text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>

          {/* Thank You Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-serif text-5xl md:text-6xl font-bold text-heading dark:text-grey-100 mb-6 leading-[1.1]"
          >
            Thank <span className="text-accent-dark dark:text-accent-light">You!</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-text/80 dark:text-grey-300 leading-relaxed mb-4"
          >
            Your order has been confirmed and is being prepared with care.
            A confirmation email is on its way to your inbox.
          </motion.p>

          {sessionId && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-sm text-text/50 dark:text-grey-500 mb-8 font-mono"
            >
              Order reference: {sessionId.slice(-8).toUpperCase()}
            </motion.p>
          )}

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/60 dark:bg-grey-800/60 border border-heading/10 dark:border-grey-700/30 rounded-2xl p-8 mb-10 text-left shadow-sm"
          >
            <h2 className="font-serif text-2xl font-bold text-heading dark:text-grey-100 mb-6">
              What Happens Next
            </h2>

            <div className="space-y-5">
              {[
                {
                  step: '1',
                  title: 'Order Confirmed',
                  description: 'We\'ve received your payment and your order is in our system.',
                },
                {
                  step: '2',
                  title: 'Freshly Roasted',
                  description: 'Your beans will be roasted in small batches to ensure peak freshness.',
                },
                {
                  step: '3',
                  title: 'Packed & Shipped',
                  description: 'Carefully packed and dispatched via Royal Mail within 1–2 business days.',
                },
                {
                  step: '4',
                  title: 'At Your Door',
                  description: 'Estimated delivery: 2–4 business days across the UK.',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="flex gap-4 items-start"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-dark dark:bg-accent-light text-background dark:text-grey-900 flex items-center justify-center text-sm font-bold font-serif">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-sans font-semibold text-heading dark:text-grey-100 text-sm">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text/70 dark:text-grey-400">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Continue Shopping Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-heading dark:bg-grey-100 text-background dark:text-grey-900 font-sans font-semibold text-sm tracking-wider uppercase rounded-full hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Continue Shopping
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
    </>
  )
}
