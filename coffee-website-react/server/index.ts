import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('ERROR: STRIPE_SECRET_KEY is not set in environment variables');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'gbp', metadata = {} } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Ensure amount is in cents (integer)
    const amountInCents = Math.round(amount);

    console.log(`Creating payment intent for $${amountInCents / 100} ${currency}`);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
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

// Webhook endpoint for Stripe events
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not set, skipping webhook verification');
    return res.status(400).send('Webhook secret not configured');
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        // TODO: Fulfill the order, send confirmation email, etc.
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', failedPayment.id);
        // TODO: Handle failed payment
        break;

      case 'charge.succeeded':
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge succeeded:', charge.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Stripe Payment Server running on http://localhost:${PORT}`);
  console.log(`📝 API Endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/create-payment-intent`);
  console.log(`   - POST /api/stripe-webhook`);
  console.log(`\n💳 Stripe Mode: ${stripeSecretKey.includes('test') ? 'TEST' : 'LIVE'}`);
  console.log(`\n🧪 Test with card: 4242 4242 4242 4242\n`);
});
