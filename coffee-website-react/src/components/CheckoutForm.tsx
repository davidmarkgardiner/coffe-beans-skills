import { useState, type FormEvent } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { StripePaymentElementOptions } from '@stripe/stripe-js';

interface CheckoutFormProps {
  amount: number;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export default function CheckoutForm({ amount, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
      redirect: 'if_required',
    });

    if (error) {
      const errorMessage = error.type === 'card_error' || error.type === 'validation_error'
        ? error.message || 'An unexpected error occurred.'
        : 'An unexpected error occurred.';

      setMessage(errorMessage);
      onError?.(errorMessage);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment successful!');
      onSuccess?.(paymentIntent.id);
    }

    setIsLoading(false);
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={paymentElementOptions} />

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full bg-accent text-heading py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors disabled:bg-border disabled:text-muted disabled:cursor-not-allowed font-semibold"
      >
        <span id="button-text">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-heading"></div>
            </div>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </span>
      </button>

      {message && (
        <div
          id="payment-message"
          className={`text-center p-3 rounded ${
            message.includes('successful')
              ? 'bg-contrast-alt text-heading'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}
