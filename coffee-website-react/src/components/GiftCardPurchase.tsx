import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Mail, User, MessageSquare } from 'lucide-react'
import { createPaymentIntent } from '../lib/stripe'
import { giftCardOperations } from '../hooks/useFirestore'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe } from '../lib/stripe'

interface GiftCardPurchaseProps {
  isOpen: boolean
  onClose: () => void
}

const PRESET_AMOUNTS = [25, 50, 100, 150]

export function GiftCardPurchase({ isOpen, onClose }: GiftCardPurchaseProps) {
  const [step, setStep] = useState<'select' | 'details' | 'payment'>('select')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    recipientEmail: '',
    recipientName: '',
    message: '',
  })
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue)
    } else {
      setSelectedAmount(null)
    }
    setCustomAmount(value)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleNext = async () => {
    if (step === 'select' && selectedAmount) {
      setError(null)
      setStep('details')
    } else if (step === 'details') {
      // Validate form
      const errors: Record<string, string> = {}

      if (!formData.senderName.trim()) {
        errors.senderName = 'Your name is required'
      }

      if (!formData.senderEmail.trim()) {
        errors.senderEmail = 'Your email is required'
      } else if (!validateEmail(formData.senderEmail)) {
        errors.senderEmail = 'Please enter a valid email address'
      }

      if (!formData.recipientEmail.trim()) {
        errors.recipientEmail = 'Recipient email is required'
      } else if (!validateEmail(formData.recipientEmail)) {
        errors.recipientEmail = 'Please enter a valid email address'
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        setError('Please fix the errors above')
        return
      }

      // Create payment intent
      setLoading(true)
      setError(null)
      setFieldErrors({})
      try {
        const { clientSecret } = await createPaymentIntent(
          selectedAmount! * 100, // Convert to cents
          'gbp',
          {
            type: 'gift_card',
            senderName: formData.senderName,
            senderEmail: formData.senderEmail,
            recipientEmail: formData.recipientEmail,
            recipientName: formData.recipientName,
            message: formData.message,
          }
        )
        setClientSecret(clientSecret)
        setStep('payment')
      } catch (err) {
        setError('Failed to initialize payment. Please try again.')
        console.error('Payment intent error:', err)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    setError(null)
    setFieldErrors({})
    if (step === 'details') {
      setStep('select')
    } else if (step === 'payment') {
      setStep('details')
    }
  }

  const handleClose = () => {
    setStep('select')
    setSelectedAmount(null)
    setCustomAmount('')
    setFormData({
      senderName: '',
      senderEmail: '',
      recipientEmail: '',
      recipientName: '',
      message: '',
    })
    setClientSecret(null)
    setError(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-background rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/70 before:content-['']"
            >
              {/* Header */}
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-accent-light px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-heading">
                      Purchase Gift Card
                    </h2>
                    <p className="text-sm text-text/70">
                      {step === 'select' && 'Choose an amount'}
                      {step === 'details' && 'Personalize your gift'}
                      {step === 'payment' && 'Complete payment'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full hover:bg-accent/10 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-text" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Step 1: Select Amount */}
                {step === 'select' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-heading mb-3">
                        Select Amount
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {PRESET_AMOUNTS.map((amount) => (
                          <motion.button
                            key={amount}
                            onClick={() => handleAmountSelect(amount)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className={`py-4 rounded-xl font-display text-2xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                              selectedAmount === amount
                                ? 'bg-accent text-white shadow-medium'
                                : 'bg-surface text-heading hover:bg-accent-light'
                            }`}
                          >
                            £{amount}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="custom-amount"
                        className="block text-sm font-semibold text-heading mb-2"
                      >
                        Or enter custom amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-display font-bold text-accent">
                          £
                        </span>
                        <input
                          id="custom-amount"
                          type="number"
                          min="10"
                          step="0.01"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          placeholder="0.00"
                          className={`w-full pl-10 pr-4 py-4 rounded-xl bg-surface border-2 transition-colors text-2xl font-display font-bold text-heading focus-visible:outline-none ${
                            selectedAmount && selectedAmount < 10
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-transparent focus:border-accent focus:bg-background'
                          }`}
                        />
                      </div>
                      <p className={`mt-2 text-xs ${
                        selectedAmount && selectedAmount < 10 ? 'text-red-500' : 'text-text/70'
                      }`}>
                        Minimum amount: £10
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Enter Details */}
                {step === 'details' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {/* Selected Amount Display */}
                    <div className="bg-accent/10 rounded-xl p-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-heading">
                        Gift Card Amount
                      </span>
                      <span className="font-display text-3xl font-bold text-accent">
                        £{selectedAmount?.toFixed(2)}
                      </span>
                    </div>

                    {/* Sender Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-heading flex items-center gap-2">
                        <User className="w-4 h-4 text-accent" />
                        Your Information
                      </h3>
                      <div>
                        <label htmlFor="sender-name" className="block text-sm text-text mb-1">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="sender-name"
                          type="text"
                          value={formData.senderName}
                          onChange={(e) => {
                            setFormData({ ...formData, senderName: e.target.value })
                            if (fieldErrors.senderName) {
                              const newErrors = { ...fieldErrors }
                              delete newErrors.senderName
                              setFieldErrors(newErrors)
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-xl bg-surface border-2 transition-colors text-heading focus-visible:outline-none ${
                            fieldErrors.senderName
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-transparent focus:border-accent focus:bg-background'
                          }`}
                          placeholder="John Doe"
                          required
                        />
                        {fieldErrors.senderName && (
                          <p className="mt-1 text-xs text-red-500">{fieldErrors.senderName}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="sender-email" className="block text-sm text-text mb-1">
                          Your Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="sender-email"
                          type="email"
                          value={formData.senderEmail}
                          onChange={(e) => {
                            setFormData({ ...formData, senderEmail: e.target.value })
                            if (fieldErrors.senderEmail) {
                              const newErrors = { ...fieldErrors }
                              delete newErrors.senderEmail
                              setFieldErrors(newErrors)
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-xl bg-surface border-2 transition-colors text-heading focus-visible:outline-none ${
                            fieldErrors.senderEmail
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-transparent focus:border-accent focus:bg-background'
                          }`}
                          placeholder="john@example.com"
                          required
                        />
                        {fieldErrors.senderEmail && (
                          <p className="mt-1 text-xs text-red-500">{fieldErrors.senderEmail}</p>
                        )}
                      </div>
                    </div>

                    {/* Recipient Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-heading flex items-center gap-2">
                        <Mail className="w-4 h-4 text-accent" />
                        Recipient Information
                      </h3>
                      <div>
                        <label
                          htmlFor="recipient-email"
                          className="block text-sm text-text mb-1"
                        >
                          Recipient Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="recipient-email"
                          type="email"
                          value={formData.recipientEmail}
                          onChange={(e) => {
                            setFormData({ ...formData, recipientEmail: e.target.value })
                            if (fieldErrors.recipientEmail) {
                              const newErrors = { ...fieldErrors }
                              delete newErrors.recipientEmail
                              setFieldErrors(newErrors)
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-xl bg-surface border-2 transition-colors text-heading focus-visible:outline-none ${
                            fieldErrors.recipientEmail
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-transparent focus:border-accent focus:bg-background'
                          }`}
                          placeholder="recipient@example.com"
                          required
                        />
                        {fieldErrors.recipientEmail && (
                          <p className="mt-1 text-xs text-red-500">{fieldErrors.recipientEmail}</p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="recipient-name"
                          className="block text-sm text-text mb-1"
                        >
                          Recipient Name (optional)
                        </label>
                        <input
                          id="recipient-name"
                          type="text"
                          value={formData.recipientName}
                          onChange={(e) =>
                            setFormData({ ...formData, recipientName: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-surface border-2 border-transparent focus:border-accent focus:bg-background transition-colors text-heading focus-visible:outline-none"
                          placeholder="Jane Smith"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm text-text mb-1 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-accent" />
                        Personal Message (optional)
                      </label>
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-surface border-2 border-transparent focus:border-accent focus:bg-background transition-colors text-heading resize-none focus-visible:outline-none"
                        placeholder="Happy Birthday! Enjoy some amazing coffee..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {step === 'payment' && clientSecret && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Elements
                      stripe={getStripe()}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'flat',
                          variables: {
                            colorPrimary: '#B8A690',
                            colorBackground: '#F7F4ED',
                            colorText: '#5B5245',
                            borderRadius: '12px',
                          },
                        },
                      }}
                    >
                      <GiftCardPaymentForm
                        amount={selectedAmount!}
                        formData={formData}
                        onSuccess={handleClose}
                      />
                    </Elements>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  {step !== 'select' && (
                    <button
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 px-6 py-3 rounded-full border-2 border-accent text-accent font-semibold text-sm tracking-wide uppercase hover:bg-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      Back
                    </button>
                  )}
                  {step !== 'payment' && (
                    <button
                      onClick={handleNext}
                      disabled={!selectedAmount || (selectedAmount < 10) || loading}
                      className="flex-1 px-6 py-3 rounded-full bg-accent text-white font-semibold text-sm tracking-wide uppercase shadow-medium hover:shadow-large hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      {loading ? 'Processing...' : step === 'select' ? 'Continue' : 'Proceed to Payment'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// Payment form component
function GiftCardPaymentForm({
  amount,
  formData,
  onSuccess,
}: {
  amount: number
  formData: any
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (submitError) {
        setError(submitError.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful - create gift card in Firebase
        try {
          await giftCardOperations.createGiftCard({
            amount: amount * 100, // Convert to cents
            currency: 'gbp',
            senderName: formData.senderName,
            senderEmail: formData.senderEmail,
            recipientEmail: formData.recipientEmail,
            recipientName: formData.recipientName,
            message: formData.message,
            paymentIntentId: paymentIntent.id,
          })

          setSuccess(true)
          setTimeout(() => {
            onSuccess()
          }, 2000)
        } catch (dbError) {
          console.error('Failed to create gift card in database:', dbError)
          setError('Payment succeeded but failed to create gift card. Please contact support.')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Payment error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-heading mb-2">
          Gift Card Sent!
        </h3>
        <p className="text-text">
          The gift card has been sent to {formData.recipientEmail}
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount Summary */}
      <div className="bg-accent/10 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-heading">Total Amount</span>
        <span className="font-display text-3xl font-bold text-accent">
          £{amount.toFixed(2)}
        </span>
      </div>

      {/* Payment Element */}
      <div className="bg-surface rounded-xl p-4">
        <PaymentElement />
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-6 py-4 rounded-full bg-accent text-white font-semibold text-sm tracking-wide uppercase shadow-medium hover:shadow-large hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
            Processing...
          </span>
        ) : (
          `Pay £${amount.toFixed(2)}`
        )}
      </button>
    </form>
  )
}
