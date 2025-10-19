#!/usr/bin/env python3
"""
Stripe setup script for coffee beans application

Generates boilerplate code for Stripe payment integration including:
- Environment variable configuration
- Payment intent creation endpoint
- Basic error handling
"""

import os
import sys

def generate_env_template():
    """Generate .env.example file with Stripe keys"""
    return """# Stripe API Keys
# Test keys (for development)
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_PUBLIC_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX

# Live keys (for production - keep secure!)
STRIPE_LIVE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXX
STRIPE_LIVE_PUBLIC_KEY=pk_live_XXXXXXXXXXXXXXXXXXXX

# Current environment (test or live)
STRIPE_ENV=test
"""

def generate_payment_endpoint():
    """Generate payment intent creation endpoint"""
    return """// Stripe Payment Intent Endpoint
// POST /api/create-payment-intent

import Stripe from 'stripe';

const stripe = new Stripe(
  process.env.STRIPE_ENV === 'live'
    ? process.env.STRIPE_LIVE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY
);

export async function POST(req) {
  try {
    const { amount, currency = 'usd', metadata = {} } = await req.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method_types: ['card'],
      metadata: {
        ...metadata,
        product: 'coffee-beans',
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
"""

def generate_webhook_handler():
    """Generate webhook handler for Stripe events"""
    return """// Stripe Webhook Handler
// POST /api/stripe-webhook

import Stripe from 'stripe';

const stripe = new Stripe(
  process.env.STRIPE_ENV === 'live'
    ? process.env.STRIPE_LIVE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(
      JSON.stringify({ error: 'Webhook signature verification failed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      // TODO: Fulfill the order, update database, send confirmation email
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);
      // TODO: Notify customer, log failure
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      console.log('Charge refunded:', refund.id);
      // TODO: Update order status, notify customer
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(
    JSON.stringify({ received: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};
"""

def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("Stripe Setup Script")
        print("\nGenerates boilerplate code for Stripe integration")
        print("\nUsage:")
        print("  python setup_stripe.py env       - Generate .env.example")
        print("  python setup_stripe.py payment   - Generate payment endpoint")
        print("  python setup_stripe.py webhook   - Generate webhook handler")
        print("  python setup_stripe.py all       - Generate all files")
        return

    output_type = sys.argv[1] if len(sys.argv) > 1 else 'all'

    if output_type in ['env', 'all']:
        print(generate_env_template())
        print("\n" + "="*50 + "\n")

    if output_type in ['payment', 'all']:
        print(generate_payment_endpoint())
        print("\n" + "="*50 + "\n")

    if output_type in ['webhook', 'all']:
        print(generate_webhook_handler())

if __name__ == "__main__":
    main()
