# Product Showcase Component Guide

This guide explains how to recreate the "Our Collection" product showcase section from the Stockbridge Coffee website for use in other projects.

## Overview

The Product Showcase is a sophisticated, editorial-style product display section featuring:
- **Section header** with label, title, and description
- **Two-column layout** with product visual and details
- **Interactive options** for format, size, and quantity selection
- **Smooth animations** using Framer Motion
- **Shopping cart integration**

## Component Structure

```
ProductShowcase (section)
├── Section Header
│   ├── Label badge
│   ├── Title
│   └── Description
└── Product Grid
    ├── Product Visual (left)
    │   ├── Decorative shape
    │   ├── Badge
    │   └── Illustrated placeholder
    └── Product Details (right)
        ├── Product Info
        ├── Tasting Notes
        ├── Description
        ├── Specifications
        └── Options & Actions
```

---

## Step-by-Step Implementation

### 1. Section Header

The header uses a consistent pattern across the site: label badge → large title → descriptive text.

```tsx
<div className="max-w-2xl mb-16 lg:mb-24">
  {/* Label Badge */}
  <span className="inline-block px-4 py-1.5 bg-background border border-heading/10 rounded-full text-xs font-body font-medium text-text/70 tracking-wider uppercase mb-6">
    Our Collection
  </span>

  {/* Title */}
  <h2 className="text-5xl lg:text-6xl font-display font-semibold text-heading mb-6">
    Today's Offering
  </h2>

  {/* Description */}
  <p className="text-lg font-body text-text/70 leading-relaxed">
    We believe in doing one thing extraordinarily well. Our single-origin coffee is carefully
    selected, expertly roasted, and available in your preferred format.
  </p>
</div>
```

**Key styling details:**
- Label badge: small, uppercase, rounded-full, subtle border
- Title: 5xl-6xl font-display (Cormorant Garamond)
- Description: lg size, relaxed leading, 70% opacity text

---

### 2. Product Visual (Left Column)

Creates an illustrated coffee bag with decorative elements.

```tsx
<div className="relative aspect-[3/4] bg-gradient-to-br from-heading/5 to-accent/5 rounded-3xl overflow-hidden">
  {/* Badge */}
  <div className="absolute top-6 right-6 z-10">
    <div className="px-4 py-2 bg-background border border-heading/20 rounded-full">
      <span className="text-xs font-body font-medium text-heading tracking-wider uppercase">
        Single Origin
      </span>
    </div>
  </div>

  {/* Coffee bag illustration */}
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="relative w-64 h-80">
      {/* Bag shape */}
      <div className="absolute inset-0 bg-heading/10 border-2 border-heading/20 rounded-2xl" />

      {/* Top seal */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-accent/20 border-2 border-heading/20 rounded-t-2xl" />

      {/* Logo circle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent-light/30 to-accent/30 flex items-center justify-center border border-heading/20">
          <span className="text-6xl font-display font-light text-heading/60">S</span>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Decorative blur element */}
<div className="absolute -bottom-6 -right-6 w-48 h-48 bg-accent-light/10 rounded-full blur-3xl -z-10" />
```

**Key techniques:**
- `aspect-[3/4]` creates consistent portrait ratio
- Subtle gradients with low opacity (`from-heading/5`)
- Layered absolute positioning for badge and illustration
- Decorative blur element positioned outside with negative margins

---

### 3. Product Details (Right Column)

#### 3.1 Product Info

```tsx
<div>
  <h3 className="text-4xl font-display font-semibold text-heading mb-2">
    Stockbridge Signature
  </h3>
  <p className="text-xl font-body text-accent font-medium">
    Ethiopian Yirgacheffe
  </p>
</div>
```

#### 3.2 Tasting Notes

```tsx
<div>
  <span className="text-sm font-body font-medium text-text/60 tracking-wider uppercase mb-3 block">
    Tasting Notes
  </span>
  <div className="flex flex-wrap gap-2">
    {['Floral', 'Citrus', 'Honey', 'Tea-like'].map((note) => (
      <span
        key={note}
        className="px-4 py-2 bg-background border border-heading/10 rounded-full text-sm font-body text-heading"
      >
        {note}
      </span>
    ))}
  </div>
</div>
```

**Pattern:** Small uppercase label + flex-wrapped pill badges

#### 3.3 Specifications Grid

```tsx
<div className="grid grid-cols-3 gap-4">
  {[
    { label: 'Altitude', value: '1,800-2,000m' },
    { label: 'Process', value: 'Washed' },
    { label: 'Roast', value: 'Light-Medium' },
  ].map((spec) => (
    <div key={spec.label} className="p-4 bg-background border border-heading/10 rounded-xl">
      <span className="text-xs font-body text-text/50 tracking-wider uppercase block mb-1">
        {spec.label}
      </span>
      <span className="text-sm font-body font-medium text-heading">
        {spec.value}
      </span>
    </div>
  ))}
</div>
```

**Pattern:** 3-column grid with cards containing label above value

---

### 4. Interactive Options

#### 4.1 Format Selection (Whole Bean / Ground)

```tsx
const [format, setFormat] = useState<'whole' | 'ground'>('whole')

<div>
  <label className="text-sm font-body font-medium text-text/70 tracking-wider uppercase mb-3 block">
    Format
  </label>
  <div className="flex gap-3">
    {[
      { value: 'whole', label: 'Whole Bean' },
      { value: 'ground', label: 'Ground' },
    ].map((option) => (
      <button
        key={option.value}
        onClick={() => setFormat(option.value as 'whole' | 'ground')}
        className={`flex-1 px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
          format === option.value
            ? 'bg-heading text-background border-heading'
            : 'bg-background text-heading border-heading/20 hover:border-heading/40'
        }`}
      >
        <span className="text-sm font-medium">{option.label}</span>
      </button>
    ))}
  </div>
</div>
```

**Key features:**
- State-driven active styling
- Full-width buttons with `flex-1`
- Conditional classes for active/inactive states
- Smooth transitions

#### 4.2 Size Selection (250g / 1kg)

```tsx
const [size, setSize] = useState<'250g' | '1kg'>('250g')

const prices = {
  '250g': 8.50,
  '1kg': 28.00,
}

<div>
  <label className="text-sm font-body font-medium text-text/70 tracking-wider uppercase mb-3 block">
    Size
  </label>
  <div className="flex gap-3">
    {[
      { value: '250g', price: 8.50 },
      { value: '1kg', price: 28.00 },
    ].map((option) => (
      <button
        key={option.value}
        onClick={() => setSize(option.value as '250g' | '1kg')}
        className={`flex-1 px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
          size === option.value
            ? 'bg-heading text-background border-heading'
            : 'bg-background text-heading border-heading/20 hover:border-heading/40'
        }`}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-medium">{option.value}</span>
          <span className="text-xs opacity-70">£{option.price.toFixed(2)}</span>
        </div>
      </button>
    ))}
  </div>
</div>
```

**Key features:**
- Two-line button content (size + price)
- Price formatting with `.toFixed(2)`

#### 4.3 Quantity Selector

```tsx
const [quantity, setQuantity] = useState(1)

<div className="flex items-center gap-4 px-6 py-3 bg-background border border-heading/20 rounded-xl">
  <button
    onClick={() => setQuantity(Math.max(1, quantity - 1))}
    className="text-heading hover:text-accent transition-colors"
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  </button>

  <span className="text-lg font-medium text-heading w-8 text-center">
    {quantity}
  </span>

  <button
    onClick={() => setQuantity(quantity + 1)}
    className="text-heading hover:text-accent transition-colors"
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  </button>
</div>
```

**Key features:**
- `Math.max(1, quantity - 1)` prevents going below 1
- Fixed-width centered number display
- SVG icons for +/- buttons

#### 4.4 Add to Cart Button

```tsx
const currentPrice = prices[size]
const totalPrice = (currentPrice * quantity).toFixed(2)

<button
  onClick={handleAddToCart}
  className="flex-1 px-8 py-4 bg-heading text-background rounded-xl hover:bg-heading/90 transition-all duration-300 group"
>
  <div className="flex items-center justify-between">
    <span className="text-base font-medium">Add to Cart</span>
    <span className="text-lg font-semibold">£{totalPrice}</span>
  </div>
</button>
```

**Key features:**
- Calculated total price displayed
- Space-between layout for label and price
- Hover state with opacity change

---

### 5. Animations with Framer Motion

#### Scroll-triggered fade-in

```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-100px' }}
  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
>
  {/* Content */}
</motion.div>
```

**Key animation properties:**
- `initial`: Starting state (invisible, shifted down)
- `whileInView`: Target state when in viewport
- `viewport={{ once: true }}`: Animate only once
- `margin: '-100px'`: Trigger animation before element enters viewport
- Custom easing: `[0.22, 1, 0.36, 1]` creates smooth, natural motion

#### Staggered animations for lists

```tsx
{['Floral', 'Citrus', 'Honey', 'Tea-like'].map((note, index) => (
  <motion.span
    key={note}
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.1 * index, duration: 0.5 }}
    className="px-4 py-2 bg-background border border-heading/10 rounded-full text-sm"
  >
    {note}
  </motion.span>
))}
```

**Key technique:** `delay: 0.1 * index` creates cascading effect

#### Scale animations for badges

```tsx
<motion.div
  initial={{ scale: 0, rotate: -45 }}
  whileInView={{ scale: 1, rotate: 0 }}
  viewport={{ once: true }}
  transition={{ delay: 0.3, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
>
  {/* Badge content */}
</motion.div>
```

**Key technique:** Spring-like easing `[0.34, 1.56, 0.64, 1]` creates bounce effect

---

### 6. Shopping Cart Integration

#### Cart Context Setup

```tsx
// context/CartContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

interface CartItem {
  format: 'whole' | 'ground'
  size: '250g' | '1kg'
  quantity: number
  price: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (item: CartItem) => {
    setCart(prevCart => [...prevCart, item])
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
```

#### Using Cart in Component

```tsx
import { useCart } from '../context/CartContext'

export default function ProductShowcase() {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart({
      format,
      size,
      quantity,
      price: parseFloat(totalPrice),
    })
  }

  return (
    // ... component JSX
  )
}
```

---

## Design Patterns Used

### 1. **Editorial Layout**
- Generous whitespace
- Large typography (5xl-6xl for headings)
- Asymmetric two-column grid
- Magazine-style section headers

### 2. **Micro-interactions**
- Button hover states (`hover:bg-heading/90`)
- Color transitions (`transition-colors duration-300`)
- Scale animations on interactive elements
- Smooth easing functions for natural feel

### 3. **Visual Hierarchy**
- Small uppercase labels above content
- Large display font for product names
- Pill badges for tags/notes
- Card-based specification display

### 4. **Color Usage**
- Low opacity overlays (`/10`, `/20`) for subtle effects
- Gradients for depth (`from-heading/5 to-accent/5`)
- Consistent border opacity (`border-heading/10`)
- Blur effects for atmospheric elements

---

## Tailwind Configuration Required

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      background: '#F5F0E8',
      surface: '#E8DCC8',
      text: '#1A1A1A',
      heading: '#212f1f',
      accent: {
        DEFAULT: '#A89175',
        hover: '#8F7B62',
        light: '#B8975A',
      },
    },
    fontFamily: {
      display: ['Cormorant Garamond', 'serif'],
      body: ['Archivo', 'sans-serif'],
    },
  },
}
```

---

## Typography Setup

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Archivo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## Complete Component Code

See: `/src/components/ProductShowcase.tsx` for the full implementation.

---

## Customization Tips

### For Different Products

1. **Change the illustration**: Replace the coffee bag SVG with product-specific visuals
2. **Adjust options**: Modify the format/size arrays to match product variants
3. **Update specs**: Change the 3-column grid data (Altitude, Process, Roast)
4. **Modify tasting notes**: Update the array of flavor tags

### For Different Color Schemes

1. **Update Tailwind config** with new brand colors
2. **Maintain opacity patterns**: Keep `/10`, `/20` structure for consistency
3. **Adjust gradients**: Update `from-*` and `to-*` values in backgrounds

### For Different Layouts

1. **Change grid columns**: Modify `lg:grid-cols-2` to different breakpoints
2. **Adjust spacing**: Update `gap-16` and padding values
3. **Modify aspect ratios**: Change `aspect-[3/4]` to different proportions

---

## Performance Notes

- Uses `viewport={{ once: true }}` to prevent re-animating on scroll
- Animations trigger `-100px` before entering viewport for smoother UX
- Low opacity overlays are GPU-accelerated
- Framer Motion animations use transform properties for better performance

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox required
- Framer Motion requires JavaScript enabled
- Backdrop blur may have limited support (graceful degradation)

---

## Dependencies

```json
{
  "react": "^18.3.1",
  "framer-motion": "^11.5.4",
  "tailwindcss": "^3.4.10"
}
```

---

## Questions?

For the complete implementation, review:
- `/src/components/ProductShowcase.tsx` - Full component code
- `/src/context/CartContext.tsx` - Cart state management
- `/tailwind.config.js` - Color and font configuration

This pattern can be adapted for any e-commerce product showcase section requiring elegant design and smooth interactions.
