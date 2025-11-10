import { motion } from 'framer-motion'
import { useCollection } from '../hooks/useFirestore'
import { orderBy, limit } from 'firebase/firestore'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: any
  readTime: string
  status: string
  featuredImage?: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const card = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

export function BlogHighlights() {
  // Fetch latest 3 published blog posts from Firestore
  // Note: Simplified query to avoid composite index requirement
  // All blog posts created by scripts have status 'published' by default
  const { data: blogPosts = [], loading, error } = useCollection<BlogPost>(
    'blog-posts',
    [
      orderBy('publishedAt', 'desc'),
      limit(3)
    ]
  )

  // Format date for display
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return ''
    try {
      const date = timestamp.toDate()
      return new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }).format(date)
    } catch {
      return ''
    }
  }

  return (
    <section className="py-20 bg-background" id="blog">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-4">
            Stockbridge Stories
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-heading mb-6">
            From Our Blog
          </h2>
          <p className="text-lg text-text max-w-2xl mx-auto leading-relaxed">
            Brew notes, neighbourhood spotlights, and behind-the-scenes reflections from the team
            crafting the Stockbridge Coffee experience.
          </p>
        </motion.div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            <p className="text-text mt-4">Loading latest posts...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load blog posts. Please try again later.</p>
          </div>
        )}

        {!loading && !error && blogPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text">No blog posts yet. Check back soon for our latest stories!</p>
          </div>
        )}

        {!loading && !error && blogPosts.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {blogPosts.map((post) => (
              <motion.article
                key={post.id}
                variants={card}
                className="relative h-full rounded-2xl bg-gradient-surface overflow-hidden shadow-medium transition-all duration-300 hover:bg-gradient-surface-hover hover:shadow-large group"
              >
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
                  </div>
                )}

                {/* Content */}
                <div className="p-8">
                  <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-4">
                    {formatDate(post.publishedAt)} · {post.readTime}
                  </p>
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-heading mb-3">
                    {post.title}
                  </h3>
                  <p className="text-sm text-text leading-relaxed mb-6">{post.excerpt}</p>
                  <a
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-accent hover:text-accent-hover transition-colors duration-200"
                  >
                    Read Recipes
                    <span aria-hidden className="ml-2 text-base">
                      →
                    </span>
                  </a>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
