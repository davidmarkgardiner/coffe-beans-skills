import { useState } from 'react';
import { useConversation } from '@elevenlabs/react';

export default function StoxyAgent() {
  const [isOpen, setIsOpen] = useState(false);

  const conversation = useConversation({
    onError: (error) => console.error('Stoxy error:', error),
  });

  const isConnected = conversation.status === 'connected';

  const handleStart = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: 'agent_2901khcdrc17fqkv7yvsp3kv0e2k',
        connectionType: 'websocket',
      });
    } catch (err) {
      console.error('Failed to start Stoxy:', err);
    }
  };

  const handleStop = () => {
    conversation.endSession();
  };

  const handleToggle = () => {
    if (isOpen) {
      if (isConnected) handleStop();
      setIsOpen(false);
    } else {
      setIsOpen(true);
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
                  {isConnected
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
            <p className="text-center text-sm" style={{ color: '#212f1f' }}>
              {isConnected
                ? conversation.isSpeaking
                  ? "I'm talking, hang on..."
                  : "I'm listening - go ahead!"
                : "Hi, I'm Stoxy! Tap below to chat - I can help with anything you need."}
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
              className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:opacity-90"
              style={{
                background: isConnected ? '#8F7B62' : '#212f1f',
                color: '#F5F0E8',
              }}
            >
              {isConnected ? 'End Conversation' : 'Start a Conversation'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
