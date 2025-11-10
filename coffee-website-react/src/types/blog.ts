export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  date: Date
  updatedAt: Date
  readTime: number
  category: string
  featured: boolean
  image?: string
  tags: string[]
  published: boolean
}

export interface BlogPostPreview {
  id: string
  title: string
  excerpt: string
  author: string
  date: Date
  readTime: number
  category: string
  image?: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
}
