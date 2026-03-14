# Stockbridge Coffee — Skills Inventory

> Generated: 2026-03-07 by Scotty's delegate  
> Source: `.claude/skills/` directory tree  
> Purpose: Agent reference — what skills exist, who owns them, how to use them

---

## 📊 Master Skills Table

| Skill | Category | Purpose | API Keys Required | Owner Agent | Status |
|-------|----------|---------|------------------|-------------|--------|
| **setup-api-key** | ai-content/elevenlabs | Guide users to obtain & store ElevenLabs API key | None (setup tool) | Scotty | ✅ Ready |
| **text-to-speech** | ai-content/elevenlabs | Convert text → spoken audio (74+ languages) | `ELEVENLABS_API_KEY` | Gem | ✅ Ready |
| **speech-to-text** | ai-content/elevenlabs | Transcribe audio/video → text (Scribe v2, 90+ languages) | `ELEVENLABS_API_KEY` | Gem | ✅ Ready |
| **music** | ai-content/elevenlabs | Generate AI music/jingles from text prompts | `ELEVENLABS_API_KEY` | Gem | ✅ Ready |
| **sound-effects** | ai-content/elevenlabs | Generate sound FX from text descriptions | `ELEVENLABS_API_KEY` | Gem | ✅ Ready |
| **stockbridge-content** | ai-content | Draft fox mascot videos for social media | `ELEVENLABS_API_KEY`, `FAL_API_KEY` | Gem | ✅ Ready |
| **video-automation** | ai-content | Full AI video pipeline (TTS + lip-sync + SFX + FFmpeg) | `ELEVENLABS_API_KEY` + pipeline-specific | Codex | ✅ Ready |
| **stoxy-agent** | ai-agents | Stoxy voice AI widget on website (ElevenLabs Conversational AI) | `ELEVENLABS_API_KEY` | Codex | ✅ Ready |
| **ai-content-manager** | ai-content | Weekly AI-generated seasonal images/videos + blog/newsletter automation | `GEMINI_API_KEY`, Firebase secrets, Gmail OAuth | Gem | ✅ Ready |
| **orchestration-system** | ai-content | Multi-AI build orchestration (Claude + Gemini + ChatGPT review loop) | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` | Scotty | ✅ Ready |
| **coffee-copilot** | ai-content | Legacy text chat copilot (RAG + order management + GitHub issues) | `OPENAI_API_KEY`, `GITHUB_TOKEN` | Codex | ⚠️ Legacy (replaced by Stoxy) |
| **firebase-coffee-integration** | firebase | Firestore inventory, Auth, orders, real-time stock | Firebase project secrets | Codex | ✅ Ready |
| **firebase-deployment** | firebase | Preview channels, CI/CD, production deploy | Firebase CLI token | Scotty | ✅ Ready |
| **cloudflare-firebase-domain** | firebase | DNS setup, Cloudflare proxy config for Firebase hosting | Cloudflare API token | Scotty | ✅ Ready |
| **premium-coffee-website** | web-builder | Build React+shadcn+Tailwind+Vite coffee website | None | Kimi | ✅ Ready |
| **seo-optimizer** | web-builder | SEO, schema markup, meta tags, structured data | None | Kimi | ✅ Ready |
| **frontend-enhancer** | web-builder | UI/UX polish, colour palettes, design principles | None | Kimi | ✅ Ready |
| **logo-manager** | web-builder | Logo asset management, hero redesigns, dark mode | None | Gem | ✅ Ready |
| **ui-ux-pro-max** | web-builder | Advanced UI/UX patterns | None | Kimi | ✅ Ready |
| **stripe-integration** | payments | Stripe payment intents, webhooks, test cards | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` | Codex | ✅ Ready |
| **secrets-manager** | devops | Teller + Google Cloud Secret Manager setup | GCP credentials | Scotty | ✅ Ready |
| **docker-containerization** | devops | Dockerfile, build/push/run scripts | Docker registry creds | Scotty | ✅ Ready |
| **cicd-pipeline-generator** | devops | GitHub Actions CI/CD workflow generation | GitHub Actions secrets | Scotty | ✅ Ready |
| **github-actions-orchestrator** | devops | Orchestrate complex GitHub Actions workflows | GitHub token | Scotty | ✅ Ready |
| **test-specialist** | devops | Testing patterns, bug analysis, test coverage | None | Codex | ✅ Ready |
| **webapp-testing** | devops | E2E web app testing (Playwright etc.) | None | Codex | ✅ Ready |
| **brand-analyzer** | business | Brand audit, archetype analysis, guidelines | None | Gem | ✅ Ready |
| **business-document-generator** | business | Contracts, proposals, business docs | None | Gem | ✅ Ready |
| **finance-manager** | business | Financial frameworks, reporting | None | Gem | ✅ Ready |
| **pitch-deck** | business | Investor pitch deck creation | None | Gem | ✅ Ready |
| **startup-validator** | business | Validate business ideas, market research | None | Gem | ✅ Ready |
| **research-paper-writer** | business | IEEE/ACM formatted research papers | None | Gem | ✅ Ready |
| **social-media-generator** | content-creation | Instagram/Twitter/LinkedIn/Facebook post templates | None | Gem | ✅ Ready |
| **script-writer** | content-creation | Video/podcast/ad scripts | None | Gem | ✅ Ready |
| **storyboard-manager** | content-creation | Storyboard and character development | None | Gem | ✅ Ready |
| **data-analyst** | data | Data analysis, imputation, statistical methods | None | Codex | ✅ Ready |
| **csv-data-visualizer** | data | CSV → charts and visualisations | None | Codex | ✅ Ready |
| **business-analytics-reporter** | data | Business KPIs, reporting dashboards | None | Codex | ✅ Ready |
| **codebase-documenter** | dev-tools | Auto-generate README, API docs, architecture docs | None | Codex | ✅ Ready |
| **document-skills (docx/pdf/pptx/xlsx)** | dev-tools | Generate Office/PDF documents programmatically | None | Codex | ✅ Ready |
| **skill-creator** | dev-tools | Create new `.claude/skills` from scratch | None | Scotty | ✅ Ready |
| **tech-debt-analyzer** | dev-tools | Identify and document technical debt | None | Codex | ✅ Ready |

---

## 🎯 AI Content Skills — Deep Dive

These are the core new skills for the Stockbridge Coffee content engine.

### ElevenLabs Suite

| Skill | Path | Quick-Start |
|-------|------|-------------|
| setup-api-key | `.claude/skills/ai-content/elevenlabs/setup-api-key/` | Walk user through https://elevenlabs.io/app/settings/api-keys and save to `.env` |
| text-to-speech | `.claude/skills/ai-content/elevenlabs/text-to-speech/` | `client.text_to_speech.convert(text=..., voice_id=..., model_id=...)` |
| speech-to-text | `.claude/skills/ai-content/elevenlabs/speech-to-text/` | `client.speech_to_text.convert(file=audio_file, model_id="scribe_v2")` |
| music | `.claude/skills/ai-content/elevenlabs/music/` | `client.music.compose(prompt=..., music_length_ms=30000)` |
| sound-effects | `.claude/skills/ai-content/elevenlabs/sound-effects/` | `client.text_to_sound_effects.convert(text=..., duration_seconds=5)` |

**Stockbridge-specific voice ID:** `gMVEZSWHxpbfIG8MuwDV`  
**All ElevenLabs skills require:** `ELEVENLABS_API_KEY` in `.env`

---

### Stockbridge Content Generator

**Path:** `.claude/skills/ai-content/stockbridge-content/`  
**Purpose:** Idea machine for the fox mascot — cheap draft videos for review, winners go to manual production  
**Cost:** ~$0.25–0.30 per draft video  
**Website:** https://stockbridgecoffee.co.uk/

```bash
# Single draft video
python3 .claude/skills/ai-content/video-automation/scripts/hybrid_automation.py \
  --image coffee-website-react/public/images/stockbridge-fox-poster.webp \
  --script "Morning everyone! ..."

# Batch of ideas
python3 .claude/skills/ai-content/stockbridge-content/scripts/generate_batch.py \
  --image coffee-website-react/public/images/stockbridge-fox-poster.webp \
  --ideas 5 \
  --topic "monday morning coffee"

# Log a winner for manual production
python3 .claude/skills/ai-content/stockbridge-content/scripts/log_winner.py \
  --video output/batch_20260307/video_001.mp4 \
  --notes "Great energy, take to Midjourney"
```

**Fox mascot assets:**
- `coffee-website-react/public/images/stockbridge-fox-poster.webp`
- `coffee-website-react/public/images/stockbridge-fox-logo.png`
- `coffee-website-react/public/images/stockbridge-fox-green.png`

---

### Video Automation Pipeline

**Path:** `.claude/skills/ai-content/video-automation/`  
**Required:** `python3`, `ffmpeg`, `ELEVENLABS_API_KEY`

| Script | Pipeline | Extra Keys |
|--------|----------|-----------|
| `hybrid_automation.py` | ElevenLabs TTS + fal.ai OmniHuman lip-sync | `FAL_API_KEY` |
| `gemini_automation.py` | Gemini Image + Veo 3.1 + Artlist + ElevenLabs | `GEMINI_API_KEY`, `ARTLIST_API_KEY` |
| `ai_video_automation.py` | OpenAI DALL-E + Runway + ElevenLabs | `OPENAI_API_KEY`, `RUNWAY_API_KEY` |
| `quick_example.py` | Add voice to existing video / list voices | `ELEVENLABS_API_KEY` |

```bash
# Setup
./scripts/setup.sh

# List voices
python3 scripts/quick_example.py voices

# Lip-sync talking head video
python3 scripts/hybrid_automation.py \
  --image character.png \
  --script "Hello from Stockbridge!" \
  --voice-id gMVEZSWHxpbfIG8MuwDV
```

---

### Stoxy Voice Agent

**Path:** `.claude/skills/ai-agents/stoxy-agent/`  
**Agent ID:** `agent_2901khcdrc17fqkv7yvsp3kv0e2k`  
**Component:** `coffee-website-react/src/components/StoxyAgent.tsx`  
**Integration:** `@elevenlabs/react` — `useConversation` hook  

Stoxy replaced the legacy CoffeeCopilot text chat (March 2026). It's a floating mic button bottom-right, styled in Stockbridge brand colours.

```tsx
import { useConversation } from "@elevenlabs/react";
// Provides: startSession, endSession, status, isSpeaking
```

For production (lower latency), upgrade to WebRTC with server-side token generation:
```
POST https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=agent_2901khcdrc17fqkv7yvsp3kv0e2k
```

---

### AI Content Manager

**Path:** `.claude/skills/ai-content/ai-content-manager/`  
**Purpose:** Weekly automated seasonal content (Gemini/Veo images + videos) + blog curation + Gmail newsletter

**Quick setup:**
```bash
# Firebase storage + Firestore structure
bash .claude/skills/ai-content-manager/scripts/setup_firebase_content.sh

# Generate content manually
node scripts/generate_content.js --season=spring

# Trigger GitHub Actions workflow
gh workflow run generate-weekly-content.yml

# Blog: curate → upload → send newsletter
npm run curate:blog
npm run upload:blog
npm run send:newsletter
# or all-in-one:
npm run blog:auto
```

**Required secrets:**
- `GEMINI_API_KEY`
- Firebase credentials (7 vars)
- `GMAIL_USER`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`

**Runs automatically:** Sundays 3:00 AM UTC (content) + Sundays 2:00 AM UTC (blog/newsletter)

**Cost:** ~$1.50/month total

---

### Orchestration System

**Path:** `.claude/skills/ai-content/orchestration-system/`  
**Purpose:** Multi-AI build system: Claude (frontend) + Gemini (Google APIs) + ChatGPT (quality review 85+/100)

```bash
/orchestrate build specs/feature-name.md
/orchestrate feature "Add X to the site"
/orchestrate fix "Bug description"
/test-local
/test-preview
/test-production
/review
/learn
```

**Required:** `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`  
**Known issue:** Python `openai`/`pydantic_core` architecture mismatch (arm64 vs x86_64) — use manual review mode as fallback.

---

### Coffee Copilot (Legacy)

**Path:** `.claude/skills/ai-content/coffee-copilot/`  
**Status:** ⚠️ Replaced by Stoxy in March 2026. Keep for RAG/order management reference.  
**If reviving:** `OPENAI_API_KEY` + vector DB + `GITHUB_TOKEN`

---

## 🔧 Infrastructure Skills

### Firebase Stack

| Skill | Purpose | Quick-Start |
|-------|---------|-------------|
| **firebase-coffee-integration** | Firestore inventory, Auth, orders | `firebase init` + follow skill |
| **firebase-deployment** | Preview channels, prod deploy, CI/CD | `firebase hosting:channel:deploy preview-$(date +%s)` |
| **cloudflare-firebase-domain** | DNS + Cloudflare proxy | `./scripts/cloudflare-dns-setup.sh` |

### Secrets Management

```bash
# Init Teller config
bash .claude/skills/devops/secrets-manager/scripts/init_teller.sh

# Sync from Google Cloud Secret Manager to .env
bash .claude/skills/devops/secrets-manager/scripts/sync_secrets.sh

# Merge multiple .env files
bash .claude/skills/devops/secrets-manager/scripts/merge_env.sh
```

---

## 🚨 Gaps & Recommendations

| Gap | Priority | Recommendation |
|-----|----------|----------------|
| No TikTok/Instagram direct posting skill | High | Build social-media-poster skill using TikTok API + Meta Graph API |
| No analytics/reporting skill for content performance | Medium | Build a content-analytics skill using Firebase Analytics + GA4 |
| No Midjourney integration | Medium | Add midjourney skill for high-quality fox image generation |
| Gmail OAuth refresh tokens expire | High | Set up quarterly rotation reminder + document re-auth steps |
| Python architecture mismatch in orchestration | Medium | Pin correct Python env or use Docker for orchestration scripts |
| No Artlist API key documented | Low | `ARTLIST_API_KEY` needed for gemini_automation.py — contact enterprise-api-support@artlist.io |
| Hero video refresh not automated | Medium | Add hero video to weekly GitHub Actions workflow |
| Stoxy WebRTC upgrade not done | Low | Still using WebSocket; upgrade to WebRTC for lower latency in production |
| Blog seasonal prompt not auto-updated | Medium | Automate season detection in `curate-blog-content.ts` (script says "update manually") |
| No skill for ElevenLabs Conversational AI dashboard config | Low | Document how to update Stoxy's system prompt and personality in ElevenLabs dashboard |

---

## 🔑 Environment Variables Master List

All secrets for the coffee project:

```bash
# ElevenLabs
ELEVENLABS_API_KEY=

# fal.ai (video generation)
FAL_API_KEY=

# Google / Gemini
GEMINI_API_KEY=

# OpenAI (orchestration, legacy copilot)
OPENAI_API_KEY=

# Runway ML (ai_video_automation.py)
RUNWAY_API_KEY=

# Artlist (gemini_automation.py music)
ARTLIST_API_KEY=

# Firebase (7 vars)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Stripe
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=

# Gmail (newsletter)
GMAIL_USER=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=

# GitHub Actions (CI/CD)
GITHUB_TOKEN=

# Google Maps (if LocationMap is used)
VITE_GOOGLE_MAPS_API_KEY=

# Cloudflare (DNS setup)
CLOUDFLARE_API_TOKEN=
```

All production secrets should be stored in **Google Cloud Secret Manager** and injected via Teller or GitHub Actions secrets. Never commit to git.

---

*Last updated: 2026-03-07 | Maintained by: Scotty 🔧*
