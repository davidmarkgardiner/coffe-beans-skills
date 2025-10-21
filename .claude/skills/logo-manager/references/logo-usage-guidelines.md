# Logo Usage Guidelines

## Color Variant Selection

### Teal (Blue-Teal) - Default Variant
**File:** `logo-stockbridge-teal.png`

**Use when:**
- Light backgrounds (white, cream, light grey)
- Default navigation bars
- Professional/corporate contexts
- Main website header

**Color profile:** Cool, professional, trustworthy
**Best contrast:** Light backgrounds (#FFFFFF, #F5F5F5, #E8E8E8)

### Golden (Premium) Variant
**File:** `logo-stockbridge-golden.png`

**Use when:**
- Premium product sections
- Warm-toned backgrounds (cream, beige, brown)
- Hero sections with coffee imagery
- Special offerings or featured products
- Festive/celebratory contexts

**Color profile:** Warm, premium, inviting
**Best contrast:** Warm neutrals (#FFF8F0, #F5E6D3, dark browns)

### Grey (Subtle) Variant
**File:** `logo-stockbridge-grey.png`

**Use when:**
- Dark backgrounds (dark grey, black, navy)
- Footer sections
- Dark mode enabled
- Overlaid on dark photos
- Minimal/modern designs

**Color profile:** Neutral, subtle, sophisticated
**Best contrast:** Dark backgrounds (#1A1A1A, #2C2C2C, #0B0B0B)

## Responsive Sizing

### Recommended Sizes

```
Mobile (< 768px):
  - Navigation: 40-48px height
  - Hero: 64-80px height
  - Footer: 32-40px height

Tablet (768px - 1024px):
  - Navigation: 48-56px height
  - Hero: 80-120px height
  - Footer: 40-48px height

Desktop (> 1024px):
  - Navigation: 56-64px height
  - Hero: 120-160px height
  - Footer: 48-56px height
```

## Logo Placement

### Navigation Bar
- Position: Top-left corner
- Variant: Teal (or auto-switching)
- Size: 48-64px
- Priority: `true` (eager loading)
- Link: Homepage (`/`)

```tsx
<Logo variant="auto" size={56} priority onClick={() => navigate('/')} />
```

### Hero Section
- Position: Center or overlay on hero image
- Variant: Golden (for warm imagery) or Grey (for dark imagery)
- Size: 120-160px
- Consider using `<LogoOverlay />` if overlaying on photos

```tsx
<LogoOverlay variant="golden" size={140} position="center" />
```

### Footer
- Position: Center or left-aligned
- Variant: Grey (if dark footer) or Teal (if light footer)
- Size: 40-56px
- Priority: `false` (lazy loading)

```tsx
<Logo variant="grey" size={48} />
```

## Accessibility

### Alt Text
Always provide descriptive alt text:
- Navigation: "Stockbridge Coffee - Home"
- General: "Stockbridge Coffee"
- Decorative overlays: "Stockbridge Coffee logo"

### Contrast Requirements
Ensure WCAG 2.1 Level AA compliance:
- Teal variant: Minimum contrast ratio 4.5:1 on light backgrounds
- Golden variant: Minimum contrast ratio 4.5:1 on warm backgrounds
- Grey variant: Minimum contrast ratio 4.5:1 on dark backgrounds

## Performance Optimization

### Format Selection
1. **Preferred:** Use `<LogoPicture />` component for automatic WebP delivery
2. **Fallback:** Standard `<Logo />` component with PNG

### Loading Strategy
```tsx
// Above the fold (visible immediately)
<Logo priority={true} />

// Below the fold
<Logo priority={false} />
```

### Caching
All logo files should be:
- Served with long cache headers (1 year)
- Versioned or cache-busted on changes
- Optimized for file size (use compression)

## Seasonal Variations

### Implementation Pattern

To add seasonal logo variants (e.g., Christmas, Halloween):

1. **Create seasonal assets:**
```
public/images/
  logo-stockbridge-christmas.png
  logo-stockbridge-halloween.png
```

2. **Extend the Logo component:**
```tsx
type LogoVariant = 'teal' | 'golden' | 'grey' | 'christmas' | 'halloween' | 'auto';

const variantMap = {
  teal: '/images/logo-stockbridge-teal.png',
  golden: '/images/logo-stockbridge-golden.png',
  grey: '/images/logo-stockbridge-grey.png',
  christmas: '/images/logo-stockbridge-christmas.png',
  halloween: '/images/logo-stockbridge-halloween.png',
};
```

3. **Add time-based auto-switching (optional):**
```tsx
const getSeasonalVariant = (): LogoVariant => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Christmas season (Dec 1 - Dec 31)
  if (month === 12) return 'christmas';

  // Halloween season (Oct 20 - Oct 31)
  if (month === 10 && day >= 20) return 'halloween';

  return 'teal'; // Default
};
```

## Best Practices

1. **Consistency:** Use the same variant throughout a page section
2. **Contrast:** Always test logo visibility on actual backgrounds
3. **Context:** Match variant to the emotional tone of the content
4. **Performance:** Prioritize only above-fold logos
5. **Accessibility:** Never rely on color alone to convey information
6. **Retina displays:** Export PNGs at 2× or 3× resolution
7. **SVG preferred:** When available, SVG provides infinite scalability

## Common Patterns

### Auto-switching based on theme
```tsx
<Logo variant="auto" />
```

### Responsive sizing
```tsx
<Logo
  size={isMobile ? 40 : isTablet ? 56 : 64}
  variant="teal"
/>
```

### Logo as link
```tsx
<a href="/" aria-label="Stockbridge Coffee home">
  <Logo variant="auto" size={56} priority />
</a>
```

### Logo overlay on hero image
```tsx
<div className="relative">
  <img src="/hero-coffee.jpg" alt="Premium coffee beans" />
  <LogoOverlay variant="golden" position="center" size={160} />
</div>
```
