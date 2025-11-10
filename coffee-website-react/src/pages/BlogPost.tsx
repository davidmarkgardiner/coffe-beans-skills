import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, User, Calendar } from 'lucide-react'
import { BlogPost as BlogPostType } from '../types/blog'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

export default function BlogPost() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return

      try {
        setLoading(true)
        const docRef = doc(db, 'blogPosts', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setPost({
            id: docSnap.id,
            ...data,
            date: data.date?.toDate?.() || new Date(data.date),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          } as BlogPostType)
        } else {
          setError('Blog post not found')
        }
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setError('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md px-6"
        >
          <h1 className="text-3xl font-bold text-amber-900 mb-4">
            {error || 'Post not found'}
          </h1>
          <p className="text-amber-700 mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-24 pb-12"
    >
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Blog
        </button>

        {/* Featured Image */}
        {post.image && (
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            src={post.image}
            alt={post.title}
            className="w-full h-96 object-cover rounded-xl shadow-lg mb-8"
          />
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-amber-900 mb-6"
        >
          {post.title}
        </motion.h1>

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap gap-6 text-amber-700 mb-8 pb-8 border-b border-amber-200"
        >
          <div className="flex items-center gap-2">
            <User size={18} />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <span>{new Date(post.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <span>{post.readTime} min read</span>
          </div>
          {post.category && (
            <div className="inline-block px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-medium">
              {post.category}
            </div>
          )}
        </motion.div>

        {/* Excerpt */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg text-amber-800 mb-8 italic"
        >
          {post.excerpt}
        </motion.p>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="prose prose-lg max-w-none text-amber-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-amber-200"
          >
            <h3 className="text-sm font-semibold text-amber-900 mb-4">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back to Blog */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-12 pt-8 border-t border-amber-200"
        >
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to All Posts
          </button>
        </motion.div>
      </div>
    </motion.article>
  )
}
