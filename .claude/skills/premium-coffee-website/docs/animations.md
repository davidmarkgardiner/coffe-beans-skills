# Premium Animation System for Coffee Websites

## Animation Philosophy

Animations should feel:
- **Smooth & Intentional** - Every motion has a purpose
- **Subtle** - Enhance, don't distract
- **Premium** - Polished and refined timing
- **Performant** - 60fps, GPU-accelerated
- **Accessible** - Respect `prefers-reduced-motion`

## Timing & Easing

### Duration Guidelines

```typescript
const duration = {
  instant: 100,      // Micro-interactions (checkbox, toggle)
  fast: 200,         // Hover states, tooltips
  normal: 300,       // Most transitions, dropdowns
  slow: 500,         // Page transitions, modals
  slower: 700,       // Hero animations, complex reveals
}
```

**Rule of thumb:**
- Smaller elements = faster animations
- Larger elements/distances = slower animations
- Entering = slightly slower than exiting

### Easing Functions

```css
/* Tailwind/CSS Easing */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);        /* Default - feels natural */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);   /* Smooth & premium */

/* Custom Premium Easing */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);   /* General purpose */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);  /* Playful */
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Elastic feel */
```

**When to use:**
- `ease-out`: Elements entering (fade in, slide in)
- `ease-in`: Elements exiting (fade out, slide out)
- `ease-in-out`: State changes (color, size)
- `ease-smooth`: Most coffee website animations (sophisticated feel)

## Framer Motion Setup (React)

### Installation
```bash
npm install framer-motion
```

### Basic Configuration
```tsx
import { motion } from 'framer-motion'

// Standard fade-in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

## Core Animation Patterns

### 1. Fade Animations

**Simple Fade In:**
```tsx
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
}

<motion.div {...fadeIn}>Content</motion.div>
```

**Fade In Up (Most Common):**
```tsx
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
}

<motion.div {...fadeInUp}>
  <h1>Premium Coffee</h1>
</motion.div>
```

**Staggered Fade In (Product Grids):**
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // 100ms delay between each child
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.div variants={container} initial="hidden" animate="show">
  {products.map(product => (
    <motion.div key={product.id} variants={item}>
      <ProductCard {...product} />
    </motion.div>
  ))}
</motion.div>
```

### 2. Hover Animations

**Lift on Hover (Product Cards):**
```tsx
<motion.div
  whileHover={{
    y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  }}
  className="product-card"
>
  {/* Card content */}
</motion.div>
```

**Scale on Hover (Buttons):**
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  Add to Cart
</motion.button>
```

**Image Zoom (Inside Container):**
```tsx
<div className="overflow-hidden rounded-lg">
  <motion.img
    src={product.image}
    whileHover={{ scale: 1.08 }}
    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
  />
</div>
```

### 3. Scroll Animations

**Scroll-Triggered Reveal:**
```tsx
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

function ScrollReveal({ children }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

**Parallax Effect (Hero Section):**
```tsx
import { useScroll, useTransform, motion } from 'framer-motion'

function HeroParallax() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <div className="relative h-screen overflow-hidden">
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0"
      >
        <img src="/hero-bg.jpg" className="w-full h-full object-cover" />
      </motion.div>
    </div>
  )
}
```

### 4. Page Transitions

**Route Transitions (with Next.js):**
```tsx
import { AnimatePresence, motion } from 'framer-motion'

function MyApp({ Component, pageProps, router }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.route}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Component {...pageProps} />
      </motion.div>
    </AnimatePresence>
  )
}
```

### 5. Modal/Dialog Animations

**Backdrop + Content:**
```tsx
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15
    }
  }
}

<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          {children}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 6. Loading States

**Skeleton Pulse:**
```tsx
<motion.div
  className="bg-gray-200 rounded-lg h-48"
  animate={{
    opacity: [0.5, 0.8, 0.5],
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>
```

**Spinner:**
```tsx
<motion.div
  className="w-8 h-8 border-4 border-gray-200 border-t-coffee-600 rounded-full"
  animate={{ rotate: 360 }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }}
/>
```

## Coffee Website Specific Animations

### Product Card Entrance
```tsx
const productCard = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}
```

### Add to Cart Animation
```tsx
const [isAdding, setIsAdding] = useState(false)

<motion.button
  onClick={() => {
    setIsAdding(true)
    addToCart()
    setTimeout(() => setIsAdding(false), 1000)
  }}
  animate={isAdding ? {
    scale: [1, 1.05, 1],
    backgroundColor: ['#6B4423', '#4B2F18', '#6B4423']
  } : {}}
  transition={{ duration: 0.3 }}
>
  {isAdding ? '✓ Added!' : 'Add to Cart'}
</motion.button>
```

### Navigation Hover Underline
```tsx
<motion.a
  href="/shop"
  className="relative"
  whileHover="hover"
>
  Shop
  <motion.div
    className="absolute bottom-0 left-0 right-0 h-0.5 bg-coffee-600"
    variants={{
      hover: {
        scaleX: 1,
        transition: { duration: 0.2 }
      }
    }}
    initial={{ scaleX: 0 }}
  />
</motion.a>
```

### Hero Title Cascade
```tsx
const title = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
}

const letter = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
}

<motion.h1 variants={title} initial="hidden" animate="visible">
  {"Artisan Coffee".split("").map((char, i) => (
    <motion.span key={i} variants={letter}>
      {char}
    </motion.span>
  ))}
</motion.h1>
```

## Performance Best Practices

### 1. Use Transform & Opacity Only
```tsx
// ✅ Good - GPU accelerated
<motion.div
  animate={{ x: 100, opacity: 0.5, scale: 1.2 }}
/>

// ❌ Bad - Causes layout recalculation
<motion.div
  animate={{ width: '200px', margin: '20px' }}
/>
```

### 2. Will-Change Optimization
```css
.animated-element {
  will-change: transform, opacity;
}
```

### 3. Reduce Motion Media Query
```tsx
import { useReducedMotion } from 'framer-motion'

function Component() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={{
        y: shouldReduceMotion ? 0 : 20
      }}
    >
      Content
    </motion.div>
  )
}
```

Or in Tailwind:
```tsx
<div className="motion-safe:animate-fade-in motion-reduce:opacity-100">
  Content
</div>
```

## Tailwind Animation Classes

Add to `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
}
```

## Quick Reference: Animation Recipes

```tsx
// Reusable animation variants
export const animations = {
  // Page entrance
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },

  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },

  // Product card
  productCard: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    whileHover: { y: -8 },
    transition: { duration: 0.5 }
  },

  // Button
  button: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  },

  // Modal
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 }
  },
}
```

Use these animation patterns to create smooth, premium interactions throughout your coffee website!
