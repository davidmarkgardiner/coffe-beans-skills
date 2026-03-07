import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('Stripe publishable key is not set in environment variables');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

// API endpoint for creating payment intents
// IMPORTANT: `amount` must be provided in the smallest currency unit (pence for GBP).
// Callers (e.g. CartDrawer) already convert pounds to pence before calling this function.
// Do NOT multiply by 100 here — that was a double-conversion bug (fixed 2026-03-06).
export const createPaymentIntent = async (amount: number, currency: string = 'gbp', metadata: Record<string, string> = {}) => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount), // Already in pence/cents — do not multiply by 100
        currency,
        metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Format price for display
export const formatPrice = (amount: number, currency: string = 'gbp'): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};
