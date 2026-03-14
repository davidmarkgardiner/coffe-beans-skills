#!/usr/bin/env bash
# upload-to-elevenlabs.sh
# Push the Stoxy knowledge base to the ElevenLabs Conversational AI agent
#
# Usage:
#   ELEVENLABS_API_KEY=<key> bash upload-to-elevenlabs.sh
#
# Or with GCloud secrets (recommended):
#   ELEVENLABS_API_KEY=$(/opt/google-cloud-sdk/bin/gcloud secrets versions access latest --secret=elevenlabs-api-key) \
#     bash upload-to-elevenlabs.sh

set -euo pipefail

AGENT_ID="agent_2901khcdrc17fqkv7yvsp3kv0e2k"
KNOWLEDGE_BASE_FILE="$(dirname "$0")/knowledge-base.md"
API_BASE="https://api.elevenlabs.io/v1"

# ── Validate API key ────────────────────────────────────────────────────────

if [[ -z "${ELEVENLABS_API_KEY:-}" ]]; then
  echo "❌ ELEVENLABS_API_KEY is not set."
  echo ""
  echo "Set it with:"
  echo "  export ELEVENLABS_API_KEY=\$(/opt/google-cloud-sdk/bin/gcloud secrets versions access latest --secret=elevenlabs-api-key)"
  echo "  bash upload-to-elevenlabs.sh"
  exit 1
fi

# ── Validate knowledge base file ────────────────────────────────────────────

if [[ ! -f "$KNOWLEDGE_BASE_FILE" ]]; then
  echo "❌ Knowledge base file not found: $KNOWLEDGE_BASE_FILE"
  exit 1
fi

echo "📖 Loading knowledge base from: $KNOWLEDGE_BASE_FILE"
KB_CONTENT=$(cat "$KNOWLEDGE_BASE_FILE")
KB_SIZE=$(wc -c < "$KNOWLEDGE_BASE_FILE")
echo "   Size: ${KB_SIZE} bytes"

# ── Build the system prompt ─────────────────────────────────────────────────
# We embed the knowledge base into the agent's system prompt.
# The preamble sets Stoxy's core identity before the knowledge base content.

SYSTEM_PROMPT="You are Stoxy, the Stockbridge Coffee fox mascot — a friendly, knowledgeable, and slightly cheeky voice assistant for Stockbridge Coffee.

You speak naturally and warmly, like a favourite local barista. You are Scottish-adjacent in your tone — genuine and welcoming, not a caricature. Keep your responses short and conversational, as this is a voice interface. Avoid bullet points and long lists — speak naturally.

Your primary job is to help customers with:
- Coffee brewing advice and recommendations
- Product information and ordering
- Shipping, freshness, and storage questions
- Re-ordering for logged-in customers

Always encourage customers to log in or create an account for easy re-ordering.

If you don't know something, say: \"I'm not sure on that one — drop us an email at hello@stockbridgecoffee.co.uk and we'll get back to you.\"

---

KNOWLEDGE BASE:

${KB_CONTENT}"

# ── Escape for JSON ─────────────────────────────────────────────────────────

# Use Python to safely JSON-encode the prompt (handles newlines, quotes, etc.)
ENCODED_PROMPT=$(python3 -c "
import json, sys
content = sys.stdin.read()
print(json.dumps(content))
" <<< "$SYSTEM_PROMPT")

# ── Build the PATCH payload ─────────────────────────────────────────────────

JSON_PAYLOAD=$(cat <<EOF
{
  "conversation_config": {
    "agent": {
      "prompt": {
        "prompt": ${ENCODED_PROMPT}
      },
      "first_message": "Hey there! I'm Stoxy, your Stockbridge Coffee guide. Whether you're after brewing tips, want to know about our current bean, or fancy placing an order — I'm all ears. What can I help you with?",
      "language": "en"
    }
  }
}
EOF
)

# ── Upload to ElevenLabs ────────────────────────────────────────────────────

echo ""
echo "🚀 Uploading knowledge base to ElevenLabs agent: $AGENT_ID"
echo "   Endpoint: PATCH ${API_BASE}/convai/agents/${AGENT_ID}"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X PATCH \
  "${API_BASE}/convai/agents/${AGENT_ID}" \
  -H "xi-api-key: ${ELEVENLABS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${JSON_PAYLOAD}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

# ── Result ──────────────────────────────────────────────────────────────────

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "✅ Knowledge base uploaded successfully! (HTTP $HTTP_CODE)"
  echo ""
  echo "   Agent ID: $AGENT_ID"
  echo "   Changes take effect immediately."
  echo ""
  echo "🦊 Test Stoxy at: https://stockbridgecoffee.co.uk"
elif [[ "$HTTP_CODE" == "401" ]]; then
  echo "❌ Authentication failed (HTTP 401) — check your API key."
  echo "   Response: $BODY"
  exit 1
elif [[ "$HTTP_CODE" == "404" ]]; then
  echo "❌ Agent not found (HTTP 404) — check the agent ID."
  echo "   Agent ID: $AGENT_ID"
  echo "   Response: $BODY"
  exit 1
else
  echo "❌ Upload failed (HTTP $HTTP_CODE)"
  echo "   Response: $BODY"
  exit 1
fi

# ── Optional: verify the upload ─────────────────────────────────────────────

echo "🔍 Verifying upload..."
VERIFY=$(curl -s \
  "${API_BASE}/convai/agents/${AGENT_ID}" \
  -H "xi-api-key: ${ELEVENLABS_API_KEY}")

PROMPT_PREVIEW=$(python3 -c "
import json, sys
data = json.load(sys.stdin)
prompt = data.get('conversation_config', {}).get('agent', {}).get('prompt', {}).get('prompt', '')
print(prompt[:200] + '...' if len(prompt) > 200 else prompt)
" <<< "$VERIFY" 2>/dev/null || echo "(could not parse response)")

echo ""
echo "   Prompt preview:"
echo "   $PROMPT_PREVIEW"
echo ""
echo "✅ Done!"
