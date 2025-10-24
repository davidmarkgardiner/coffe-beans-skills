# Premium Coffee Website - React + TypeScript

A sophisticated, high-end coffee e-commerce website built with **React**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

## Features

- ⚛️ React 18 with TypeScript for type safety
- 🎨 Tailwind CSS with custom coffee color palette
- 🎬 Smooth animations with Framer Motion
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🛒 Shopping cart functionality
- 💳 **Stripe payment integration** (NEW!)
- ✨ Premium design with glassmorphism effects
- 🎯 60-30-10 color rule implementation
- 🔤 Premium typography (Playfair Display + Inter)

## Design System

### Colors

- **Coffee Brown** (#6B4423) - Primary accent color
- **Grey Scale** - 10 shades for neutral colors (60% of interface)
- **Semantic Colors** - Success, warning, info, error states

### Typography

- **Headings**: Playfair Display (serif) - Elegant, sophisticated
- **Body**: Inter (sans-serif) - Clean, modern, highly readable

### Animations

- Fade-in-up on scroll
- Staggered product card entrance
- Hover lift effects on cards
- Smooth parallax hero
- Add-to-cart micro-interactions

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Stripe (Required for Payments)

Create a `.env` file in this directory:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
```

Get your keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) (Test Mode).

**Note:** Backend server expects `STRIPE_SECRET_KEY` in parent `.env` file.

### 3. Run Development Servers

**Option A: Run both frontend and backend together**
```bash
npm run dev:all
```

**Option B: Run separately (2 terminals)**
```bash
# Terminal 1 - Backend API server
npm run server

# Terminal 2 - Frontend dev server
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser (port may vary).

### 4. Test Stripe Payment

1. Click **"Buy Now"** on any product
2. Checkout modal will open
3. Enter test card: **4242 4242 4242 4242**
4. Expiry: **12/34** | CVC: **123** | ZIP: **12345**
5. Click **"Pay $XX.XX"**
6. ✅ Payment should succeed!

**Other test cards:**
- Declined: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`
- 3D Secure: `4000 0025 0000 3155`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
# Test Stripe configuration
npm run test:stripe

# Run end-to-end payment test
python3 ../test_stripe_checkout.py
```

## Project Structure

```
coffee-website-react/
├── server/
│   └── index.ts               # Express backend for Stripe payments
├── src/
│   ├── components/
│   │   ├── Navigation.tsx     # Fixed nav with scroll effects
│   │   ├── Hero.tsx           # Full-height parallax hero
│   │   ├── ProductCard.tsx    # Product card with Buy Now button
│   │   ├── ProductGrid.tsx    # Staggered product grid
│   │   ├── Checkout.tsx       # Stripe checkout modal (NEW)
│   │   ├── CheckoutForm.tsx   # Stripe payment form (NEW)
│   │   └── Footer.tsx         # Footer with newsletter
│   ├── lib/
│   │   └── stripe.ts          # Stripe utilities (NEW)
│   ├── hooks/
│   │   └── useCart.ts         # Shopping cart logic
│   ├── types/
│   │   └── product.ts         # TypeScript types
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # App entry point
│   └── index.css              # Tailwind imports
├── scripts/
│   ├── test-stripe.ts         # Stripe config test (NEW)
│   └── test-checkout.ts       # Checkout test
├── .env                       # Environment variables (git-ignored)
├── tailwind.config.js         # Tailwind configuration
├── vite.config.ts             # Vite config with API proxy
├── index.html                 # HTML template with fonts
├── STRIPE_SETUP.md            # Stripe setup guide (NEW)
└── package.json
```

## Customization

### Update Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  coffee: {
    700: '#6B4423', // Change primary coffee color
  },
}
```

### Add Products

Edit the `products` array in `src/App.tsx`:

```typescript
const products: Product[] = [
  {
    id: '1',
    name: 'Your Coffee Name',
    description: 'Description here',
    price: 24.99,
    weight: '250g',
    category: 'Single Origin',
    image: 'https://your-image-url.com/image.jpg',
    badge: 'Best Seller',
  },
  // Add more products...
]
```

### Modify Typography

Update font families in `tailwind.config.js`:

```javascript
fontFamily: {
  display: ['Your Display Font', 'serif'],
  sans: ['Your Body Font', 'sans-serif'],
}
```

Then update the Google Fonts link in `index.html`.

## Design Principles Used

### 60-30-10 Color Rule

- **60%** - Neutral colors (greys, whites)
- **30%** - Supporting colors (lighter coffee tones)
- **10%** - Primary accent (coffee brown for CTAs)

### Shadow Layering

- **Soft** - Subtle depth for nav and cards
- **Medium** - Standard elevation
- **Large** - Hover states and emphasis
- **XL** - Dramatic depth for modals

### Animation Timing

- **Instant** (100ms) - Micro-interactions
- **Fast** (200ms) - Hover states
- **Normal** (300-400ms) - Most transitions
- **Slow** (500-700ms) - Hero animations

## Performance Tips

1. **Images** - Optimize and use WebP format
2. **Lazy Loading** - Images load on scroll
3. **Code Splitting** - Vite handles automatically
4. **Animations** - GPU-accelerated (transform & opacity only)

## Accessibility

- ✅ 4.5:1 minimum contrast ratio
- ✅ Keyboard navigation support
- ✅ Semantic HTML structure
- ✅ ARIA labels where needed
- ✅ Reduced motion support

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Deployment

### Vercel

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

Update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
})
```

Then build and deploy the `dist` folder.

## Technologies

### Frontend
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide React](https://lucide.dev/) - Icons

### Payments
- [Stripe](https://stripe.com/) - Payment processing
- [Stripe.js](https://stripe.com/docs/js) - Client-side SDK
- [Stripe React](https://stripe.com/docs/stripe-js/react) - React components
- [Express](https://expressjs.com/) - Backend API server

### Testing
- [Playwright](https://playwright.dev/) - End-to-end testing

## Stripe Payment Integration

### Features
- ✅ Secure payment processing with Stripe
- ✅ Beautiful checkout modal with Stripe Elements
- ✅ Test mode with test card support
- ✅ Payment intent creation API
- ✅ Webhook support for payment events
- ✅ Loading states and error handling
- ✅ Mobile-responsive payment form

### Quick Payment Test

**Prerequisites:**
- Both servers running (`npm run dev:all`)
- `.env` file configured with Stripe keys

**Steps:**
1. Open http://localhost:5174
2. Browse products and click **"Buy Now"**
3. Enter test card: `4242 4242 4242 4242`
4. Fill in: Expiry `12/34`, CVC `123`, ZIP `12345`
5. Click **"Pay"** button
6. ✅ See success message!

**Verify Payment:**
- Check [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
- Your test payment will appear in the list

**Test Different Scenarios:**
```bash
# Successful payment
Card: 4242 4242 4242 4242

# Declined
Card: 4000 0000 0000 0002

# Insufficient funds
Card: 4000 0000 0000 9995

# 3D Secure
Card: 4000 0025 0000 3155
```

### Documentation
- **Complete Setup Guide:** See `STRIPE_SETUP.md` in this directory
- **Integration Summary:** See `../STRIPE_INTEGRATION_SUMMARY.md`
- **Key Management:** See `../GET_STRIPE_KEY.md`

### Troubleshooting

**"Stripe publishable key is not set"**
- Ensure `.env` file exists in this directory
- Check for `VITE_` prefix on the key
- Restart dev server: `npm run dev`

**Payment form not loading**
- Verify backend server is running: `npm run server`
- Check console for errors
- Ensure correct publishable key (starts with `pk_test_`)

**API errors (404)**
- Verify Vite proxy configured in `vite.config.ts`
- Ensure backend on port 3001

For more help, see `STRIPE_SETUP.md`.

## License

Free to use for personal and commercial projects.

---

**Built with the Premium Coffee Website Skill**

Enjoy your premium coffee website! ☕
