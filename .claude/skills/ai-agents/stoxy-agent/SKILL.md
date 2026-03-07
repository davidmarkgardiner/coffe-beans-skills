# Stoxy Agent Skill

Manage the Stoxy conversational AI mascot powered by ElevenLabs.

## When to Use

- Adding, updating, or configuring the Stoxy voice agent on the website
- Changing the ElevenLabs agent ID or integration method
- Customizing Stoxy's behavior, appearance, or voice settings
- Troubleshooting the conversational AI widget
- Migrating between ElevenLabs integration methods (widget, React SDK, WebSocket, WebRTC)

## Agent Details

- **Name**: Stoxy
- **Agent ID**: `agent_2901khcdrc17fqkv7yvsp3kv0e2k`
- **Provider**: ElevenLabs Conversational AI
- **Current Integration**: Embeddable CDN Widget

## File Locations

- **Component**: `coffee-website-react/src/components/StoxyAgent.tsx`
- **Used in**: `coffee-website-react/src/App.tsx`
- **Replaced**: `coffee-website-react/src/components/CoffeeCopilot.tsx` (legacy text chat)

## Current Integration Method: React SDK (@elevenlabs/react)

Custom-styled widget using `useConversation` hook for full UI control.

**Brand colors used:**
- Dark green `#212f1f` — header, button, orb
- Tan `#A89175` — avatar, accents, border
- Cream `#F5F0E8` — body background
- Hover tan `#8F7B62` — end conversation button

**Key features:**
- Floating mic button (bottom-right) with branded colors
- Expandable panel with greeting: "Hi, I'm Stoxy!"
- Visual states: closed, open (idle), listening, speaking
- Animated pulsing orb during active conversation

```tsx
import { useConversation } from "@elevenlabs/react";
// Provides: startSession, endSession, status, isSpeaking
// Supports: WebRTC (lower latency) or WebSocket
// Features: sendUserMessage, sendContextualUpdate, setVolume, clientTools
```

## Alternative Integration Methods

### WebRTC (for production low-latency)

Requires server-side token generation:

```
POST https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=agent_2901khcdrc17fqkv7yvsp3kv0e2k
Header: xi-api-key: <ELEVENLABS_API_KEY>
```

Then pass `conversationToken` to the React SDK with `connectionType: "webrtc"`.

### Direct WebSocket

```
wss://api.elevenlabs.io/v1/convai/conversation?agent_id=agent_2901khcdrc17fqkv7yvsp3kv0e2k
```

Handle message types: `user_transcript`, `agent_response`, `audio`, `ping/pong`.

## Customization Options

The widget and React SDK support overrides:

- `prompt` — custom system prompt
- `firstMessage` — greeting message
- `language` — conversation language
- `voiceId` — ElevenLabs voice ID
- `clientTools` — client-side functions the agent can invoke

## Environment Variables

If upgrading to React SDK or WebRTC:

- `ELEVENLABS_API_KEY` — required for server-side token generation
- Add to `.env` and secrets manager

## Gotchas

- The CDN widget script should only be loaded once (use an ID check)
- The `elevenlabs-convai` custom element needs JSX type declarations for TypeScript
- Widget requires microphone permissions for voice interaction
- WebRTC has lower latency than WebSocket but requires server-side token auth

## Migration Notes

- Stoxy replaced the old CoffeeCopilot text chat widget (March 2026)
- CoffeeCopilot.tsx is still in the codebase but no longer imported
- The old copilot used a custom backend API (`VITE_COPILOT_API_URL`); Stoxy connects directly to ElevenLabs
