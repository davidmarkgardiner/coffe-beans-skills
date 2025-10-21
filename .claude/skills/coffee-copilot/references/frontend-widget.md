# Frontend Chat Widget Implementation

This document provides guidance for implementing the Coffee Copilot chat widget in your React application.

## Widget Architecture

The chat widget is a self-contained React component that:
- Displays conversation history
- Handles user input
- Communicates with the backend API
- Manages loading states
- Provides a pleasant user experience

## Basic Implementation

### Component Structure

```tsx
import React, { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function CoffeeCopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm your Coffee Copilot ☕️ Ask me about beans, brewing, or place an order."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          user: { id: 'user-123' } // Replace with actual user ID
        })
      });

      if (!response.ok) throw new Error('Chat request failed');

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply?.content || '[No response]'
      };

      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="coffee-copilot-widget">
      {/* Widget content */}
    </div>
  );
}
```

## Styling Options

### Option 1: Tailwind CSS (Recommended)

```tsx
export default function CoffeeCopilot() {
  // ... component logic

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[95vw] rounded-2xl shadow-xl border bg-white flex flex-col z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b font-semibold bg-gray-50 rounded-t-2xl flex items-center justify-between">
        <span>Coffee Copilot</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="p-3 h-96 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === 'user' ? 'text-right' : 'text-left'}
          >
            <div
              className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block px-4 py-2 rounded-2xl bg-gray-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Ask about beans, orders, or brewing..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
        />
        <button
          className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

### Option 2: Custom CSS

```css
/* CoffeeCopilot.css */
.coffee-copilot-widget {
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
}

.message.user .message-bubble {
  background: #111827;
  color: white;
}

.message.assistant .message-bubble {
  background: #f3f4f6;
  color: #111827;
}

.copilot-input {
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
}

.copilot-input input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
}

.copilot-input button {
  padding: 0.5rem 1rem;
  background: #111827;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
}
```

## Advanced Features

### 1. Toggle Widget Open/Close

```tsx
export default function CoffeeCopilot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 flex items-center justify-center"
        >
          ☕️
        </button>
      )}

      {/* Chat widget */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 ...">
          {/* Widget content */}
        </div>
      )}
    </>
  );
}
```

### 2. Streaming Responses (SSE)

For a better UX with streaming responses:

```tsx
const sendMessage = async () => {
  // ... setup

  try {
    const response = await fetch('/api/chat-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages, user: { id: 'user-123' } })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';

    // Add empty assistant message
    setMessages([...updatedMessages, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          assistantMessage += data.content;

          // Update last message
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: assistantMessage }
          ]);
        }
      }
    }
  } catch (error) {
    // ... error handling
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Markdown Support

Render formatted messages with markdown:

```bash
npm install react-markdown
```

```tsx
import ReactMarkdown from 'react-markdown';

// In your message rendering:
<div className="message-bubble">
  <ReactMarkdown>{msg.content}</ReactMarkdown>
</div>
```

### 4. Typing Indicators

```tsx
const TypingIndicator = () => (
  <div className="flex space-x-2 p-3">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
  </div>
);
```

### 5. Message Timestamps

```tsx
type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// When rendering:
<div className="text-xs text-gray-500 mt-1">
  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
</div>
```

### 6. Quick Actions / Suggested Prompts

```tsx
const QuickActions = ({ onSelect }: { onSelect: (text: string) => void }) => {
  const suggestions = [
    "What beans do you recommend?",
    "How do I brew a pour over?",
    "Show me your bestsellers"
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1 text-sm border rounded-full hover:bg-gray-50"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};
```

## Integration with Existing App

### Next.js Integration

```tsx
// app/layout.tsx or pages/_app.tsx
import CoffeeCopilot from '@/components/CoffeeCopilot';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CoffeeCopilot />
      </body>
    </html>
  );
}
```

### React Router Integration

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CoffeeCopilot from './components/CoffeeCopilot';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your routes */}
      </Routes>
      <CoffeeCopilot />
    </BrowserRouter>
  );
}
```

### Conditional Rendering

Only show on certain pages:

```tsx
import { useLocation } from 'react-router-dom';

export default function CoffeeCopilot() {
  const location = useLocation();
  const allowedPaths = ['/', '/shop', '/products'];

  if (!allowedPaths.includes(location.pathname)) {
    return null;
  }

  // ... rest of component
}
```

## Accessibility

Make the widget accessible:

```tsx
<div
  role="dialog"
  aria-label="Coffee Copilot Chat"
  aria-modal="true"
>
  {/* Header */}
  <div role="banner">
    <h2 className="font-semibold">Coffee Copilot</h2>
  </div>

  {/* Messages */}
  <div
    role="log"
    aria-live="polite"
    aria-atomic="false"
  >
    {messages.map((msg, i) => (
      <div key={i} role="article" aria-label={`${msg.role} message`}>
        {msg.content}
      </div>
    ))}
  </div>

  {/* Input */}
  <div role="form">
    <label htmlFor="chat-input" className="sr-only">
      Type your message
    </label>
    <input
      id="chat-input"
      aria-label="Message input"
      // ... other props
    />
    <button aria-label="Send message">
      Send
    </button>
  </div>
</div>
```

## Performance Optimization

1. **Lazy loading**: Load widget only when needed
2. **Message virtualization**: For long conversations
3. **Debounce typing**: For typing indicators
4. **Memoization**: Use React.memo for message components

```tsx
import { lazy, Suspense } from 'react';

const CoffeeCopilot = lazy(() => import('./components/CoffeeCopilot'));

function App() {
  return (
    <Suspense fallback={null}>
      <CoffeeCopilot />
    </Suspense>
  );
}
```

## Testing

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoffeeCopilot from './CoffeeCopilot';

describe('CoffeeCopilot', () => {
  it('renders initial message', () => {
    render(<CoffeeCopilot />);
    expect(screen.getByText(/Coffee Copilot/i)).toBeInTheDocument();
  });

  it('sends message on button click', async () => {
    render(<CoffeeCopilot />);

    const input = screen.getByPlaceholderText(/Ask about/i);
    const button = screen.getByText(/Send/i);

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });
});
```

## Customization Tips

1. **Brand colors**: Replace gray-900 with your brand color
2. **Typography**: Match your app's font family
3. **Animations**: Add entrance/exit animations with Framer Motion
4. **Position**: Change fixed position (bottom-right, bottom-left, etc.)
5. **Size**: Adjust width and height for mobile/desktop
