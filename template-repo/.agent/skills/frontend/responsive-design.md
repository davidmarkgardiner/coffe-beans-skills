# Skill: Responsive Design Best Practices

## Purpose
To ensure the application looks and functions perfectly across all device sizes.

## Guidelines

### Mobile-First Approach
*   Start by designing for mobile screens (< 640px).
*   Use Tailwind's default breakpoints (sm, md, lg, xl, 2xl) to override styles for larger screens.
*   Example: `class="w-full md:w-1/2 lg:w-1/3"`

### Flexible Layouts
*   Use Flexbox and Grid for layouts. Avoid fixed widths in pixels.
*   Use relative units (`rem`, `%`, `vw`, `vh`) instead of `px`.

### Images and Media
*   Use `next/image` for automatic optimization.
*   Ensure images have `max-width: 100%` and `height: auto`.

### Touch Targets
*   Ensure buttons and interactive elements are at least 44x44px on mobile.
*   Add sufficient spacing between clickable elements.

### Testing
*   Test on real devices whenever possible.
*   Use Chrome DevTools Device Mode to simulate various screen sizes.
