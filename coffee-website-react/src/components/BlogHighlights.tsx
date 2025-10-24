import { motion } from 'framer-motion'

const blogPosts = [
  {
    id: 'origin-story',
    title: 'From Water of Leith to Micro-Roastery',
    excerpt:
      'Explore how Stockbridge Coffee has spent 20 years sourcing beans that echo the neighbourhood’s artisan spirit.',
    date: 'Jan 12, 2025',
    readTime: '5 min read',
  },
  {
    id: 'seasonal-menu',
    title: 'Winter Aurora Menu',
    excerpt:
      'Take a peek behind the bar and discover the flavour notes inspiring our limited-edition pours this season.',
    date: 'Feb 02, 2025',
    readTime: '4 min read',
  },
  {
    id: 'community-market',
    title: 'Voices from Stockbridge Market',
    excerpt:
      'Hear from makers and musicians who join us every Sunday as we brew, taste, and celebrate community.',
    date: 'Mar 08, 2025',
    readTime: '6 min read',
  },
]

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
              className="relative h-full rounded-2xl bg-gradient-surface p-8 shadow-medium transition-all duration-300 hover:bg-gradient-surface-hover hover:shadow-large"
            >
              <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">
                {post.date} · {post.readTime}
              </p>
              <h3 className="font-display text-2xl font-semibold tracking-tight text-heading mb-3">
                {post.title}
              </h3>
              <p className="text-sm text-text leading-relaxed mb-6">{post.excerpt}</p>
              <a
                href={`/blog/${post.id}`}
                className="inline-flex items-center text-sm font-semibold text-accent hover:text-accent-hover transition-colors duration-200"
              >
                Read Story
                <span aria-hidden className="ml-2 text-base">
                  →
                </span>
              </a>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
