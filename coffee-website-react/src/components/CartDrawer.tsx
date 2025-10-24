import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { CartItem } from '../types/product';
import Checkout from './Checkout';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  total,
  updateQuantity,
  removeFromCart,
}: CartDrawerProps) {
  const [showCheckout, setShowCheckout] = useState(false);

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
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-text/70">
                                  ${item.price.toFixed(2)} each
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
                  {/* Subtotal */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-heading">
                      Subtotal
                    </span>
                    <span className="text-2xl font-display font-bold text-accent">
                      ${total.toFixed(2)}
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
