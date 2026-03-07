import { useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';

interface StoxyAgentProps {
  onOpenLogin?: () => void;
  onOpenCart?: () => void;
}

// Token response type
interface TokenResponse {
  token: string;
  expires_at?: number;
}

// Type for client tools - ElevenLabs SDK requires string | number | void return types
interface ClientTools {
  [key: string]: (parameters: any) => string | Promise<string>;
}

export default function StoxyAgent({ onOpenLogin, onOpenCart }: StoxyAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('');
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  
  const { currentUser, userRole } = useAuth();
  const { addToCart, cart, total, itemCount } = useCart();

  // Fetch WebRTC token from server
  const fetchConversationToken = async (): Promise<string | null> => {
    setIsLoadingToken(true);
    try {
      // Try to fetch token from our backend
      const response = await fetch('/api/elevenlabs-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: 'agent_2901khcdrc17fqkv7yvsp3kv0e2k',
        }),
      });

      if (!response.ok) {
        console.warn('Failed to fetch WebRTC token, falling back to WebSocket');
        return null;
      }

      const data: TokenResponse = await response.json();
      return data.token;
    } catch (error) {
      console.warn('Error fetching token:', error);
      return null;
    } finally {
      setIsLoadingToken(false);
    }
  };

  const conversation = useConversation({
    onError: (error) => console.error('Stoxy error:', error),
    onMessage: (message) => {
      console.log('Stoxy message:', message);
    },
  });

  const isConnected = conversation.status === 'connected';

  // Client tools for the agent to use
  // Note: ElevenLabs SDK requires tools to return string | number | void
  const clientTools: ClientTools = {
    // Check if user is logged in
    checkLoginStatus: useCallback((): string => {
      return JSON.stringify({
        isLoggedIn: !!currentUser,
        userId: currentUser?.uid || null,
        displayName: currentUser?.displayName || null,
        userRole: userRole || 'guest',
      });
    }, [currentUser, userRole]),

    // Show login prompt to user
    promptLogin: useCallback((_params?: { message?: string }): string => {
      const message = _params?.message || 'Create an account to save your delivery address for easy re-ordering!';
      setLoginPromptMessage(message);
      setShowLoginPrompt(true);
      return JSON.stringify({ success: true, message: 'Login prompt displayed' });
    }, []),

    // Get current cart contents
    getCartContents: useCallback((): string => {
      return JSON.stringify({
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        itemCount,
        total: total.toFixed(2),
      });
    }, [cart, itemCount, total]),

    // Add item to cart
    addItemToCart: useCallback((params?: { 
      productId?: string; 
      format?: 'whole' | 'ground';
      size?: '250g' | '1kg';
      quantity?: number;
    }): string => {
      // Check if user is logged in for voice orders
      if (!currentUser) {
        setLoginPromptMessage('Create an account to save your delivery address for easy re-ordering!');
        setShowLoginPrompt(true);
        return JSON.stringify({ 
          success: false, 
          requiresLogin: true,
          message: 'Please create an account or log in to place orders via voice.' 
        });
      }

      const format = params?.format || 'whole';
      const size = params?.size || '250g';
      const product = {
        id: params?.productId || 'stockbridge-signature',
        name: `Stockbridge Signature - ${format === 'ground' ? 'Ground' : 'Whole Bean'}`,
        description: 'Ethiopian Yirgacheffe',
        price: size === '1kg' ? 28.00 : 12.00,
        weight: size,
        category: 'Single Origin',
        image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
      };

      const qty = params?.quantity || 1;
      for (let i = 0; i < qty; i++) {
        addToCart(product);
      }

      // Open cart drawer to show the user
      onOpenCart?.();

      return JSON.stringify({ 
        success: true, 
        message: `Added ${qty} x ${product.name} to your cart.` 
      });
    }, [currentUser, addToCart, onOpenCart]),

    // Open cart/checkout
    openCheckout: useCallback((): string => {
      onOpenCart?.();
      return JSON.stringify({ success: true, message: 'Cart opened' });
    }, [onOpenCart]),
  };

  const handleStart = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to get WebRTC token first
      const token = await fetchConversationToken();
      
      if (token) {
        // Use WebRTC for lower latency
        await conversation.startSession({
          conversationToken: token,
          connectionType: 'webrtc',
          clientTools,
        });
      } else {
        // Fallback to WebSocket with direct agent ID
        await conversation.startSession({
          agentId: 'agent_2901khcdrc17fqkv7yvsp3kv0e2k',
          connectionType: 'websocket',
          clientTools,
        });
      }
    } catch (err) {
      console.error('Failed to start Stoxy:', err);
    }
  };

  const handleStop = () => {
    conversation.endSession();
    setShowLoginPrompt(false);
  };

  const handleToggle = () => {
    if (isOpen) {
      if (isConnected) handleStop();
      setIsOpen(false);
      setShowLoginPrompt(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleLoginPromptAction = (action: 'login' | 'dismiss') => {
    setShowLoginPrompt(false);
    if (action === 'login') {
      onOpenLogin?.();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 hover:scale-105 border-2"
        style={{
          background: isOpen ? '#A89175' : '#212f1f',
          borderColor: isOpen ? '#8F7B62' : '#A89175',
        }}
        aria-label={isOpen ? 'Close Stoxy' : 'Chat with Stoxy'}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-5 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ border: '2px solid #A89175' }}
        >
          {/* Header */}
          <div
            className="px-5 py-4"
            style={{ background: '#212f1f' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: '#A89175', color: '#212f1f' }}
              >
                S
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm tracking-wide">Stoxy</h3>
                <p className="text-xs" style={{ color: '#A89175' }}>
                  {isLoadingToken 
                    ? 'Connecting...' 
                    : isConnected
                      ? conversation.isSpeaking ? 'Speaking...' : 'Listening...'
                      : 'Voice Assistant'}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div
            className="px-5 py-6 flex flex-col items-center gap-4"
            style={{ background: '#F5F0E8' }}
          >
            {/* Login Prompt Modal */}
            {showLoginPrompt && (
              <div className="w-full p-4 rounded-xl mb-4" style={{ background: '#212f1f', border: '1px solid #A89175' }}>
                <p className="text-sm text-white mb-3">{loginPromptMessage}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoginPromptAction('login')}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: '#A89175', color: '#212f1f' }}
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => handleLoginPromptAction('dismiss')}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border"
                    style={{ borderColor: '#A89175', color: '#A89175' }}
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-sm" style={{ color: '#212f1f' }}>
              {isConnected
                ? conversation.isSpeaking
                  ? "I'm talking, hang on..."
                  : "I'm listening - go ahead!"
                : "Hi, I'm Stoxy! Tap below to chat - I can help with coffee recommendations and take your order."}
            </p>

            {/* Animated orb when connected */}
            {isConnected && (
              <div className="relative flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: '#212f1f' }}
                >
                  <div
                    className={`w-10 h-10 rounded-full ${conversation.isSpeaking ? 'animate-pulse' : 'animate-[pulse_3s_ease-in-out_infinite]'}`}
                    style={{ background: '#A89175' }}
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={isConnected ? handleStop : handleStart}
              disabled={isLoadingToken}
              className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{
                background: isConnected ? '#8F7B62' : '#212f1f',
                color: '#F5F0E8',
              }}
            >
              {isLoadingToken 
                ? 'Connecting...' 
                : isConnected 
                  ? 'End Conversation' 
                  : 'Start a Conversation'}
            </button>

            {/* Login status indicator */}
            {currentUser ? (
              <p className="text-xs text-center" style={{ color: '#212f1f', opacity: 0.7 }}>
                Signed in as {currentUser.displayName || currentUser.email}
              </p>
            ) : (
              <p className="text-xs text-center" style={{ color: '#212f1f', opacity: 0.7 }}>
                Guest mode — sign in to save your preferences
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
