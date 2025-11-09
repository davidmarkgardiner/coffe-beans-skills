import { motion } from 'framer-motion'
import { Gift, Heart, Sparkles } from 'lucide-react'

interface GiftCardSectionProps {
  onPurchaseClick: () => void
}

export function GiftCardSection({ onPurchaseClick }: GiftCardSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-accent/10 via-background to-accent/5" id="gift-cards">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
              <Gift className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold tracking-wider uppercase text-accent">
                Perfect Gift
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-heading mb-4">
              Give the Gift of<br />Premium Coffee
            </h2>
            <p className="text-lg text-text leading-relaxed max-w-2xl mx-auto">
              Share the joy of exceptional coffee with friends and family. Our digital gift cards
              are delivered instantly and never expire.
            </p>
          </div>

          {/* Gift Card Preview */}
          <div className="relative mb-12">
            <motion.div
              whileHover={{ scale: 1.02, y: -8 }}
              transition={{ duration: 0.3 }}
              className="relative mx-auto max-w-md"
            >
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent via-accent-hover to-accent-dark shadow-xl p-8 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/30 before:content-['']">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-4 w-32 h-32 bg-white/5 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-display text-xl font-bold text-white">
                        Gift Card
                      </span>
                    </div>
                    <Sparkles className="w-6 h-6 text-white/60" />
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-white/70 mb-2">Balance</p>
                    <p className="font-display text-5xl font-bold text-white">£50.00</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Gift Code</p>
                      <p className="font-mono text-sm text-white font-semibold">
                        GIFT-XXXX-XXXX
                      </p>
                    </div>
                    <Heart className="w-5 h-5 text-white/40" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Gift className="w-6 h-6" />,
                title: 'Instant Delivery',
                description: 'Sent via email immediately after purchase',
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: 'Personal Message',
                description: 'Add a custom note to make it special',
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'Never Expires',
                description: 'Valid for one year from purchase date',
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-surface hover:bg-accent/5 transition-colors"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-heading mb-2">{benefit.title}</h3>
                <p className="text-sm text-text">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <motion.button
              onClick={onPurchaseClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-white font-semibold text-sm tracking-wide uppercase shadow-large hover:shadow-xl hover:bg-accent-hover transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <Gift className="w-5 h-5" />
              Purchase Gift Card
            </motion.button>
            <p className="mt-4 text-sm text-text/70">
              Choose from £25, £50, £100 or enter a custom amount
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
