# Stoxy Knowledge Base Skill

Manage and update the knowledge base for Stoxy — the Stockbridge Coffee ElevenLabs conversational AI voice agent (the fox mascot).

## When to Use

- Updating product information, pricing, or bean details
- Adding new brewing methods or guides
- Changing FAQ content (shipping, returns, subscriptions)
- Pushing knowledge base updates to the live ElevenLabs agent
- Reviewing or auditing what Stoxy knows

## Files

| File | Purpose |
|------|---------|
| `knowledge-base.md` | The complete knowledge document — edit this first |
| `upload-to-elevenlabs.sh` | Script to push knowledge base to ElevenLabs agent API |
| `SKILL.md` | This file — agent guidance |

## Agent Details

- **Agent Name:** Stoxy
- **ElevenLabs Agent ID:** `agent_2901khcdrc17fqkv7yvsp3kv0e2k`
- **API Endpoint:** `PATCH /v1/convai/agents/{agent_id}`
- **Related Skill:** `.claude/skills/ai-agents/stoxy-agent/SKILL.md` (widget integration)

## Workflow: Updating the Knowledge Base

### Step 1 — Edit the knowledge document

```bash
# Edit the knowledge base
$EDITOR .claude/skills/ai-agents/stoxy-knowledge-base/knowledge-base.md
```

Key sections to keep current:
- **Section 2** — Current bean / product details + pricing
- **Section 3** — Brewing guides (rarely changes)
- **Section 5** — Personality & ordering behaviour rules
- **Section 6** — FAQ (shipping costs, policies, subscriptions)

### Step 2 — Get the ElevenLabs API key

```bash
ELEVENLABS_API_KEY=$(/opt/google-cloud-sdk/bin/gcloud secrets versions access latest --secret=elevenlabs-api-key)
```

### Step 3 — Upload to ElevenLabs

```bash
cd .claude/skills/ai-agents/stoxy-knowledge-base/
ELEVENLABS_API_KEY=$(...) bash upload-to-elevenlabs.sh
```

### Step 4 — Verify

After uploading, test Stoxy on the website at stockbridgecoffee.co.uk. Ask it a product question and a brewing question to confirm the knowledge has updated.

## ElevenLabs API Reference

### Update Agent (PATCH)

```bash
curl -X PATCH \
  "https://api.elevenlabs.io/v1/convai/agents/agent_2901khcdrc17fqkv7yvsp3kv0e2k" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_config": {
      "agent": {
        "prompt": {
          "prompt": "<knowledge base content here>"
        }
      }
    }
  }'
```

### Get Agent (GET)

```bash
curl "https://api.elevenlabs.io/v1/convai/agents/agent_2901khcdrc17fqkv7yvsp3kv0e2k" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" | jq '.conversation_config.agent.prompt'
```

## Notes

- The knowledge base is embedded in the **agent system prompt** via the API
- Changes take effect immediately after a successful PATCH — no redeploy needed
- The ElevenLabs agent connects directly from the browser via WebRTC/WebSocket
- API key secret name in GCloud: `elevenlabs-api-key`

## Common Issues

| Issue | Fix |
|-------|-----|
| 401 Unauthorized | Check API key is valid and not expired |
| Agent not reflecting changes | Wait 30s and test again; clear browser cache |
| Voice doesn't match knowledge | Verify the PATCH response shows 200 OK |
