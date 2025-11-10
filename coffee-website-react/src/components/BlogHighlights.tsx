import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BlogPostPreview } from '../types/blog'
import { db } from '../firebase/config'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'

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

const fallbackPosts: BlogPostPreview[] = [
  {
    id: 'origin-story',
    title: 'From Water of Leith to Micro-Roastery',
    excerpt:
      'Explore how Stockbridge Coffee has spent 20 years sourcing beans that echo the neighbourhood's artisan spirit.',
    author: 'Stockbridge Team',
    date: new Date('2025-01-12'),
    readTime: 5,
    category: 'Stories',
  },
  {
    id: 'seasonal-menu',
    title: 'Winter Aurora Menu',
    excerpt:
      'Take a peek behind the bar and discover the flavour notes inspiring our limited-edition pours this season.',
    author: 'Stockbridge Team',
    date: new Date('2025-02-02'),
    readTime: 4,
    category: 'Menu',
  },
  {
    id: 'community-market',
    title: 'Voices from Stockbridge Market',
    excerpt:
      'Hear from makers and musicians who join us every Sunday as we brew, taste, and celebrate community.',
    author: 'Stockbridge Team',
    date: new Date('2025-03-08'),
    readTime: 6,
    category: 'Community',
  },
]

export function BlogHighlights() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPostPreview[]>(fallbackPosts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, 'blogPosts'),
          where('published', '==', true),
          orderBy('date', 'desc'),
          limit(3)
        )
        const querySnapshot = await getDocs(q)

        if (querySnapshot.docs.length > 0) {
          const postsData: BlogPostPreview[] = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              title: data.title,
              excerpt: data.excerpt,
              author: data.author,
              date: data.date?.toDate?.() || new Date(data.date),
              readTime: data.readTime,
              category: data.category,
              image: data.image,
            } as BlogPostPreview
          })
          setPosts(postsData)
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err)
        // Use fallback posts on error
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {posts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={card}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="relative h-full rounded-2xl bg-gradient-surface p-8 shadow-medium transition-all duration-300 hover:bg-gradient-surface-hover hover:shadow-large cursor-pointer"
                >
                  <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-4">
                    {new Date(post.date).toLocaleDateString()} · {post.readTime} min read
                  </p>
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-heading mb-3">
                    {post.title}
                  </h3>
                  <p className="text-sm text-text leading-relaxed mb-6">{post.excerpt}</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(`/blog/${post.id}`)
                    }}
                    className="inline-flex items-center text-sm font-semibold text-accent hover:text-accent-hover transition-colors duration-200"
                  >
                    Read Story
                    <span aria-hidden className="ml-2 text-base">
                      →
                    </span>
                  </button>
                </motion.article>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12 text-center"
            >
              <button
                onClick={() => navigate('/blog')}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-white font-semibold hover:opacity-90 transition-opacity duration-200"
              >
                View All Stories
                <span aria-hidden>→</span>
              </button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
