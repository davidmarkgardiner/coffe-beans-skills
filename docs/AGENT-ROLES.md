# Stockbridge Coffee — Agent Roles & Responsibilities

> Generated: 2026-03-07 by Scotty's delegate  
> Companion doc: `SKILLS-INVENTORY.md`

---

## 👥 Agent Roster for Stockbridge Coffee

| Agent | Model | Role | Primary Focus |
|-------|-------|------|---------------|
| **Scotty** 🔧 | Claude Opus/Sonnet | Ops & Orchestration Lead | Infrastructure, CI/CD, coordination |
| **Gem** 💎 | Gemini Pro | Content & Creative Lead | AI content generation, visual assets, social media |
| **Kimi** 🧠 | Kimi for Coding | Web & Frontend Lead | Website code, UX, SEO |
| **Codex** 🤖 | GPT Codex | Backend & Integrations Lead | APIs, payments, Firebase logic, testing |

---

## 🔧 Scotty — Ops & Orchestration Lead

### Responsibilities
- Keep the infrastructure running (Firebase, Cloudflare, GitHub Actions)
- Manage secrets securely (Teller + Google Cloud Secret Manager)
- Coordinate multi-agent builds using the orchestration-system skill
- Review and merge PRs after quality gates pass
- Monitor costs and alert if API spend spikes
- Keep `.claude/skills/` up to date after each major build

### Skills Owned
| Skill | Usage |
|-------|-------|
| `orchestration-system` | Kick off multi-AI feature builds |
| `secrets-manager` | Manage all API keys via Teller + GCP |
| `firebase-deployment` | Preview + production deploys |
| `cloudflare-firebase-domain` | DNS, proxy config |
| `docker-containerization` | Containerise any backend services |
| `cicd-pipeline-generator` | Create/update GitHub Actions workflows |
| `github-actions-orchestrator` | Manage complex automation flows |
| `elevenlabs/setup-api-key` | Help onboard new ElevenLabs users |
| `skill-creator` | Create new skills when patterns emerge |

### Daily Tasks
- Check GitHub Actions runs — any failures?
- Verify weekly content workflow ran (Sundays)
- Check ElevenLabs + fal.ai + Gemini API spend
- Review any new PRs from sub-agents

### Weekly Tasks
- Review `output/winners.json` — any content ready for production?
- Rotate secrets if any approaching 90-day mark
- Update `SKILLS-INVENTORY.md` if new skills were added
- Check Firebase Storage quota (free tier: 5GB)

### Monthly Tasks
- Refresh hero video (`coffee-website-react/public/video/hero-optimised.mp4`)
- Review Stoxy conversation logs for quality issues
- Audit all GitHub Actions for cost/efficiency
- Update skill files with lessons learned from past month

---

## 💎 Gem — Content & Creative Lead

### Responsibilities
- Generate and curate all AI content (videos, images, blog posts, social media)
- Maintain the Stockbridge fox mascot brand consistency
- Run the weekly content pipeline (AI Content Manager)
- Draft fox mascot video scripts and review output batches
- Manage newsletter and blog automation
- Handle all ElevenLabs audio (TTS, music, sound effects)

### Skills Owned
| Skill | Usage |
|-------|-------|
| `stockbridge-content` | Fox mascot draft video generation |
| `ai-content-manager` | Weekly seasonal content + blog/newsletter |
| `elevenlabs/text-to-speech` | Voice generation for content |
| `elevenlabs/music` | Background music for videos |
| `elevenlabs/sound-effects` | SFX for video production |
| `elevenlabs/speech-to-text` | Transcribe audio content |
| `social-media-generator` | Instagram/TikTok/LinkedIn posts |
| `script-writer` | Fox mascot scripts, video scripts |
| `storyboard-manager` | Plan video series and campaigns |
| `brand-analyzer` | Audit brand consistency |
| `logo-manager` | Logo asset management |
| `pitch-deck` | If needed for partnerships/investors |
| `business-document-generator` | Partnership proposals, supplier docs |

### Daily Tasks
- Generate 2–3 fox mascot draft videos (during ideation phase)
- Check if any seasonal/trending topics need a quick content piece
- Review previous day's drafts in `output/batch_YYYYMMDD/`

### Weekly Tasks
- Curate blog content: `npm run curate:blog`
- Upload to Firestore: `npm run upload:blog`
- Send newsletter: `npm run send:newsletter`
- Review AI-generated seasonal hero images/videos from Sunday automation
- Pick best content pieces from the week's drafts → log in `output/winners.json`
- Post to social platforms (Instagram Reels, TikTok, YouTube Shorts)

### Monthly Tasks
- Plan next month's content calendar (themes, seasonal events)
- Update seasonal prompts in `ai-content-manager` if season changing
- Refresh fox mascot scripts based on what resonated
- Review ElevenLabs voice settings — is the fox voice still on-brand?
- Produce 2–3 high-quality manual videos from month's best draft concepts

### Content Pillars to Cover (Weekly Rotation)
1. Coffee culture (brewing tips, bean origins, café life)
2. Current events (light topical takes through fox's lens)
3. Seasonal/Edinburgh local (weather, festivals, events)
4. Behind the scenes (day in the life at Stockbridge Coffee)
5. Customer moments (relatable café scenarios)

### Quick Commands
```bash
# Generate 5 draft videos on a topic
python3 .claude/skills/ai-content/stockbridge-content/scripts/generate_batch.py \
  --image coffee-website-react/public/images/stockbridge-fox-poster.webp \
  --ideas 5 \
  --topic "Edinburgh Fringe Festival"

# Full blog + newsletter automation
npm run blog:auto

# Trigger weekly content generation manually
gh workflow run generate-weekly-content.yml

# Single TTS voiceover (Python)
python3 -c "
from elevenlabs.client import ElevenLabs
client = ElevenLabs()
audio = client.text_to_speech.convert(
    text='Good morning Stockbridge!',
    voice_id='gMVEZSWHxpbfIG8MuwDV',
    model_id='eleven_multilingual_v2'
)
open('output.mp3','wb').write(b''.join(audio))
"
```

---

## 🧠 Kimi — Web & Frontend Lead

### Responsibilities
- Maintain and improve the React website (`coffee-website-react/`)
- Implement new UI features and components
- SEO optimisation and structured data markup
- Website performance, accessibility, responsive design
- UI/UX polish and design consistency

### Skills Owned
| Skill | Usage |
|-------|-------|
| `premium-coffee-website` | Build/extend the React+Vite+shadcn site |
| `seo-optimizer` | Meta tags, schema.org, sitemap |
| `frontend-enhancer` | UI polish, colour, spacing |
| `ui-ux-pro-max` | Advanced UX patterns |
| `webapp-testing` | E2E testing with Playwright |

### Daily Tasks
- Monitor for any UI bugs or console errors reported via Stoxy/GitHub Issues
- Check Google Search Console for any SEO drops (weekly is fine)

### Weekly Tasks
- Implement any new features from the backlog
- Review Stoxy conversation logs — are users asking for things the site doesn't have?
- Run E2E tests: `npx playwright test`
- Deploy to preview channel for review before production

### Monthly Tasks
- Full SEO audit using `seo-optimizer` skill
- Accessibility review (ARIA labels, keyboard navigation, screen reader)
- Performance audit (Lighthouse > 85)
- Review `premium-coffee-website` skill for any new design patterns to adopt
- Update hero video once Gem provides new content

### Quick Commands
```bash
# Start dev server
cd coffee-website-react && npm run dev

# Build + type check
npm run build

# Deploy preview
firebase hosting:channel:deploy preview-$(date +%s)

# Run E2E tests
npx playwright test

# Deploy to production (after review)
firebase deploy --only hosting
```

---

## 🤖 Codex — Backend & Integrations Lead

### Responsibilities
- Firebase backend logic (Firestore rules, Cloud Functions if needed)
- Stripe payment processing
- Stoxy voice agent integration and updates
- API integrations (video pipeline scripts, backend services)
- Testing infrastructure
- Technical debt management

### Skills Owned
| Skill | Usage |
|-------|-------|
| `stoxy-agent` | Maintain/upgrade the Stoxy ElevenLabs widget |
| `video-automation` | AI video pipeline scripts |
| `firebase-coffee-integration` | Firestore schema, Auth, orders |
| `stripe-integration` | Payment intents, webhooks, test cards |
| `test-specialist` | Testing patterns, coverage |
| `webapp-testing` | E2E test implementation |
| `data-analyst` | Analyse business/content data |
| `csv-data-visualizer` | Visualise metrics |
| `business-analytics-reporter` | KPI dashboards |
| `codebase-documenter` | Keep code docs up to date |
| `tech-debt-analyzer` | Track and prioritise debt |
| `coffee-copilot` (legacy) | Reference for RAG/order logic if reviving |

### Daily Tasks
- Monitor Firebase for errors (check Firestore rules, Auth issues)
- Check Stripe dashboard for any failed payments or webhooks
- Check Stoxy agent health — any conversation errors?

### Weekly Tasks
- Review video pipeline output quality from Gem's drafts
- Update Stoxy conversation quality if needed (tune ElevenLabs agent settings)
- Run test suite, fix any failures
- Check Firestore quota usage

### Monthly Tasks
- Stripe payment reconciliation review
- Firebase security rules audit
- Consider Stoxy WebRTC upgrade (currently WebSocket — WebRTC has lower latency)
- Tech debt review using `tech-debt-analyzer`
- Update `coffee-copilot` references if Stoxy needs RAG capability added

### Quick Commands
```bash
# Check Stoxy agent (via ElevenLabs dashboard or API)
curl -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/convai/agents/agent_2901khcdrc17fqkv7yvsp3kv0e2k

# Run video pipeline (lip-sync)
python3 .claude/skills/ai-content/video-automation/scripts/hybrid_automation.py \
  --image coffee-website-react/public/images/stockbridge-fox-poster.webp \
  --script "Test script" \
  --voice-id gMVEZSWHxpbfIG8MuwDV

# Firebase deploy rules
firebase deploy --only firestore:rules,storage

# Stripe test webhook
stripe listen --forward-to localhost:3001/webhook
```

---

## 🔄 Collaboration Flow

```
Content ideas
      │
      ▼
   Gem 💎
   (draft videos, blog, social)
      │
      ├──► Kimi 🧠 (hero video ready → update website)
      │
      └──► Scotty 🔧 (winners.json → coordinate production workflow)

Feature requests
      │
      ▼
  Scotty 🔧
  /orchestrate build specs/feature.md
      │
      ├──► Claude (frontend tasks)
      ├──► Gemini (Google API tasks)
      └──► ChatGPT review (quality ≥ 85/100)
            │
            ▼
         Kimi 🧠 (deploy to production)
               │
               ▼
            Codex 🤖 (tests pass, Firebase/Stripe healthy)
```

---

## 📅 Automation Schedule

| Day/Time | What Runs | Who Monitors |
|----------|-----------|-------------|
| Sunday 2:00 AM UTC | Blog curation + newsletter send | Gem |
| Sunday 3:00 AM UTC | Weekly hero video + photos (Gemini/Veo) | Gem |
| Any PR | Firebase preview channel deploy | Kimi |
| Monthly | Hero video refresh | Scotty coordinates Gem + Kimi |
| Quarterly | Secret rotation (ElevenLabs, Stripe, etc.) | Scotty |

---

## 🎯 North Star Metrics

The agents should optimise for:

1. **Content velocity** — 2–3 quality fox videos posted per week
2. **Website performance** — Lighthouse ≥ 85, Core Web Vitals green
3. **Conversion** — Stripe orders, newsletter signups
4. **Stoxy engagement** — Conversations started, issues resolved
5. **SEO** — Organic search growth for "Stockbridge Coffee Edinburgh"

---

*Last updated: 2026-03-07 | Maintained by: Scotty 🔧*
