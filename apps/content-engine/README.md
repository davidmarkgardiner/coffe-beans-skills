# Content Engine — Stockbridge Coffee 🦊

## Overview
Automated content creation and scheduling for Stockbridge Coffee's social media and marketing.

## The Fox Mascot
The "Stockbridge Fox" is the brand mascot — a fox that walks through Edinburgh's Stockbridge neighborhood. Video clips already generated and stored in Obsidian.

**Asset locations:**
- `~/obsidian-vault/Coffee Business/Fox_walking_across_1080p_*.mp4` — Walking clips
- `~/obsidian-vault/Coffee Business/logo/` — Logo variants

## Content Calendar

### Weekly Schedule
| Day | Content Type | Platform | Agent |
|-----|-------------|----------|-------|
| Monday | Roast day behind-the-scenes | Instagram Stories | Gem |
| Wednesday | Brewing tip / Coffee fact | Instagram + X | Gem |
| Friday | Product feature / New arrival | Instagram + Website blog | Gem |
| Sunday | Newsletter draft (for Monday send) | Email | Scotty/newsletter-mgr |

### Monthly
- 1x Product launch post (when new beans arrive)
- 1x Customer spotlight / review feature
- 1x "Origin story" — Honduras farm/region feature

## Content Types

### 1. Social Media Posts
- Product photography (AI-generated via nano-banana-pro skill)
- Fox mascot clips with coffee captions
- Brewing guides with step-by-step images
- Behind-the-scenes roasting content

### 2. Blog Posts (SEO)
- Coffee origin stories (Honduras regions: Marcala, Copan)
- Brewing method guides (V60, AeroPress, French Press)
- "Why single-origin?" educational content
- Local Edinburgh coffee culture

### 3. Email Newsletter
- Weekly newsletter with: featured product, brewing tip, fox update
- Automated welcome email for new subscribers
- Re-engagement for inactive subscribers (6+ months)

## Integration Points
- **Instagram:** Manual posting initially, Buffer API later
- **Website blog:** Firebase CMS or markdown-based
- **Email:** Gmail (stockbridgecoffee@gmail.com) via existing automation
- **Image generation:** nano-banana-pro skill for product visuals

## Scripts

### generate-social-post.sh
Generates a social media post with AI-created image + caption.

### schedule-newsletter.sh  
Drafts the weekly newsletter from templates + recent content.

### fox-clip-selector.sh
Randomly selects a fox clip and adds coffee-related captions.
