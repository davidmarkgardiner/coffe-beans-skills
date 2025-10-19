# Premium Coffee Website

A sophisticated, high-end coffee website featuring a premium grey/white aesthetic with modern design patterns, smooth animations, and glassmorphism effects.

## Features

### Design
- **Premium Aesthetic**: Sophisticated grey/white color palette with Coffee Brown (#6B4423) accents
- **Smooth Animations**: Fluid transitions using AOS (Animate On Scroll) library
- **Glassmorphism Effects**: Modern backdrop-blur effects on navigation and cards
- **Parallax Scrolling**: Subtle parallax effect on hero section
- **Responsive Design**: Mobile-first approach with breakpoints for all devices

### Functionality
- **Shopping Cart**: Fully functional cart with localStorage persistence
- **Product Showcase**: Beautiful product grid with hover effects and image zoom
- **Contact Form**: Styled contact form with validation
- **Newsletter Signup**: Footer newsletter subscription form
- **Smooth Navigation**: Scroll-to-section navigation with offset for fixed header

### Components
- Fixed navigation bar with scroll effects
- Full-height hero section with parallax background
- Product cards with overlay and "Add to Cart" buttons
- About section with image and feature highlights
- Contact form with premium input styling
- Comprehensive footer with multiple columns

## Quick Start

### Option 1: Direct Browser Opening
Simply open `index.html` in your web browser. No server required!

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

### Option 2: Local Server (Recommended)
For the best experience, use a local server:

#### Using Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```

#### Using PHP
```bash
php -S localhost:8000
```

Then open your browser to `http://localhost:8000`

### Option 3: VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Project Structure

```
coffee-website/
├── index.html          # Main HTML structure
├── styles.css          # All styles and design system
├── script.js           # Interactive functionality
├── README.md           # This file
└── assets/
    └── images/         # Place your images here
```

## Customization Guide

### Colors
All colors are defined as CSS variables in `styles.css`. To customize:

```css
:root {
    /* Update these values in styles.css */
    --color-coffee-brown: #6B4423;      /* Primary accent color */
    --color-light-grey: #F5F5F5;        /* Background sections */
    --color-white: #FFFFFF;             /* Main background */
    /* ... more colors ... */
}
```

### Typography
The site uses two Google Fonts:
- **Playfair Display** (serif) - For headings and elegant touches
- **Inter** (sans-serif) - For body text and UI elements

To change fonts, update the Google Fonts link in `index.html` and the CSS variables in `styles.css`:

```css
:root {
    --font-serif: 'Your Serif Font', serif;
    --font-sans: 'Your Sans Font', sans-serif;
}
```

### Adding Products
To add a new product, copy an existing product card in `index.html` and update:

```html
<div class="product-card" data-aos="fade-up" data-aos-delay="100">
    <div class="product-image">
        <img src="YOUR_IMAGE_URL" alt="Product Name">
        <span class="product-badge">Badge Text</span>
        <div class="product-overlay">
            <button class="btn btn-white" onclick="addToCart('Product Name', 24.99)">
                Add to Cart
            </button>
        </div>
    </div>
    <div class="product-info">
        <span class="product-category">Category</span>
        <h3 class="product-name">Product Name</h3>
        <p class="product-description">Description here...</p>
        <div class="product-footer">
            <span class="product-price">$24.99</span>
            <span class="product-weight">250g</span>
        </div>
    </div>
</div>
```

### Images
The template currently uses Unsplash images via URLs. For production:

1. Download or use your own images
2. Place them in `assets/images/`
3. Update image paths in `index.html`
4. Optimize images for web (recommended: WebP format)

**Recommended image sizes:**
- Hero background: 1920×1080px
- Product images: 800×800px
- About section: 800×1000px

### Spacing and Layout
Adjust spacing using CSS variables:

```css
:root {
    --spacing-xl: 120px;    /* Extra large sections */
    --spacing-lg: 100px;    /* Large sections */
    --spacing-md: 80px;     /* Medium sections */
    --spacing-sm: 60px;     /* Small sections */
}
```

## Browser Compatibility

Tested and supported on the latest versions of:
- Chrome
- Firefox
- Safari
- Edge

**Note:** Some effects like `backdrop-filter` (glassmorphism) may not work on older browsers but will gracefully degrade.

## Performance Tips

1. **Optimize Images**: Use WebP format and compress images
2. **Lazy Loading**: Images are lazy-loaded using Intersection Observer
3. **Minimize HTTP Requests**: Consider bundling CSS/JS for production
4. **Enable Caching**: Configure server caching for static assets
5. **CDN**: Host images on a CDN for faster loading

## Accessibility

The site follows accessibility best practices:
- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3)
- Alt text for images
- Keyboard navigation support
- ARIA labels where appropriate
- Minimum 4.5:1 contrast ratio for text

## Integration Guide

### Payment Gateway
To integrate payments (e.g., Stripe), modify the `checkout()` function in `script.js`:

```javascript
function checkout() {
    // Example Stripe integration
    stripe.redirectToCheckout({
        lineItems: cart.map(item => ({
            price: item.priceId,
            quantity: item.quantity
        })),
        mode: 'payment',
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/cancel',
    });
}
```

### Backend API
To connect to a backend, update form handlers:

```javascript
async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData
    });

    // Handle response...
}
```

### Analytics
Add Google Analytics or similar:

```html
<!-- Add before closing </head> tag in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## SEO Optimization

Current meta tags are basic. For better SEO, add:

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://yoursite.com/">
<meta property="og:title" content="Premium Coffee - Artisan Roasted Beans">
<meta property="og:description" content="Your description here">
<meta property="og:image" content="https://yoursite.com/preview.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://yoursite.com/">
<meta property="twitter:title" content="Premium Coffee - Artisan Roasted Beans">
<meta property="twitter:description" content="Your description here">
<meta property="twitter:image" content="https://yoursite.com/preview.jpg">
```

## Deployment

### Netlify
1. Create account on [Netlify](https://netlify.com)
2. Drag and drop the `coffee-website` folder
3. Your site is live!

### GitHub Pages
1. Create a GitHub repository
2. Push your files
3. Enable GitHub Pages in repository settings
4. Access at `https://username.github.io/repository-name`

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

## Troubleshooting

**Problem**: Animations not working
- **Solution**: Ensure AOS library is loaded from CDN (check console for errors)

**Problem**: Images not loading
- **Solution**: Check image paths and ensure files exist in correct location

**Problem**: Cart not persisting
- **Solution**: Check browser's localStorage is enabled (works in incognito/private mode but doesn't persist)

**Problem**: Parallax effect laggy on mobile
- **Solution**: Parallax is intentionally disabled on small screens for performance

## Credits

- **Fonts**: [Google Fonts](https://fonts.google.com) - Playfair Display & Inter
- **Animations**: [AOS Library](https://michalsnik.github.io/aos/) by Michał Sajnóg
- **Images**: [Unsplash](https://unsplash.com) (demo images)

## License

This template is free to use for personal and commercial projects. Attribution appreciated but not required.

## Support

For questions or issues with this template:
1. Check this README
2. Review the code comments
3. Test in different browsers
4. Check browser console for errors

---

**Built with the Premium Coffee Website Skill**

Enjoy building your premium coffee website!
