# Product Requirements Document: Stockbridge Coffee Website

> A handoff document for rebuilding the premium coffee e-commerce website from scratch.

---

## 1. Brand Identity

### Company Information
| Field | Value |
|-------|-------|
| **Name** | Stockbridge Coffee |
| **Location** | Stockbridge, Edinburgh, Scotland, UK |
| **Business Model** | Online coffee roaster with UK-wide delivery |
| **Tagline** | *"Edinburgh's Premium Coffee Roasters"* |

### Brand Pillars
1. **Direct Farmer Relationships** - Work directly with farmers in Latin America
2. **Fair Trade & Sustainability** - 100% sustainable, ethical sourcing
3. **Small-Batch Artisan Roasting** - Decades of experience, hand-crafted
4. **Community & Craftsmanship** - Coffee as connection, not just a drink

### Key Stats (for social proof)
- 15+ Countries sourced
- 50K+ Happy Customers
- 100% Sustainable

### Brand Voice
Premium, warm, artisanal, community-focused. Speaks of craftsmanship and passion without being pretentious.

---

## 2. Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Log Cabin Green** | `#212f1f` | Primary brand color, headings, buttons, nav background |
| **Off-White** | `#F5F0E8` | Main background |
| **Cream/Beige** | `#E8DCC8` | Cards, section backgrounds, surfaces |
| **Tan/Brown** | `#A89175` | Accent elements, secondary buttons, hover states |
| **Gold/Bronze** | `#B8975A` | Premium highlights, special accents |
| **Deep Black** | `#1A1A1A` | Primary text color |
| **Deep Green** | `#1a231a` | Shadows, darker accents |

### Gradients

```css
/* Primary CTA Button */
background: linear-gradient(135deg, #A89175 0%, #8F7B62 55%, #212f1f 100%);

/* CTA Hover State */
background: linear-gradient(135deg, #B8975A 0%, #A89175 45%, #8F7B62 100%);

/* Navigation (scrolled) */
background: linear-gradient(to bottom, rgba(33, 47, 31, 0.95), rgba(33, 47, 31, 0.85));
```

### Dark Mode
Inverted scheme - maintain contrast and readability with adapted colors.

---

## 3. Typography

### Font Families

| Font | Type | Usage |
|------|------|-------|
| **Bebas Neue** | Sans-serif | Logo, hero headings, large display text |
| **Cinzel** | Serif | Featured/accent headings |
| **Crimson Text** | Serif | Body copy, elegant paragraphs |
| **Libre Baskerville** | Serif | Alternative body serif |
| **Playfair Display** | Serif | Featured quotes, testimonials |
| **Inter** | Sans-serif | UI elements, buttons, labels, default body |

### Font Sizes (Desktop)
- Hero heading: 72px - 144px (responsive)
- Section headings: 36px - 48px
- Body text: 16px
- Small/labels: 12px - 14px

### Text Treatments
- Wide letter-spacing on labels: `0.2em - 0.25em`
- Serif fonts with kerning enabled
- Antialiased rendering

---

## 4. Logo Assets

### Required Variants
1. **Primary Color Logo** - For light backgrounds
2. **Black Logo** - For when color isn't suitable
3. **White/Light Logo** - For dark backgrounds (auto-switches in dark mode)

### Logo Specifications
- Default height: 56px in navigation
- Include drop shadow for visibility on images
- Support for overlay positioning (6 positions on product images)

### Current Files (for reference)
```
/public/images/
├── stockbridge-logo2.png
├── stockbridge-logo3.png      (color version)
├── stockbridge-logo3-black.png
└── stockbridge-logo4.png      (main nav logo)
```

---

## 5. Hero Section

### Design Specs
- **Layout:** Full-screen (100vh) with centered content
- **Background:** Video with rotating content (30-second intervals)
- **Overlay:** Dark gradient at 60-70% opacity
- **Effect:** 2px blur on background

### Content
```
Main Heading: STOCKBRIDGE COFFEE
Subheading: Edinburgh
```

### Text Styling
- Font: Bebas Neue
- Color: White
- Shadow: `4px 4px 8px black, -1px -1px 2px black`
- Animation: Fade-in + slide-up on page load

### Media Requirements
- Hero video (MP4 format)
- Fallback poster image (Unsplash coffee imagery)
- Multiple video sources for rotation

---

## 6. Navigation

### Menu Structure (Desktop)
```
[Logo] | Shop | Blog | About | Contact | [User/Login] | [Cart Badge]
```

### Behavior
- **Fixed** position at top
- **Scroll effect:** Background changes from transparent to green with backdrop blur
- **Mobile:** Hamburger menu with slide-down navigation

### User States
| State | Display |
|-------|---------|
| Logged out | "Sign In" button |
| Logged in | User avatar, name, dropdown menu |
| Admin | Additional "Admin Dashboard" link |

---

## 7. Page Sections

### 7.1 About Section

**Layout:** 2-column (text left, image right on desktop)

**Content:**
```
Badge: "Our Story"
Heading: "Crafted With Passion"

Body Copy:
At Stockbridge Coffee, we believe great coffee starts with great relationships.
Our journey begins in Latin America, where we work directly with farmers who
share our commitment to quality and sustainability.

Based in Stockbridge, Edinburgh, our small-batch roasters bring decades of
experience to every roast. For us, coffee is more than a drink. It's about
connecting communities, celebrating craftsmanship, and sharing the warmth
behind every cup.
```

**Stats Row:**
- 15+ Countries
- 50K+ Happy Customers
- 100% Sustainable

**Image:** Coffee cup with floating badge "Artisan Roasted - Every batch is carefully crafted by hand"

---

### 7.2 Product Showcase

**Featured Product:**
```
Name: Stockbridge Signature - Ethiopian Yirgacheffe
Label: Single Origin
Origin: Ethiopian Yirgacheffe
Altitude: 1,800-2,000m
Process: Washed
Roast: Light-Medium

Tasting Notes: Floral, Citrus, Honey, Tea-like

Description: A bright, clean coffee with delicate floral aromatics and
vibrant citrus acidity. This naturally processed Ethiopian coffee delivers
a tea-like body with sweet honey notes that linger beautifully on the palate.
```

**Pricing:**
| Size | Label | Price |
|------|-------|-------|
| 250g | Small Batch | £8.50 |
| 1kg | Value Pack | £28.00 |

**Options:**
- Format toggle: Whole Bean / Ground
- Size toggle: 250g / 1kg
- Quantity selector: +/- buttons

---

### 7.3 Testimonials

Three testimonials with customer photos:

**1. Sarah Mitchell** - Coffee Enthusiast
> "The Ethiopian Yirgacheffe is absolutely divine. The floral notes and bright acidity are unlike anything I've tasted from other roasters. Truly exceptional quality."

**2. Michael Chen** - Cafe Owner
> "We've been sourcing from Stockbridge for two years now. The consistency and quality of their beans have helped us build a loyal customer base. Their House Blend is a crowd favorite."

**3. Emma Rodriguez** - Home Barista
> "The House Blend has become my daily ritual. It's perfectly balanced for both espresso and pour-over. The subscription service ensures I never run out of great coffee."

---

### 7.4 Blog Section

```
Badge: "Stockbridge Stories"
Heading: "From Our Blog"
Subtitle: Brew notes, neighbourhood spotlights, and behind-the-scenes
reflections from the team crafting the Stockbridge Coffee experience.

CTA: "Read Recipes" →
```

**Display:** 3 latest published blog posts with:
- Featured image
- Title
- Excerpt
- Published date
- Read time estimate

---

### 7.5 Gift Cards

```
Badge: "Perfect Gift"
Heading: "Give the Gift of Premium Coffee"
Description: Share the joy of exceptional coffee with friends and family.
Our digital gift cards are delivered instantly and never expire.
```

**Benefits:**
- Instant Delivery (via email)
- Personal Message option
- Never Expires (valid 1 year)

**Amounts:** £25, £50, £100, or Custom

**Features:**
- Digital delivery to recipient email
- Custom message support
- Redeemable with balance tracking

---

### 7.6 Newsletter

```
CTA: "Subscribe for updates and special offers"
Input: Email field
Button: "Subscribe"
Success: "✓ Subscribed!"
```

---

### 7.7 Contact Section

**Tabbed Interface:**

**Tab 1: Contact Info**
- Email: hello@stockbridgecoffee.com
- Support: support@stockbridgecoffee.com
- Phone: (555) 123-4567
- Hours: Mon-Fri 8am-6pm

**Tab 2: Send Message**
Form fields: Name, Email, Subject, Message

**Tab 3: Location**
- Based in: Stockbridge, Edinburgh, Scotland, UK
- Note: Online shop, no physical storefront
- UK-wide delivery available

---

### 7.8 Footer

**Columns:**
1. **Brand** - Logo + tagline
2. **Quick Links** - Home, Products, Blog, About, Contact
3. **Contact** - Email, phone, hours
4. **Newsletter** - Email signup

**Copyright:** © 2025 Stockbridge Coffee. All rights reserved.

---

## 8. E-Commerce Features

### Shopping Cart
- Slide-out drawer sidebar
- Item quantity adjustment (+/-)
- Remove items
- Discount code input
- Order summary (subtotal, discount, total)
- Cart badge count in navigation

### Checkout
- Stripe payment integration
- Currency: GBP (£)
- Order summary display
- Error handling with user messages

### Gift Card System
- Apply gift card codes at checkout
- Track remaining balance
- Multiple redemptions supported
- Covers full or partial orders

### Discount Codes
- Percentage or fixed amount types
- Visual feedback on application
- Validation and error states

---

## 9. Authentication

### Methods
- Email/Password registration and login
- Google OAuth
- Password reset via email

### User Features
- Profile with avatar display
- Order history (if implemented)
- Saved addresses (if implemented)

### Admin Features
- Admin role detection
- Admin Dashboard access
- Content management capabilities

---

## 10. Animations & Interactions

### Scroll Animations
- Fade-in on scroll
- Fade-in-up with stagger delays (0.1s increments)
- Scale animations on images

### Hover Effects
- **Lift:** `translateY(-4px)` with shadow
- **Glow:** Box shadow effect
- **Scale:** 1.05x zoom
- **Image zoom:** 1.05-1.1x on hover

### Transitions
- Smooth: 0.3s cubic-bezier ease
- Fast: 0.15s ease
- Slow: 0.5s ease

### Loading States
- Spin animation for loaders
- Shimmer effect for skeletons

### Reduced Motion
Respect `prefers-reduced-motion` - disable animations for accessibility.

---

## 11. Responsive Design

### Breakpoints
- Mobile-first approach
- **md:** 768px (tablet)
- **lg:** 1024px (desktop)
- **xl:** 1280px (large desktop)

### Key Adaptations
| Element | Desktop | Mobile |
|---------|---------|--------|
| Navigation | Horizontal menu | Hamburger |
| Hero text | 9xl | 6xl |
| Sections | 2-column | 1-column |
| Product grid | 3-column | 1-column |
| Testimonials | 3 cards | Stacked |

---

## 12. Technical Requirements

### Recommended Stack
- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Payments:** Stripe
- **Routing:** React Router
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

### Integrations
- Firebase Authentication
- Firestore database
- Stripe payment processing
- Google Maps (location embed)
- Email service (Nodemailer/Gmail API)

---

## 13. Accessibility Requirements

- ARIA labels on all interactive elements
- Proper form labels with `htmlFor`
- Alt text on all images
- Keyboard navigation support
- Focus visible states (ring highlights)
- Color contrast WCAG AA compliant
- Respect reduced motion preferences

---

## 14. Content Assets Needed

### Images
- [ ] Logo variants (color, black, white)
- [ ] Hero background video(s)
- [ ] Hero poster/fallback image
- [ ] Coffee cup lifestyle photo (About section)
- [ ] Product photos (coffee bags)
- [ ] Customer testimonial photos (3)
- [ ] Blog post featured images
- [ ] Gift card illustration

### Copy
- [ ] About section text
- [ ] Product descriptions
- [ ] Testimonial quotes
- [ ] Blog posts
- [ ] Terms & Privacy pages
- [ ] Email templates

---

## 15. Success Metrics

The rebuilt site should achieve:
- Lighthouse Performance: 90+
- Lighthouse Accessibility: 100
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Mobile-friendly: Pass Google test
- Cross-browser: Chrome, Firefox, Safari, Edge

---

## Appendix: Quick Reference

### Brand Colors (Copy-Paste)
```css
:root {
  --brand-primary: #212f1f;
  --background: #F5F0E8;
  --surface: #E8DCC8;
  --accent: #A89175;
  --gold: #B8975A;
  --text: #1A1A1A;
}
```

### Font Import
```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@400;500;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
```

### Contact Emails
- General: hello@stockbridgecoffee.com
- Support: support@stockbridgecoffee.com

---

## 16. Assets Manifest

### Logo Files (COPY THESE)
```
coffee-website-react/public/images/
├── stockbridge-logo2.png         # Version 2
├── stockbridge-logo3.png         # Color version (main)
├── stockbridge-logo3-black.png   # Black variant
└── stockbridge-logo4.png         # Navigation logo
```

### Media Files (COPY THESE)
```
coffee-website-react/public/
├── hero.mp4                      # Hero background video
├── coffee-icon.svg               # Favicon/icon
└── images/
    └── coffee-cup-seasonal.png   # About section image
```

### SEO Files (COPY THESE)
```
coffee-website-react/public/
├── robots.txt
└── sitemap.xml
```

### External Image Sources
The site uses Unsplash for fallback hero images. No local copies needed - fetched via URL.

---

## 17. Product Data

### Current Product Catalog

```json
{
  "products": [
    {
      "id": "stockbridge-signature",
      "name": "Stockbridge Signature",
      "origin": "Ethiopian Yirgacheffe",
      "label": "Single Origin",
      "description": "A bright, clean coffee with delicate floral aromatics and vibrant citrus acidity. This naturally processed Ethiopian coffee delivers a tea-like body with sweet honey notes that linger beautifully on the palate.",
      "tastingNotes": ["Floral", "Citrus", "Honey", "Tea-like"],
      "specs": {
        "altitude": "1,800-2,000m",
        "process": "Washed",
        "roast": "Light-Medium"
      },
      "pricing": {
        "250g": { "price": 8.50, "label": "Small Batch" },
        "1kg": { "price": 28.00, "label": "Value Pack" }
      },
      "formats": ["Whole Bean", "Ground"],
      "image": "/images/coffee-cup-seasonal.png"
    }
  ]
}
```

### Gift Card Options
- £25, £50, £100, or Custom amount
- Digital delivery via email
- 1-year validity
- Balance tracking for partial redemptions

---

## 18. Blog Content

Blog posts are stored in **Firebase Firestore** under the `blog-posts` collection.

### Blog Post Schema
```typescript
interface BlogPost {
  id: string
  title: string
  slug: string              // URL-friendly slug
  excerpt: string           // Short preview text
  content: string           // Full markdown/HTML content
  featuredImage?: string    // URL to featured image
  publishedAt: Timestamp    // Firebase timestamp
  readTime: string          // e.g., "5 min read"
  status: 'draft' | 'published'
  author?: string
  tags?: string[]
}
```

### Export Instructions
To export blog posts from Firebase:
```bash
# Using Firebase CLI
firebase firestore:export gs://your-bucket/blog-backup

# Or query via Admin SDK and save to JSON
```

---

## 19. Third-Party Setup Guide

### 19.1 Firebase Setup

**Required Services:**
- Authentication (Email/Password + Google OAuth)
- Firestore Database
- Firebase Storage (for images)
- Firebase Hosting

**Steps:**
1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication providers:
   - Email/Password
   - Google (configure OAuth consent screen first)
3. Create Firestore database (start in test mode, secure later)
4. Enable Storage
5. Get config from Project Settings → General → Your Apps → Web App

**Environment Variables Needed:**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Firestore Collections:**
- `blog-posts` - Blog content
- `newsletter-subscribers` - Email subscriptions
- `gift-cards` - Gift card records
- `orders` - Order history (if tracking)

---

### 19.2 Stripe Setup

**Steps:**
1. Create account at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get API keys from Developers → API Keys
3. Create webhook endpoint for order confirmation

**Environment Variables Needed:**
```env
# Frontend (publishable - safe to expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend (secret - never expose)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Webhook Events to Handle:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

### 19.3 Google Maps Setup

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project or use existing
3. Enable Maps JavaScript API
4. Create API key with HTTP referrer restrictions

**Environment Variable:**
```env
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

---

### 19.4 Email Service (Optional)

For contact form and newsletter:

**Option A: Gmail API**
- Use OAuth2 with Gmail
- Good for low volume

**Option B: SendGrid/Mailgun**
- Better for production
- Transactional email templates

**Environment Variables:**
```env
# Gmail approach
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Or SendGrid
SENDGRID_API_KEY=SG.xxxxx
```

---

### 19.5 AI Features (Optional)

For AI copilot/chat features:

```env
OPENAI_API_KEY=sk-...
```

For AI content generation:

```env
GEMINI_API_KEY=AIza...
```

---

## 20. Complete Environment Template

Create `.env` file with these variables:

```env
# ============================================
# FIREBASE (Required)
# ============================================
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# ============================================
# STRIPE (Required for payments)
# ============================================
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# ============================================
# GOOGLE MAPS (Required for location)
# ============================================
VITE_GOOGLE_MAPS_API_KEY=

# ============================================
# SERVER CONFIG
# ============================================
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173

# ============================================
# OPTIONAL - AI Features
# ============================================
OPENAI_API_KEY=
GEMINI_API_KEY=

# ============================================
# OPTIONAL - Email
# ============================================
GMAIL_USER=
GMAIL_APP_PASSWORD=
```

---

## 21. Handoff Checklist

### Files to Transfer
- [ ] `/public/images/` - All logo and image files
- [ ] `/public/hero.mp4` - Hero video
- [ ] `/public/robots.txt` - SEO
- [ ] `/public/sitemap.xml` - SEO
- [ ] This PRD document

### Data to Export
- [ ] Blog posts from Firestore (JSON export)
- [ ] Newsletter subscribers (if needed)
- [ ] Gift card records (if needed)

### Accounts to Create
- [ ] Firebase project
- [ ] Stripe account
- [ ] Google Cloud project (for Maps API)
- [ ] Domain/hosting (Firebase Hosting, Vercel, etc.)

### Credentials to Generate
- [ ] Firebase config keys
- [ ] Stripe API keys
- [ ] Google Maps API key
- [ ] Email service credentials (optional)

---

*Document Version: 1.1*
*Last Updated: January 2025*
*Includes: Assets, Product Data, Setup Guides*
