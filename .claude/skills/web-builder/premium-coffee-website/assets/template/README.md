# Premium Coffee Website Template

This is a starter template for building premium coffee websites with a sophisticated grey/white aesthetic.

## Features

- **Premium Design**: Grey/white color palette with subtle gradients and shadows
- **Smooth Animations**: Scroll-triggered animations using AOS library
- **Glassmorphism Effects**: Modern transparent card designs with blur
- **Parallax Scrolling**: Depth effect on hero section
- **Responsive Design**: Mobile-first approach with breakpoints for all devices
- **Performance Optimized**: Lazy loading images, CSS animations, minimal JavaScript
- **Accessibility**: Keyboard navigation, ARIA labels, proper contrast ratios

## File Structure

```
template/
├── index.html      # Main HTML structure
├── styles.css      # Premium styles and effects
├── script.js       # Interactive functionality
└── README.md       # This file
```

## Getting Started

1. Copy all files to your project directory
2. Open `index.html` in a web browser
3. Customize the content, colors, and layout as needed

## Customization

### Colors

All colors are defined as CSS variables in `styles.css`:

```css
:root {
  --white: #FFFFFF;
  --light-grey: #F5F5F5;
  --coffee-brown: #6B4423;
  /* ... more colors */
}
```

### Typography

The template uses:
- **Playfair Display** for headings (serif)
- **Inter** for body text (sans-serif)

Both are loaded from Google Fonts.

### Spacing

Consistent spacing system using CSS variables:

```css
--spacing-xl: 120px;  /* Hero sections */
--spacing-lg: 100px;  /* Main sections */
--spacing-md: 80px;   /* Sub-sections */
--spacing-sm: 60px;   /* Minor sections */
```

## Libraries Used

- **AOS (Animate On Scroll)**: v2.3.1 - For scroll animations
- **Google Fonts**: Inter, Playfair Display

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. Optimize images before uploading (use WebP format)
2. Lazy load images below the fold
3. Minify CSS and JavaScript for production
4. Use a CDN for assets
5. Enable browser caching

## Accessibility

This template includes:
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Proper contrast ratios (4.5:1 minimum)
- Alt text placeholders for images
- Focus indicators

## Next Steps

1. Replace placeholder images with actual product photos
2. Add real product data and pricing
3. Implement shopping cart backend
4. Add payment integration
5. Set up analytics tracking

## License

Free to use for personal and commercial projects.
