import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, User, Calendar } from 'lucide-react'
import { BlogPostPreview } from '../types/blog'
import { db } from '../firebase/config'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

export default function Blog() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPostPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const q = query(
          collection(db, 'blogPosts'),
          where('published', '==', true),
          orderBy('date', 'desc')
        )
        const querySnapshot = await getDocs(q)

        const postsData: BlogPostPreview[] = querySnapshot.docs
          .map((doc) => {
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

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(postsData.map((p) => p.category).filter(Boolean))
        )
        setCategories(uniqueCategories)
      } catch (err) {
        console.error('Error fetching blog posts:', err)
        setError('Failed to load blog posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.category === selectedCategory)
    : posts

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-24 pb-12"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold text-amber-900 mb-4">Our Coffee Blog</h1>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            Discover stories, tips, and insights about our coffee journey
          </p>
        </motion.div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                All Posts
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-amber-700 text-white'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                onClick={() => navigate(`/blog/${post.id}`)}
                className="cursor-pointer group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  {/* Featured Image */}
                  {post.image && (
                    <div className="overflow-hidden h-48 bg-amber-200">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    {/* Category */}
                    {post.category && (
                      <span className="inline-block w-fit px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-medium mb-3">
                        {post.category}
                      </span>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-bold text-amber-900 mb-2 group-hover:text-amber-700 transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-amber-700 text-sm mb-4 flex-grow">
                      {post.excerpt}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-xs text-amber-600 border-t border-amber-100 pt-4">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{post.readTime} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-lg text-amber-700">
              {selectedCategory
                ? 'No posts found in this category.'
                : 'No blog posts available yet.'}
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-4 text-amber-700 hover:text-amber-900 font-medium"
              >
                View all posts
              </button>
            )}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 text-red-600"
          >
            <p>{error}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
