// CoffeeCopilot.tsx - React Chat Widget Component
import React, { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  imageUrl?: string;
};

export default function CoffeeCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm your Coffee Copilot ☕️ Ask me about beans, brewing, or coffee preparation!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bugReportMode, setBugReportMode] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle screenshot upload
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setScreenshot(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove screenshot
  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // SIMPLIFIED FEEDBACK FLOW: Direct GitHub issue creation
      if (bugReportMode) {
        // Get base URL (remove /api/chat if present)
        const fullApiUrl = import.meta.env.VITE_COPILOT_API_URL || 'http://localhost:3001/api/chat';
        const baseUrl = fullApiUrl.replace(/\/api\/chat$/, '');

        const formData = new FormData();
        formData.append('description', input);
        if (screenshot) {
          formData.append('screenshot', screenshot);
        }

        const response = await fetch(`${baseUrl}/api/feedback`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Show success message
        const successMessage: Message = {
          role: 'assistant',
          content: `✅ Feedback submitted successfully! Issue #${data.issueNumber || 'created'} has been created. Thank you for helping us improve!`,
          timestamp: new Date()
        };
        setMessages([...messages, successMessage]);

        // Clear form
        setInput('');
        removeScreenshot();
      } else {
        // NORMAL CHAT MODE: Use existing chat flow
        const userMessage: Message = {
          role: 'user',
          content: input,
          timestamp: new Date()
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');

        const apiUrl = import.meta.env.VITE_COPILOT_API_URL || 'http://localhost:3001/api/chat';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: updatedMessages.map(m => ({
              role: m.role,
              content: m.content
            })),
            user: {
              id: 'user-123' // TODO: Replace with actual authenticated user ID
            },
            allowGithubIssues: false
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply?.content || '[No response]',
          timestamp: new Date()
        };

        setMessages([...updatedMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again in a moment.',
        timestamp: new Date()
      };

      setMessages([...messages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center text-2xl z-50"
          aria-label="Open Coffee Copilot chat"
          data-testid="copilot-button"
        >
          ☕️
        </button>
      )}

      {/* Chat widget */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 w-96 max-w-[95vw] rounded-2xl shadow-xl border bg-white flex flex-col z-50"
          role="dialog"
          aria-label="Coffee Copilot Chat"
          aria-modal="true"
          data-testid="copilot-widget"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b font-semibold bg-gray-50 rounded-t-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">☕️</span>
                <span>Coffee Copilot</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setBugReportMode(false)}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-colors ${
                  !bugReportMode
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setBugReportMode(true)}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-colors ${
                  bugReportMode
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                🐛 Report Issue
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="p-3 h-96 overflow-y-auto space-y-3"
            role="log"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === 'user' ? 'text-right' : 'text-left'}
                role="article"
                aria-label={`${msg.role} message`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] break-words ${
                    msg.role === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div>{msg.content}</div>
                  {msg.timestamp && (
                    <div
                      className={`text-xs mt-1 ${
                        msg.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="text-left">
                <div className="inline-block px-4 py-2 rounded-2xl bg-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t" role="form">
            {bugReportMode && (
              <div className="mb-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                🐛 Bug Report Mode: Add a screenshot and description (submit creates GitHub issue directly)
              </div>
            )}

            {/* Screenshot Preview */}
            {bugReportMode && screenshotPreview && (
              <div className="mb-2 relative">
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="w-full rounded-lg border border-gray-300"
                />
                <button
                  onClick={removeScreenshot}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  aria-label="Remove screenshot"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex gap-2">
              {/* Screenshot Upload Button (only in bug report mode) */}
              {bugReportMode && (
                <label className="cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshotChange}
                    disabled={isLoading}
                  />
                  <div className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center">
                    📷
                  </div>
                </label>
              )}

              <label htmlFor="chat-input" className="sr-only">
                Type your message
              </label>
              <input
                id="chat-input"
                type="text"
                className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 disabled:bg-gray-50"
                placeholder={bugReportMode ? "Describe the bug or feature request..." : "Ask about beans, brewing, or coffee..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                aria-label="Message input"
              />
              <button
                className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                {bugReportMode ? 'Submit' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// Alternative: Vanilla CSS Version (no Tailwind)
// ============================================================================

/*
If you're not using Tailwind, create a CoffeeCopilot.css file with:

.copilot-button {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: #111827;
  color: white;
  border: none;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.copilot-button:hover {
  background: #1f2937;
}

.copilot-widget {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 384px;
  max-width: 95vw;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  z-index: 50;
}

.copilot-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  font-weight: 600;
  border-radius: 1rem 1rem 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.copilot-close {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
}

.copilot-close:hover {
  color: #374151;
}

.copilot-messages {
  padding: 0.75rem;
  height: 384px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  word-wrap: break-word;
}

.message.user .message-bubble {
  background: #111827;
  color: white;
}

.message.assistant .message-bubble {
  background: #f3f4f6;
  color: #111827;
}

.message-timestamp {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.message.user .message-timestamp {
  color: #d1d5db;
}

.message.assistant .message-timestamp {
  color: #6b7280;
}

.copilot-input-area {
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
}

.copilot-input-area input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
}

.copilot-input-area input:focus {
  outline: none;
  ring: 2px solid #111827;
}

.copilot-input-area input:disabled {
  opacity: 0.5;
  background: #f9fafb;
}

.copilot-input-area button {
  padding: 0.5rem 1rem;
  background: #111827;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
}

.copilot-input-area button:hover:not(:disabled) {
  background: #1f2937;
}

.copilot-input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
}

.loading-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #9ca3af;
  border-radius: 50%;
  animation: bounce 1s infinite;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.1s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.5rem);
  }
}
*/
