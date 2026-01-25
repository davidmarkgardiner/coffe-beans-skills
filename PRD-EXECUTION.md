# PRD Execution Plan
## Detailed Task Breakdown by Phase

---

## Table of Contents

1. [Phase 1: Quick Wins (1-2 weeks)](#phase-1-quick-wins)
2. [Phase 2: Core Improvements (3-4 weeks)](#phase-2-core-improvements)
3. [Phase 3: Advanced Features (4-6 weeks)](#phase-3-advanced-features)
4. [Phase 4: Infrastructure (2-3 weeks)](#phase-4-infrastructure)
5. [Phase 5: AI & Automation (3-4 weeks)](#phase-5-ai--automation)

---

## Phase 1: Quick Wins (1-2 weeks)

**Goal:** Immediate value improvements with low effort, high impact

### Task 1.1: Add Comprehensive Error Handling
**Priority:** High
**Estimated Effort:** 8-12 hours
**Dependencies:** None

**Description:**
- Add try-catch blocks to all async operations
- Implement global error boundary
- Add user-friendly error messages
- Log errors to Sentry

**Implementation:**

```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)

    // Log to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

function ErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">
        Oops! Something went wrong
      </h1>
      <p className="text-gray-600 mb-6">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-coffee-700 text-white rounded-lg"
      >
        Refresh Page
      </button>
    </div>
  )
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Acceptance Criteria:**
- [ ] Error boundary wraps entire app
- [ ] All async operations have error handling
- [ ] User-friendly error messages displayed
- [ ] Errors logged to Sentry
- [ ] Reload button available

---

### Task 1.2: Implement Loading States
**Priority:** High
**Estimated Effort:** 6-8 hours
**Dependencies:** None

**Description:**
- Add loading indicators for all async operations
- Implement skeleton loaders
- Add loading overlays for actions
- Use consistent loading patterns

**Implementation:**

```typescript
// components/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-coffee-700 border-t-transparent ${sizeClasses[size]}`} />
  )
}

// components/SkeletonCard.tsx
export function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-20 bg-gray-200 rounded animate-pulse mt-4" />
    </div>
  )
}

// Usage in ProductList
export function ProductList() {
  const { data: products, isLoading } = useProducts()

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// Usage in buttons
function AddToCartButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-4 py-2 bg-coffee-700 text-white rounded-lg
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          Adding...
        </span>
      ) : (
        'Add to Cart'
      )}
    </button>
  )
}
```

**Acceptance Criteria:**
- [ ] Loading spinner component created
- [ ] Skeleton loaders for lists/grids
- [ ] Button loading states implemented
- [ ] All API calls show loading state
- [ ] Consistent loading UI across app

---

### Task 1.3: Set Up Basic Analytics
**Priority:** High
**Estimated Effort:** 4-6 hours
**Dependencies:** None

**Description:**
- Install Google Analytics 4
- Install Vercel Analytics
- Add basic event tracking
- Set up page view tracking

**Implementation:**

```bash
# Install packages
npm install @next/third-parties @vercel/analytics
```

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
        <Analytics />
      </body>
    </html>
  )
}

// lib/analytics.ts
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return

  // Google Analytics
  (window as any).gtag('event', name, properties)

  // Vercel Analytics
  if ((window as any).va) {
    (window as any).va.track(name, properties)
  }
}

export function trackPageView(path: string) {
  if (typeof window === 'undefined') return

  // Google Analytics
  (window as any).gtag('event', 'page_view', { page_path: path })

  // Vercel Analytics
  if ((window as any).va) {
    (window as any).va.track('pageview', { path })
  }
}

// Usage in components
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  return null
}
```

**Acceptance Criteria:**
- [ ] GA4 configured and tracking page views
- [ ] Vercel Analytics installed
- [ ] Event tracking function created
- [ ] Page view tracking working
- [ ] Events firing correctly in GA4 dashboard
- [ ] Events visible in Vercel Analytics

---

### Task 1.4: Fix Critical Accessibility Issues
**Priority:** High
**Estimated Effort:** 12-16 hours
**Dependencies:** None

**Description:**
- Run axe DevTools audit
- Fix critical and serious issues
- Add skip to main content link
- Improve focus management
- Add ARIA labels

**Implementation:**

```bash
# Install accessibility tools
npm install -D @axe-core/react jest-axe
```

```typescript
// Fix 1: Skip to main content
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                 px-4 py-2 bg-coffee-700 text-white rounded-lg"
        >
          Skip to main content
        </a>
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  )
}

// Fix 2: Add ARIA labels to buttons
<button
  aria-label="Add to cart: {product.name}"
  onClick={addToCart}
>
  <ShoppingCart className="w-5 h-5" />
</button>

// Fix 3: Alt text for images
<img
  src={product.image}
  alt={product.name}
  loading="lazy"
/>

// Fix 4: Focus management in modals
export function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus first focusable element
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea'
      ) as HTMLElement
      firstFocusable?.focus()

      // Trap focus
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea'
          )
          const firstElement = focusableElements?.[0] as HTMLElement
          const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      modalRef.current?.addEventListener('keydown', handleKeyDown)

      return () => {
        modalRef.current?.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  )
}

// Fix 5: Focus returned after modal closes
function closeModal() {
  const previouslyFocused = document.activeElement as HTMLElement
  onClose()
  // Return focus to triggering element
  setTimeout(() => previouslyFocused?.focus(), 0)
}
```

**Acceptance Criteria:**
- [ ] Axe DevTools shows 0 critical issues
- [ ] Skip link implemented and working
- [ ] All buttons have ARIA labels
- [ ] All images have alt text
- [ ] Focus properly trapped in modals
- [ ] Focus returned after modal closes
- [ ] Keyboard navigation works throughout app
- [ ] Color contrast meets WCAG AA standards

---

### Task 1.5: Add Dark Mode Support
**Priority:** Medium
**Estimated Effort:** 12-16 hours
**Dependencies:** None

**Description:**
- Implement dark mode toggle
- Add system preference detection
- Create dark mode color palette
- Persist user preference

**Implementation:**

```typescript
// hooks/useTheme.ts
'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setThemeState(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    let effectiveTheme = theme

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }

    root.classList.toggle('dark', effectiveTheme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return { theme, setTheme, mounted }
}
```

```typescript
// tailwind.config.js
module.exports = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#FDF8F3',
          100: '#FAEDE2',
          200: '#F5DCBE',
          300: '#E0C396',
          400: '#C5A970',
          500: '#A88F4F',
          600: '#8B7533',
          700: '#6B4423',
          800: '#4D311B',
          900: '#3D2B1F',
          950: '#261A16',
        }
      },
      dark: {
        coffee: {
          50: '#3D2B1F',
          100: '#4D311B',
          200: '#5C3D28',
          300: '#6B4936',
          400: '#7A5543',
          500: '#8B7533',
          600: '#9C853F',
          700: '#6B4423', // Primary color stays same
          800: '#8B7533',
          900: '#A88F4F',
          950: '#B5AA5E',
        }
      }
    }
  }
}
```

```typescript
// components/ThemeToggle.tsx
'use client'

import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme()

  if (!mounted) return null

  return (
    <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-700 shadow'
            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        aria-label="Light mode"
      >
        <Sun className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-700 shadow'
            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        aria-label="Dark mode"
      >
        <Moon className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 shadow'
            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        aria-label="System theme"
      >
        <Monitor className="w-5 h-5" />
      </button>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Theme toggle component created
- [ ] System preference detection working
- [ ] Theme persisted to localStorage
- [ ] Dark mode color palette defined
- [ ] All components work in both modes
- [ ] Theme toggle in navigation bar
- [ ] Smooth transitions between themes

---

### Task 1.6: Optimize Images
**Priority:** High
**Estimated Effort:** 8-12 hours
**Dependencies:** None

**Description:**
- Convert images to WebP format
- Implement lazy loading
- Add responsive image sizes
- Optimize image compression

**Implementation:**

```bash
# Install image optimization tools
npm install next/image sharp

# Optimize images
# Use Next.js Image component
```

```typescript
// Use Next.js Image component
import Image from 'next/image'

export function ProductCard({ product }) {
  return (
    <div>
      <Image
        src={product.image}
        alt={product.name}
        width={400}
        height={400}
        priority={false}
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBAIDAAAAAAAAAAABAgMABBEFEiExQVFhBhJxof/aAAgBAQABBQLEAAAAAAAAAAAAAAAAAAEDBgcICQoL/aAAgBAQACAgMBAAAAAAAAAAAAAAAAAwQBAgUGB//aAAwDAQACAQAAAAAAAEAAAMAAAIREEhMUBf/EABwRAAEFAQACAwAAAAAAAAAAAAAEAQMEESIExQVFh/2gAIAQEAAT8Qf/EABwRAAICAgMAAAAAAAAAAAAAAAABAgMRECEQMUFRYf/aAAgBAQABBQEJAAAAAAAAAAAAAAAACAwERICEQITFP/2gAIAQEAAT8Qf/EABkRAAEFAAMBAAAAAAAAAAAAAAABAgMRBCBBIhMUIv/aAAgBAQABBQEBAAAAAAAAAAAAAAIAAwQRECESE//EABkRAAEFAQEBAAAAAAAAAAAAAAABAgMRECEQMUFRYf/aAAgBAQABBQEJAAAAAAAAAAAAAAIAAwQRECESE//EABkQAQACAwEAAAAAAAAAAAAAAAECERAhMUBVH/2gAIAQEAAT8Qf/EABsQAAMAAQIDAAAAAAAAAAAAAAABESEAESExQVFh/9oACAEBAAE8QH/xAAcEAACAgIDAAAAAAAAAAAAAAABEQAhMSBBBVFh/9oACAEBAAE8QH/xAAcEQABAwEAAAAAAAAAAAAAAABECESESMUFRYf/aAAgBAQABBQEJAAAAAAAAAAAAAAIAAwQRECESE//EABkQAQACAgMAAAAAAAAAAAAAAAEBESESMUFRYf/aAAgBAQABBQEBAAAAAAAAAAAAAAIAAwQRECESE//aAAgBAQEBPxB"
      />
      <h3>{product.name}</h3>
    </div>
  )
}

// For dynamic images with sizes
export function HeroImage({ product }) {
  return (
    <Image
      src={product.image}
      alt={product.name}
      width={1200}
      height={600}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority
    />
  )
}

// Generate responsive images script
// scripts/generate-responsive-images.sh
#!/bin/bash

for file in public/images/products/*.jpg; do
  filename=$(basename "$file" .jpg)

  # Generate different sizes
  convert "$file" -resize 400x400 "public/images/products/${filename}-400w.webp"
  convert "$file" -resize 800x800 "public/images/products/${filename}-800w.webp"
  convert "$file" -resize 1200x1200 "public/images/products/${filename}-1200w.webp"

  # Optimize original
  convert "$file" -quality 85 "public/images/products/${filename}-optimized.webp"
done

echo "Image optimization complete!"
```

**Acceptance Criteria:**
- [ ] All images converted to WebP
- [ ] Lazy loading implemented for images below fold
- [ ] Responsive image sizes configured
- [ ] Image compression optimized
- [ ] Priority images load immediately
- [ ] Lighthouse image score improved to > 90
- [ ] Page load time reduced

---

### Task 1.7: Add SEO Meta Tags Dynamically
**Priority:** High
**Estimated Effort:** 6-8 hours
**Dependencies:** None

**Description:**
- Implement Next.js metadata API
- Add dynamic Open Graph tags
- Create sitemap.xml
- Add structured data (JSON-LD)

**Implementation:**

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Stockbridge Coffee Roastery | Premium Single-Origin Coffee',
  description: 'Discover exceptional single-origin coffee beans roasted to perfection. Free UK delivery on orders over £25.',
  keywords: ['coffee', 'single-origin', 'specialty coffee', 'coffee beans', 'uk coffee'],
  authors: [{ name: 'Stockbridge Coffee Roastery' }],
  creator: 'Stockbridge Coffee Roastery',
  publisher: 'Stockbridge Coffee Roastery',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://stockbridgecoffee.co.uk'),
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://stockbridgecoffee.co.uk',
    siteName: 'Stockbridge Coffee Roastery',
    title: 'Stockbridge Coffee Roastery | Premium Single-Origin Coffee',
    description: 'Discover exceptional single-origin coffee beans roasted to perfection.',
    images: [
      {
        url: 'https://stockbridgecoffee.co.uk/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Stockbridge Coffee Roastery'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stockbridge Coffee Roastery',
    description: 'Discover exceptional single-origin coffee beans.',
    images: ['https://stockbridgecoffee.co.uk/twitter-image.jpg'],
    creator: '@stockbridgecoffee'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  manifest: '/manifest.json'
}
```

```typescript
// app/products/[id]/page.tsx
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const product = await getProduct(params.id)

  return {
    title: `${product.name} | Stockbridge Coffee Roastery`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
      type: 'product'
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.image]
    },
    alternates: {
      canonical: `/products/${product.id}`
    }
  }
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct(params.id)

  return (
    <>
      <StructuredData product={product} />
      <ProductDetails product={product} />
    </>
  )
}
```

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()

  return [
    {
      url: 'https://stockbridgecoffee.co.uk',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    ...products.map(product => ({
      url: `https://stockbridgecoffee.co.uk/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8
    })),
    {
      url: 'https://stockbridgecoffee.co.uk/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ]
}
```

```typescript
// components/StructuredData.tsx
export function ProductStructuredData({ product }: { product: Product }) {
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [product.image],
    brand: {
      '@type': 'Brand',
      name: 'Stockbridge Coffee Roastery'
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'GBP',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://stockbridgecoffee.co.uk/products/${product.id}`
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount
    } : undefined
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

**Acceptance Criteria:**
- [ ] Metadata API implemented in layout
- [ ] Dynamic meta tags for products
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] Sitemap.xml generated
- [ ] Structured data (JSON-LD) added
- [ ] Canonical URLs set
- [ ] Robots.txt configured
- [ ] Lighthouse SEO score > 90

---

## Phase 2: Core Improvements (3-4 weeks)

**Goal:** Modernize tech stack and establish testing foundation

### Task 2.1: Migrate to Next.js 15 App Router
**Priority:** Critical
**Estimated Effort:** 32-40 hours
**Dependencies:** None

**Description:**
- Create new Next.js project
- Migrate React components to App Router
- Convert Express routes to API routes
- Update build and deployment configuration

**Implementation Steps:**

**Step 1: Setup**
```bash
npx create-next-app@latest coffee-website-nextjs
cd coffee-website-nextjs
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install framer-motion lucide-react
```

**Step 2: Directory Structure**
```
coffee-website-nextjs/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts
│   │   ├── products/
│   │   │   └── route.ts
│   │   └── checkout/
│   │       └── route.ts
│   └── sitemap.ts
├── components/
├── lib/
├── hooks/
├── store/
└── public/
```

**Step 3: Migration Checklist**

- [ ] Create `app/layout.tsx` with metadata
- [ ] Migrate `Navigation.tsx` component
- [ ] Migrate `Hero.tsx` component
- [ ] Migrate `ProductCard.tsx` component
- [ ] Migrate `CartDrawer.tsx` component
- [ ] Convert Express `/api/chat` to `app/api/chat/route.ts`
- [ ] Convert Express `/api/products` to `app/api/products/route.ts`
- [ ] Convert Express `/api/checkout` to `app/api/checkout/route.ts`
- [ ] Update all imports to use Next.js Image
- [ ] Configure Vite → Next.js build
- [ ] Update deployment scripts

**Express to Next.js API Migration:**

```typescript
// Before: Express route
// server/index.ts
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages
  })
  res.json({ reply: response.choices[0].message })
})

// After: Next.js route
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { messages } = body

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages
  })

  return NextResponse.json({
    reply: response.choices[0].message
  })
}
```

**Acceptance Criteria:**
- [ ] Next.js 15 project created
- [ ] All pages migrated to App Router
- [ ] All components converted to Server Components where possible
- [ ] Express API routes converted to Next.js API routes
- [ ] Build process working with Next.js
- [ ] Application functions identically to React version
- [ ] Performance improved (verified with Lighthouse)

---

### Task 2.2: Implement shadcn/ui Component Library
**Priority:** High
**Estimated Effort:** 16-20 hours
**Dependencies:** Task 2.1 (Next.js migration complete)

**Description:**
- Initialize shadcn/ui
- Install required components
- Replace custom components with shadcn equivalents
- Maintain design consistency

**Implementation:**

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add select
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tabs
```

**Migration Plan:**

```typescript
// Before: Custom Button
// components/Button.tsx
const Button = ({ children, onClick, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-coffee-700 text-white hover:bg-coffee-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-coffee-700 text-coffee-700 hover:bg-coffee-50'
  }

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg ${variants[variant]}`}
    >
      {children}
    </button>
  )
}

// After: shadcn/ui Button
// components/ui/button.tsx (auto-generated)
// Usage
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function AddToCartButton({ loading, onClick }) {
  return (
    <Button onClick={onClick} disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Add to Cart
    </Button>
  )
}

// Before: Custom Card
// components/Card.tsx
const Card = ({ children, className }) => (
  <div className={`border rounded-lg p-4 ${className}`}>
    {children}
  </div>
)

// After: shadcn/ui Card
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProductCard({ product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{product.description}</p>
      </CardContent>
    </Card>
  )
}

// Before: Custom Modal
// components/Modal.tsx
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg">
        {children}
      </div>
    </div>
  )
}

// After: shadcn/ui Dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function CheckoutModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Complete your purchase details
          </DialogDescription>
        </DialogHeader>
        <CheckoutForm />
        <DialogFooter>
          <Button onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Component Replacement Checklist:**

- [ ] Button → shadcn/ui Button
- [ ] Card → shadcn/ui Card
- [ ] Input → shadcn/ui Input
- [ ] Label → shadcn/ui Label
- [ ] Dialog → shadcn/ui Dialog
- [ ] DropdownMenu → shadcn/ui DropdownMenu
- [ ] Tabs → shadcn/ui Tabs
- [ ] Sheet (drawer) → shadcn/ui Sheet
- [ ] Form components → shadcn/ui Form
- [ ] Toast notifications → shadcn/ui Toaster
- [ ] Select dropdowns → shadcn/ui Select
- [ ] Badge → shadcn/ui Badge
- [ ] Separator → shadcn/ui Separator

**Acceptance Criteria:**
- [ ] shadcn/ui initialized
- [ ] All required components installed
- [ ] Custom components replaced with shadcn equivalents
- [ ] Design consistency maintained
- [ ] All components work with dark mode
- [ ] Accessibility improved (Radix primitives)
- [ ] Reduced custom CSS

---

### Task 2.3: Add Zustand State Management
**Priority:** High
**Estimated Effort:** 12-16 hours
**Dependencies:** Task 2.1 (Next.js migration)

**Description:**
- Install Zustand
- Create store modules
- Replace React Context with Zustand
- Implement persistence

**Implementation:**

```bash
npm install zustand
```

```typescript
// store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartState {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  get subtotal: () => number
  get total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            }
          }
          return { items: [...state.items, item] }
        }),

      removeFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        })),

      clearCart: () => set({ items: [] }),

      get subtotal: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      get total: () => {
        const state = get()
        const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        return subtotal * 1.2 // 20% tax
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)
```

```typescript
// store/wishlist.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  items: string[]
  toggleWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (productId) =>
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items.filter((id) => id !== productId)
            : [...state.items, productId]
        })),

      isInWishlist: (productId) => get().items.includes(productId)
    }),
    {
      name: 'wishlist-storage'
    }
  )
)
```

```typescript
// store/ui.ts
import { create } from 'zustand'

interface UIState {
  cartOpen: boolean
  mobileMenuOpen: boolean
  searchOpen: boolean
  setCartOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open })
}))
```

**Migration Checklist:**

- [ ] Remove React Context providers
- [ ] Create cart store with Zustand
- [ ] Create wishlist store with Zustand
- [ ] Create UI state store with Zustand
- [ ] Update all components to use Zustand stores
- [ ] Remove context imports
- [ ] Test state persistence across page reloads

**Acceptance Criteria:**
- [ ] Zustand installed and configured
- [ ] Cart state managed with Zustand
- [ ] Wishlist state managed with Zustand
- [ ] UI state managed with Zustand
- [ ] Context providers removed
- [ ] State persists across sessions
- [ ] DevTools available for debugging

---

### Task 2.4: Set Up Comprehensive Testing
**Priority:** Critical
**Estimated Effort:** 24-32 hours
**Dependencies:** Task 2.1 (Next.js migration)

**Description:**
- Set up Vitest for unit tests
- Configure Playwright for E2E tests
- Create test utilities
- Write initial test suite

**Implementation:**

```bash
# Install testing tools
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test
npm install -D msw
```

**vitest.config.ts:**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts'
      ]
    }
  }
})
```

**tests/setup.ts:**

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})
```

**Unit Test Example:**

```typescript
// tests/unit/store/cart.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/store/cart'
import { renderHook, act } from '@testing-library/react'

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addToCart({
        id: '1',
        name: 'Test Product',
        price: 10,
        quantity: 1,
        image: '/test.jpg'
      })
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].name).toBe('Test Product')
  })

  it('should calculate subtotal correctly', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addToCart({
        id: '1',
        name: 'A',
        price: 10,
        quantity: 2,
        image: '/a.jpg'
      })
    })

    expect(result.current.subtotal).toBe(20)
  })

  it('should update quantity of existing item', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addToCart({
        id: '1',
        name: 'Test Product',
        price: 10,
        quantity: 1,
        image: '/test.jpg'
      })

      result.current.updateQuantity('1', 3)
    })

    expect(result.current.items[0].quantity).toBe(3)
  })
})
```

**E2E Test Example:**

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('should complete checkout successfully', async ({ page }) => {
    await page.goto('/')

    // Add product to cart
    await page.click('[data-testid="product-1"]')
    await page.click('text=Add to Cart')

    // Open cart
    await page.click('[data-testid="cart-icon"]')

    // Proceed to checkout
    await page.click('text=Checkout')

    // Fill checkout form
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="name"]', 'Test User')
    await page.fill('[data-testid="address"]', '123 Test Street')
    await page.fill('[data-testid="city"]', 'London')

    // Fill card details
    await page.frameLocator('iframe').locator('[name="cardnumber"]').fill('4242 4242 4242 4242')
    await page.frameLocator('iframe').locator('[name="exp-date"]').fill('12/34')
    await page.frameLocator('iframe').locator('[name="cvc"]').fill('123')

    // Submit payment
    await page.click('text=Pay')

    // Verify success
    await expect(page.locator('text=Order confirmed')).toBeVisible()
    await expect(page.locator('text=Thank you for your order')).toBeVisible()
  })

  test('should show validation errors for missing fields', async ({ page }) => {
    await page.goto('/checkout')

    // Try to submit without filling form
    await page.click('text=Pay')

    // Verify error messages
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Address is required')).toBeVisible()
  })
})
```

**playwright.config.ts:**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Acceptance Criteria:**
- [ ] Vitest configured and running
- [ ] Test utilities created
- [ ] Unit tests for all hooks written
- [ ] Unit tests for key components written
- [ ] Playwright configured
- [ ] E2E tests for critical flows written
- [ ] Test coverage > 80%
- [ ] CI/CD runs tests automatically
- [ ] All tests passing

---

### Task 2.5: Implement React Query for Caching
**Priority:** High
**Estimated Effort:** 12-16 hours
**Dependencies:** Task 2.1 (Next.js migration), Task 2.3 (Zustand)

**Description:**
- Install React Query
- Set up QueryClient provider
- Convert API calls to use React Query
- Configure caching and revalidation

**Implementation:**

```bash
npm install @tanstack/react-query
```

```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

```typescript
// lib/api.ts
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products')
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  return response.json()
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch product')
  }
  return response.json()
}

export async function addToCart(item: CartItem): Promise<Cart> {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  })
  return response.json()
}
```

```typescript
// hooks/useProducts.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '@/lib/api'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// hooks/useProduct.ts
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

// hooks/useAddToCart.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      // Invalidate cart query
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      // Show success toast
      toast.success('Item added to cart')
    },
    onError: (error) => {
      toast.error('Failed to add item to cart')
      console.error(error)
    }
  })
}
```

```typescript
// Usage in components
import { useProducts } from '@/hooks/useProducts'
import { useAddToCart } from '@/hooks/useAddToCart'

export function ProductList() {
  const { data: products, isLoading, error } = useProducts()
  const addToCart = useAddToCart()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorFallback error={error} />

  return (
    <div className="grid grid-cols-3 gap-6">
      {products?.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => addToCart.mutate(product)}
        />
      ))}
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] React Query installed and configured
- [ ] QueryClient provider wraps app
- [ ] All API calls use React Query
- [ ] Mutations use useMutation
- [ ] Cache invalidation configured
- [ ] Stale time configured appropriately
- [ ] Loading states working
- [ ] Error handling improved

---

### Task 2.6: Add PWA Features
**Priority:** Medium
**Estimated Effort:** 16-20 hours
**Dependencies:** Task 2.1 (Next.js migration)

**Description:**
- Configure next-pwa
- Create app manifest
- Add service worker
- Implement install prompt
- Test offline functionality

**Implementation:**

```bash
npm install next-pwa
```

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-routes\.js$/],
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = withPWA(nextConfig)
```

```json
{
  "name": "Stockbridge Coffee",
  "short_name": "Stockbridge",
  "description": "Premium single-origin coffee beans",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#6B4423",
  "theme_color": "#6B4423",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["shopping", "food", "lifestyle"],
  "shortcuts": [
    {
      "name": "Shop",
      "short_name": "Shop",
      "description": "Browse our coffee collection",
      "url": "/products",
      "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }]
    },
    {
      "name": "Cart",
      "short_name": "Cart",
      "description": "View your cart",
      "url": "/cart",
      "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }]
    }
  ]
}
```

```typescript
// components/InstallPWA.tsx
'use client'

import { useEffect, useState } from 'react'

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowInstall(false)
      }
    }
  }

  if (!showInstall) return null

  return (
    <button
      onClick={handleInstall}
      className="px-4 py-2 bg-coffee-700 text-white rounded-lg"
    >
      Install App
    </button>
  )
}
```

**Acceptance Criteria:**
- [ ] PWA configured with next-pwa
- [ ] Manifest file created
- [ ] Service worker registered
- [ ] Install prompt displayed when appropriate
- [ ] App installs to home screen
- [ ] Offline page displays correctly
- [ ] Assets cached properly
- [ ] Lighthouse PWA score > 90

---

## Phase 3: Advanced Features (4-6 weeks)

**Goal:** Upgrade infrastructure and add e-commerce features

### Task 3.1: Upgrade to Supabase
**Priority:** Critical
**Estimated Effort:** 32-40 hours
**Dependencies:** Task 2.1 (Next.js migration)

**Description:**
- Set up Supabase project
- Create PostgreSQL schema
- Migrate data from Firebase
- Update all API calls
- Implement authentication

**Implementation:**

```bash
# Install Supabase client
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

**Schema Migration:**

```sql
-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  stock INTEGER DEFAULT 0,
  sold INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  image TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX products_active_idx ON products(active);
CREATE INDEX products_category_idx ON products(category);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  customer_email TEXT NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  shipping_address JSONB,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX orders_user_idx ON orders(user_id);
CREATE INDEX orders_status_idx ON orders(status);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

CREATE INDEX order_items_order_idx ON order_items(order_id);
CREATE INDEX order_items_product_idx ON order_items(product_id);

-- Carts
CREATE TABLE carts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX reviews_product_idx ON reviews(product_id);

-- Wishlists
CREATE TABLE wishlists (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products are viewable by everyone"
ON products FOR SELECT
USING (active = true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);
```

**Migration Script:**

```typescript
// scripts/migrate-to-supabase.ts
import { createClient } from '@supabase/supabase-js'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

const firebaseApp = initializeApp(process.env.FIREBASE_CONFIG)
const firestore = getFirestore(firebaseApp)

async function migrateProducts() {
  console.log('Migrating products...')

  const snapshot = await getDocs(collection(firestore, 'products'))

  for (const doc of snapshot.docs) {
    const data = doc.data()

    await supabase.from('products').insert({
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      stock: data.stock,
      image: data.image,
      active: data.active ?? true
    })

    console.log(`Migrated: ${data.name}`)
  }

  console.log('Products migration complete!')
}

async function migrateOrders() {
  console.log('Migrating orders...')

  const snapshot = await getDocs(collection(firestore, 'orders'))

  for (const doc of snapshot.docs) {
    const data = doc.data()

    await supabase.from('orders').insert({
      user_id: data.userId || null,
      customer_email: data.customerEmail,
      status: data.status,
      total: data.total,
      shipping_address: data.shippingAddress,
      billing_address: data.billingAddress
    })

    console.log(`Migrated order: ${doc.id}`)
  }

  console.log('Orders migration complete!')
}

// Run migrations
migrateProducts().then(() => migrateOrders())
```

**Acceptance Criteria:**
- [ ] Supabase project created
- [ ] PostgreSQL schema defined
- [ ] Row Level Security enabled
- [ ] Data migrated from Firebase
- [ ] Authentication flow working
- [ ] All API calls updated to Supabase
- [ ] Performance benchmarks met
- [ ] Backup strategy in place

---

### Task 3.2: Add Product Reviews & Ratings
**Priority:** High
**Estimated Effort:** 20-24 hours
**Dependencies:** Task 3.1 (Supabase complete)

**Description:**
- Create reviews schema
- Build review submission form
- Display reviews on product pages
- Calculate average ratings

**Implementation:**

```typescript
// app/api/products/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      user:users(name, avatar_url)
    `)
    .eq('product_id', params.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ reviews })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { rating, title, content, userId } = body

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'Invalid rating' },
      { status: 400 }
    )
  }

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      product_id: params.id,
      user_id: userId,
      rating,
      title,
      content
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Update product rating
  await updateProductRating(params.id)

  return NextResponse.json({ review })
}

async function updateProductRating(productId: string) {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)

  if (!reviews || reviews.length === 0) return

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await supabase
    .from('products')
    .update({
      rating: avgRating,
      review_count: reviews.length
    })
    .eq('id', productId)
}
```

**Acceptance Criteria:**
- [ ] Reviews table created
- [ ] Review submission form working
- [ ] Reviews displayed on product pages
- [ ] Average rating calculated correctly
- [ ] Rating updates after review submission
- [ ] Prevent duplicate reviews per user
- [ ] Reviews paginated if many

---

### Task 3.3: Implement Wishlist Functionality
**Priority:** Medium
**Estimated Effort:** 12-16 hours
**Dependencies:** Task 3.1 (Supabase complete)

**Description:**
- Create wishlist table
- Add wishlist toggle button
- Create wishlist page
- Persist wishlist state

**Implementation:**

```typescript
// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(...)

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')

  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('*, products(*)')
    .eq('user_id', userId)

  return NextResponse.json({ wishlist })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { productId, userId, action } = body

  if (action === 'add') {
    await supabase.from('wishlists').insert({
      user_id: userId,
      product_id: productId
    })
  } else {
    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
  }

  return NextResponse.json({ success: true })
}
```

**Acceptance Criteria:**
- [ ] Wishlist table created
- [ ] Toggle button working
- [ ] Wishlist page displays products
- [ ] Wishlist persisted across sessions
- [ ] Add/remove functionality working
- [ ] Wishlist accessible from navigation

---

### Task 3.4: Add Discount Code System
**Priority:** Medium
**Estimated Effort:** 16-20 hours
**Dependencies:** Task 3.1 (Supabase complete)

**Description:**
- Create discount codes table
- Implement validation logic
- Add discount input to checkout
- Calculate discounts

**Implementation:**

```sql
CREATE TABLE discount_codes (
  code TEXT PRIMARY KEY,
  type TEXT CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_products UUID[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Acceptance Criteria:**
- [ ] Discount codes table created
- [ ] Validation API endpoint working
- [ ] Discount input in checkout
- [ ] Discount applied correctly to total
- [ ] Error handling for invalid codes
- [ ] Admin interface to create codes

---

### Task 3.5: Create Analytics Dashboard
**Priority:** High
**Estimated Effort:** 32-40 hours
**Dependencies:** Task 3.1 (Supabase complete)

**Description:**
- Create admin dashboard page
- Display revenue metrics
- Show top products
- Visualize order trends
- Track customer segments

**Implementation:**

```typescript
// app/admin/analytics/page.tsx
import { Suspense } from 'react'
import { MetricsOverview } from '@/components/admin/MetricsOverview'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { TopProducts } from '@/components/admin/TopProducts'

export default async function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      <Suspense fallback={<MetricsLoading />}>
        <MetricsOverview />
      </Suspense>

      <div className="grid grid-cols-2 gap-6">
        <Suspense fallback={<ChartLoading />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<ChartLoading />}>
          <OrdersChart />
        </Suspense>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Suspense fallback={<ProductsLoading />}>
          <TopProducts />
        </Suspense>
        <Suspense fallback={<CustomersLoading />}>
          <CustomerSegments />
        </Suspense>
        <Suspense fallback={<FunnelLoading />}>
          <ConversionFunnel />
        </Suspense>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Dashboard page created
- [ ] Revenue metrics accurate
- [ ] Order trends visualized
- [ ] Top products identified
- [ ] Customer segments analyzed
- [ ] Real-time data updates
- [ ] Date range filtering working

---

### Task 3.6: Implement Subscription Support
**Priority:** Medium
**Estimated Effort:** 24-32 hours
**Dependencies:** Task 3.1 (Supabase complete)

**Description:**
- Create subscriptions schema
- Build subscription UI
- Implement recurring billing
- Manage subscription lifecycle

**Implementation:**

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  frequency TEXT CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  grind_size TEXT,
  next_delivery TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Acceptance Criteria:**
- [ ] Subscriptions table created
- [ ] Subscribe button on product pages
- [ ] Frequency selection UI
- [ ] Next delivery calculated correctly
- [ ] Subscription management page
- [ ] Pause/resume functionality
- [ ] Cancel subscription working

---

### Task 3.7: Upgrade AI Copilot with Vector DB
**Priority:** Medium
**Estimated Effort:** 24-32 hours
**Dependencies:** Task 3.1 (Supabase complete)

**Description:**
- Set up pgvector extension
- Create embeddings for documents
- Implement semantic search
- Update copilot to use vector search

**Implementation:**

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX documents_embedding_idx ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

**Acceptance Criteria:**
- [ ] pgvector installed
- [ ] Documents table created
- [ ] Embeddings generated for knowledge base
- [ ] Semantic search working
- [ ] Copilot using vector search
- [ ] Search relevance improved

---

## Phase 4: Infrastructure (2-3 weeks)

**Goal:** Production-ready infrastructure with observability

### Task 4.1: Set Up Vercel Deployment
**Priority:** Critical
**Estimated Effort:** 8-12 hours
**Dependencies:** Task 2.1 (Next.js migration complete)

**Description:**
- Deploy to Vercel
- Configure environment variables
- Set up custom domain
- Configure preview deployments

**Implementation:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
```

**Acceptance Criteria:**
- [ ] Project deployed to Vercel
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Preview deployments working
- [ ] Environment variables configured
- [ ] Deployments automated via GitHub

---

### Task 4.2: Configure Observability
**Priority:** High
**Estimated Effort:** 16-24 hours
**Dependencies:** Task 4.1 (Vercel deployment)

**Description:**
- Set up Sentry error tracking
- Configure LogRocket session replay
- Set up performance monitoring
- Create dashboards

**Implementation:**

```bash
npm install @sentry/nextjs
npm install logrocket
```

**Acceptance Criteria:**
- [ ] Sentry configured
- [ ] Error tracking working
- [ ] LogRocket recording sessions
- [ ] Performance metrics collected
- [ ] Dashboards created
- [ ] Alerts configured

---

### Task 4.3: Implement Security Headers
**Priority:** High
**Estimated Effort:** 4-8 hours
**Dependencies:** Task 4.1 (Vercel deployment)

**Description:**
- Add security headers to Next.js config
- Implement CSP headers
- Add HSTS
- Configure CORS properly

**Implementation:**

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  }
}
```

**Acceptance Criteria:**
- [ ] Security headers configured
- [ ] CSP headers active
- [ ] HSTS enabled
- [ ] CORS properly configured
- [ ] Security score improved

---

### Task 4.4: Add Rate Limiting
**Priority:** High
**Estimated Effort:** 8-12 hours
**Dependencies:** Task 4.1 (Vercel deployment)

**Description:**
- Implement rate limiting middleware
- Configure Redis for distributed limiting
- Add rate limit headers
- Handle rate limit exceeded

**Implementation:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100

  const userRequests = rateLimit.get(ip) || []

  const validRequests = userRequests.filter(
    (time: number) => now - time < windowMs
  )

  if (validRequests.length >= maxRequests) {
    return new NextResponse('Too many requests', { status: 429 })
  }

  validRequests.push(now)
  rateLimit.set(ip, validRequests)

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
```

**Acceptance Criteria:**
- [ ] Rate limiting implemented
- [ ] Limits configured appropriately
- [ ] Rate limit headers returned
- [ ] 429 status returned when exceeded
- [ ] Rate limit per endpoint

---

### Task 4.5: Set Up Staging Environment
**Priority:** High
**Estimated Effort:** 8-12 hours
**Dependencies:** Task 4.1 (Vercel deployment)

**Description:**
- Create staging environment
- Configure environment-specific settings
- Set up staging database
- Configure staging domains

**Implementation:**

**Acceptance Criteria:**
- [ ] Staging environment created
- [ ] Separate database configured
- [ ] Staging URL configured
- [ ] Environment variables set
- [ ] Deployment pipeline updated

---

## Phase 5: AI & Automation (3-4 weeks)

**Goal:** Enhanced AI capabilities and automation

### Task 5.1: Upgrade Content Generation Workflow
**Priority:** Medium
**Estimated Effort:** 16-20 hours
**Dependencies:** Task 3.1 (Supabase complete)

**Description:**
- Improve AI prompts
- Add content quality checks
- Automate review process
- Schedule content generation

**Implementation:**

**Acceptance Criteria:**
- [ ] Improved prompts created
- [ ] Quality checks implemented
- [ ] Automated review working
- [ ] Generation scheduled weekly
- [ ] Content stored in database

---

### Task 5.2: Implement AI Product Recommendations
**Priority:** Medium
**Estimated Effort:** 16-24 hours
**Dependencies:** Task 3.7 (Vector DB complete)

**Description:**
- Build recommendation engine
- Implement collaborative filtering
- Add content-based recommendations
- Display on product pages

**Implementation:**

**Acceptance Criteria:**
- [ ] Recommendation engine built
- [ ] Collaborative filtering working
- [ ] Content-based recommendations working
- [ ] Recommendations displayed
- [ ] Click tracking implemented

---

### Task 5.3: Add Smart Search
**Priority:** Medium
**Estimated Effort:** 16-24 hours
**Dependencies:** Task 3.7 (Vector DB complete)

**Description:**
- Implement hybrid search
- Combine keyword and semantic search
- Add search suggestions
- Optimize search performance

**Implementation:**

**Acceptance Criteria:**
- [ ] Hybrid search implemented
- [ ] Keyword search working
- [ ] Semantic search working
- [ ] Results ranked correctly
- [ ] Search suggestions displayed

---

### Task 5.4: Automate Content Quality Review
**Priority:** Medium
**Estimated Effort:** 12-16 hours
**Dependencies:** Task 5.1 (Content generation)

**Description:**
- Implement quality scoring
- Add AI review process
- Create approval workflow
- Track quality metrics

**Implementation:**

**Acceptance Criteria:**
- [ ] Quality scoring implemented
- [ ] AI review working
- [ ] Approval workflow created
- [ ] Quality metrics tracked
- [ ] Low quality content rejected

---

### Task 5.5: Enhance Multi-Agent Orchestration
**Priority:** Low
**Estimated Effort:** 24-32 hours
**Dependencies:** Task 1.1 (Error handling)

**Description:**
- Refactor monolithic agent code
- Improve agent communication
- Add better observability
- Implement error recovery

**Implementation:**

**Acceptance Criteria:**
- [ ] Code modularized
- [ ] Better agent communication
- [ ] Improved observability
- [ ] Error recovery working
- [ ] Performance improved

---

## Summary

**Total Estimated Effort:**
- Phase 1: 40-60 hours
- Phase 2: 80-100 hours
- Phase 3: 120-160 hours
- Phase 4: 40-60 hours
- Phase 5: 80-100 hours
- **Grand Total: 360-480 hours**

**Priority Order:**
1. **Critical Path:** Phase 2 (Next.js migration) → All other phases
2. **High Impact:** Phase 1 (Quick wins) + Phase 4 (Infrastructure)
3. **Feature Complete:** Phase 3 (Advanced features)
4. **Enhancement:** Phase 5 (AI & Automation)

---

**Document Version:** 1.0
**Last Updated:** January 17, 2026
