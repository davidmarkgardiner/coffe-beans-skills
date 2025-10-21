# Logo Assets

This directory contains the Logo component template for implementing company logos on websites.

## Files

### Logo.tsx
React/TypeScript component template with three exports:

1. **`<Logo />`** - Main component with variant switching
2. **`<LogoPicture />`** - Optimized version using `<picture>` element for WebP support
3. **`<LogoOverlay />`** - Specialized component for overlaying logos on images

## Usage

Copy `Logo.tsx` into your project's components directory and customize as needed:

```bash
cp assets/Logo.tsx src/components/
```

## Expected Directory Structure

The component expects logo files to be organized in your public directory:

```
public/
  images/
    logo-stockbridge-teal.png      # Blue-teal variant (default/light backgrounds)
    logo-stockbridge-golden.png    # Golden variant (premium/warm contexts)
    logo-stockbridge-grey.png      # Grey variant (dark/subtle backgrounds)
    logo-stockbridge-teal.webp     # WebP versions for optimization
    logo-stockbridge-golden.webp
    logo-stockbridge-grey.webp
```

## Customization

To adapt this template for different branding:

1. Update the `variantMap` in `getLogoSrc()` with your logo file paths
2. Modify the `variant` type to match your color schemes
3. Adjust the component props and styling as needed
4. Update the JSDoc comments to reflect your brand name

## Seasonal Variations

To add seasonal logo variants (e.g., Christmas, Halloween):

1. Add new variant types: `variant?: 'teal' | 'golden' | 'grey' | 'christmas' | 'halloween'`
2. Add corresponding files to the public directory
3. Update the `variantMap` with the new paths
4. Consider adding time-based auto-switching logic
