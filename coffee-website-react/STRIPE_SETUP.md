# Stripe Payment Integration

This guide walks you through setting up and testing Stripe payments for the Coffee Beans website.

## 📋 Prerequisites

- Stripe account (sign up at https://stripe.com)
- Node.js and npm installed
- Coffee website project set up

## 🔧 Setup Instructions

### 1. Get Your Stripe Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in top right)
3. Go to **Developers** → **API keys**
4. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 2. Configure Environment Variables

Update your `.env` file with both Stripe keys:

```env
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

**⚠️ Important Notes:**
- The `STRIPE_SECRET_KEY` is used by the backend server
- The `VITE_STRIPE_PUBLISHABLE_KEY` is used by the frontend (requires `VITE_` prefix)
- Never commit your `.env` file to git (it's already in `.gitignore`)
- Use **test keys** (not live keys) during development

### 3. Install Dependencies

All required dependencies should already be installed. If not, run:

```bash
npm install
```

This installs:
- `stripe` - Stripe Node.js SDK (backend)
- `@stripe/stripe-js` - Stripe.js library (frontend)
- `@stripe/react-stripe-js` - React components for Stripe Elements
- `express` & `cors` - Backend API server

### 4. Test Your Configuration

Run the Stripe test script to verify everything is set up correctly:

```bash
npm run test:stripe
```

This will:
- ✅ Verify your Stripe secret key is valid
- ✅ Test the Stripe API connection
- ✅ Create and cancel a test payment intent
- ✅ Display test card numbers for manual testing

Expected output:
```
🔧 Testing Stripe Configuration...

✓ Stripe Secret Key: sk_test_...
✓ Mode: TEST

📡 Testing Stripe API connection...
✅ Successfully created test payment intent!
   Payment Intent ID: pi_...
   Amount: $24.99
   Status: requires_payment_method
   Client Secret: pi_...secret_...

✅ Test payment intent cancelled successfully

✨ Stripe integration is working correctly!
```

## 🚀 Running the Application

### Option 1: Run Both Frontend and Backend Together

```bash
npm run dev:all
```

This starts:
- Backend API server on http://localhost:3001
- Frontend dev server on http://localhost:5173

### Option 2: Run Separately (Two Terminals)

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 💳 Testing Payments

### Test Card Numbers

Use these test card numbers in the payment form:

| Scenario | Card Number | Expiry | CVC | ZIP |
|----------|-------------|--------|-----|-----|
| ✅ Successful Payment | `4242 4242 4242 4242` | Any future date | Any 3 digits | Any |
| ❌ Declined Card | `4000 0000 0000 0002` | Any future date | Any 3 digits | Any |
| 💰 Insufficient Funds | `4000 0000 0000 9995` | Any future date | Any 3 digits | Any |
| 🔐 3D Secure Auth | `4000 0025 0000 3155` | Any future date | Any 3 digits | Any |

**Examples:**
- Expiry: `12/34` (December 2034)
- CVC: `123`
- ZIP: `12345`

### Testing Workflow

1. Open the website at http://localhost:5173
2. Browse to a product
3. Click **"Buy Now"** button
4. Enter test card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - Billing ZIP: `12345`
5. Click **"Pay $XX.XX"**
6. ✅ Payment should succeed!

### Verify Payment in Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/payments
2. You should see your test payment listed
3. Click on it to view details and metadata

## 🏗️ Architecture

### File Structure

```
coffee-website-react/
├── server/
│   └── index.ts                 # Express backend API
├── src/
│   ├── components/
│   │   ├── Checkout.tsx        # Checkout modal wrapper
│   │   ├── CheckoutForm.tsx    # Stripe payment form
│   │   └── ProductCard.tsx     # Updated with "Buy Now" button
│   └── lib/
│       └── stripe.ts           # Stripe utilities
├── scripts/
│   └── test-stripe.ts          # Stripe configuration test
└── vite.config.ts              # API proxy configuration
```

### API Endpoints

**Backend (http://localhost:3001):**
- `GET /api/health` - Health check
- `POST /api/create-payment-intent` - Create payment intent
- `POST /api/stripe-webhook` - Handle webhook events

**Frontend (http://localhost:5173):**
- Proxies `/api/*` requests to backend server

### Payment Flow

1. User clicks "Buy Now" on a product
2. Checkout modal opens
3. Frontend calls `/api/create-payment-intent`
4. Backend creates PaymentIntent with Stripe
5. Backend returns `clientSecret`
6. Frontend displays Stripe payment form
7. User enters card details
8. Stripe securely processes payment
9. Frontend receives confirmation
10. User sees success message

## 🔐 Webhook Setup (Optional)

Webhooks allow Stripe to notify your server about payment events.

### Local Testing with Stripe CLI

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe-webhook
   ```

4. Copy the webhook signing secret and add to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. Trigger test events:
   ```bash
   stripe trigger payment_intent.succeeded
   stripe trigger payment_intent.payment_failed
   ```

### Production Webhook Setup

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **"Add endpoint"**
3. Enter your production URL: `https://yourdomain.com/api/stripe-webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
5. Copy the webhook signing secret
6. Add to production environment variables

## 🚢 Production Deployment

### Before Going Live

- [ ] Switch to **Live Mode** in Stripe Dashboard
- [ ] Get live API keys (start with `pk_live_` and `sk_live_`)
- [ ] Update environment variables with live keys
- [ ] Set up production webhook endpoint
- [ ] Test with a real card (small amount)
- [ ] Enable Stripe Radar for fraud protection
- [ ] Set up email notifications for failed payments

### Environment Variables for Production

```env
# Stripe (Live Mode)
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
```

## 🐛 Troubleshooting

### "Stripe publishable key is not set"

**Solution:** Make sure `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env` and restart the dev server.

### "Failed to create payment intent"

**Possible causes:**
1. Backend server not running (`npm run server`)
2. Invalid Stripe secret key
3. Amount is 0 or negative
4. Network/CORS issues

**Solution:** Check backend server logs and verify environment variables.

### Payment form doesn't load

**Possible causes:**
1. Invalid publishable key
2. Network blocked Stripe.js
3. Browser console shows errors

**Solution:** Check browser console for errors and verify keys.

### CORS errors

**Solution:** Make sure CORS is enabled in `server/index.ts` (already configured).

### Webhook signature verification fails

**Solution:** Ensure `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret in Stripe Dashboard.

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Testing Guide](https://stripe.com/docs/testing)
- [React Stripe.js Docs](https://stripe.com/docs/stripe-js/react)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)

## 💡 Tips

- Always use test mode during development
- Test with multiple card scenarios (success, decline, 3DS)
- Monitor payments in Stripe Dashboard
- Use metadata to store order information
- Implement proper error handling
- Never expose secret keys in frontend code
- Set up email notifications for payment events
- Consider implementing customer accounts for saved cards

## 🎯 Next Steps

- [ ] Test successful payment with test card
- [ ] Test declined card scenario
- [ ] Verify payment appears in Stripe Dashboard
- [ ] Implement order confirmation page
- [ ] Add order history for customers
- [ ] Set up email confirmations
- [ ] Implement refund functionality
- [ ] Add subscription support (if needed)

---

**Need Help?** Check the Stripe logs in the Dashboard or contact support at https://support.stripe.com
