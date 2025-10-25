---
name: stripe-integration
description: Integrate Stripe payment processing into coffee beans e-commerce applications. Use this skill when implementing payment workflows, setting up Stripe API endpoints, handling webhooks, or configuring payment forms for one-time purchases. Supports automated testing with test cards and easy transition to production.
---

# Stripe Integration for Coffee Beans Store

## Overview

This skill enables secure payment processing for coffee beans e-commerce using Stripe. It provides scripts for generating boilerplate code, comprehensive API reference documentation, and ready-to-use payment form components. The skill supports the complete payment lifecycle from test environment setup to production deployment.

## When to Use This Skill

Invoke this skill when:
- Setting up Stripe payment processing for the first time
- Creating payment intent endpoints or checkout flows
- Implementing webhook handlers for payment events
- Configuring test environment with Stripe test cards
- Transitioning from test mode to live production payments
- Building or customizing payment forms with Stripe Elements
- Troubleshooting Stripe API integration issues

## Quick Start Workflow

### 1. Initial Environment Setup

Start by setting up environment variables for Stripe API keys:

**CRITICAL: Environment Variable Location**
- For **Vite/React** apps: `.env` must be in the project root (e.g., `coffee-website-react/.env`)
- For **Next.js** apps: `.env.local` in the project root
- Frontend keys need the framework prefix: `VITE_STRIPE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Backend keys (secret key) should be in the parent `.env` or loaded separately

**Get Your Keys from Stripe:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Switch to **Test Mode** (toggle in top right)
3. Copy both keys:
   - **Secret Key**: `sk_test_...` (for backend only)
   - **Publishable Key**: `pk_test_...` (for frontend - safe to expose)

**Setup `.env` file:**
```env
# Backend (server-side)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# Frontend (Vite/React)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# Frontend (Next.js)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
```

**⚠️ Common Mistake:** Don't confuse the keys! Secret key (`sk_test_`) and Publishable key (`pk_test_`) are different. Mixing them up will cause "export not found" errors.

### 2. Install Required Dependencies

```bash
# All Stripe dependencies
npm install stripe @stripe/stripe-js @stripe/react-stripe-js

# For Vite/React backend API
npm install express cors dotenv
npm install --save-dev @types/express @types/cors

# For automated testing (optional)
# Playwright is recommended for end-to-end testing
```

**TypeScript Import Fix:** When using TypeScript, import Stripe types correctly to avoid module errors:

```typescript
// ✅ Correct way
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe, StripePaymentElementOptions } from '@stripe/stripe-js';

// ❌ Wrong way (causes "export not found" errors)
import { loadStripe, Stripe } from '@stripe/stripe-js';
```

### 3. Create Payment Endpoint

Generate the payment intent creation endpoint:

```bash
# Output boilerplate payment endpoint code
python scripts/setup_stripe.py payment
```

Place the generated code in the appropriate API route:
- **Next.js App Router**: `app/api/create-payment-intent/route.ts`
- **Next.js Pages Router**: `pages/api/create-payment-intent.ts`
- **Express.js**: `routes/payment.js`

The endpoint handles:
- Amount validation
- Payment intent creation with metadata
- Error handling and logging
- Currency conversion (dollars to cents)

### 4. Set Up Webhook Handler

Generate webhook handler to process Stripe events:

```bash
# Output webhook handler code
python scripts/setup_stripe.py webhook
```

Place the generated code in:
- **Next.js App Router**: `app/api/stripe-webhook/route.ts`
- **Next.js Pages Router**: `pages/api/stripe-webhook.ts`
- **Express.js**: `routes/webhook.js`

Configure webhook endpoint in Stripe Dashboard:
1. Navigate to Developers → Webhooks
2. Add endpoint URL (e.g., `https://yourdomain.com/api/stripe-webhook`)
3. Select events to listen for (at minimum: `payment_intent.succeeded`, `payment_intent.payment_failed`)
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` environment variable

### 5. Implement Payment Form

Use the pre-built payment form component from `assets/payment-form.tsx`:

```tsx
import StripePaymentForm from './components/payment-form';

<StripePaymentForm
  amount={24.99}
  productName="Colombian Coffee Beans - 1kg"
  onSuccess={(paymentIntentId) => {
    // Redirect to confirmation page
    router.push(`/order-confirmation?payment=${paymentIntentId}`);
  }}
  onError={(error) => {
    // Show error message
    toast.error(`Payment failed: ${error}`);
  }}
/>
```

Ensure `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` is set in environment variables for client-side access.

## Testing Payments

### Using Test Cards

Stripe provides test card numbers for different scenarios (no real charges):

**Successful Payment**:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits
- ZIP: Any valid code

**Declined Card**:
- Card: `4000 0000 0000 0002`

**Insufficient Funds**:
- Card: `4000 0000 0000 9995`

**3D Secure Authentication Required**:
- Card: `4000 0025 0000 3155`

Full list available in `references/stripe_api.md` under "Testing with Stripe".

### Testing Webhooks Locally

Use Stripe CLI to forward webhook events to localhost:

```bash
# Install Stripe CLI (if not installed)
brew install stripe/stripe-cli/stripe

# Login to Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

### Automated Testing with Playwright

**Recommended:** Use Playwright for end-to-end testing of the complete payment flow. This tests the actual user experience including Stripe Elements loading and interaction.

**Test Script Example:**
```python
#!/usr/bin/env python3
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate and wait for page load
    page.goto('http://localhost:5174')
    page.wait_for_load_state('networkidle')

    # Click Buy Now button
    page.locator('button:has-text("Buy Now")').first.click()
    page.wait_for_timeout(2000)

    # Wait for Stripe iframe to load
    page.wait_for_selector('iframe[name^="__privateStripeFrame"]', timeout=15000)

    # Verify payment button exists
    pay_button = page.locator('button:has-text("Pay")')
    assert pay_button.count() > 0

    # Take screenshots for verification
    page.screenshot(path='/tmp/checkout_test.png')

    browser.close()
```

**Unit Test Example:**
```javascript
// Example test for payment processing
test('processes successful payment', async () => {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({
      amount: 24.99,
      currency: 'usd',
      metadata: { product: 'test-coffee' }
    })
  });

  const { clientSecret } = await response.json();
  expect(clientSecret).toBeDefined();
  expect(clientSecret).toMatch(/^pi_.*_secret_.*/);
});
```

**NPM Test Script:**
Add to `package.json`:
```json
{
  "scripts": {
    "test:stripe": "tsx scripts/test-stripe.ts",
    "test:e2e": "python3 test_stripe_checkout.py"
  }
}
```

## Switching to Production

When ready to accept live payments:

1. **Update Environment Variables**:
   ```
   STRIPE_ENV=live
   STRIPE_SECRET_KEY=${STRIPE_LIVE_SECRET_KEY}
   STRIPE_PUBLIC_KEY=${STRIPE_LIVE_PUBLIC_KEY}
   ```

2. **Update Webhook Endpoint**:
   - Add production webhook URL in Stripe Dashboard
   - Update `STRIPE_WEBHOOK_SECRET` with live webhook secret

3. **Test Small Live Transaction**:
   - Process a real payment with a small amount
   - Verify payment appears in Stripe Dashboard (Live mode)
   - Confirm webhook events are received

4. **Monitor Dashboard**:
   - Check Stripe Dashboard regularly for successful/failed payments
   - Set up email notifications for payment failures
   - Monitor webhook delivery status

## Common Payment Workflows

### Single Coffee Bag Purchase

```javascript
// Create payment intent for single product
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2499, // $24.99 in cents
  currency: 'usd',
  metadata: {
    product_id: 'coffee_colombian_1kg',
    product_name: 'Colombian Coffee Beans',
    quantity: '1'
  }
});
```

### Multiple Items in Cart

```javascript
// Calculate total from cart items
const cartTotal = cartItems.reduce((sum, item) =>
  sum + (item.price * item.quantity), 0
);

const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(cartTotal * 100),
  currency: 'usd',
  metadata: {
    order_id: orderId,
    items_count: cartItems.length.toString(),
    cart_items: JSON.stringify(cartItems.map(i => i.id))
  }
});
```

### Processing Refunds

```javascript
// Refund a payment
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  reason: 'requested_by_customer', // or 'duplicate', 'fraudulent'
  metadata: {
    refund_reason: 'Customer changed mind',
    order_id: orderId
  }
});
```

## Error Handling

### Payment Intent Creation Errors

Common errors when creating payment intents:

```javascript
try {
  const paymentIntent = await stripe.paymentIntents.create({...});
} catch (error) {
  if (error.type === 'StripeInvalidRequestError') {
    // Invalid parameters (amount, currency, etc.)
    console.error('Invalid request:', error.message);
  } else if (error.type === 'StripeAuthenticationError') {
    // Invalid API key
    console.error('Authentication failed:', error.message);
  } else {
    // Network or other error
    console.error('Stripe error:', error.message);
  }
}
```

### Card Payment Errors

Handle card-specific errors on the frontend:

```javascript
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {...});

if (error) {
  switch (error.code) {
    case 'card_declined':
      // Card was declined
      showError('Your card was declined. Please try another card.');
      break;
    case 'insufficient_funds':
      // Insufficient funds
      showError('Insufficient funds. Please try another card.');
      break;
    case 'expired_card':
      // Card expired
      showError('Your card has expired. Please use a different card.');
      break;
    default:
      showError('Payment failed. Please try again.');
  }
}
```

## Best Practices

### 1. Always Use Environment Variables
Never hardcode API keys. Use environment variables for all keys and secrets:
```javascript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

### 2. Store Amounts in Cents
Always work with the smallest currency unit to avoid floating-point errors:
```javascript
const priceInDollars = 24.99;
const amountInCents = Math.round(priceInDollars * 100); // 2499
```

### 3. Use Metadata Extensively
Store order information in payment intent metadata for easy reference:
```javascript
metadata: {
  order_id: 'order_123',
  customer_email: 'customer@example.com',
  product_names: 'Colombian Beans, Ethiopian Beans',
  shipping_address: '123 Main St, City, State'
}
```

### 4. Implement Idempotency
Use idempotency keys to safely retry failed requests:
```javascript
await stripe.paymentIntents.create({
  amount: 2499,
  currency: 'usd'
}, {
  idempotencyKey: `order_${orderId}_${attemptNumber}`
});
```

### 5. Verify Webhook Signatures
Always verify webhook signatures to prevent fraudulent requests:
```javascript
const event = stripe.webhooks.constructEvent(
  requestBody,
  signature,
  webhookSecret
);
// Only process verified events
```

### 6. Handle Webhooks Asynchronously
Respond to webhooks immediately, process asynchronously:
```javascript
// Respond immediately
res.status(200).json({ received: true });

// Process event asynchronously
processWebhookEvent(event).catch(console.error);
```

### 7. Lock API Version
Specify Stripe API version to avoid breaking changes:
```javascript
const stripe = new Stripe(secretKey, {
  apiVersion: '2023-10-16'
});
```

## Resources

### scripts/setup_stripe.py
Executable Python script that generates boilerplate code for:
- Environment variable configuration (`.env` template)
- Payment intent creation endpoint
- Webhook event handler

Usage:
```bash
python scripts/setup_stripe.py env      # Generate .env template
python scripts/setup_stripe.py payment  # Generate payment endpoint
python scripts/setup_stripe.py webhook  # Generate webhook handler
python scripts/setup_stripe.py all      # Generate all files
python scripts/setup_stripe.py --help   # Show help
```

### references/stripe_api.md
Comprehensive API reference documentation including:
- Detailed parameter descriptions for Payment Intents API
- Complete list of webhook events and handling patterns
- All test card numbers for different scenarios
- Error types and handling strategies
- Security best practices
- Currency support and rate limits
- Testing approaches (local webhooks, automated tests)

Load this reference when:
- Need detailed information about specific API parameters
- Troubleshooting error codes
- Implementing complex payment flows
- Setting up webhook event handlers
- Understanding authentication requirements

### assets/payment-form.tsx
Production-ready React payment form component with:
- Stripe Elements integration
- Card input with validation
- Loading states and error handling
- TypeScript types
- Tailwind CSS styling
- Success/error callbacks

Copy and customize this component for:
- Checkout pages
- Product detail pages with "Buy Now" buttons
- Subscription sign-up forms
- Donation or tip forms

## Troubleshooting

### "Stripe publishable key is not set" Error
**Cause:** Environment variable not loaded or in wrong location
**Solutions:**
1. **Vite/React:** Ensure `.env` file is in the project root (e.g., `coffee-website-react/.env`)
2. **Restart dev server:** Vite only loads `.env` on startup - restart required after changes
3. **Check prefix:** Use `VITE_` prefix (not `REACT_APP_` or `NEXT_PUBLIC_`)
4. **Verify value:** Run `echo $VITE_STRIPE_PUBLISHABLE_KEY` in terminal (won't work, only at build time)

```bash
# Kill and restart Vite dev server to pick up new .env
npm run dev
```

### "The requested module does not provide an export named 'Stripe'" Error
**Cause:** TypeScript type imports used as runtime imports
**Solution:** Use `import type` for types:

```typescript
// ✅ Correct
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe, StripePaymentElementOptions, Appearance } from '@stripe/stripe-js';

// ❌ Wrong
import { loadStripe, Stripe } from '@stripe/stripe-js';
```

### Payment Intent Creation Fails
- Verify API key is correct (test vs live)
- Check amount is positive integer (cents)
- Ensure currency code is valid (3-letter ISO)
- Review Stripe Dashboard logs for detailed error

### Stripe iframe not loading / Payment form blank
**Causes:**
1. **Wrong key type:** Using secret key (`sk_test_`) instead of publishable key (`pk_test_`)
2. **Missing environment variable:** Publishable key not set or not loaded
3. **CORS issues:** Backend not allowing requests from frontend origin

**Solutions:**
1. Verify correct publishable key in `.env`
2. Check browser console for errors
3. Ensure backend has CORS enabled for frontend URL

### Webhook Events Not Received
- Verify webhook URL is publicly accessible (use ngrok for local testing)
- Check webhook signing secret is correct
- Ensure endpoint responds with 200 status
- Review webhook delivery logs in Stripe Dashboard

### Card Declined in Test Mode
- Use official Stripe test card numbers (see Testing section)
- Ensure using test API keys (not live keys)
- Check card details format (future expiry, any CVC)

### Vite Config Issues
If API calls fail with 404, ensure Vite proxy is configured:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Production Payment Fails
- Verify switched to live API keys
- Check customer's card has sufficient funds
- Review payment declined reason in Dashboard
- Ensure webhook endpoint updated for production URL

## Production Deployment

### Deploying Backend with Stripe to Cloud Run (Firebase Projects)

When deploying a Stripe-enabled backend for Firebase Hosting projects, follow this proven architecture:

**Architecture:**
- **Frontend**: Firebase Hosting (static site)
- **Backend**: Google Cloud Run (Express server with Stripe)
- **Connection**: Firebase rewrites proxy `/api/*` to Cloud Run

**Step 1: Create Unified Backend Server**

Merge Stripe endpoints into your existing backend (or create new):

```typescript
// server/src/server.ts
import express from 'express';
import Stripe from 'stripe';

const app = express();
const port = process.env.PORT || 8080; // Cloud Run uses PORT 8080

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover', // Use latest stable version
});

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Webhook handler
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret!);

    // Handle events
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

**Step 2: Configure Cloud Run Deployment**

Create Dockerfile:

```dockerfile
# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Cloud Run expects PORT 8080
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["npm", "start"]
```

Update `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "stripe": "^19.1.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

**Step 3: Set Up GitHub Actions Deployment**

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Cloud Run

on:
  push:
    branches: [main]
    paths:
      - 'server/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Build and Push Docker Image
        run: |
          cd server
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/backend

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy backend \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/backend \
            --region us-central1 \
            --platform managed \
            --allow-unauthenticated \
            --set-env-vars "NODE_ENV=production" \
            --update-secrets "STRIPE_SECRET_KEY=stripe-secret-key:latest" \
            --port 8080
```

**Step 4: Grant Required GCP Permissions**

The GitHub Actions service account needs these roles:

```bash
# Get service account email from GitHub secrets
SERVICE_ACCOUNT="github-actions-sa@YOUR-PROJECT.iam.gserviceaccount.com"
PROJECT_ID="YOUR-PROJECT-ID"

# Grant required permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/iam.serviceAccountUser"
```

**Common Permission Error:**
```
denied: Permission "artifactregistry.repositories.uploadArtifacts" denied
```
**Solution:** Grant `roles/artifactregistry.writer` as shown above.

**Step 5: Configure Firebase Hosting Rewrites**

Update `firebase.json` to proxy API requests to Cloud Run:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "backend",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**CRITICAL:** The rewrite for `/api/**` must come **before** the catch-all `**` rewrite, otherwise all API requests will go to `index.html`.

**Step 6: Store Stripe Secrets in Google Secret Manager**

```bash
# Create secret for Stripe secret key
echo -n "sk_live_YOUR_SECRET_KEY" | gcloud secrets create stripe-secret-key \
  --data-file=- \
  --replication-policy="automatic"

# Grant Cloud Run service access to secret
gcloud secrets add-iam-policy-binding stripe-secret-key \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

**Step 7: Deploy and Test**

```bash
# Deploy backend (triggers automatically via GitHub Actions)
git add .
git commit -m "feat: deploy Stripe backend to Cloud Run"
git push origin main

# After deployment, test the endpoint
curl https://YOUR-DOMAIN.com/api/health

# Test payment intent creation
curl -X POST https://YOUR-DOMAIN.com/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 2999, "currency": "usd"}'
```

### Common Production Issues and Solutions

**Issue 1: "Stripe API version mismatch" Error**

```
error TS2322: Type '"2024-12-18.acacia"' is not assignable to type '"2025-09-30.clover"'
```

**Cause:** Installed Stripe SDK version has different API version than specified in code.

**Solution:** Update to match installed SDK version:
```typescript
const stripe = new Stripe(secretKey, {
  apiVersion: '2025-09-30.clover', // Check node_modules/stripe for correct version
});
```

**Issue 2: Frontend Gets HTML Instead of JSON from API**

**Error in browser console:**
```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**Cause:** Firebase Hosting returns 404 HTML page when backend isn't configured.

**Solution:** Verify Firebase rewrite is correctly configured (see Step 5) and backend is deployed.

**Issue 3: Payment Form Shows "Please select a payment method"**

**This is NORMAL!** This is Stripe's validation message before the user fills in card details.

**What happens:**
1. User clicks "Buy Now" → Modal opens
2. Stripe PaymentElement loads → Shows empty form
3. User sees "Please select a payment method" → **Expected behavior**
4. User enters card details → Message disappears
5. User clicks "Pay" → Payment processes

**This is not an error** - it's proper validation ensuring users enter payment details before submitting.

**Issue 4: Docker Build Fails with Package Lock Mismatch**

```
npm error Missing: stripe@19.1.0 from lock file
```

**Cause:** Added dependency to `package.json` but didn't update `package-lock.json`.

**Solution:**
```bash
cd server
npm install  # Updates package-lock.json
git add package-lock.json
git commit -m "fix: update package-lock with Stripe dependency"
```

**Issue 5: Cloud Run Health Check Fails**

```
curl: (22) The requested URL returned error: 404
```

**Cause:** Workflow checks `/api/health` but endpoint is at `/health`.

**Solution:** Ensure health endpoint path matches workflow expectation, or update workflow:
```yaml
- name: Test health endpoint
  run: curl -f ${{ steps.service.outputs.url }}/health || exit 1
```

### Production Checklist

Before going live with Stripe payments:

- [ ] **Switch to live API keys** in Google Secret Manager
- [ ] **Update webhook endpoint** in Stripe Dashboard to production URL
- [ ] **Test small live payment** with real card
- [ ] **Verify webhook events** are received on production
- [ ] **Enable Stripe Radar** for fraud protection
- [ ] **Set up email alerts** for failed payments in Stripe Dashboard
- [ ] **Configure proper CORS** origins for production domain
- [ ] **Test payment flow** end-to-end on production URL
- [ ] **Monitor Cloud Run logs** for errors
- [ ] **Set up Cloud Run budget alerts** to prevent runaway costs

### Monitoring and Debugging

**View Cloud Run Logs:**
```bash
gcloud run services logs read backend --region us-central1 --limit 50
```

**Check Stripe Dashboard:**
- Payments → View recent transactions
- Developers → Webhooks → Check delivery status
- Logs → See all API requests

**Test Production API Directly:**
```bash
# Test from Cloud Run URL
curl https://backend-xxx.run.app/health

# Test through Firebase Hosting
curl https://yourdomain.com/api/health
```

## Additional Resources

For more detailed information, refer to:
- `references/stripe_api.md` - Complete API reference
- [Stripe Official Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Hosting Rewrites](https://firebase.google.com/docs/hosting/cloud-run)
