# Browser Testing Scenarios for Coffee Website

This guide outlines test scenarios for manual and automated browser testing of the coffee e-commerce website. Based on existing E2E tests and website features.

---

## Core Smoke Tests

### Homepage
- [ ] Homepage loads successfully with correct title containing "Coffee"
- [ ] Navigation bar/header is visible
- [ ] No critical console errors on load (ignore favicon/404 errors)
- [ ] All main sections render (Hero, Products, About, Location, Newsletter, Footer)

### Navigation
- [ ] All nav links work correctly
- [ ] Mobile hamburger menu opens/closes
- [ ] Smooth scroll to sections works
- [ ] Hash navigation (e.g., `/#location`) scrolls to correct section

---

## Authentication Tests

### Login Modal
- [ ] Login modal opens when clicking sign-in button
- [ ] Email and password fields visible with icons
- [ ] Form validation: required fields, email format
- [ ] Login with valid credentials closes modal
- [ ] Invalid credentials show error in red alert box
- [ ] "Forgot password?" switches to reset mode
- [ ] Modal closes with X button or backdrop click
- [ ] Loading spinner shows during submission

### Sign Up
- [ ] "Sign up" link switches modal to signup mode
- [ ] Full Name field appears in signup mode
- [ ] Password minimum 6 characters enforced
- [ ] Successful signup closes modal
- [ ] "Already have an account?" switches back to login

### Google OAuth
- [ ] "Continue with Google" button visible
- [ ] Button opens Google popup
- [ ] Popup closed by user shows "Sign-in cancelled" message
- [ ] Popup blocked shows appropriate error

### Password Reset
- [ ] Reset mode shows email field only
- [ ] Successful submission shows "Check your email" confirmation
- [ ] Email displays in confirmation message
- [ ] "Back to login" returns to login form

---

## Shopping Cart Tests

### Adding to Cart
- [ ] "Add to Cart" button works on product cards/showcase
- [ ] Cart icon in nav shows item count badge
- [ ] Cart drawer opens (manually or automatically)

### Cart Drawer
- [ ] Cart drawer slides in from right
- [ ] Header shows "Shopping Cart" with bag icon
- [ ] X button closes drawer
- [ ] Backdrop click closes drawer
- [ ] Empty cart shows: "Your cart is empty" message with bag icon

### Cart Items
- [ ] Product image, name, weight displayed
- [ ] Price shown correctly (with "each" for qty > 1)
- [ ] Plus (+) button increases quantity
- [ ] Minus (-) button decreases quantity (min 1)
- [ ] Trash button removes item with animation
- [ ] Quantity displays in center between +/-

### Discount Codes
- [ ] Discount code input visible when no code applied
- [ ] Tag icon in input field
- [ ] "Apply" button applies code
- [ ] Enter key also applies code
- [ ] Valid code: green success message, code clears
- [ ] Invalid code: red error message
- [ ] Applied discount shows green box with code name
- [ ] "Remove" link removes discount
- [ ] Discount amount shown in summary

### Cart Totals
- [ ] Subtotal calculates correctly
- [ ] Discount amount shown (when applied)
- [ ] Total updates with discount
- [ ] Item count shows correctly (e.g., "3 item(s) in cart")

### Checkout Button
- [ ] "Proceed to Checkout" button visible
- [ ] Button disabled/inactive when cart empty
- [ ] "Continue Shopping" closes drawer

---

## Checkout Tests

### Checkout Modal
- [ ] Opens from cart "Proceed to Checkout"
- [ ] Shows product name or "Cart Checkout (N items)"
- [ ] Loading spinner while payment intent creates
- [ ] X button closes modal
- [ ] Amount displays correctly

### Gift Card Redemption
- [ ] Gift card input section visible
- [ ] Valid code applies and shows balance
- [ ] Balance deducted from total
- [ ] Invalid code shows error

### Stripe Payment Form
- [ ] Stripe Elements loads (card number, expiry, CVC)
- [ ] Test card `4242 4242 4242 4242` processes
- [ ] Declined card `4000 0000 0000 0002` shows error
- [ ] 3D Secure card `4000 0027 6000 3184` triggers auth
- [ ] Success clears cart and closes modals
- [ ] Error messages display clearly

---

## Newsletter Subscription

### Subscribe Form
- [ ] Newsletter section visible with heading "Stay Brew-tiful"
- [ ] Email input field with placeholder "Enter your email" (Footer uses "Your email")
- [ ] Subscribe button visible
- [ ] Email field has `aria-label="Email address"`

### Subscription Flow
- [ ] Button shows "Subscribing..." during load
- [ ] Successful: button shows "✓ Subscribed!"
- [ ] Already subscribed: shows "✓ Already Subscribed!"
- [ ] Success message: "Welcome! Check your inbox..."
- [ ] Already subscribed message: "You're already on our list!"
- [ ] Error shows red message box
- [ ] Form resets after 3 seconds on success

---

## Product Display Tests

### Product Showcase
- [ ] Featured product section visible
- [ ] Product image loads
- [ ] Product name, description visible
- [ ] Price displayed in correct currency (£)
- [ ] Customization options work (grind type, weight)
- [ ] Price updates with options
- [ ] "Add to Cart" works

### Product Grid/Cards
- [ ] Products display in grid
- [ ] Product cards show: image, name, price
- [ ] Hover effects on desktop
- [ ] Cards are clickable/interactive

---

## Coffee Copilot (AI Chat Widget)

### Chat Widget
- [ ] Chat button visible (bottom corner)
- [ ] Click opens chat panel
- [ ] Initial message: "Hey! I'm your Coffee Copilot..."
- [ ] Message input field at bottom
- [ ] Send button works
- [ ] Messages display with correct alignment (user right, assistant left)
- [ ] Timestamps on messages
- [ ] Auto-scroll to newest message

### Bug Report Mode
- [ ] Bug report toggle exists
- [ ] Screenshot upload accepts images
- [ ] Preview shows uploaded image
- [ ] Remove screenshot button works

---

## Location/Map Section

### Map Display
- [ ] Section has `aria-label` containing "Coffee shop location"
- [ ] Section has `id="location"`
- [ ] Heading: "Find Our Coffee Shop"
- [ ] Google Maps loads with correct location
- [ ] Map container has `role="application"`

### Business Info Cards
- [ ] Address card: heading "Address", text includes "Top 8, EH4 2DP, Edinburgh, UK"
- [ ] Hours card: heading "Opening Hours", text includes "Mon-Sat: 7:30 AM - 6:00 PM"
- [ ] Phone card: heading "Phone", text includes "+44 131"
- [ ] Phone link has `tel:` href
- [ ] "Get Directions" link opens Google Maps

### Responsive Map
- [ ] Mobile (375px): map height > 250px
- [ ] Desktop (1920px): map height > 450px
- [ ] Info cards stack on mobile, side-by-side on desktop

### Map Error Handling
- [ ] If API blocked: "Map Unavailable" heading or graceful fallback

---

## Dark Mode Tests

> **Note**: Dark mode toggle is NOT currently visible in the navigation. The `ThemeToggle` component exists but is not rendered. Skip these tests until the feature is enabled.

### Theme Toggle (SKIP - not implemented in UI)
- [ ] Toggle button in nav with `aria-label` containing "switch to dark/light mode"
- [ ] Click toggles between modes
- [ ] `html` element gets/loses `dark` class
- [ ] Icon changes between sun/moon

### Persistence (SKIP - not implemented in UI)
- [ ] Theme persists after page reload
- [ ] `localStorage.theme` updated on toggle

### Dark Mode Styling (SKIP - not implemented in UI)
- [ ] Body background dark (RGB avg < 100)
- [ ] Text readable on dark backgrounds
- [ ] Location section styled for dark mode
- [ ] Smooth transition between themes (CSS transition on body)

---

## Responsive Design Tests

### Mobile (375px x 667px)
- [ ] Mobile nav menu works
- [ ] No horizontal scroll
- [ ] Touch targets large enough (44x44px min)
- [ ] Forms usable

### Tablet (768px x 1024px)
- [ ] Layout adapts appropriately
- [ ] Nav behavior correct

### Desktop (1920px x 1080px)
- [ ] Full nav visible
- [ ] Grid layouts correct
- [ ] Hover effects work

---

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] Escape closes modals
- [ ] Enter activates buttons

### ARIA & Semantics
- [ ] Images have alt text
- [ ] Buttons have aria-labels
- [ ] Form fields have labels
- [ ] Headings hierarchical (h1, h2, h3)
- [ ] Sections have proper landmark roles

---

## Test Data Reference

### Test User Login

**Shared test account:**
- **Email**: `test@example.com`
- **Password**: `Test123!`

**If you get `auth/invalid-credential` error:**
The test account doesn't exist yet. Create it once via Sign Up:
1. Click "Login" → "Sign up" link
2. Name: `Test User`, Email: `test@example.com`, Password: `Test123!`
3. Click "Create Account"

After that, everyone can log in with those credentials.

### Stripe Test Cards
| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0027 6000 3184` | 3D Secure |

### Test Card Details
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

---

## Running Existing E2E Tests

```bash
# Run all e2e tests
cd coffee-website-react && npx playwright test

# Run specific test file
npx playwright test e2e/smoke.spec.ts
npx playwright test e2e/dark-mode.spec.ts
npx playwright test e2e/google-maps.spec.ts

# Run in headed mode (visible browser)
npx playwright test --headed

# Run with UI mode for debugging
npx playwright test --ui

# Run single test by name
npx playwright test -g "homepage loads successfully"
```

## Existing Test Coverage

| File | Coverage |
|------|----------|
| `e2e/smoke.spec.ts` | Homepage load, navigation, console errors |
| `e2e/dark-mode.spec.ts` | Theme toggle, persistence, styling |
| `e2e/google-maps.spec.ts` | Map section, business info, responsive, accessibility |
