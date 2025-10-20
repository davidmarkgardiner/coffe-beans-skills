---
name: premium-coffee-website
description: Build premium coffee websites using React, TypeScript, shadcn/ui, and Tailwind CSS with sophisticated aesthetics, smooth animations, and modern design patterns. Always builds with Vite + React stack.
---

# Premium Coffee Website Builder

Build sophisticated, high-end coffee websites using **React + shadcn/ui + Tailwind CSS**. This skill creates production-ready applications with premium design, smooth animations, and modern architecture.

## Stack & Technology

**ALWAYS use this stack:**
- ⚛️ **React 18** with TypeScript
- 🎨 **shadcn/ui** for components
- 🎭 **Tailwind CSS** for styling
- ⚡ **Vite** for build tooling
- 🎬 **Framer Motion** for animations
- 🛣️ **React Router** for navigation (if multi-page)

## When to Use This Skill

Use when building:
- Coffee e-commerce websites
- Coffee shop landing pages
- Artisan coffee product showcases
- Coffee subscription services
- Any premium coffee-related web project

Keywords: "premium coffee website", "coffee shop site", "coffee e-commerce"

## Design Philosophy

> **"Sophisticated yet approachable. Modern yet warm. Premium yet inviting."**

Think **Apple Store meets artisan coffee shop**:
- **Elegant** - Refined aesthetics with attention to detail
- **Clean** - Minimal clutter, purposeful white space
- **Smooth** - Fluid 60fps animations
- **Premium** - High-quality micro-interactions
- **Warm** - Coffee brown accents, inviting typography

## Quick Start: Project Setup

### Step 1: Initialize Vite + React Project

```bash
# Create new Vite project
npm create vite@latest coffee-website -- --template react-ts
cd coffee-website

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui
npx shadcn-ui@latest init

# Install additional dependencies
npm install framer-motion react-router-dom lucide-react
```

### Step 2: Configure Tailwind

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Coffee Brown Palette
        coffee: {
          50: '#faf8f5',
          100: '#f4f0e8',
          200: '#e8dfd0',
          300: '#d6c5a8',
          400: '#c4ab80',
          500: '#a88f66',
          600: '#8b7355',
          700: '#6B4423', // Primary coffee brown
          800: '#4b2f18',
          900: '#3a2412',
          950: '#2a1a0d',
        },
        // Grey Scale
        grey: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        // Two-layer shadow system for premium depth
        'soft': 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 1px 2px rgba(15, 23, 42, 0.08)',
        'medium': 'inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 3px 6px rgba(15, 23, 42, 0.12)',
        'large': 'inset 0 2px 0 rgba(255, 255, 255, 0.2), 0 6px 12px rgba(15, 23, 42, 0.18)',
        'xl': 'inset 0 3px 0 rgba(255, 255, 255, 0.24), 0 12px 24px rgba(15, 23, 42, 0.24)',
      },
      backgroundImage: {
        // Premium gradient system
        'gradient-cta': 'linear-gradient(to bottom, #c4ab80 0%, #a88f66 45%, #6B4423 100%)',
        'gradient-cta-hover': 'linear-gradient(to bottom, #d6c5a8 0%, #a88f66 50%, #4b2f18 100%)',
        'gradient-surface': 'linear-gradient(to bottom, #fafafa 0%, #ffffff 45%, #e5e5e5 100%)',
        'gradient-surface-hover': 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 50%, #d4d4d4 100%)',
        'gradient-nav-strong': 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0.8) 100%)',
        'gradient-nav-soft': 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.7) 100%)',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config
```

### Step 3: Add Google Fonts

Update `index.html`:

```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
```

### Step 4: Install shadcn/ui Components

```bash
# Core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
```

## Project Structure

```
coffee-website/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Hero.tsx         # Hero section
│   │   ├── Navigation.tsx   # Nav bar
│   │   ├── ProductCard.tsx  # Product cards
│   │   ├── ProductGrid.tsx  # Product grid
│   │   └── Footer.tsx       # Footer
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── hooks/
│   │   └── useCart.ts       # Shopping cart logic
│   ├── types/
│   │   └── product.ts       # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Design System Reference

### 📖 Load These Docs Into Context

When building, reference these design documentation files:

**@docs/colors.md** - Color palette implementation
- 60-30-10 rule (60% neutrals, 30% secondary, 10% primary)
- Color layering for depth
- Semantic colors for status

**@docs/shadow.md** - Shadow & depth system
- Two-layer shadow technique
- Small/medium/large shadow levels
- Gradient enhancement for premium feel

**@docs/typography.md** - Typography system
- Font pairings (Playfair Display + Inter)
- Type scale and responsive sizing
- Line height and letter spacing

**@docs/animations.md** - Animation patterns
- Framer Motion recipes
- Timing and easing functions
- Scroll animations and hover effects

### Color System (Quick Reference)

```typescript
// Primary - Coffee Brown (#6B4423)
// Use for: CTAs, buttons, active states, prices

// Neutrals - Grey scale
// Use for: Text, backgrounds, borders (60% of interface)

// Semantic Colors
const semanticColors = {
  success: 'green-600',    // Order confirmed
  warning: 'amber-500',    // Low stock
  info: 'blue-600',        // Shipping updates
  error: 'red-600',        // Out of stock
}
```

### Typography (Quick Reference)

```tsx
// Headings - Playfair Display (serif)
<h1 className="font-display text-6xl md:text-7xl font-bold tracking-tight">
  Premium Coffee
</h1>

// Body - Inter (sans-serif)
<p className="font-sans text-base text-grey-600 leading-relaxed">
  Artisan roasted beans
</p>

// Labels - Uppercase, wide tracking
<span className="font-sans text-xs font-semibold tracking-widest uppercase text-grey-500">
  Single Origin
</span>

// Price - Display font, large
<span className="font-display text-3xl font-bold tracking-tight text-coffee-700">
  $24.99
</span>
```

## Core Components

### Navigation Component

```tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gradient-nav-strong backdrop-blur-md shadow-medium'
          : 'bg-gradient-nav-soft backdrop-blur-sm shadow-soft'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="font-display text-2xl font-bold text-grey-900">
            Premium Coffee
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-sm font-medium text-grey-700 hover:text-coffee-700 transition-colors">
              Shop
            </a>
            <a href="#about" className="text-sm font-medium text-grey-700 hover:text-coffee-700 transition-colors">
              About
            </a>
            <a href="#contact" className="text-sm font-medium text-grey-700 hover:text-coffee-700 transition-colors">
              Contact
            </a>
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-coffee-700 text-white text-xs rounded-full flex items-center justify-center">
              0
            </span>
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}
```

### Hero Component

```tsx
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background with parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 text-center text-white px-6"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-sm font-semibold tracking-widest uppercase mb-4"
        >
          Artisan Roasted
        </motion.p>

        <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          Experience Coffee<br />At Its Finest
        </h1>

        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Carefully sourced from the world's finest coffee regions,
          roasted to perfection, delivered to your door.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <motion.a
            href="#products"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-8 py-3 rounded-full bg-gradient-cta text-white font-semibold text-sm tracking-wide uppercase shadow-large transition-all duration-200 hover:bg-gradient-cta-hover hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Shop Collection
          </motion.a>
          <motion.a
            href="#about"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-8 py-3 rounded-full border border-white/40 bg-white/10 text-white font-semibold text-sm tracking-wide uppercase shadow-soft backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:shadow-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Learn More
          </motion.a>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-center"
      >
        <p className="text-xs tracking-widest uppercase mb-2">Scroll to explore</p>
        <div className="w-px h-12 bg-white/50 mx-auto animate-bounce" />
      </motion.div>
    </section>
  )
}
```

### Product Card Component

```tsx
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="group"
    >
      <div className="relative rounded-2xl overflow-hidden bg-gradient-surface shadow-medium transition-all duration-300 hover:bg-gradient-surface-hover hover:shadow-large before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/70 before:content-['']">
        {/* Image */}
        <div className="relative h-64 overflow-hidden bg-grey-100">
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
          />

          {product.badge && (
            <Badge className="absolute top-4 right-4 bg-coffee-700">
              {product.badge}
            </Badge>
          )}

          {/* Overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <motion.button
              onClick={() => onAddToCart(product)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 rounded-full bg-gradient-surface text-coffee-700 font-semibold text-sm tracking-wide uppercase shadow-soft transition-all duration-200 hover:bg-gradient-surface-hover hover:shadow-medium"
            >
              Add to Cart
            </motion.button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-grey-500 mb-2">
            {product.category}
          </p>

          <h3 className="font-display text-2xl font-semibold tracking-tight text-grey-900 mb-2">
            {product.name}
          </h3>

          <p className="text-sm text-grey-600 leading-relaxed mb-4">
            {product.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-grey-200">
            <span className="font-display text-3xl font-bold tracking-tight text-coffee-700">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-grey-500">
              {product.weight}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
```

### Product Grid Component

```tsx
import { motion } from 'framer-motion'
import { ProductCard } from './ProductCard'
import type { Product } from '@/types/product'

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <section className="py-20 bg-white" id="products">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-coffee-700 mb-4">
            Our Collection
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-grey-900 mb-6">
            Premium Coffee Beans
          </h2>
          <p className="text-lg text-grey-600 max-w-2xl mx-auto leading-relaxed">
            Each blend is carefully crafted to deliver a unique and memorable coffee experience.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
```

## TypeScript Types

```typescript
// src/types/product.ts
export interface Product {
  id: string
  name: string
  description: string
  price: number
  weight: string
  category: string
  image: string
  badge?: string
}

export interface CartItem extends Product {
  quantity: number
}
```

## State Management (Shopping Cart Hook)

```typescript
// src/hooks/useCart.ts
import { useState } from 'react'
import type { Product, CartItem } from '@/types/product'

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id)

      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId)
      return
    }

    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    total,
    itemCount,
  }
}
```

## Build & Development Workflow

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Premium Design Enhancements

### Two-Layer Shadow System

The skill uses a sophisticated two-layer shadow technique for premium depth. Each shadow combines an **inset top highlight** and a **bottom shadow**:

```css
/* Pattern: inset [top highlight], [bottom shadow] */

/* SOFT - Subtle cards, minimal elevation */
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.12),  /* Top highlight */
  0 1px 2px rgba(15, 23, 42, 0.08);         /* Bottom shadow */

/* MEDIUM - Standard elevation, interactive elements */
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.16),
  0 3px 6px rgba(15, 23, 42, 0.12);

/* LARGE - Hover states, elevated cards */
box-shadow:
  inset 0 2px 0 rgba(255, 255, 255, 0.2),
  0 6px 12px rgba(15, 23, 42, 0.18);

/* XL - Modals, overlays, maximum elevation */
box-shadow:
  inset 0 3px 0 rgba(255, 255, 255, 0.24),
  0 12px 24px rgba(15, 23, 42, 0.24);
```

**Usage in Components:**

```tsx
// Card transitions from medium to large shadow on hover
<div className="shadow-medium hover:shadow-large transition-shadow duration-300">
  {/* Content */}
</div>
```

### Gradient System

Premium gradient backgrounds for CTAs and surfaces create depth and sophistication:

```tsx
// CTA Buttons - Coffee gradient
<button className="bg-gradient-cta hover:bg-gradient-cta-hover">
  Shop Now
</button>

// Surface Cards - Subtle grey gradient
<div className="bg-gradient-surface hover:bg-gradient-surface-hover">
  {/* Content */}
</div>

// Navigation - Glassmorphism gradient
<nav className="bg-gradient-nav-strong backdrop-blur-md">
  {/* Nav items */}
</nav>
```

**Gradient Definitions:**

```typescript
backgroundImage: {
  // CTA gradients - from light coffee to dark coffee
  'gradient-cta': 'linear-gradient(to bottom, #c4ab80 0%, #a88f66 45%, #6B4423 100%)',
  'gradient-cta-hover': 'linear-gradient(to bottom, #d6c5a8 0%, #a88f66 50%, #4b2f18 100%)',

  // Surface gradients - subtle depth
  'gradient-surface': 'linear-gradient(to bottom, #fafafa 0%, #ffffff 45%, #e5e5e5 100%)',
  'gradient-surface-hover': 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 50%, #d4d4d4 100%)',

  // Navigation gradients - glassmorphism effect
  'gradient-nav-strong': 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0.8) 100%)',
  'gradient-nav-soft': 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.7) 100%)',
}
```

### Glassmorphism Effects

Combine gradients with backdrop blur for modern glass effects:

```tsx
// Navigation with glassmorphism
<nav className="bg-gradient-nav-strong backdrop-blur-md shadow-medium">
  {/* Nav content */}
</nav>

// Card with top highlight border
<div className="bg-gradient-surface before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/70 before:content-['']">
  {/* Card content */}
</div>
```

**Complete Premium Card Pattern:**

```tsx
<motion.div
  whileHover={{ y: -8 }}
  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
>
  <div className="relative rounded-2xl overflow-hidden bg-gradient-surface shadow-medium transition-all duration-300 hover:bg-gradient-surface-hover hover:shadow-large before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/70 before:content-['']">
    {/* Content */}
  </div>
</motion.div>
```

## Best Practices

### 1. Always Load Design Docs
Before building components, load:
- `@docs/colors.md` for color system
- `@docs/shadow.md` for depth/shadows
- `@docs/typography.md` for text styling
- `@docs/animations.md` for motion

### 2. Component Composition
- Use shadcn/ui components as foundation
- Compose custom components from primitives
- Keep components small and focused
- Use TypeScript for type safety

### 3. Responsive Design
```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
```

### 4. Performance
- Use `whileInView` for scroll animations (don't animate everything on mount)
- Optimize images (WebP format, proper sizing)
- Lazy load below-the-fold content
- Code-split routes if multi-page

### 5. Accessibility

**Always implement accessibility features:**

```tsx
// Semantic HTML with ARIA labels
<Button aria-label="Add Ethiopian Yirgacheffe to cart">
  Add to Cart
</Button>

// Keyboard navigation
<Card tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
  {/* Content */}
</Card>

// Focus-visible states (not just focus)
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-600/60">
  Shop Now
</button>
```

**Respect Motion Preferences:**

```tsx
// Disable animations for users who prefer reduced motion
import { useReducedMotion } from 'framer-motion'

export function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
    >
      {/* Content */}
    </motion.div>
  )
}
```

**Or use CSS media queries in Tailwind:**

```tsx
<motion.div
  className="motion-safe:animate-fade-in-up motion-reduce:opacity-100"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  {/* Content */}
</motion.div>
```

**Video/Media Accessibility:**

```tsx
// Always provide poster images for videos
<video
  autoPlay
  loop
  muted
  playsInline
  poster="/hero-poster.jpg"
  aria-hidden="true"
>
  <source src="/hero-video.mp4" type="video/mp4" />
</video>
```

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag 'dist' folder to Netlify
```

### GitHub Pages
```bash
# Add to vite.config.ts
export default defineConfig({
  base: '/repository-name/',
})

npm run build
# Deploy 'dist' folder
```

## Quick Implementation Checklist

When building a new coffee website:

- [ ] Run project setup commands
- [ ] Configure Tailwind with coffee colors
- [ ] Add Google Fonts (Playfair Display + Inter)
- [ ] Install shadcn/ui components
- [ ] Load design docs (`@docs/*.md`) into context
- [ ] Create Navigation component
- [ ] Create Hero component
- [ ] Create Product Card component
- [ ] Create Product Grid with stagger animation
- [ ] Implement shopping cart hook
- [ ] Add Footer component
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Optimize images
- [ ] Test accessibility (keyboard nav, screen reader)
- [ ] Build and deploy

## Example: Complete App.tsx

```tsx
import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { ProductGrid } from './components/ProductGrid'
import { Footer } from './components/Footer'
import { useCart } from './hooks/useCart'

const products = [
  {
    id: '1',
    name: 'Ethiopian Yirgacheffe',
    description: 'Bright citrus notes with floral undertones.',
    price: 24.99,
    weight: '250g',
    category: 'Single Origin',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',
    badge: 'Best Seller',
  },
  // ... more products
]

function App() {
  const { addToCart, cart, itemCount } = useCart()

  return (
    <>
      <Navigation itemCount={itemCount} />
      <Hero />
      <ProductGrid products={products} onAddToCart={addToCart} />
      <Footer />
    </>
  )
}

export default App
```

---

**This skill ALWAYS builds React + shadcn/ui applications with premium design principles from the @docs/ files.**
