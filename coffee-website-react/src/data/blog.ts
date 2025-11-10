import type { BlogInfo } from '../types/product'

export const blogPosts: BlogInfo[] = [
  {
    id: 'origin-story',
    title: 'From Water of Leith to Micro-Roastery',
    excerpt:
      'Explore how Stockbridge Coffee has spent 20 years sourcing beans that echo the neighbourhood\'s artisan spirit.',
    date: 'Jan 12, 2025',
    readTime: '5 min read',
    author: 'Stockbridge Team',
    tags: ['origin', 'sourcing', 'community'],
  },
  {
    id: 'seasonal-menu',
    title: 'Winter Aurora Menu',
    excerpt:
      'Take a peek behind the bar and discover the flavour notes inspiring our limited-edition pours this season.',
    date: 'Feb 02, 2025',
    readTime: '4 min read',
    author: 'Coffee Experts',
    tags: ['seasonal', 'menu', 'tasting'],
  },
  {
    id: 'community-market',
    title: 'Voices from Stockbridge Market',
    excerpt:
      'Hear from makers and musicians who join us every Sunday as we brew, taste, and celebrate community.',
    date: 'Mar 08, 2025',
    readTime: '6 min read',
    author: 'Community Contributor',
    tags: ['community', 'market', 'events'],
  },
]

export const getBlogPost = (id: string): BlogInfo | undefined => {
  return blogPosts.find((post) => post.id === id)
}

export const getAllBlogPosts = (): BlogInfo[] => {
  return blogPosts
}
