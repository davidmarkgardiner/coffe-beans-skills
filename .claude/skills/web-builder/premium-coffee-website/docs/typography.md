# Premium Typography System for Coffee Websites

## Font Pairing Philosophy

For premium coffee websites, typography should feel:
- **Elegant yet approachable** - Sophisticated without being pretentious
- **Readable** - Clear hierarchy and comfortable line heights
- **Modern** - Contemporary fonts that feel fresh
- **Premium** - High-quality typefaces that convey craftsmanship

## Recommended Font Combinations

### Option 1: Classic Elegance (Recommended)
**Perfect for artisan coffee shops and premium e-commerce**

- **Headings**: Playfair Display (serif)
  - Style: Elegant, high-contrast serif
  - Use: H1, H2, product names, hero titles
  - Weight: 400 (regular), 600 (semibold), 700 (bold)

- **Body**: Inter (sans-serif)
  - Style: Clean, modern, highly readable
  - Use: Body text, UI elements, buttons, labels
  - Weight: 300 (light), 400 (regular), 500 (medium), 600 (semibold)

```css
/* Implementation */
--font-display: 'Playfair Display', serif;
--font-body: 'Inter', sans-serif;
```

### Option 2: Modern Minimalism
**Perfect for contemporary coffee brands and subscription services**

- **Headings**: Cormorant Garamond (serif)
  - Style: Refined, slightly condensed
  - Pairs beautifully with minimalist layouts

- **Body**: Work Sans (sans-serif)
  - Style: Geometric, clean, friendly
  - Excellent for UI and long-form reading

### Option 3: Editorial Style
**Perfect for coffee blogs and content-heavy sites**

- **Headings**: Lora (serif)
  - Style: Well-balanced, contemporary serif
  - Great for storytelling

- **Body**: Source Sans Pro (sans-serif)
  - Style: Professional, neutral, versatile
  - Adobe's open-source workhorse

## Typography Scale

Use a modular scale for consistent sizing:

```css
/* Base: 16px */
--text-xs: 0.75rem;    /* 12px - Tiny labels, captions */
--text-sm: 0.875rem;   /* 14px - Small text, metadata */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body, subtitles */
--text-xl: 1.25rem;    /* 20px - H4 */
--text-2xl: 1.5rem;    /* 24px - H3 */
--text-3xl: 1.875rem;  /* 30px - H2 */
--text-4xl: 2.25rem;   /* 36px - H1 */
--text-5xl: 3rem;      /* 48px - Hero titles */
--text-6xl: 3.75rem;   /* 60px - Large displays */
--text-7xl: 4.5rem;    /* 72px - Extra large hero */
```

### Responsive Typography

Use `clamp()` for fluid typography:

```css
/* Scales between viewport sizes */
h1 {
  font-size: clamp(2.25rem, 5vw, 4.5rem);
  /* Min: 36px, Preferred: 5vw, Max: 72px */
}

h2 {
  font-size: clamp(1.875rem, 4vw, 3rem);
  /* Min: 30px, Preferred: 4vw, Max: 48px */
}

body {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  /* Min: 16px, Preferred: 1.5vw, Max: 18px */
}
```

## Line Height System

Proper line height improves readability:

```css
--leading-none: 1;        /* Tight headings */
--leading-tight: 1.25;    /* Display text */
--leading-snug: 1.375;    /* Large headings */
--leading-normal: 1.5;    /* UI elements */
--leading-relaxed: 1.625; /* Short paragraphs */
--leading-loose: 1.75;    /* Long-form content */
```

**Rules of thumb:**
- Headings: 1.1 - 1.3 (tighter for impact)
- Body text: 1.5 - 1.75 (more space for readability)
- Wider text blocks need more line height
- Smaller text needs more line height

## Letter Spacing (Tracking)

Subtle adjustments create sophistication:

```css
--tracking-tighter: -0.05em;  /* Large display headings */
--tracking-tight: -0.025em;   /* Headings */
--tracking-normal: 0;         /* Body text */
--tracking-wide: 0.025em;     /* Slightly open */
--tracking-wider: 0.05em;     /* Button text */
--tracking-widest: 0.1em;     /* ALL CAPS labels */
```

**Coffee Website Specific Usage:**
```css
/* Hero title - tight for elegance */
.hero-title {
  letter-spacing: -0.02em;
}

/* Product category labels - wide for readability */
.product-category {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
}

/* Price - slightly tight for premium feel */
.product-price {
  letter-spacing: -0.01em;
  font-family: var(--font-display);
}
```

## Font Weights

Strategic weight usage creates hierarchy:

```css
--font-thin: 100;
--font-extralight: 200;
--font-light: 300;       /* Elegant body text */
--font-normal: 400;      /* Standard body */
--font-medium: 500;      /* Emphasized text, UI */
--font-semibold: 600;    /* Subheadings, buttons */
--font-bold: 700;        /* Headings */
--font-extrabold: 800;   /* Rarely used */
--font-black: 900;       /* Display only */
```

**Coffee Website Mapping:**
- Product names: 600 (semibold)
- Prices: 700 (bold) in display font
- Body text: 400 (regular)
- Button text: 500-600 (medium/semibold)
- Labels/categories: 600 (semibold, uppercase)

## Text Color Hierarchy

Using opacity for hierarchy (works with any base color):

```css
/* On white backgrounds */
--text-primary: rgba(0, 0, 0, 0.90);     /* Main headings, important text */
--text-secondary: rgba(0, 0, 0, 0.70);   /* Body text */
--text-tertiary: rgba(0, 0, 0, 0.50);    /* Captions, labels */
--text-disabled: rgba(0, 0, 0, 0.30);    /* Disabled state */

/* Or use specific gray shades */
--text-primary: #1A1A1A;      /* Near black */
--text-secondary: #4A4A4A;    /* Dark gray */
--text-tertiary: #A8A8A8;     /* Medium gray */
--text-disabled: #D0D0D0;     /* Light gray */
```

## Implementation in shadcn/ui + Tailwind

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
    },
  },
}
```

## Practical Examples for Coffee Websites

### Hero Section
```tsx
<h1 className="font-display text-6xl md:text-7xl font-bold tracking-tight text-gray-900">
  Artisan Coffee<br />Roasted Daily
</h1>
<p className="font-sans text-lg md:text-xl text-gray-600 leading-relaxed">
  Experience the finest single-origin beans
</p>
```

### Product Card
```tsx
<div className="product-card">
  <span className="font-sans text-xs font-semibold uppercase tracking-widest text-gray-500">
    Single Origin
  </span>
  <h3 className="font-display text-2xl font-semibold tracking-tight text-gray-900">
    Ethiopian Yirgacheffe
  </h3>
  <p className="font-sans text-sm text-gray-600 leading-relaxed">
    Bright citrus notes with floral undertones
  </p>
  <span className="font-display text-3xl font-bold tracking-tight text-coffee-700">
    $24.99
  </span>
</div>
```

### Navigation
```tsx
<nav className="font-sans text-sm font-medium tracking-wide">
  <a className="text-gray-700 hover:text-coffee-700">Shop</a>
  <a className="text-gray-700 hover:text-coffee-700">About</a>
</nav>
```

## Accessibility

**Minimum Requirements:**
- Body text: 16px minimum
- Line height: 1.5 minimum for body text
- Contrast ratio: 4.5:1 for normal text, 3:1 for large text (18px+)
- Don't rely on color alone - use weight, size, spacing

## Performance Tips

1. **Load only needed weights:**
```html
<!-- Good: Specific weights -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap">

<!-- Bad: All weights -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display&family=Inter">
```

2. **Use font-display: swap**
```css
@font-face {
  font-family: 'Playfair Display';
  font-display: swap; /* Shows fallback immediately */
}
```

3. **Subset fonts** for production (Latin only if English-only site)

## Quick Reference: Coffee Website Typography

```tsx
// Component typography classes
const typography = {
  // Headings
  h1: "font-display text-5xl md:text-7xl font-bold tracking-tight",
  h2: "font-display text-3xl md:text-5xl font-semibold tracking-tight",
  h3: "font-display text-2xl md:text-3xl font-semibold tracking-tight",

  // Body
  body: "font-sans text-base text-gray-600 leading-relaxed",
  large: "font-sans text-lg text-gray-600 leading-relaxed",
  small: "font-sans text-sm text-gray-500 leading-normal",

  // UI Elements
  button: "font-sans text-sm font-semibold tracking-wide uppercase",
  label: "font-sans text-xs font-semibold tracking-widest uppercase text-gray-500",
  price: "font-display text-3xl font-bold tracking-tight text-coffee-700",

  // Special
  productName: "font-display text-2xl font-semibold tracking-tight",
  category: "font-sans text-xs font-semibold tracking-widest uppercase",
}
```

Use these guidelines to create beautiful, readable, premium typography for any coffee website!
