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

```bash
# Generate .env template with Stripe configuration
python scripts/setup_stripe.py env > .env.example
```

Edit `.env.example` and add actual API keys from Stripe Dashboard:
- Test keys: `sk_test_...` and `pk_test_...` (for development)
- Live keys: `sk_live_...` and `pk_live_...` (for production)

Copy `.env.example` to `.env` and ensure `.env` is in `.gitignore`.

### 2. Install Required Dependencies

```bash
# Server-side (Node.js/Next.js)
npm install stripe

# Client-side (React with Stripe Elements)
npm install @stripe/stripe-js @stripe/react-stripe-js
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

### Automated Testing

Create automated tests using test card numbers:

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

### Payment Intent Creation Fails
- Verify API key is correct (test vs live)
- Check amount is positive integer (cents)
- Ensure currency code is valid (3-letter ISO)
- Review Stripe Dashboard logs for detailed error

### Webhook Events Not Received
- Verify webhook URL is publicly accessible (use ngrok for local testing)
- Check webhook signing secret is correct
- Ensure endpoint responds with 200 status
- Review webhook delivery logs in Stripe Dashboard

### Card Declined in Test Mode
- Use official Stripe test card numbers (see Testing section)
- Ensure using test API keys (not live keys)
- Check card details format (future expiry, any CVC)

### Production Payment Fails
- Verify switched to live API keys
- Check customer's card has sufficient funds
- Review payment declined reason in Dashboard
- Ensure webhook endpoint updated for production URL

## Additional Resources

For more detailed information, refer to:
- `references/stripe_api.md` - Complete API reference
- [Stripe Official Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
