import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { newsletterOperations } from '../hooks/useFirestore'
import { where, limit } from 'firebase/firestore'

interface CuratedArticle {
  title: string
  url: string
  source: string
  summary: string
  fullContent: string // Full blog article content
  imageUrl?: string // URL of generated image
  imagePrompt: string // Prompt used for generating image
  relevanceScore: number
  publishedDate?: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  introduction: string
  articles: CuratedArticle[]
  conclusion: string
  tags: string[]
  category: string
  publishedAt: any
  readTime: string
  excerpt: string
  author: string
  featuredImage?: string
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false)

  // Fetch blog post by slug
  const { data: posts = [], loading, error } = useCollection<BlogPost>(
    'blog-posts',
    [
      where('slug', '==', slug),
      where('status', '==', 'published'),
      limit(1)
    ]
  )

  const post = posts[0]

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [slug])


  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setSubscribeStatus('loading')
    setErrorMessage('')

    try {
      const result = await newsletterOperations.subscribe(email, 'newsletter-section')

      if (result.success) {
        setSubscribeStatus('success')
        setIsAlreadySubscribed(result.alreadySubscribed)

        // Reset form after 3 seconds
        setTimeout(() => {
          setEmail('')
          setSubscribeStatus('idle')
          setIsAlreadySubscribed(false)
        }, 3000)
      }
    } catch (error) {
      setSubscribeStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.')

      // Reset error after 5 seconds
      setTimeout(() => {
        setSubscribeStatus('idle')
        setErrorMessage('')
      }, 5000)
    }
  }

  // Format date for display
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return ''
    try {
      const date = timestamp.toDate()
      return new Intl.DateTimeFormat('en-GB', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(date)
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-6"></div>
            <p className="text-text">Loading blog post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center py-20">
            <h1 className="font-display text-4xl font-bold text-heading mb-6">
              Blog Post Not Found
            </h1>
            <p className="text-text mb-8">
              Sorry, we couldn't find the blog post you're looking for.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-6">
        <article className="max-w-4xl mx-auto">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => {
              // Navigate to home page
              window.location.href = '/#blog'
            }}
            className="inline-flex items-center text-accent hover:text-accent-hover transition-colors mb-8"
          >
            <span className="mr-2">←</span>
            Back to Blog
          </motion.button>

          {/* Featured Image Hero */}
          {post.featuredImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-12 rounded-3xl overflow-hidden shadow-large"
            >
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-96 object-cover"
              />
            </motion.div>
          )}

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold uppercase tracking-wider">
                {post.category.replace('-', ' ')}
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-grey-100 text-grey-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-heading mb-6">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-text">
              <span>{post.author}</span>
              <span>•</span>
              <span>{formatDate(post.publishedAt)}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </motion.header>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <p className="text-lg leading-relaxed text-text">
              {post.introduction}
            </p>
          </motion.div>

          {/* Curated Recipes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-12 mb-12"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-heading mb-8">
              Featured Recipes
            </h2>

            {post.articles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-gradient-surface rounded-2xl overflow-hidden shadow-medium hover:shadow-large transition-all duration-300"
              >
                {/* Article Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={article.imageUrl || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop'}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-8">
                  {/* Article Source */}
                  <div className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
                    {article.source}
                  </div>

                  {/* Article Title */}
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-heading mb-4">
                    {index + 1}. {article.title}
                  </h3>

                  {/* Full Blog Content */}
                  <div className="prose prose-lg max-w-none mb-6">
                    <div className="text-text leading-relaxed whitespace-pre-line">
                      {article.fullContent}
                    </div>
                  </div>

                  {/* Read Original Link */}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
                  >
                    Read Original Article
                    <span className="ml-2">→</span>
                  </a>

                  {/* Relevance Score */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-grey-500">Relevance:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < article.relevanceScore
                              ? 'bg-accent'
                              : 'bg-grey-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-grey-500">
                      {article.relevanceScore}/10
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Conclusion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12 p-8 bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl border-l-4 border-accent"
          >
            <p className="text-lg leading-relaxed text-text">
              {post.conclusion}
            </p>
          </motion.div>

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center bg-gradient-to-b from-heading to-accent-dark text-white rounded-2xl p-12"
          >
            <h3 className="font-display text-3xl font-bold mb-4">
              Enjoyed this roundup?
            </h3>
            <p className="text-lg text-white/90 mb-6">
              Get weekly coffee recipes delivered to your inbox
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={subscribeStatus === 'loading'}
                aria-label="Email address"
                className="flex-1 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <motion.button
                type="submit"
                disabled={subscribeStatus === 'loading'}
                whileHover={subscribeStatus !== 'loading' ? { scale: 1.05 } : {}}
                whileTap={subscribeStatus !== 'loading' ? { scale: 0.98 } : {}}
                className="px-8 py-3 rounded-full bg-white text-heading font-semibold text-sm tracking-wide uppercase shadow-large transition-all duration-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-heading disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscribeStatus === 'loading' ? 'Subscribing...' : subscribeStatus === 'success' ? (isAlreadySubscribed ? '✓ Already Subscribed!' : '✓ Subscribed!') : 'Subscribe'}
              </motion.button>
            </form>

            {subscribeStatus === 'error' && errorMessage && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-200 mt-4 bg-red-500/20 px-4 py-2 rounded-lg"
              >
                {errorMessage}
              </motion.p>
            )}

            {subscribeStatus === 'success' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-white/90 mt-4 bg-white/10 px-4 py-2 rounded-lg"
              >
                {isAlreadySubscribed
                  ? `✓ ${email} is already subscribed!`
                  : `✓ Welcome! Check ${email} for confirmation.`}
              </motion.p>
            )}
          </motion.div>
        </article>
      </div>
    </div>
  )
}
