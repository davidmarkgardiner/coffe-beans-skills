import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Check, X, AlertCircle } from 'lucide-react'
import { giftCardOperations } from '../hooks/useFirestore'
import type { GiftCard } from '../types/product'

interface GiftCardRedemptionProps {
  onApplyGiftCard: (giftCard: GiftCard) => void
  appliedGiftCard?: GiftCard | null
  onRemoveGiftCard: () => void
  cartTotal: number // in pence
}

export function GiftCardRedemption({
  onApplyGiftCard,
  appliedGiftCard,
  onRemoveGiftCard,
  cartTotal,
}: GiftCardRedemptionProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a gift card code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const validation = await giftCardOperations.validateGiftCard(code.trim())

      if (validation.valid && validation.giftCard) {
        onApplyGiftCard(validation.giftCard)
        setCode('')
        setError(null)
      } else {
        setError(validation.error || 'Invalid gift card')
      }
    } catch (err) {
      setError('Failed to validate gift card. Please try again.')
      console.error('Gift card validation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply()
    }
  }

  const formatCode = (value: string) => {
    // Format as GIFT-XXXX-XXXX-XXXX-XXXX
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    let formatted = ''
    for (let i = 0; i < cleaned.length && i < 20; i++) {
      if (i === 4 || i === 8 || i === 12 || i === 16) {
        formatted += '-'
      }
      formatted += cleaned[i]
    }
    return formatted
  }

  const handleCodeChange = (value: string) => {
    setCode(formatCode(value))
    setError(null)
  }

  // Calculate discount amount
  const getDiscountAmount = () => {
    if (!appliedGiftCard) return 0
    return Math.min(appliedGiftCard.balance, cartTotal)
  }

  return (
    <div className="border-t border-accent-light pt-4">
      {/* Applied Gift Card Display */}
      {appliedGiftCard ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl p-4 mb-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-heading text-sm">Gift Card Applied</span>
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-text/70 font-mono">{appliedGiftCard.code}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-text/70">Discount:</span>
                  <span className="font-display text-lg font-bold text-accent">
                    -£{(getDiscountAmount() / 100).toFixed(2)}
                  </span>
                </div>
                {appliedGiftCard.balance > cartTotal && (
                  <p className="text-xs text-text/70 mt-1">
                    Remaining balance: £{((appliedGiftCard.balance - cartTotal) / 100).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onRemoveGiftCard}
              className="w-7 h-7 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent flex-shrink-0"
              aria-label="Remove gift card"
            >
              <X className="w-4 h-4 text-text" />
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Collapsed State */}
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent/5 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-heading">Have a gift card?</span>
              </div>
              <svg
                className="w-5 h-5 text-text/50 group-hover:text-accent transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}

          {/* Expanded State */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  {/* Input */}
                  <div>
                    <label htmlFor="gift-card-code" className="block text-sm font-semibold text-heading mb-2">
                      Enter gift card code
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          id="gift-card-code"
                          type="text"
                          value={code}
                          onChange={(e) => handleCodeChange(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="GIFT-XXXX-XXXX-XXXX-XXXX"
                          disabled={loading}
                          className="w-full px-4 py-3 rounded-xl bg-surface border-2 border-transparent focus:border-accent focus:bg-background transition-colors text-heading font-mono text-sm focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <button
                        onClick={handleApply}
                        disabled={!code.trim() || loading}
                        className="px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm tracking-wide uppercase hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap"
                      >
                        {loading ? (
                          <svg
                            className="w-5 h-5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Collapse Button */}
                  <button
                    onClick={() => {
                      setExpanded(false)
                      setCode('')
                      setError(null)
                    }}
                    className="text-sm text-text/70 hover:text-accent transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
