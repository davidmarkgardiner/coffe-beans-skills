# Stripe Payment Safety Audit

**Date:** 2026-03-06
**Auditor:** Scotty (subagent)
**Site:** https://stockbridgecoffee.co.uk/
**Status:** 🔴 **CRITICAL BUG FOUND AND FIXED**

## Summary

A **double-conversion bug** was confirmed in the payment flow. Customers would be charged **100× the correct amount** (e.g., £850 instead of £8.50).

## Payment Flow Trace

| Step | File | Value | Unit |
|------|------|-------|------|
| 1. Product price defined | `ProductShowcase.tsx`, Firestore | `8.50` | **pounds** |
| 2. Cart total calculated | `useCart.ts:74` | `sum + item.price * item.quantity` | **pounds** |
| 3. Passed to Checkout | `CartDrawer.tsx:334` | `Math.round(total * 100)` → `850` | **pence** ✅ |
| 4. Checkout displays | `Checkout.tsx:105` | `(amount / 100).toFixed(2)` → `"8.50"` | **pounds** ✅ |
| 5. Sent to createPaymentIntent | `Checkout.tsx:36` | `finalAmount` = `850` | **pence** |
| 6. **BUG** stripe.ts sent to API | `stripe.ts:28` | `Math.round(amount * 100)` → `85000` | ❌ **100× too much** |
| 7. Server passes through | `server.ts:657` | `Math.round(amount)` → `85000` | pence (wrong value) |

## Bug Details

- **Location:** `src/lib/stripe.ts`, line 28
- **Code:** `amount: Math.round(amount * 100)` with comment "Convert to cents"
- **Problem:** The caller (`CartDrawer.tsx`) already converts pounds → pence via `Math.round(total * 100)`. The `createPaymentIntent` function then multiplied by 100 again.
- **Impact:** Customers charged 100× the correct amount
- **Severity:** CRITICAL

## Fix Applied

**File:** `src/lib/stripe.ts`

Changed `Math.round(amount * 100)` to `Math.round(amount)` with clear documentation that the amount is already in pence.

## Additional Checks

### Hardcoded test prices
- `ProductShowcase.tsx:250-251`: Hardcoded prices (`8.50`, `28.00`) used as defaults — acceptable for the showcase component
- `useCart.ts:7-10`: Hardcoded discount codes (`WELCOME10`, `SAVE5`, `COFFEE20`) — should be moved to backend for production

### Currency
- ✅ `createPaymentIntent` defaults to `'gbp'`
- ✅ `Checkout.tsx` explicitly passes `'gbp'`
- ✅ Server defaults to `'gbp'` (line 649)

### Webhook signature verification
- ✅ `server.ts:698`: Uses `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`
- ⚠️ `server.ts:691-693`: If `STRIPE_WEBHOOK_SECRET` is not set, webhook processes **without** signature verification (logs a warning). This should be hardened — reject webhooks if secret is missing in production.

### Server-side validation
- ✅ Amount validated as positive integer (`server.ts:652-653`)
- ⚠️ No maximum amount validation — consider adding a ceiling (e.g., £500) as a safety net

## Recommendations

1. ✅ **DONE** — Fixed double-conversion bug
2. ⚠️ Reject webhooks when `STRIPE_WEBHOOK_SECRET` is unset (don't just warn)
3. ⚠️ Add server-side maximum amount validation as a safety net
4. ⚠️ Move discount codes to backend/Firestore
5. ℹ️ Consider adding an integration test that verifies the amount sent to Stripe matches expected pence value
