# 🚀 Launch Audit — Stockbridge Coffee Website

**Audit Date:** 2026-03-07  
**Auditor:** Scotty (automated subagent)

---

## ✅ What Was Fixed

### Website Polish
| Issue | Fix Applied |
|-------|-------------|
| `public/robots.txt` referenced `.com` domain | Changed to `stockbridgecoffee.co.uk` |
| `public/sitemap.xml` referenced `.com` domain and had only 1 URL | Rebuilt with `.co.uk` + all 5 key pages |
| `CartDrawer.tsx` had debug `console.log('Cart checkout successful!')` | Replaced with a comment |
| `Checkout.tsx` showed "Test Mode" + test card hint to end users | Removed the test mode block entirely |
| `CoffeeCopilot.tsx` had `id: 'user-123' // TODO: Replace...` | Replaced with `'guest'` (correct fallback) |
| `server/index.ts` logged `$` instead of `£` for payment amounts | Fixed to use `£` |

### Stripe Safety
| Issue | Fix Applied |
|-------|-------------|
| No maximum payment cap existed | Added `MAX_AMOUNT_PENCE = 50000` (£500) guardrail in `create-payment-intent` endpoint |

---

## ✅ Already Correct — No Changes Needed

### Stripe Readiness
- **Double-conversion bug** — `src/lib/stripe.ts` is correct. Callers pass pence, the function does NOT multiply by 100 again. Comment confirms this was fixed 2026-03-06. ✅
- **Webhook rejects if secret unset** — `server/index.ts` returns HTTP 400 with "Webhook secret not configured" if `STRIPE_WEBHOOK_SECRET` is missing. ✅
- **OrderConfirmation page** — exists at `src/pages/OrderConfirmation.tsx` and is routed at `/order-confirmation` in `App.tsx`. ✅
- **Currency** — all displayed prices use `£` via `Intl.NumberFormat('en-GB', { currency: 'GBP' })` or manual `£` prefix. ✅

### Domain References
- `index.html` — canonical, og:url, og:image, schema.org all reference `stockbridgecoffee.co.uk`. ✅
- Contact/Footer emails use `@stockbridgecoffee.co.uk`. ✅
- No `.com` references remaining in src files. ✅

### About Page
- Uses "The Stockbridge Fox" mascot story ("If you've wandered Stockbridge at dusk, you've probably spotted one..."). ✅

### SEO & Meta
- All meta tags (title, description, og:*, twitter:*) present and reference `.co.uk`. ✅
- Schema.org `LocalBusiness` + `Organization` markup present with `.co.uk` URLs. ✅
- `robots.txt` exists ✅ (fixed domain)
- `sitemap.xml` exists ✅ (rebuilt)
- No placeholder phone numbers — phone field is intentionally empty in both schema.org and MapSection. ✅

### Accessibility
- All `<img>` tags have `alt` attributes. Hero background image uses `alt=""` (correct for decorative). ✅

### Security / Server
- Rate limiting: 10 req/min for Stripe, 20 for AI, 100 for general. ✅
- CORS: locked to specific origins including `stockbridgecoffee.co.uk`. ✅
- Webhook signature verification with `constructEvent`. ✅

---

## ⚠️ Requires Manual Action Before Launch

### 1. Stripe Live Keys (Critical)
Switch from test to live by updating environment variables only:

**Server (`server/.env`):**
```
STRIPE_SECRET_KEY=sk_live_...        # from Stripe Dashboard → Developers → API keys
STRIPE_WEBHOOK_SECRET=whsec_live_... # register new webhook for production URL
```

**Frontend (`/.env`):**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

No code changes required. The server already logs `TEST` vs `LIVE` mode on startup.

> ⚠️ Register a **new webhook endpoint** in Stripe Dashboard pointing to your live server URL (e.g. `https://api.stockbridgecoffee.co.uk/api/stripe-webhook`), not localhost.

### 2. DNS
- Point `stockbridgecoffee.co.uk` to Firebase Hosting (or Cloud Run if using server mode).
- Verify SSL certificate is provisioned.

### 3. Firebase Production Config
- Switch Firebase project from `coffee-65c46` dev project to production project if applicable.
- Update allowed CORS origins in `server/index.ts` if production domain differs.

### 4. SMTP (Order Confirmation Emails)
Set real SMTP credentials or a transactional email service:
```
SMTP_HOST=smtp.sendgrid.net   # or Mailgun, etc.
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your-sendgrid-api-key>
```
Without this, orders complete but no confirmation emails are sent (logged to `email_failures` Firestore collection).

### 5. OpenAI API Key (Coffee Copilot)
```
OPENAI_API_KEY=sk-...
```
Without this, the Coffee Copilot returns a 503 error gracefully but is non-functional.

### 6. Phone Number
The schema.org `telephone` field and MapSection `phone` are intentionally empty. Add a real phone number before launch if available.

### 7. CoffeeCopilot User ID
The copilot sends `id: 'guest'` for unauthenticated users. If you want usage analytics per-user, wire in the Firebase Auth `currentUser.uid` from `AuthContext`.

---

## 📊 Launch Readiness Summary

| Area | Status |
|------|--------|
| Copy & domain references | ✅ Ready |
| GBP currency | ✅ Ready |
| About / brand story | ✅ Ready |
| SEO meta tags | ✅ Ready |
| robots.txt + sitemap | ✅ Ready |
| Accessibility (alt text) | ✅ Ready |
| Stripe double-conversion bug | ✅ Fixed |
| Stripe webhook security | ✅ Ready |
| Payment cap (£500) | ✅ Added |
| OrderConfirmation page + route | ✅ Ready |
| Debug/test code removed | ✅ Done |
| Stripe live keys | ⚠️ Manual |
| DNS | ⚠️ Manual |
| SMTP email | ⚠️ Manual |
| Phone number | ⚠️ Optional |
