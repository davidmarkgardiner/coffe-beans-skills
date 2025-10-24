# Hero Section Redesign Patterns

This guide covers patterns for redesigning hero sections to maximize logo visibility and visual impact, based on successful implementations.

## Pattern: Massive Logo Hero

### When to Use
- Want logo to be the primary focal point
- Have a high-quality logo with good detail
- Background image (e.g., coffee beans, products) supports the brand
- Desire a minimal, elegant, artisan aesthetic
- Logo contains both icon and text (e.g., "Company Name + Location")

### Problem Statement
Original hero sections often have:
- Small logo competing with large text
- Duplicate branding (logo + separate heading with company name)
- Multiple CTAs and description text cluttering the hero
- Scroll indicators taking up space
- Logo with wrong spelling or incorrect color variants

### Solution: Logo-Centric Hero

Create a hero section where:
1. Logo fills 60-95% of viewport width (responsive)
2. Logo is bright/high-contrast against background
3. All text content is removed (no duplicate headings, descriptions, CTAs)
4. Clean, minimal layout with single visual focus

## Implementation Steps

### Step 1: Create Bright Logo Variant

**Problem:** Existing logo variants may be:
- Too dark for dark backgrounds
- Wrong spelling (common issue with designer files)
- Have opaque backgrounds instead of transparency

**Solution:** Generate bright, transparent logo variant

```bash
# Use the create_bright_variant.py script
python scripts/create_bright_variant.py logo-source.png logo-bright.png
```

**Key Parameters:**
- Background threshold: 200 (pixels lighter than this become transparent)
- Bright color: RGB(250, 240, 210) - soft off-white with golden tint
- Enhanced brightness: 85-95% depending on pixel darkness
- Contrast enhancement: 1.3x
- Sharpness enhancement: 1.5x

**Why These Values:**
- 250/240/210 provides warm, elegant tone that stands out on dark backgrounds
- 85-95% brightness ensures logo is clearly visible while preserving detail
- Contrast/sharpness enhancement keeps edges crisp and professional

### Step 2: Update Hero Component

**Before:**
```tsx
<section className="hero">
  <div className="content">
    <Logo variant="golden" size={160} className="w-40 sm:w-48 md:w-56 lg:w-64" />
    <p>Tagline text</p>
    <h1>Company Name</h1>
    <p>Description text...</p>
    <div className="buttons">
      <button>CTA 1</button>
      <button>CTA 2</button>
    </div>
  </div>
  <div className="scroll-indicator">Scroll to explore</div>
</section>
```

**After:**
```tsx
import brightLogo from '../assets/logo-variants/logo-bright.png'

<section className="hero h-screen flex items-center justify-center">
  {/* Background with subtle blur */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px]"
         style={{ backgroundImage: `url(${bgImage})` }} />
    <div className="absolute inset-0 bg-gradient-to-b from-grey-900/60 via-grey-900/70 to-grey-900/80" />
  </div>

  {/* Massive Logo */}
  <motion.div className="relative z-10 flex items-center justify-center px-4 w-full">
    <img
      src={brightLogo}
      alt="Company Name Location - Logo"
      className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.65)]
                 w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[82vw] xl:w-[78vw] 2xl:w-[72vw]
                 max-w-[1680px]"
      style={{
        imageRendering: 'crisp-edges',
        filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 0.15))'
      }}
      loading="eager"
    />
  </motion.div>
</section>
```

### Step 3: Responsive Sizing Strategy

**Goal:** Logo should fill most of the viewport on mobile, scale down progressively on larger screens

| Breakpoint | Viewport Width | Logo Width | Reasoning |
|------------|----------------|------------|-----------|
| Mobile     | < 640px        | 95vw       | Maximum impact on small screens |
| Small      | 640-768px      | 90vw       | Slight padding for balance |
| Medium     | 768-1024px     | 85vw       | More breathing room |
| Large      | 1024-1280px    | 82vw       | Proportional to larger viewport |
| XL         | 1280-1536px    | 78vw       | Prevent logo from being too massive |
| 2XL        | > 1536px       | 72vw       | Cap at reasonable size |
| Max Width  | All            | 1680px     | Absolute maximum for very large screens |

**Why This Works:**
- Mobile-first: Largest relative size where screen real estate is limited
- Progressive scaling: Logo doesn't become overwhelming on large displays
- Max-width cap: Prevents logo from being absurdly large on ultra-wide monitors

### Step 4: Background Treatment

**Goal:** Make logo stand out while showing brand imagery

```css
/* Background container */
.absolute.inset-0.overflow-hidden

/* Image layer - slight scale + blur */
.scale-105.blur-[2px]
/* Scale prevents blur edges, blur makes logo pop */

/* Light center spotlight */
.bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0,transparent_60%)]

/* Dark overlay gradient */
.bg-gradient-to-b.from-grey-900/60.via-grey-900/70.to-grey-900/80
```

**Why:**
- 2px blur: Subtle depth without losing detail
- Scale 105%: Prevents white edges from blur
- Radial gradient: Creates subtle spotlight on logo
- Dark gradient: Ensures logo contrast, darker at edges

### Step 5: Visual Effects for Impact

```tsx
// Drop shadow for depth
className="drop-shadow-[0_30px_60px_rgba(0,0,0,0.65)]"

// Crisp edges for text clarity
style={{ imageRendering: 'crisp-edges' }}

// Subtle glow for prominence
style={{ filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 0.15))' }}
```

**Why Each Effect:**
- Heavy drop shadow (60px, 65% opacity): Creates dramatic depth
- Crisp edges: Prevents anti-aliasing blur on text
- White glow (40px, 15% opacity): Subtle halo effect makes logo "pop"

## Common Issues & Solutions

### Issue 1: Logo Has Wrong Spelling

**Symptoms:**
- "COEEEE" instead of "COFFEE"
- "FOINBURGH" instead of "EDINBURGH"
- Missing letters in text

**Cause:** Designer provided logo variant files have errors

**Solution:**
1. Find logo file with correct spelling (usually in different variant)
2. Use that as source for bright variant generation
3. Run through `create_bright_variant.py` script

```bash
# Check all logo variants
ls src/assets/logo-variants/
ls src/assets/

# Read each to find correct spelling
# Use webapp-testing skill to verify

# Generate bright variant from correct source
python scripts/create_bright_variant.py src/assets/logo-correct.png src/assets/logo-variants/logo-bright.png
```

### Issue 2: Logo Too Dark on Dark Background

**Symptoms:**
- Logo barely visible
- Poor contrast with coffee beans or dark imagery
- Text hard to read

**Solution:** Increase brightness values in generation script

```python
# Increase these values (current: 250, 240, 210)
bright_r = 255  # Pure white
bright_g = 250  # Slightly warm
bright_b = 220  # Golden undertone

# Or increase enhanced_brightness multipliers
enhanced_brightness = 0.90  # for dark pixels (was 0.85)
enhanced_brightness = 0.98  # for mid-tones (was 0.95)
```

### Issue 3: Logo Not Centered Vertically

**Symptoms:**
- Logo appears too high or too low
- Unbalanced whitespace

**Solution:** Ensure flex centering and check padding

```tsx
// Parent section
className="h-screen flex items-center justify-center"

// Logo container
className="relative z-10 flex items-center justify-center px-4 w-full"

// Remove any margin classes (mb-8, mt-4, etc.)
```

### Issue 4: Logo Appears Blurry

**Symptoms:**
- Text not sharp
- Edges fuzzy
- Loss of detail

**Solution:**
1. Use high-resolution source (1024x1024 or larger)
2. Apply sharpness enhancement
3. Use `imageRendering: 'crisp-edges'`

```python
# In generation script
sharpness_enhancer = ImageEnhance.Sharpness(logo)
logo = sharpness_enhancer.enhance(1.5)  # Increase for sharper
```

```tsx
// In component
style={{ imageRendering: 'crisp-edges' }}
```

## Testing Checklist

After implementing massive logo hero:

- [ ] Logo displays correct spelling (no "COEEEE")
- [ ] Logo is bright and clearly visible on dark background
- [ ] Logo fills appropriate % of viewport on all screen sizes
- [ ] Logo maintains transparency (background shows through)
- [ ] No duplicate text (company name appears only in logo)
- [ ] No scroll indicator or extraneous elements
- [ ] Logo is crisp and sharp (not blurry)
- [ ] Background image visible but doesn't compete with logo
- [ ] Proper drop shadow for depth
- [ ] Responsive across mobile, tablet, desktop
- [ ] Centered vertically and horizontally
- [ ] Alt text is descriptive and accurate

## Before/After Metrics

Typical transformation:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Logo size (desktop) | 160-256px | 1200-1400px | **~600% larger** |
| Logo size (mobile) | 160px | 320-360px | **100% larger** |
| Viewport coverage | 10-15% | 70-85% | **5-7x larger** |
| Text elements | 4-5 (tagline, h1, description, CTAs) | 0 (logo only) | **100% reduction** |
| Scroll indicator | Yes | No | **Removed** |
| Loading priority | Normal | Eager | **Improved** |
| Visual focus | Distributed | Singular | **Unified** |

## Maintenance Notes

**When logo needs updating:**
1. Get new source logo with correct spelling
2. Verify spelling with webapp-testing skill before processing
3. Run through `create_bright_variant.py`
4. Test on actual website (not just viewing PNG)
5. Verify responsive sizing on mobile, tablet, desktop

**Preserving changes through git:**
- Commit logo variant files to git
- Include Hero.tsx changes
- Document which logo source file has correct spelling
- Keep generation script in repo for reproducibility

## Related Patterns

- **Logo + Minimal Text**: Keep logo large (60-70vw) but add single tagline below
- **Logo Overlay on Video**: Similar sizing but on video background instead of static image
- **Animated Logo Entrance**: Add scale or fade animations to logo appearance
- **Seasonal Logo Swap**: Use same sizing but swap logo variant for holidays

## Real-World Example

**Stockbridge Coffee Edinburgh Hero**

- Logo: Bridge icon + "STOCKBRIDGE COFFEE" + "EDINBURGH" text
- Background: Coffee beans photo (dark)
- Logo variant: Bright off-white/gold (RGB 250, 240, 210)
- Size: 95vw mobile, 72vw on 2XL, max 1680px
- Effects: 30px/60px drop shadow, 40px white glow
- Background treatment: 2px blur, 60-80% dark overlay
- Result: Stunning, minimal hero with clear brand focus
