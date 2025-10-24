import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import type { Appearance, StripeElementsOptions } from '@stripe/stripe-js';
import { getStripe, createPaymentIntent } from '../lib/stripe';
import CheckoutForm from './CheckoutForm';
import { X } from 'lucide-react';

interface CheckoutProps {
  amount: number;
  productName: string;
  productId?: string;
  onClose: () => void;
  onSuccess?: (paymentIntentId: string) => void;
}

export default function Checkout({ amount, productName, productId, onClose, onSuccess }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    createPaymentIntent(amount, 'usd', {
      product_name: productName,
      product_id: productId || '',
    })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [amount, productName, productId]);

  const appearance: Appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#B8A690',
      colorBackground: '#F7F4ED',
      colorText: '#5B5245',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <div className="fixed inset-0 bg-heading/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6 relative border border-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text hover:text-heading transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-heading mb-2">Checkout</h2>
        <p className="text-text mb-6">{productName}</p>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {clientSecret && !error && (
          <Elements options={options} stripe={getStripe()}>
            <CheckoutForm
              amount={amount}
              onSuccess={(paymentIntentId) => {
                onSuccess?.(paymentIntentId);
                setTimeout(() => onClose(), 2000);
              }}
              onError={(err) => setError(err)}
            />
          </Elements>
        )}

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex justify-between text-sm text-text mb-2">
            <span>Test Mode</span>
            <span>Use card: 4242 4242 4242 4242</span>
          </div>
        </div>
      </div>
    </div>
  );
}
