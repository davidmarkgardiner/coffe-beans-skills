# Blog Information Structure

## Overview

This document describes the blog information architecture for the Stockbridge Coffee website. The blog system is built with a clear separation of concerns between data, types, and components.

## Blog Info Types

### `BlogInfo` Interface

Located in `src/types/product.ts`, the `BlogInfo` interface defines the structure for blog post metadata:

```typescript
export interface BlogInfo {
  id: string              // Unique identifier for the blog post
  title: string           // Post title
  excerpt: string         // Short description/preview
  date: string            // Publication date (e.g., "Jan 12, 2025")
  readTime: string        // Estimated reading time (e.g., "5 min read")
  content?: string        // Full post content (optional)
  author?: string         // Post author name (optional)
  tags?: string[]         // Array of topic tags (optional)
  imageUrl?: string       // Featured image URL (optional)
}
```

### `BlogPost` Interface

Extends `BlogInfo` with required content:

```typescript
export interface BlogPost extends BlogInfo {
  content: string  // Full post content (required for full posts)
}
```

## Blog Data Structure

### Blog Posts Data

Located in `src/data/blog.ts`, all blog post data is centralized:

```typescript
export const blogPosts: BlogInfo[] = [
  {
    id: 'origin-story',
    title: 'From Water of Leith to Micro-Roastery',
    excerpt: 'Explore how Stockbridge Coffee has spent 20 years sourcing beans...',
    date: 'Jan 12, 2025',
    readTime: '5 min read',
    author: 'Stockbridge Team',
    tags: ['origin', 'sourcing', 'community'],
  },
  // ... more posts
]
```

### Helper Functions

#### `getBlogPost(id: string): BlogInfo | undefined`

Retrieves a specific blog post by ID:

```typescript
import { getBlogPost } from '@/data/blog'

const post = getBlogPost('origin-story')
if (post) {
  console.log(post.title)  // "From Water of Leith to Micro-Roastery"
}
```

#### `getAllBlogPosts(): BlogInfo[]`

Retrieves all blog posts:

```typescript
import { getAllBlogPosts } from '@/data/blog'

const allPosts = getAllBlogPosts()
console.log(allPosts.length)  // Total number of posts
```

## Components Using Blog Info

### BlogHighlights Component

Located in `src/components/BlogHighlights.tsx`, displays a preview of blog posts:

- Uses `getAllBlogPosts()` to fetch blog data
- Renders blog posts with proper TypeScript typing
- Provides navigation links to full blog posts
- Includes Framer Motion animations

## Future Enhancements

### Planned Features

1. **Dynamic Blog Post Pages**
   - Full blog post detail pages at `/blog/{post-id}`
   - Individual page components for each blog post

2. **Firebase Integration**
   - Store blog posts in Firestore for dynamic management
   - Add CMS capabilities for blog post management

3. **Blog Management API**
   - Create new blog posts programmatically
   - Update existing blog posts
   - Delete blog posts

4. **Advanced Features**
   - Comment system for blog posts
   - Related posts recommendations
   - Blog post search functionality
   - Category/tag filtering

## Adding New Blog Posts

To add a new blog post:

1. Open `src/data/blog.ts`
2. Add a new object to the `blogPosts` array:

```typescript
{
  id: 'unique-post-id',
  title: 'Post Title',
  excerpt: 'Short preview of the post...',
  date: 'Month DD, YYYY',
  readTime: 'X min read',
  author: 'Author Name',
  tags: ['tag1', 'tag2', 'tag3'],
}
```

3. The post will automatically appear on the homepage blog section

## Testing

### E2E Tests

Blog functionality is tested in `e2e/blog.spec.ts`:

- Verifies blog section visibility
- Validates blog post structure
- Tests blog post links
- Ensures no console errors

Run tests with:
```bash
npx playwright test e2e/blog.spec.ts
```

## Files Modified

- `src/types/product.ts` - Added `BlogInfo` and `BlogPost` interfaces
- `src/data/blog.ts` - Centralized blog post data
- `src/components/BlogHighlights.tsx` - Updated to use new types and data structure
- `e2e/blog.spec.ts` - Added comprehensive blog tests

## Type Safety

The blog system provides full TypeScript support:

```typescript
import type { BlogInfo, BlogPost } from '@/types/product'
import { getBlogPost, getAllBlogPosts } from '@/data/blog'

// Fully typed blog data
const post: BlogInfo | undefined = getBlogPost('origin-story')
const allPosts: BlogInfo[] = getAllBlogPosts()
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│         Blog Info Architecture                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  src/types/product.ts                          │
│  ├── BlogInfo interface                         │
│  └── BlogPost interface                         │
│                                                 │
│  src/data/blog.ts                              │
│  ├── blogPosts data array                       │
│  ├── getBlogPost(id) function                   │
│  └── getAllBlogPosts() function                 │
│                                                 │
│  src/components/BlogHighlights.tsx              │
│  └── Renders blog previews                      │
│                                                 │
│  e2e/blog.spec.ts                              │
│  └── Tests blog functionality                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Questions?

For more information about the blog system or to request additional features, please refer to the related documentation or create an issue.
