# Visual Improvements - Deferred

This document tracks visual/UI improvements that were developed but deferred to preserve the current production appearance.

## Branch Information

- **Current branch**: `feature/non-visual-improvements-v2` - Contains only non-visual improvements
- **Original work branch**: `update/refactor` - Had uncommitted visual changes (now in git history via stash)

## How to Recover Visual Changes

The visual changes were stored in a git stash. To recover them:

```bash
# Check if stash exists
git stash list

# If not, recover from dangling commit
git fsck --lost-found | grep commit
# Look for commit: 186b510e2ab0b6ca4bf1e0b2a401b42f4817002f
git stash store -m "visual improvements" 186b510e2ab0b6ca4bf1e0b2a401b42f4817002f

# Apply stash to see changes
git stash show -p
```

---

## Deferred Visual Changes

### 1. Navigation Component (`src/components/Navigation.tsx`)
- Logo/branding styling changes
- Navigation layout updates

### 2. Product Card (`src/components/ProductCard.tsx`)
- Card styling improvements
- Visual presentation changes

### 3. Hero Section (`src/components/Hero.tsx`)
- Hero visual styling
- Layout changes

### 4. Blog Highlights (`src/components/BlogHighlights.tsx`)
- Blog section styling

### 5. Cart Drawer (`src/components/CartDrawer.tsx`)
- Cart UI styling updates

### 6. Coffee Copilot (`src/components/CoffeeCopilot.tsx`)
- AI assistant widget styling

### 7. Product Showcase (`src/components/ProductShowcase.tsx`)
- Product display styling

### 8. Blog Post Page (`src/pages/BlogPost.tsx`)
- Blog detail page styling

### 9. New Logo Variants (NOT committed)
Files that were in working directory but not committed:
- `public/images/stockbridge-logo-edinburgh.png`
- `public/images/stockbridge-logo-enhanced-green.png`
- `public/images/stockbridge-logo-enhanced.png`
- `public/images/stockbridge-logo-fox.png`
- `public/images/stockbridge-logo-large-text.png`
- `public/images/stockbridge-logo-new.png`
- `public/images/stockbridge-logo-rect-tight.png`
- `public/images/stockbridge-logo-square-tight.png`

---

## Deferred Mixed Changes (Validation + Styling)

These files had both functional validation improvements AND visual styling changes:

### 1. Login Modal (`src/components/LoginModal.tsx`)
**Kept**: None (restored to main)
**Deferred**:
- Zod validation schemas for email/password
- Password strength indicator UI
- Field-level error styling (red borders)
- `onBlur` validation handlers

### 2. Checkout (`src/components/Checkout.tsx`)
**Kept**: None (restored to main)
**Deferred**:
- Gift card redemption logic with Firebase
- Free order handling (fully covered by gift card)
- Button text changes ("Done" → "Complete Order")

### 3. Checkout Form (`src/components/CheckoutForm.tsx`)
**Kept**: None (restored to main)
**Deferred**:
- Enhanced error handling with `PaymentError` interface
- Error code mapping to user-friendly messages
- Retry functionality
- Order lookup for failed payments
- Error recovery UI

### 4. Gift Card Purchase (`src/components/GiftCardPurchase.tsx`)
**Kept**: None (restored to main)
**Deferred**:
- Zod validation for gift card form
- `onBlur` field validation
- Error styling

### 5. Newsletter (`src/components/Newsletter.tsx`)
**Kept**: None (restored to main)
**Deferred**:
- Zod email validation
- Error display styling

### 6. App.tsx (`src/App.tsx`)
**Kept**: None (restored to main)
**Deferred**:
- Lazy loading with `React.lazy()`
- `Suspense` boundaries
- `PageLoadingFallback` component
- Routes for `/account` and `/wishlist`

---

## Deferred New Features

These new files were created but not included:

### Wishlist Feature
- `src/components/WishlistButton.tsx`
- `src/contexts/WishlistContext.tsx`
- `src/pages/Wishlist.tsx`

### Account Dashboard
- `src/pages/AccountDashboard.tsx`

### Reviews System
- `src/components/ReviewForm.tsx`
- `src/components/ReviewList.tsx`
- `src/components/StarRating.tsx`

### Order Tracking
- `src/components/OrderTimeline.tsx`

### Validation Utilities
- `src/utils/validation.ts` (created but not used since UI components restored)

---

## What WAS Included (Non-Visual)

The `feature/non-visual-improvements-v2` branch includes:

### Backend
- `server/index.ts` - Email service, rate limiting

### Build Config
- `vite.config.ts` - Vendor chunk splitting (improves load time)

### Data Layer
- `src/config/firebase.ts` - Firebase configuration
- `src/contexts/AuthContext.tsx` - Auth improvements
- `src/hooks/useFirestore.ts` - Firestore hooks
- `src/hooks/useContentRotation.ts` - Content rotation hook
- `src/services/contentService.ts` - Content service

### Documentation
- PRD files
- Testing documentation

---

## Re-adding Visual Changes Later

To add visual changes in the future:

1. Create a new branch from `feature/non-visual-improvements-v2`
2. Recover stash or manually apply changes from this document
3. Test each component individually
4. Ensure color scheme matches brand guidelines

```bash
git checkout feature/non-visual-improvements-v2
git checkout -b feature/visual-updates
# Then selectively add visual changes
```
