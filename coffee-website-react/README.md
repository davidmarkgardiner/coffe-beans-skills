# Premium Coffee Website - React + TypeScript

A sophisticated, high-end coffee e-commerce website built with **React**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

## Features

- ⚛️ React 18 with TypeScript for type safety
- 🎨 Tailwind CSS with custom coffee color palette
- 🎬 Smooth animations with Framer Motion
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🛒 Shopping cart functionality
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

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
coffee-website-react/
├── src/
│   ├── components/
│   │   ├── Navigation.tsx     # Fixed nav with scroll effects
│   │   ├── Hero.tsx           # Full-height parallax hero
│   │   ├── ProductCard.tsx    # Product card with hover effects
│   │   ├── ProductGrid.tsx    # Staggered product grid
│   │   └── Footer.tsx         # Footer with newsletter
│   ├── hooks/
│   │   └── useCart.ts         # Shopping cart logic
│   ├── types/
│   │   └── product.ts         # TypeScript types
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # App entry point
│   └── index.css              # Tailwind imports
├── tailwind.config.js         # Tailwind configuration
├── index.html                 # HTML template with fonts
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

- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide React](https://lucide.dev/) - Icons

## License

Free to use for personal and commercial projects.

---

**Built with the Premium Coffee Website Skill**

Enjoy your premium coffee website! ☕
