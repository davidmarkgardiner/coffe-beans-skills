import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import type { Appearance, StripeElementsOptions } from '@stripe/stripe-js';
import { getStripe, createPaymentIntent } from '../lib/stripe';
import CheckoutForm from './CheckoutForm';
import { GiftCardRedemption } from './GiftCardRedemption';
import { X } from 'lucide-react';
import type { GiftCard } from '../types/product';

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
  const [appliedGiftCard, setAppliedGiftCard] = useState<GiftCard | null>(null);

  // Calculate final amount after gift card discount
  const finalAmount = appliedGiftCard
    ? Math.max(0, amount - Math.min(appliedGiftCard.balance, amount))
    : amount;

  useEffect(() => {
    // Create PaymentIntent with final amount (after gift card discount)
    createPaymentIntent(finalAmount, 'gbp', {
      product_name: productName,
      product_id: productId || '',
      gift_card_code: appliedGiftCard?.code || '',
      original_amount: amount.toString(),
    })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [finalAmount, productName, productId, appliedGiftCard?.code, amount]);

  const appearance: Appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#78350f',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h2>
        <p className="text-gray-600 mb-6">{productName}</p>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Gift Card Redemption */}
        {!isLoading && !error && (
          <div className="mb-4">
            <GiftCardRedemption
              onApplyGiftCard={(giftCard) => {
                setAppliedGiftCard(giftCard);
                setIsLoading(true);
                setClientSecret(''); // Reset to create new payment intent with discount
              }}
              appliedGiftCard={appliedGiftCard}
              onRemoveGiftCard={() => {
                setAppliedGiftCard(null);
                setIsLoading(true);
                setClientSecret(''); // Reset to create new payment intent without discount
              }}
              cartTotal={amount}
            />
          </div>
        )}

        {/* Order Summary */}
        {!isLoading && !error && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>£{(amount / 100).toFixed(2)}</span>
            </div>
            {appliedGiftCard && (
              <div className="flex justify-between text-sm text-green-600 mb-2">
                <span>Gift Card Discount</span>
                <span>-£{(Math.min(appliedGiftCard.balance, amount) / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>£{(finalAmount / 100).toFixed(2)}</span>
            </div>
          </div>
        )}

        {clientSecret && !error && finalAmount > 0 && (
          <Elements options={options} stripe={getStripe()} key={clientSecret}>
            <CheckoutForm
              amount={finalAmount}
              onSuccess={(paymentIntentId) => {
                onSuccess?.(paymentIntentId);
                setTimeout(() => onClose(), 2000);
              }}
              onError={(err) => setError(err)}
            />
          </Elements>
        )}

        {/* Free order (fully covered by gift card) */}
        {clientSecret && !error && finalAmount === 0 && appliedGiftCard && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Complete!</h3>
            <p className="text-gray-600 mb-4">
              Your order is fully covered by your gift card.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Test Mode</span>
            <span>Use card: 4242 4242 4242 4242</span>
          </div>
        </div>
      </div>
    </div>
  );
}
