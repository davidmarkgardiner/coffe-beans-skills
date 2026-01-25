# Stripe API Reference for Coffee Beans Store

This reference provides detailed information about integrating Stripe payment processing for a coffee beans e-commerce application.

## API Keys and Environment Configuration

### Test vs Live Keys

Stripe provides two sets of API keys:
- **Test keys**: Start with `sk_test_` and `pk_test_` - for development and automated testing
- **Live keys**: Start with `sk_live_` and `pk_live_` - for production payments

### Environment Variables Structure

```
STRIPE_SECRET_KEY=sk_test_...          # Current test secret key
STRIPE_PUBLIC_KEY=pk_test_...          # Current test public key
STRIPE_LIVE_SECRET_KEY=sk_live_...     # Production secret key
STRIPE_LIVE_PUBLIC_KEY=pk_live_...     # Production public key
STRIPE_ENV=test                        # Current environment (test|live)
STRIPE_WEBHOOK_SECRET=whsec_...        # Webhook signing secret
```

### Security Best Practices

1. Never commit API keys to version control
2. Always use environment variables via `.env` files
3. Keep live keys in secure production environment only
4. Rotate keys if compromised
5. Use webhook secrets to verify event authenticity

## Payment Intents API

### Creating a Payment Intent

The Payment Intents API is the modern way to handle payments in Stripe. It handles complex payment flows and supports multiple payment methods.

**Endpoint**: `stripe.paymentIntents.create()`

**Parameters**:
- `amount` (required): Integer in smallest currency unit (cents for USD)
- `currency` (required): Three-letter ISO currency code (e.g., 'usd')
- `payment_method_types` (optional): Array of allowed payment methods (default: ['card'])
- `metadata` (optional): Object containing custom key-value pairs

**Example**:
```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2499, // $24.99 in cents
  currency: 'usd',
  payment_method_types: ['card'],
  metadata: {
    product: 'colombian-coffee-beans',
    quantity: '2',
    customer_id: 'cust_123'
  }
});
```

**Response** includes:
- `id`: Unique payment intent identifier
- `client_secret`: Secret key for client-side confirmation
- `status`: Current status (requires_payment_method, requires_confirmation, succeeded, etc.)
- `amount`: Payment amount
- `currency`: Payment currency

### Payment Intent Statuses

- `requires_payment_method`: Waiting for payment method
- `requires_confirmation`: Payment method attached, awaiting confirmation
- `requires_action`: Additional action needed (3D Secure, etc.)
- `processing`: Payment is processing
- `succeeded`: Payment completed successfully
- `canceled`: Payment intent canceled

## Webhook Events

Webhooks allow Stripe to notify your application about events asynchronously.

### Common Webhook Events

**Payment Events**:
- `payment_intent.succeeded`: Payment completed successfully
- `payment_intent.payment_failed`: Payment failed
- `payment_intent.canceled`: Payment intent canceled

**Charge Events**:
- `charge.succeeded`: Charge completed
- `charge.failed`: Charge failed
- `charge.refunded`: Charge refunded

**Customer Events**:
- `customer.created`: New customer created
- `customer.updated`: Customer details updated
- `customer.deleted`: Customer deleted

### Webhook Signature Verification

Always verify webhook signatures to ensure requests come from Stripe:

```javascript
const event = stripe.webhooks.constructEvent(
  requestBody,
  signature,
  webhookSecret
);
```

### Webhook Handler Pattern

```javascript
switch (event.type) {
  case 'payment_intent.succeeded':
    // Fulfill order, update database, send confirmation
    break;
  case 'payment_intent.payment_failed':
    // Notify customer, log failure
    break;
  case 'charge.refunded':
    // Update order status, process refund
    break;
  default:
    console.log(`Unhandled event: ${event.type}`);
}
```

## Testing with Stripe

### Test Card Numbers

Stripe provides test cards that simulate different scenarios:

**Success**:
- `4242 4242 4242 4242` - Visa (succeeds)
- `5555 5555 5555 4444` - Mastercard (succeeds)

**Decline Codes**:
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds
- `4000 0000 0000 0069` - Charge expired

**Special Scenarios**:
- `4000 0025 0000 3155` - Requires authentication (3D Secure 2)
- `4000 0000 0000 9979` - Charge declined after successful authentication

**Card Details for Testing**:
- Any future expiration date (e.g., 12/34)
- Any 3-digit CVC
- Any valid billing ZIP code

### Testing Webhooks Locally

Use Stripe CLI to forward webhook events to localhost:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Trigger specific events:
```bash
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

## Error Handling

### Common Stripe Errors

**API Errors**:
- `StripeCardError`: Card declined or invalid
- `StripeInvalidRequestError`: Invalid parameters
- `StripeAPIError`: Stripe API issue
- `StripeConnectionError`: Network communication failed
- `StripeAuthenticationError`: Invalid API key

### Error Handling Pattern

```javascript
try {
  const paymentIntent = await stripe.paymentIntents.create({...});
} catch (error) {
  if (error.type === 'StripeCardError') {
    // Card declined - show user friendly message
  } else if (error.type === 'StripeInvalidRequestError') {
    // Invalid parameters - log and fix code
  } else {
    // Other error - log and show generic message
  }
}
```

## Best Practices

### 1. Idempotency
Use idempotency keys to safely retry requests:
```javascript
await stripe.paymentIntents.create({
  amount: 2499,
  currency: 'usd'
}, {
  idempotencyKey: 'order_123_payment_attempt_1'
});
```

### 2. Amount Handling
Always store amounts in smallest currency unit (cents):
```javascript
const priceInDollars = 24.99;
const amountInCents = Math.round(priceInDollars * 100); // 2499
```

### 3. Metadata Usage
Store order information in metadata for easy reference:
```javascript
metadata: {
  order_id: 'order_123',
  product_name: 'Colombian Coffee Beans',
  quantity: '2',
  customer_email: 'customer@example.com'
}
```

### 4. Webhook Reliability
- Always respond with 200 status immediately
- Process webhook events asynchronously
- Implement idempotency in webhook handlers
- Store and process events in order

### 5. API Versioning
Lock Stripe API version to avoid breaking changes:
```javascript
const stripe = new Stripe(secretKey, {
  apiVersion: '2023-10-16'
});
```

## Currency Support

Common currencies for coffee sales:
- `usd` - US Dollar
- `eur` - Euro
- `gbp` - British Pound
- `cad` - Canadian Dollar
- `aud` - Australian Dollar

Note: Some currencies are zero-decimal (e.g., JPY) - no need to multiply by 100.

## Rate Limits

Stripe API rate limits:
- Test mode: 100 requests/second
- Live mode: 100 requests/second (can be increased)

Implement exponential backoff for rate limit errors.
