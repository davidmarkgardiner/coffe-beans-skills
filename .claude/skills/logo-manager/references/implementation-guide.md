# Logo Implementation Guide

This guide provides ready-to-use implementation patterns for displaying company logos on websites with support for dark mode, responsive sizing, and overlay positioning.

## Quick Setup

### 1. Asset Organization

Create the following directory structure in your public folder:

```
public/
  images/
    logo-stockbridge-teal.png      # Transparent PNG for light backgrounds
    logo-stockbridge-golden.png    # Transparent PNG for premium contexts
    logo-stockbridge-grey.png      # Transparent PNG for dark backgrounds
    logo-stockbridge-teal.webp     # Optional WebP (smaller file size)
    logo-stockbridge-golden.webp
    logo-stockbridge-grey.webp
    logo-stockbridge.svg           # Optional vector for infinite scaling
```

### 2. For Express/Node.js

**Server setup:**

```js
// app.js
import express from "express";
const app = express();

// Serve the /public folder at root
app.use(express.static("public"));

app.get("/", (_req, res) => res.sendFile(process.cwd() + "/public/index.html"));
app.listen(3000, () => console.log("http://localhost:3000"));
```

**HTML with responsive dark mode:**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Stockbridge Coffee</title>
  <style>
    .logo { height: 56px; width: auto; display: inline-block }
    /* Optional: tint if using monochrome SVG */
    .logo svg { fill: currentColor }
    /* Dark mode styling */
    @media (prefers-color-scheme: dark) {
      .page { background: #0b0b0b; color: #eee }
    }
  </style>
</head>
<body class="page">
  <!-- Optimized: <picture> for WebP support + dark mode -->
  <a href="/" aria-label="Stockbridge Coffee home">
    <picture>
      <!-- Dark mode WebP -->
      <source
        srcset="/images/logo-stockbridge-grey.webp"
        media="(prefers-color-scheme: dark)"
        type="image/webp"
      />
      <!-- Light mode WebP -->
      <source srcset="/images/logo-stockbridge-teal.webp" type="image/webp" />
      <!-- Dark mode PNG fallback -->
      <source
        srcset="/images/logo-stockbridge-grey.png"
        media="(prefers-color-scheme: dark)"
      />
      <!-- Default light mode PNG -->
      <img
        class="logo"
        src="/images/logo-stockbridge-teal.png"
        alt="Stockbridge Coffee"
        loading="eager"
        fetchpriority="high"
      />
    </picture>
  </a>
</body>
</html>
```

### 3. For React/Next.js

**Using the Logo component (recommended):**

```tsx
// Copy assets/Logo.tsx to your components directory
import Logo from '@/components/Logo';

export default function Header() {
  return (
    <nav>
      <a href="/">
        <Logo variant="auto" size={56} priority />
      </a>
    </nav>
  );
}
```

**Using Next.js Image component:**

```tsx
import Image from "next/image";

export default function Logo({ size = 56 }: { size?: number }) {
  // Choose variant based on theme
  const isDark = typeof window !== "undefined" &&
    document.documentElement.dataset.theme === "dark";
  const src = isDark
    ? "/images/logo-stockbridge-grey.png"
    : "/images/logo-stockbridge-teal.png";

  return (
    <Image
      src={src}
      alt="Stockbridge Coffee"
      width={size * 4}
      height={size}
      priority
      style={{ height: size, width: "auto" }}
    />
  );
}
```

**Using plain `<picture>` (works in Next.js):**

```tsx
export default function Logo() {
  return (
    <picture>
      <source
        srcSet="/images/logo-stockbridge-grey.webp"
        media="(prefers-color-scheme: dark)"
        type="image/webp"
      />
      <source srcSet="/images/logo-stockbridge-teal.webp" type="image/webp" />
      <source
        srcSet="/images/logo-stockbridge-grey.png"
        media="(prefers-color-scheme: dark)"
      />
      <img
        src="/images/logo-stockbridge-teal.png"
        alt="Stockbridge Coffee"
        style={{ height: '56px', width: 'auto' }}
      />
    </picture>
  );
}
```

## Advanced Patterns

### Logo Overlay on Images

Overlay the logo on any photo background using absolute positioning:

```html
<div class="hero">
  <img class="hero-img" src="/images/beans.jpg" alt="Coffee beans">
  <img class="hero-logo" src="/images/logo-stockbridge-golden.png" alt="Stockbridge Coffee">
</div>

<style>
.hero {
  position: relative;
  display: inline-block
}
.hero-img {
  display: block;
  width: 100%;
  height: auto
}
.hero-logo {
  position: absolute;
  left: 24px;
  bottom: 24px;
  height: 48px;
  width: auto;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,.35));
}

/* Switch to grey variant in dark mode */
@media (prefers-color-scheme: dark) {
  .hero-logo { content: url("/images/logo-stockbridge-grey.png"); }
}
</style>
```

**React version with LogoOverlay:**

```tsx
import { LogoOverlay } from '@/components/Logo';

export default function Hero() {
  return (
    <div className="relative">
      <img src="/images/beans.jpg" alt="Coffee beans" className="w-full" />
      <LogoOverlay variant="golden" position="bottom-left" size={48} />
    </div>
  );
}
```

### Variant Selection by Context

```tsx
import Logo from '@/components/Logo';

// Navigation (light background) - use teal
<nav className="bg-white">
  <Logo variant="teal" size={56} />
</nav>

// Premium section (warm tones) - use golden
<section className="bg-amber-50">
  <Logo variant="golden" size={80} />
</section>

// Footer (dark background) - use grey
<footer className="bg-gray-900">
  <Logo variant="grey" size={48} />
</footer>

// Auto-switching based on theme
<header>
  <Logo variant="auto" size={56} />
</header>
```

### Responsive Sizing

```tsx
import Logo from '@/components/Logo';
import { useState, useEffect } from 'react';

export default function ResponsiveLogo() {
  const [logoSize, setLogoSize] = useState(56);

  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 768) setLogoSize(40);
      else if (window.innerWidth < 1024) setLogoSize(56);
      else setLogoSize(64);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return <Logo variant="auto" size={logoSize} priority />;
}
```

### CSS-only responsive sizing:

```css
.logo {
  height: 40px;  /* Mobile */
  width: auto;
}

@media (min-width: 768px) {
  .logo {
    height: 56px;  /* Tablet */
  }
}

@media (min-width: 1024px) {
  .logo {
    height: 64px;  /* Desktop */
  }
}
```

## Favicon & Social Media Assets

Convert the logo into square versions for favicons and social previews:

```html
<head>
  <!-- Favicons -->
  <link rel="icon" href="/images/favicon-32.png" sizes="32x32">
  <link rel="icon" href="/images/favicon-192.png" sizes="192x192">
  <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" sizes="180x180">

  <!-- Social media previews -->
  <meta property="og:image" content="/images/og-1200x630.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="/images/twitter-1200x600.png">
</head>
```

**Required sizes:**
- Favicon: 32×32, 192×192
- Apple Touch Icon: 180×180
- Open Graph: 1200×630
- Twitter Card: 1200×600

## Quality & Performance Tips

### 1. Export at High Resolution
Export PNGs at **2× or 3×** resolution for retina displays, then downscale with CSS:

```
Export: 168px × 168px (3× for 56px display)
CSS: height: 56px
```

### 2. Prefer SVG When Available
SVG provides infinite scalability and smaller file sizes:

```html
<img src="/images/logo.svg" alt="Stockbridge Coffee" class="logo">
```

For recolorable SVG:
```css
.logo svg { fill: currentColor; }
```

### 3. Optimize File Sizes
- Compress PNGs (use tools like TinyPNG, ImageOptim)
- Convert to WebP for ~30% smaller files
- Use `<picture>` to serve WebP with PNG fallback

### 4. Use Appropriate Loading Priority

```tsx
// Above the fold (navigation, hero)
<Logo priority={true} />

// Below the fold (footer, secondary sections)
<Logo priority={false} />
```

### 5. Set Proper Cache Headers
Configure your server to cache logo files for 1 year:

```
Cache-Control: public, max-age=31536000, immutable
```

## Troubleshooting

### Logo appears blurry on retina displays
Export PNG at 2× or 3× the display size, use CSS to set smaller display height

### Logo doesn't switch in dark mode
Verify `prefers-color-scheme` media query, check browser support, test in dark mode

### Logo loads slowly
Use `priority={true}` for above-fold logos, optimize file size, enable WebP format

### Logo not accessible to screen readers
Always include descriptive `alt` text, ensure sufficient color contrast

### Logo positioning breaks on mobile
Use responsive sizing, test across breakpoints, consider separate mobile layout
