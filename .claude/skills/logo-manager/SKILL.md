---
name: logo-manager
description: This skill provides tools and workflows for implementing, managing, and displaying company logos on websites with support for multiple color variants, dark mode switching, seasonal variations, and responsive sizing. Use this skill when adding logos to navigation bars, hero sections, or footers, when adapting logos for different backgrounds or themes, when implementing seasonal logo variations, or when exporting optimized logo assets in various formats (PNG, WebP, SVG).
---

# Logo Manager

## Overview

This skill enables efficient implementation and management of company logos across web applications, with support for:

- **Multiple color variants** (teal, golden, grey) that adapt to different backgrounds
- **Dark mode support** with automatic switching
- **Seasonal variations** (Christmas, Halloween, etc.)
- **Responsive sizing** across devices
- **Performance optimization** (WebP, lazy loading, retina support)
- **Accessibility** (proper alt text, contrast checking)
- **Asset export** (favicons, social media cards)

## When to Use This Skill

Invoke this skill when:

1. Adding a logo to a new page or component (navigation, hero, footer)
2. Extracting individual logo variants from a composite image provided by a designer
3. Implementing dark mode or theme switching for logos
4. Creating seasonal logo variations (holidays, special events)
5. Exporting logo assets in various formats and sizes
6. Optimizing logo performance (file size, loading priority)
7. Ensuring logo accessibility and proper contrast
8. Working with transparent logos that adapt to any background

## Quick Start Workflow

### 1. Determine the Context

First, identify where and how the logo will be used:

**Navigation Bar:**
- Variant: Teal (default) or auto-switching
- Size: 48-64px
- Priority: High (eager loading)
- Link: Homepage

**Hero Section:**
- Variant: Golden (warm imagery) or Grey (dark imagery)
- Size: 120-160px
- Position: Center or overlay
- May use `LogoOverlay` component

**Footer:**
- Variant: Grey (dark footer) or Teal (light footer)
- Size: 40-56px
- Priority: Low (lazy loading)

**Premium/Featured Sections:**
- Variant: Golden
- Size: 60-100px

### 2. Choose Implementation Approach

Based on the project stack:

**For React/Next.js:**
Use the provided `Logo` component template from `assets/Logo.tsx`

**For Express/Node.js:**
Use HTML `<picture>` element pattern from `references/implementation-guide.md`

**For Static HTML:**
Use standard `<img>` with CSS media queries

### 3. Implement the Logo

Copy the appropriate component or pattern and customize:

```tsx
// React example - Navigation
import Logo from '@/components/Logo';

<nav className="bg-white">
  <a href="/">
    <Logo variant="auto" size={56} priority />
  </a>
</nav>

// React example - Hero overlay
import { LogoOverlay } from '@/components/Logo';

<div className="relative">
  <img src="/hero.jpg" alt="Coffee beans" />
  <LogoOverlay variant="golden" position="center" size={140} />
</div>
```

### 4. Verify Accessibility & Performance

- Check alt text is descriptive
- Verify color contrast meets WCAG AA standards
- Ensure appropriate loading priority (eager for above-fold, lazy for below)
- Test dark mode switching
- Validate responsive sizing across breakpoints

## Core Capabilities

### 1. Logo Component Integration

The skill provides a ready-to-use React component (`assets/Logo.tsx`) with three exports:

**`<Logo />`** - Main component with variant switching
```tsx
<Logo variant="teal" size={56} priority />
<Logo variant="golden" size={80} />
<Logo variant="grey" size={48} />
<Logo variant="auto" size={56} /> // Auto-switches based on theme
```

**`<LogoPicture />`** - Optimized with WebP support
```tsx
<LogoPicture size={56} priority />
```

**`<LogoOverlay />`** - For overlaying on images
```tsx
<LogoOverlay variant="golden" position="bottom-left" size={48} />
```

To use:
1. Copy `assets/Logo.tsx` to the project's components directory
2. Import the desired component
3. Use with appropriate props for the context

### 2. Color Variant Selection

Three variants are provided for different contexts:

**Teal (Blue-Teal)** - Default variant
- Use on: Light backgrounds (white, cream, light grey)
- Context: Navigation, professional sections, default branding
- Best contrast: #FFFFFF, #F5F5F5, #E8E8E8

**Golden** - Premium variant
- Use on: Warm backgrounds (cream, beige, brown), coffee imagery
- Context: Premium products, featured sections, hero banners
- Best contrast: #FFF8F0, #F5E6D3, dark browns

**Grey** - Subtle variant
- Use on: Dark backgrounds (dark grey, black, navy)
- Context: Dark mode, footer sections, minimal designs
- Best contrast: #1A1A1A, #2C2C2C, #0B0B0B

**Auto** - Theme-aware switching
- Automatically switches between teal (light mode) and grey (dark mode)
- Use when: Supporting dynamic theme switching

For detailed variant guidelines, consult `references/logo-usage-guidelines.md`.

### 3. Seasonal Variations

To implement seasonal logo variants (e.g., Christmas, Halloween):

1. **Extend the Logo component type:**
```tsx
type LogoVariant = 'teal' | 'golden' | 'grey' | 'christmas' | 'halloween';
```

2. **Add seasonal assets to public directory:**
```
public/images/
  logo-stockbridge-christmas.png
  logo-stockbridge-halloween.png
```

3. **Update variant map:**
```tsx
const variantMap = {
  teal: '/images/logo-stockbridge-teal.png',
  golden: '/images/logo-stockbridge-golden.png',
  grey: '/images/logo-stockbridge-grey.png',
  christmas: '/images/logo-stockbridge-christmas.png',
  halloween: '/images/logo-stockbridge-halloween.png',
};
```

4. **Optional: Add time-based auto-switching:**
```tsx
const getSeasonalVariant = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  if (month === 12) return 'christmas';
  if (month === 10 && now.getDate() >= 20) return 'halloween';
  return 'teal';
};
```

### 4. Extracting Logo Variants from Composite Images

If you have a composite image with multiple logo color variants (e.g., from a designer), use the extraction script (`scripts/extract_logos.py`) to automatically extract individual transparent PNG files:

**Extract variants from a 2x3 grid composite:**
```bash
python scripts/extract_logos.py
```

The script assumes:
- Input: `src/assets/logos.png` (2 columns × 3 rows grid)
- Output: `src/assets/logo-variants/` directory
- Grid positions:
  - Top-left: Teal variant
  - Top-right: Golden variant
  - Middle-left: Grey variant
  - Middle-right: Golden-dark variant
  - Bottom-left: Golden icon-only
  - Bottom-right: Grey icon-only

The script will:
1. Split the composite image into individual logos
2. Auto-crop to remove whitespace while preserving transparency
3. Save optimized transparent PNG files
4. Create properly named files for each variant

**Requirements:** `pip install Pillow`

After extraction, update your Logo component imports to use the new transparent variants:
```tsx
import stockbridgeLogoTeal from '../assets/logo-variants/logo-stockbridge-teal.png';
import stockbridgeLogoGolden from '../assets/logo-variants/logo-stockbridge-golden.png';
import stockbridgeLogoGrey from '../assets/logo-variants/logo-stockbridge-grey.png';
```

### 5. Asset Export & Optimization

Use the export script (`scripts/export_logo_assets.py`) to generate optimized assets:

**Basic export:**
```bash
python scripts/export_logo_assets.py logo-teal.png --variant teal --output ./public/images
```

**Export all variants:**
```bash
python scripts/export_logo_assets.py logo-base.png --all-variants --output ./public/images
```

**Export with favicons and social media cards:**
```bash
python scripts/export_logo_assets.py logo.png --variant teal --icons --output ./public/images
```

**Export retina versions (3× DPI):**
```bash
python scripts/export_logo_assets.py logo.png --variant golden --dpi 3 --output ./dist
```

The script generates:
- Standard PNG files
- WebP versions (smaller file size)
- Retina versions (@2x, @3x)
- Favicons (32×32, 192×192)
- Apple Touch Icons (180×180)
- Social media cards (1200×630 for OG, 1200×600 for Twitter)

**Requirements:** `pip install Pillow`

### 6. Responsive Sizing

Recommended sizes by device and context:

```
Mobile (< 768px):
  Navigation: 40-48px
  Hero: 64-80px
  Footer: 32-40px

Tablet (768px - 1024px):
  Navigation: 48-56px
  Hero: 80-120px
  Footer: 40-48px

Desktop (> 1024px):
  Navigation: 56-64px
  Hero: 120-160px
  Footer: 48-56px
```

**Implementation:**

CSS-only approach:
```css
.logo {
  height: 40px; /* Mobile */
  width: auto;
}

@media (min-width: 768px) {
  .logo { height: 56px; } /* Tablet */
}

@media (min-width: 1024px) {
  .logo { height: 64px; } /* Desktop */
}
```

React approach:
```tsx
const logoSize = isMobile ? 40 : isTablet ? 56 : 64;
<Logo variant="auto" size={logoSize} />
```

### 7. Performance Optimization

**Loading Priority:**
```tsx
// Above the fold (navigation, hero)
<Logo priority={true} />  // Sets loading="eager" fetchpriority="high"

// Below the fold (footer, secondary sections)
<Logo priority={false} />  // Sets loading="lazy"
```

**Format Optimization:**
- Use `<LogoPicture />` for automatic WebP delivery with PNG fallback
- WebP reduces file size by ~30% compared to PNG
- Export retina versions (2× or 3×) for crisp display on high-DPI screens

**Caching:**
- Configure server to cache logo files for 1 year
- Use immutable cache headers: `Cache-Control: public, max-age=31536000, immutable`

### 8. Accessibility

**Alt Text Guidelines:**
- Navigation: "Company Name - Home" or "Company Name logo"
- General: "Company Name"
- Decorative overlays: "Company Name logo" or empty alt="" if purely decorative

**Contrast Requirements:**
- Ensure WCAG 2.1 Level AA compliance (4.5:1 minimum contrast ratio)
- Test each variant against its intended background colors
- Use browser DevTools or contrast checking tools

**Example:**
```tsx
<Logo
  variant="teal"
  size={56}
  alt="Stockbridge Coffee - Home"
  priority
/>
```

## Common Patterns

### Pattern 1: Navigation Logo with Link
```tsx
import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';

export default function Navigation() {
  const navigate = useNavigate();

  return (
    <nav className="bg-white px-6 py-4">
      <Logo
        variant="auto"
        size={56}
        priority
        onClick={() => navigate('/')}
        className="cursor-pointer"
      />
    </nav>
  );
}
```

### Pattern 2: Hero Section with Logo Overlay
```tsx
import { LogoOverlay } from '@/components/Logo';

export default function Hero() {
  return (
    <section className="relative w-full h-screen">
      <img
        src="/images/coffee-beans-hero.jpg"
        alt="Premium coffee beans"
        className="w-full h-full object-cover"
      />
      <LogoOverlay
        variant="golden"
        position="center"
        size={160}
      />
    </section>
  );
}
```

### Pattern 3: Context-Aware Variant Selection
```tsx
import Logo from '@/components/Logo';

export default function AdaptiveLogo({ backgroundType }) {
  // Choose variant based on background
  const variant =
    backgroundType === 'dark' ? 'grey' :
    backgroundType === 'premium' ? 'golden' :
    'teal';

  return <Logo variant={variant} size={64} />;
}
```

### Pattern 4: Seasonal Logo with Fallback
```tsx
import Logo from '@/components/Logo';
import { useMemo } from 'react';

export default function SeasonalLogo() {
  const variant = useMemo(() => {
    const month = new Date().getMonth() + 1;
    if (month === 12) return 'christmas';
    if (month === 10) return 'halloween';
    return 'auto';
  }, []);

  return <Logo variant={variant} size={56} priority />;
}
```

## Resources

### assets/
- **Logo.tsx** - React component with `<Logo />`, `<LogoPicture />`, and `<LogoOverlay />` exports
- **README.md** - Documentation on using and customizing the Logo component

### references/
- **logo-usage-guidelines.md** - Comprehensive guidelines on variant selection, sizing, accessibility, and best practices
- **implementation-guide.md** - Ready-to-use code examples for Express, React, Next.js, and HTML implementations

### scripts/
- **extract_logos.py** - Python script for extracting individual transparent logo variants from composite images
- **export_logo_assets.py** - Python script for generating optimized logo assets in various formats and sizes

## Workflow Decision Tree

```
START: Need to add/update a logo?
│
├─> Have a composite image with multiple logo variants?
│   ├─> Yes → Use scripts/extract_logos.py to extract individual transparent PNGs
│   │         Update Logo component imports to use extracted variants
│   │         Verify logos work on different backgrounds
│   └─> No → Continue to next question
│
├─> Is this for a new implementation?
│   ├─> Yes → Copy assets/Logo.tsx to components/
│   │         Set up logo files in src/assets/logo-variants/
│   │         Choose appropriate variant for context
│   │         Implement with correct size and priority
│   └─> No → Continue to next question
│
├─> Need to export logo assets?
│   ├─> Yes → Use scripts/export_logo_assets.py
│   │         Specify variant(s) and output directory
│   │         Include --icons flag for favicon/social cards
│   └─> No → Continue to next question
│
├─> Adding seasonal variation?
│   ├─> Yes → Extend Logo component with new variant type
│   │         Create seasonal logo assets
│   │         Update variant map
│   │         Optionally add time-based switching
│   └─> No → Continue to next question
│
├─> Need implementation examples?
│   └─> Yes → Consult references/implementation-guide.md
│             Use appropriate pattern for stack (React/Express/HTML)
│
└─> Need usage guidelines?
    └─> Yes → Consult references/logo-usage-guidelines.md
              Check variant selection rules
              Verify accessibility requirements
```

## Best Practices

1. **Transparency first:** Always use transparent PNG logos so they work on any background
2. **Consistency:** Use the same variant throughout a page section for visual coherence
3. **Contrast:** Always test logo visibility against actual backgrounds, not just in isolation
4. **Context matching:** Select variant based on emotional tone and background color
5. **Performance:** Set `priority={true}` only for above-fold logos
6. **Accessibility:** Provide descriptive alt text and ensure sufficient contrast
7. **Retina displays:** Export PNGs at 2× or 3× resolution for crisp rendering
8. **Format optimization:** Use WebP with PNG fallback via `<LogoPicture />` component
9. **Responsive design:** Test logos across all breakpoints and adjust sizes accordingly
10. **Asset organization:** Keep logo variants in `src/assets/logo-variants/` for easy management
11. **Version control:** Cache-bust logo files when updating to ensure users see changes
12. **Extraction workflow:** Use `extract_logos.py` when receiving composite images from designers
