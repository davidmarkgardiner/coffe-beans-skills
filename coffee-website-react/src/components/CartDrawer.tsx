import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useState } from 'react';
import type { CartItem, AppliedDiscount } from '../types/product';
import Checkout from './Checkout';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  total: number;
  appliedDiscount: AppliedDiscount | null;
  applyDiscount: (code: string) => { success: boolean; message: string };
  removeDiscount: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  subtotal,
  total,
  appliedDiscount,
  applyDiscount,
  removeDiscount,
  updateQuantity,
  removeFromCart,
}: CartDrawerProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (paymentIntentId: string) => {
    console.log('Cart checkout successful!', paymentIntentId);
    // Clear cart after successful payment
    cart.forEach(item => removeFromCart(item.id));
    setShowCheckout(false);
    onClose();
  };

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountMessage({ type: 'error', text: 'Please enter a discount code' });
      return;
    }

    const result = applyDiscount(discountCode.trim());
    setDiscountMessage({ type: result.success ? 'success' : 'error', text: result.message });

    if (result.success) {
      setDiscountCode('');
      // Clear message after 3 seconds
      setTimeout(() => setDiscountMessage(null), 3000);
    }
  };

  const handleRemoveDiscount = () => {
    removeDiscount();
    setDiscountMessage(null);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-accent-light">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-accent" />
                  <h2 className="text-2xl font-display font-semibold text-heading">
                    Shopping Cart
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface rounded-full transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-6 h-6 text-text" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag className="w-16 h-16 text-accent-light mb-4" />
                    <p className="text-lg font-semibold text-text mb-2">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-text/70">
                      Add some delicious coffee to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex gap-4 p-4 bg-surface rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-heading truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-text mb-2">{item.weight}</p>

                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-accent-light/30 rounded transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-4 h-4 text-text" />
                              </button>
                              <span className="w-8 text-center font-semibold text-heading">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-accent-light/30 rounded transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-4 h-4 text-text" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="font-bold text-accent">
                                £{(item.price * item.quantity).toFixed(2)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-text/70">
                                  £{item.price.toFixed(2)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors self-start"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer with Total and Checkout */}
              {cart.length > 0 && (
                <div className="border-t border-accent-light p-6 bg-surface">
                  {/* Discount Code Input */}
                  {!appliedDiscount && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-heading mb-2">
                        Discount Code
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text/50" />
                          <input
                            type="text"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                            placeholder="Enter code"
                            className="w-full pl-10 pr-3 py-2 border border-accent-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={handleApplyDiscount}
                          className="px-4 py-2 bg-accent-light text-accent font-semibold rounded-lg hover:bg-accent hover:text-white transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {discountMessage && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mt-2 text-sm ${
                            discountMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {discountMessage.text}
                        </motion.p>
                      )}
                    </div>
                  )}

                  {/* Applied Discount Display */}
                  {appliedDiscount && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold text-green-800">
                              {appliedDiscount.code}
                            </p>
                            {appliedDiscount.description && (
                              <p className="text-xs text-green-600">
                                {appliedDiscount.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveDiscount}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Subtotal */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base font-semibold text-heading">
                      Subtotal
                    </span>
                    <span className="text-base font-semibold text-heading">
                      £{subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Discount Amount */}
                  {appliedDiscount && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base font-semibold text-green-600">
                        Discount
                      </span>
                      <span className="text-base font-semibold text-green-600">
                        -£{appliedDiscount.amount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center mb-4 pt-2 border-t border-accent-light">
                    <span className="text-lg font-semibold text-heading">
                      Total
                    </span>
                    <span className="text-2xl font-display font-bold text-accent">
                      £{total.toFixed(2)}
                    </span>
                  </div>

                  {/* Item Count */}
                  <p className="text-sm text-text mb-4">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} item(s) in cart
                  </p>

                  {/* Checkout Button */}
                  <motion.button
                    onClick={handleCheckout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-accent text-white rounded-lg font-semibold text-lg hover:bg-accent-hover transition-colors shadow-medium hover:shadow-large"
                  >
                    Proceed to Checkout
                  </motion.button>

                  <button
                    onClick={onClose}
                    className="w-full mt-3 py-2 text-text hover:text-heading transition-colors text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          amount={total}
          productName={`Cart Checkout (${cart.length} items)`}
          productId="cart-checkout"
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </>
  );
}
