# Stockbridge Coffee — Project Status

*Last updated: 2026-03-06*

## 🏪 Business Overview
- **Name:** Stockbridge Coffee
- **Location:** Stockbridge, Edinburgh, Scotland
- **Product:** Honduras SHG Monte Cristo Mountain, medium roast, 200g bags
- **Price range:** £12-18 per 250g (ultra-premium segment)
- **Website:** stockbridgecoffee.co.uk
- **Email:** stockbridgecoffee@gmail.com / hello@stockbridgecoffee.co.uk
- **Social:** @stockbridgecoffee_edinburgh
- **Mascot:** The Stockbridge Fox 🦊

## ✅ What's Built

### Website (React + Vite + Tailwind)
- Full e-commerce site with product pages
- Firebase backend (Firestore for data, Firebase Auth)
- Stripe payments integration (currently test mode)
- Google Maps store location
- AI content generation (@google/genai)
- Skills system for Claude Code development

### Automations (Existing)
- ✅ Gmail inbox monitoring (every 15 min) — auto-drafts responses
- ✅ Newsletter sync (Firestore → Google Contacts, daily)
- ✅ Firebase credentials in Secret Manager
- ✅ Gmail OAuth credentials in Secret Manager

### Trigger.dev Stubs (Partially Built)
- `daily-buy.ts` — Daily Playwright checkout test (stub, needs implementation)
- `inventory.ts` — Hourly stock level check (stub, needs Firebase integration)
- `newsletter.ts` — Weekly newsletter draft (stub, needs Gmail API integration)
- K8s deployment manifest ready at `infrastructure/trigger-dev/`

### Brand Assets
- Competitive research (15+ UK specialty roasters)
- Color palette defined
- Packaging design (200g bags with roast date/batch stickers)
- Fox mascot video clips generated (1080p walking animations)
- Logo variants created

## 🔴 Launch Blocklist

### P0 — Must Have for Launch
| # | Task | Agent | Status |
|---|------|-------|--------|
| 1 | Website final polish (copy, images, About page) | Kimi/web | 🔄 In audit |
| 2 | Stripe test → live switch + webhook verification | Kimi/web | 🔄 In audit |
| 3 | Daily automated checkout test (Playwright) | Kimi/web | 🔄 Being written |
| 4 | Inventory tracking ("Bean Ledger" in Firestore) | Codex/stock | 🔄 Being built |
| 5 | Critical alerting (site down, stock low, Stripe errors) | Scotty | ✅ Draft |

### P1 — First Week After Launch
| # | Task | Agent | Status |
|---|------|-------|--------|
| 6 | Content engine (1 reel/week, fox clips, social schedule) | Gem/content | ✅ Planned |
| 7 | Newsletter system (weekly, welcome email, re-engagement) | Scotty/newsletter | ✅ Planned |
| 8 | Analytics (PostHog or Plausible) | Scotty/analytics | 📋 TODO |
| 9 | Low stock alerts (Telegram notification) | Codex/stock | 🔄 Being built |

### P2 — Growth Phase
| # | Task | Agent | Status |
|---|------|-------|--------|
| 10 | B2B local outreach (EH3/EH4 businesses) | Scotty/email + Codex/research | ✅ Planned |
| 11 | SEO optimization | Kimi/seo | 📋 TODO |
| 12 | Voice re-ordering (ElevenLabs + Stripe) | Kimi/web | 📋 Designed |
| 13 | Subscription/Coffee Club model | Kimi/web + Scotty/finance | 📋 TODO |
| 14 | Abandoned cart nudges | Scotty/email | 📋 TODO |

## 🤖 Agent Team

### Command Center Agents (via OpenClaw gateways)
| Gateway | Agent | Coffee Business Role |
|---------|-------|---------------------|
| Scotty | email-mgr | Customer emails, supplier comms, outreach |
| Scotty | newsletter-mgr | Weekly newsletters, subscriber management |
| Scotty | analytics-mgr | Revenue dashboards, KPIs, PostHog |
| Codex | stock-inventory | Bean Ledger, reorder alerts, waste tracking |
| Codex | market-research | Competitor pricing, trends, new products |
| Gem | content-writer | Blog posts, product descriptions, social copy |
| Gem | video-creator | Fox clips, product videos, reels |
| Kimi | web | Storefront features, checkout, site speed |
| Kimi | seo | Google Business, schema markup, local SEO |

## 📁 Key File Locations

### Codebase
- Website: `~/clawd/projects/coffe-beans-skills/coffee-website-react/`
- Apps: `~/clawd/projects/coffe-beans-skills/apps/`
- Skills: `~/clawd/projects/coffe-beans-skills/.claude/skills/`

### Obsidian (Planning & Brand)
- Launch plan: `~/obsidian-vault/08-Stockbridge-Coffee/Stockbridge-Launch-Master.md`
- Operations: `~/obsidian-vault/08-Stockbridge-Coffee/Stockbridge-Coffee-Operations.md`
- Automations: `~/obsidian-vault/08-Stockbridge-Coffee/automation/`
- Brand research: `~/obsidian-vault/Coffee Business/research.md`
- Packaging: `~/obsidian-vault/Coffee Business/packaging.md`
- Voice ordering: `~/obsidian-vault/08-Stockbridge-Coffee/11labs.md`

### Secrets (Google Cloud Secret Manager)
- `GMAIL_COFFEE_CLIENT_ID`
- `GMAIL_COFFEE_CLIENT_SECRET`
- `GMAIL_COFFEE_REFRESH_TOKEN`
- `COFFEE_FIREBASE_SERVICE_ACCOUNT`

## 🏗️ Architecture

```
Customer → stockbridgecoffee.co.uk (Firebase Hosting)
              ↓
         React + Vite + Tailwind (frontend)
              ↓
         Firebase (Auth, Firestore, Functions)
              ↓
         Stripe (Payments, Webhooks)
              ↓
         Command Center (Agent orchestration)
         ├── Scotty (ops, email, newsletter)
         ├── Codex (inventory, analytics)
         ├── Gem (content, social)
         └── Kimi (web dev, SEO)
              ↓
         Telegram (alerts to David)
```

## 🗓️ Voice Re-ordering (Future)
Architecture designed in `11labs.md`:
1. User creates account + saves Stripe payment method
2. ElevenLabs voice agent handles reorder intent
3. Backend charges saved card via Stripe off-session
4. Confirmation by voice + email
- Requires: `setup_future_usage: "off_session"` on initial Stripe setup
