# Premium Component Specifications

## Navigation Bar

### Specifications
- Style: Fixed, semi-transparent with blur effect
- Height: 80px
- Background: `rgba(255, 255, 255, 0.95)` with backdrop-blur
- Shadow: `0 2px 20px rgba(0,0,0,0.05)`
- Logo: Left-aligned, subtle fade-in animation
- Menu: Center or right-aligned, 600 font-weight
- Hover: Underline animation from center
- Cart: Icon with badge, smooth scale on hover

### CSS Implementation
```css
.nav {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding: 24px 0;
  transition: all 0.3s ease;
}

.nav.scrolled {
  padding: 16px 0;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

.nav-link {
  position: relative;
  padding: 8px 16px;
  color: #2C2C2C;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #6B4423;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::after {
  width: 80%;
}
```

## Hero Section

### Specifications
- Layout: Full viewport height (100vh)
- Video: Autoplay, muted, loop with 0.6 opacity overlay
- Text: Large serif heading (48-72px)
- Subtitle in light grey (18px)
- Minimal but impactful
- Animation: Fade in from bottom, stagger text elements
- CTA Button: 14px letter-spacing, hover scale 1.05

### Animation Timeline
```
1. Hero Video (0s)
   └─ Fade in from black (0.8s)

2. Hero Text (0.3s delay)
   └─ Fade up from bottom (1s)

3. Hero CTA (0.6s delay)
   └─ Fade in with scale (0.6s)

4. Scroll Indicator (1.2s delay)
   └─ Bounce animation (infinite)
```

## Product Cards

### CSS Implementation
```css
.product-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  box-shadow: 0 24px 48px rgba(0,0,0,0.12);
  transform: translateY(-12px);
}

/* Image Container */
.product-image {
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.product-image img {
  transition: transform 0.6s ease;
}

.product-image:hover img {
  transform: scale(1.08);
}
```

### Grid Layout
```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  padding: 80px 0;
}
```

## Premium CTA Button

### CSS Implementation
```css
.cta-button {
  background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
  color: #FFFFFF;
  padding: 18px 48px;
  border-radius: 50px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.3);
}

.cta-button:active {
  transform: translateY(0);
}
```

### Button Shine Effect
```css
.premium-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.premium-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.premium-button:hover::before {
  left: 100%;
}
```

## Form Inputs

### CSS Implementation
```css
.premium-input {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.premium-input:focus {
  border-color: #6B4423;
  box-shadow: 0 0 0 4px rgba(107, 68, 35, 0.1);
  outline: none;
}
```

## Glassmorphism Cards

### CSS Implementation
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}
```

## Neumorphism Cards

### CSS Implementation
```css
.neuro-card {
  background: #F0F0F0;
  border-radius: 20px;
  box-shadow:
    12px 12px 24px rgba(0,0,0,0.1),
    -12px -12px 24px rgba(255,255,255,0.7);
}
```

## Image Effects

### Loading Skeleton
```css
.image-skeleton {
  background: linear-gradient(
    90deg,
    #F0F0F0 0%,
    #E0E0E0 50%,
    #F0F0F0 100%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Hover Shine Effect
```css
.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}

.image-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.3),
    transparent
  );
  transition: left 0.6s;
}

.image-container:hover::before {
  left: 100%;
}
```

### Reveal on Scroll
```css
.reveal-image {
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s ease;
}

.reveal-image.visible {
  opacity: 1;
  transform: translateY(0);
}
```

## Text Effects

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #2C2C2C 0%, #6B4423 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## Custom Cursor (Desktop Only)

### CSS Implementation
```css
.custom-cursor {
  width: 40px;
  height: 40px;
  border: 2px solid #2C2C2C;
  border-radius: 50%;
  pointer-events: none;
  transition: all 0.1s ease;
  mix-blend-mode: difference;
}
```

## Animation Effects

### Smooth Parallax Scrolling
- Hero video/image moves slower than content (0.5x speed)
- Product images have subtle parallax on scroll
- Creates depth and premium feel

### Fade-In Scroll Animations
```javascript
// Using AOS (Animate On Scroll) library
data-aos="fade-up"
data-aos-delay="100"
data-aos-duration="800"
```

### Scroll Animations Timeline
```
Section Content (on scroll)
   └─ Fade up when 20% visible (0.8s)

Product Cards (on scroll)
   └─ Stagger fade up (0.6s each, 0.1s delay between)
```

## Micro-Animations

### Product Card Hover
```css
.product-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
}
```
