---
name: stockbridge-content
description: Generate social media content ideas for Stockbridge Coffee featuring the fox mascot. Use when brainstorming video concepts, writing scripts, generating draft videos, or planning content calendars. Produces cheap draft videos for review — winning ideas get taken to higher-quality manual production (Midjourney, NanoBanana 2, etc).
license: MIT
compatibility: Requires ELEVENLABS_API_KEY and FAL_API_KEY. Python 3.8+. Fox mascot image required.
metadata: {"openclaw": {"requires": {"env": ["ELEVENLABS_API_KEY", "FAL_API_KEY"]}, "primaryEnv": "ELEVENLABS_API_KEY"}}
---

# Stockbridge Coffee Content Generator

Generate draft video content featuring the Stockbridge Coffee fox mascot. This is an **idea machine** — produce cheap drafts quickly, review what works, then take winning concepts to manual production on higher-quality platforms.

> **Website:** https://stockbridgecoffee.co.uk/

## Workflow

```
Idea → Script → Cheap Draft Video → Review → Best ones → Manual Production
                                                          (Midjourney, NanoBanana 2, Artlist, etc.)
```

### Phase 1: Generate ideas and drafts (automated, cheap)
- Write short scripts for the fox mascot
- Run through `hybrid_automation.py` to produce lip-synced draft videos
- Cost: ~$0.15-0.30 per draft (ElevenLabs TTS + fal.ai OmniHuman)

### Phase 2: Curate and produce (manual, high quality)
- Review drafts, pick the best concepts
- Take the winning script + image prompt to Midjourney / NanoBanana 2
- Add music from Artlist, final voice from ElevenLabs
- Post to social platforms

## Brand Guidelines

### The Fox Mascot
- Friendly, cheeky, Scottish character
- Appears in different settings and situations
- Comments on current events, coffee culture, seasonal topics, local Edinburgh life
- Light-hearted and engaging — never preachy or corporate
- Think: a fox who runs a coffee shop and has opinions about everything

### Tone of Voice
- **Warm and witty** — like chatting to a friend at the counter
- **Topical** — references what's happening in the world right now
- **Self-aware** — knows it's a fox running a coffee shop, leans into the absurdity
- **Scottish touches** — occasional local references, Edinburgh culture
- **Short and punchy** — scripts should be 15-30 seconds for social media

### Content Pillars
1. **Coffee culture** — brewing tips, bean origins, cafe life, coffee snobbery (affectionate)
2. **Current events** — light takes on what's trending, news through the lens of a coffee-loving fox
3. **Seasonal/local** — Edinburgh events, weather, Scottish holidays, festivals
4. **Behind the scenes** — "day in the life" of the fox, running the shop
5. **Customer moments** — relatable cafe scenarios, ordering quirks

### What NOT to do
- No politics or anything divisive
- No negativity about competitors
- Nothing that requires context to understand — should work as standalone content
- No long monologues — keep it snappy

## Fox Mascot Assets

Images are in the website repo:
- `coffee-website-react/public/images/stockbridge-fox-poster.webp` — poster frame
- `coffee-website-react/public/images/stockbridge-fox-logo.png` — logo variant
- `coffee-website-react/public/images/stockbridge-fox-green.png` — green variant

Default ElevenLabs voice: `gMVEZSWHxpbfIG8MuwDV` (Stockbridge voice)

## Hero Video (Website)

The website hero at `coffee-website-react/src/components/Hero.tsx` plays a looping muted background video from `/video/hero-optimised.mp4`. This should be refreshed monthly to keep the site feeling current.

### Hero video specs
- **Format:** MP4 (H.264), optimised for web
- **Aspect:** Landscape, full-width (1920x1080 or similar)
- **Duration:** 10-30 seconds, seamlessly loopable
- **Audio:** Muted (hero video has no sound)
- **Content:** Atmospheric coffee/fox footage — no text overlay needed (the site adds "STOCKBRIDGE COFFEE / Edinburgh" on top)
- **Style:** Cinematic, warm tones, coffee shop vibes

### Hero video workflow
1. Generate concept with draft pipeline (test the vibe cheaply)
2. Take winning concept to NanoBanana 2 / Midjourney for final quality
3. Optimise with FFmpeg: `ffmpeg -i hero-raw.mp4 -vcodec h264 -crf 23 -preset slow -movflags +faststart hero-optimised.mp4`
4. Replace `coffee-website-react/public/video/hero-optimised.mp4`
5. Deploy

### Hero video prompts by season
- **Spring:** Fox in a sunlit coffee shop, morning light through windows, steam rising from cups
- **Summer:** Fox at an outdoor cafe table in Stockbridge, Edinburgh streets, warm golden hour
- **Autumn:** Fox in a cosy shop, warm lighting, rain on windows, autumn leaves outside
- **Winter:** Fox by a fireplace with a latte, frost on windows, fairy lights, festive warmth

## Quick Start

### Generate a single draft video

```bash
python3 .claude/skills/ai-content/video-automation/scripts/hybrid_automation.py \
  --image coffee-website-react/public/images/stockbridge-fox-poster.webp \
  --script "Morning everyone! Did you know the average person drinks three cups of coffee a day? Amateurs. I'm on my seventh and it's not even noon. Come see us at Stockbridge Coffee — we'll sort you out."
```

### Generate a batch of drafts

```bash
python3 .claude/skills/ai-content/stockbridge-content/scripts/generate_batch.py \
  --image coffee-website-react/public/images/stockbridge-fox-poster.webp \
  --ideas 5 \
  --topic "monday morning coffee"
```

This will:
1. Generate 5 script ideas based on the topic
2. Run each through the video pipeline
3. Save all drafts to `output/batch_YYYYMMDD/`
4. Log prompts and scripts to `output/batch_YYYYMMDD/ideas.json` for reference

### Review and promote winners

After reviewing drafts, log the winning concepts:

```bash
# Add a winning idea to the favourites log
python3 .claude/skills/ai-content/stockbridge-content/scripts/log_winner.py \
  --video output/batch_20260307/video_001.mp4 \
  --notes "Great energy, use this script with a better fox image from Midjourney"
```

Winners are saved to `output/winners.json` with the original script, prompt, and your notes — ready to take to manual production.

## Script Templates

### Current Events
```
"Right, so apparently [trending topic]. Look, I'm just a fox who makes coffee,
but even I know that [funny take]. Anyway, come grab a flat white —
we can talk about it. Stockbridge Coffee, see you there."
```

### Coffee Culture
```
"Someone asked me yesterday what the difference is between [coffee thing A]
and [coffee thing B]. [Funny comparison]. Either way, we make both
brilliantly. Stockbridge Coffee — no judgement, just great coffee."
```

### Seasonal
```
"It's [season/event] in Edinburgh and you know what that means —
[observation]. Perfect weather for [coffee drink]. Pop in to
Stockbridge Coffee, the kettle's always on."
```

### Behind the Scenes
```
"[Time of day] at the shop. [Funny observation about running a cafe].
[Self-deprecating fox joke]. This is Stockbridge Coffee —
where the coffee's serious but we're definitely not."
```

## Production Pipeline

| Step | Tool | Cost | Quality |
|------|------|------|---------|
| Script writing | Claude / manual | Free | - |
| Voice generation | ElevenLabs (voice `gMVEZSWHxpbfIG8MuwDV`) | ~$0.15 | Draft quality |
| Lip-sync video | fal.ai OmniHuman v1.5 | ~$0.10-0.15 | Draft quality |
| **Draft total** | | **~$0.25-0.30** | **Good enough to evaluate** |
| Final image | Midjourney / NanoBanana 2 | Subscription | Production quality |
| Final video | Manual editing | Your time | Production quality |
| Final music | Artlist | Subscription | Production quality |

## Content Calendar Approach

### Daily ideation phase (first 2-4 weeks)
- Generate 2-3 draft videos per day
- Different topics, different tones
- Track what feels right, what falls flat
- Build a sense of the fox's personality

### Weekly production phase (ongoing)
- Pick 2-3 best concepts from the week's drafts
- Produce high-quality versions manually
- Post to Instagram Reels / TikTok / YouTube Shorts

## References

- [Video Automation Pipeline](../video-automation/SKILL.md) — the underlying draft video pipeline
- [Cost Analysis](../video-automation/references/actual-costs.md) — detailed per-video costs
