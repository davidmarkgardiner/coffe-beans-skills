import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'login' | 'signup' | 'reset'

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const { login, signup, loginWithGoogle, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
        onClose()
      } else if (mode === 'signup') {
        await signup(email, password, displayName)
        onClose()
      } else if (mode === 'reset') {
        await resetPassword(email)
        setResetEmailSent(true)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      await loginWithGoogle()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setDisplayName('')
    setError('')
    setResetEmailSent(false)
  }

  const switchMode = (newMode: AuthMode) => {
    resetForm()
    setMode(newMode)
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
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/70 backdrop-blur-md z-[9999]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto"
            style={{ alignItems: 'center' }}
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden my-auto"
              style={{ marginTop: 'auto', marginBottom: 'auto' }}
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-coffee-50 to-coffee-100 px-6 py-5 border-b border-coffee-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold text-charcoal">
                    {mode === 'login' && 'Welcome Back'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'reset' && 'Reset Password'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-coffee-200 rounded-full transition-colors duration-200"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 text-grey-700" />
                  </button>
                </div>
                <p className="text-sm text-grey-600 mt-1">
                  {mode === 'login' && 'Sign in to your account'}
                  {mode === 'signup' && 'Join our coffee community'}
                  {mode === 'reset' && 'Enter your email to receive a reset link'}
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {resetEmailSent ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-charcoal mb-2">
                      Check your email
                    </h3>
                    <p className="text-grey-600 mb-6">
                      We've sent a password reset link to {email}
                    </p>
                    <button
                      onClick={() => switchMode('login')}
                      className="text-coffee-700 hover:text-coffee-800 font-medium"
                    >
                      Back to login
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Google Sign In */}
                    {mode !== 'reset' && (
                      <>
                        <button
                          onClick={handleGoogleLogin}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-grey-300 rounded-lg hover:bg-grey-50 transition-colors duration-200 font-medium text-grey-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Continue with Google
                        </button>

                        <div className="flex items-center gap-4 my-6">
                          <div className="flex-1 h-px bg-grey-300" />
                          <span className="text-sm text-grey-500">or</span>
                          <div className="flex-1 h-px bg-grey-300" />
                        </div>
                      </>
                    )}

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                      </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {mode === 'signup' && (
                        <div>
                          <label
                            htmlFor="displayName"
                            className="block text-sm font-medium text-grey-700 mb-2"
                          >
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400" />
                            <input
                              id="displayName"
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              required
                              className="w-full pl-11 pr-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent outline-none transition-all"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-grey-700 mb-2"
                        >
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400" />
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-11 pr-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent outline-none transition-all"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      {mode !== 'reset' && (
                        <div>
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-grey-700 mb-2"
                          >
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400" />
                            <input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              minLength={6}
                              className="w-full pl-11 pr-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent outline-none transition-all"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      )}

                      {mode === 'login' && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => switchMode('reset')}
                            className="text-sm text-coffee-700 hover:text-coffee-800 font-medium"
                          >
                            Forgot password?
                          </button>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-coffee-700 text-white py-3 rounded-lg hover:bg-coffee-800 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          <>
                            {mode === 'login' && 'Sign In'}
                            {mode === 'signup' && 'Create Account'}
                            {mode === 'reset' && 'Send Reset Link'}
                          </>
                        )}
                      </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center text-sm text-grey-600">
                      {mode === 'login' ? (
                        <>
                          Don't have an account?{' '}
                          <button
                            onClick={() => switchMode('signup')}
                            className="text-coffee-700 hover:text-coffee-800 font-medium"
                          >
                            Sign up
                          </button>
                        </>
                      ) : mode === 'signup' ? (
                        <>
                          Already have an account?{' '}
                          <button
                            onClick={() => switchMode('login')}
                            className="text-coffee-700 hover:text-coffee-800 font-medium"
                          >
                            Sign in
                          </button>
                        </>
                      ) : (
                        <>
                          Remember your password?{' '}
                          <button
                            onClick={() => switchMode('login')}
                            className="text-coffee-700 hover:text-coffee-800 font-medium"
                          >
                            Sign in
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
