# Real API Costs (2026) - No Assumptions

You're right - subscriptions don't include API access. Here are the **actual API costs** you'll pay:

## 📊 Actual Per-Video Costs (30-second video)

### Option 1: Gemini API (Full Automation)

```
Gemini Image → Veo Video → Eleven Labs Voice → Artlist Music
```

| Component | Provider | Actual Cost |
|-----------|----------|-------------|
| 1 image (1K quality) | Gemini API | **$0.13** |
| 8-sec video | Veo via fal.ai | **$0.80** ($0.10/sec) |
| 8-sec video (extended to 30s) | Need 3x generations | **$2.40** |
| 30-sec voiceover | Eleven Labs | **$0.15** |
| Background music | Artlist API | **$0** (included) |
| **TOTAL per video** | | **$2.55 - $2.68** |

⚠️ **Problem**: Veo only generates 8-second videos. For 30 seconds, you need multiple generations + stitching = expensive!

---

### Option 2: Pika API (Better for longer videos)

```
Gemini Image → Pika Video → Eleven Labs Voice → Artlist Music
```

| Component | Provider | Actual Cost |
|-----------|----------|-------------|
| 1 image (1K) | Gemini API | **$0.13** |
| 5-sec video | Pika via fal.ai | **$0.10** |
| 30-sec video | 6x generations | **$0.60** |
| 30-sec voiceover | Eleven Labs | **$0.15** |
| Background music | Artlist API | **$0** (included) |
| **TOTAL per video** | | **$0.88** |

⚠️ **Problem**: Still need multiple clips for 30 seconds, stitching required.

---

### Option 3: Runway Gen-3 (Best for longer videos)

```
Gemini Image → Runway Gen-3 → Eleven Labs Voice → Artlist Music
```

| Component | Provider | Actual Cost |
|-----------|----------|-------------|
| 1 image (1K) | Gemini API | **$0.13** |
| 30-sec video | Runway Gen-3 | **$1.50** ($0.05/sec) |
| 30-sec voiceover | Eleven Labs | **$0.15** |
| Background music | Artlist API | **$0** (included) |
| **TOTAL per video** | | **$1.78** |

✅ **Best option**: Single generation for full 30s, no stitching needed.

---

### Option 4: Hybrid - Midjourney + Pika ⭐ **CHEAPEST**

```
Midjourney (manual) → Download → Pika Video → Eleven Labs Voice → Artlist Music
```

| Component | Provider | Actual Cost |
|-----------|----------|-------------|
| 1 image | Midjourney subscription | **$0** (already paying) |
| Manual download | 30 seconds of your time | **$0** |
| 30-sec video | Pika via fal.ai (6x5sec) | **$0.60** |
| 30-sec voiceover | Eleven Labs | **$0.15** |
| Background music | Artlist API | **$0** (included) |
| **TOTAL per video** | | **$0.75** |

✅ **Most cost-effective**: Uses what you already pay for (Midjourney + Artlist).

---

### Option 5: Minimal Automation ⭐⭐ **CHEAPEST + BEST QUALITY**

```
Midjourney (manual) → Manual Video Creation → Eleven Labs Dubbing → Artlist Music
```

| Component | Provider | Actual Cost |
|-----------|----------|-------------|
| Image creation | Midjourney | **$0** (included) |
| Video creation | Manual (CapCut/Premiere) | **$0** (your time) |
| Voice dubbing | Eleven Labs dubbing API | **$0.15 - $0.30** |
| Background music | Artlist | **$0** (included) |
| **TOTAL per video** | | **$0.15 - $0.30** |

✅ **Best ROI**: Lowest cost, highest quality, maximum control.

---

## 💰 Monthly Cost Comparison

**Assuming 4 videos per week = 16 videos/month:**

| Approach | Cost/Video | Cost/Month | Time/Video | Time/Month |
|----------|-----------|------------|-----------|------------|
| **Gemini + Veo** | $2.68 | **$42.88** | 5 min | 80 min |
| **Gemini + Pika** | $0.88 | **$14.08** | 7 min | 112 min |
| **Gemini + Runway** | $1.78 | **$28.48** | 5 min | 80 min |
| **Midjourney + Pika** ⭐ | $0.75 | **$12.00** | 8 min | 128 min |
| **Minimal Automation** ⭐⭐ | $0.25 | **$4.00** | 15-20 min | 240-320 min |

---

## 🎯 My Updated Recommendation

For **weekly production** (3-7 videos/week):

### Best Overall: **Midjourney + Pika + Eleven Labs**

**Why:**
1. **Lowest cost for automation**: $12/month at 4 videos/week
2. **Best image quality**: Midjourney still superior
3. **Good automation**: Only manual step is image creation
4. **You already pay for it**: Leverages Midjourney subscription

**Workflow (8 minutes per video):**
```bash
# 1. Create image in Midjourney (2 min manual)
# Save as: character.png

# 2. Run automation (1 min hands-on + 5 min waiting)
python3 hybrid_automation.py \
  --image character.png \
  --motion "robot waves hello" \
  --script "Welcome to our product!" \
  --duration 30

# Output: final_video.mp4
```

---

### Best for Quality + Control: **Minimal Automation**

**Why:**
1. **Cheapest**: Only $4/month
2. **Maximum quality**: Full creative control
3. **Best for branding**: Consistent look and feel
4. **Flexible**: Automate only the tedious parts

**Workflow (15-20 min per video):**
1. Create image in Midjourney (2 min)
2. Create/edit video manually in CapCut/Premiere (10-15 min)
3. Export video
4. Run voice automation (3 min total):
   ```bash
   python3 quick_example.py dub my_video.mp4
   ```

---

## 🚀 What You Actually Need

### Required API Keys:

1. **Eleven Labs** 🔥 **Essential**
   - Cost: $22/month (Starter plan)
   - OR: $0.30 per 1,000 characters (pay-as-you-go)
   - Get: https://elevenlabs.io/app/settings/api-keys

2. **Artlist Enterprise API** 🔥 **Essential**
   - Cost: $0 (included with subscription)
   - Get: Email enterprise-api-support@artlist.io

3. **Pika via Fal.ai** 🟡 **Optional** (for video automation)
   - Cost: $0.10 per 5-second clip
   - Get: https://fal.ai/dashboard/keys

### Optional API Keys:

4. **Gemini API** (for image generation if ditching Midjourney)
   - Cost: $0.13 per 1K image
   - Get: https://aistudio.google.com/app/apikey

5. **Runway ML** (for longer single-shot videos)
   - Cost: $0.05 per second
   - Get: https://runwayml.com/

---

## 📋 Decision Matrix

**Choose based on your priorities:**

### If you value: **Lowest Cost**
→ **Minimal Automation** ($0.25/video)
- Manual video creation
- Automate only voice/music

### If you value: **Time Savings**
→ **Midjourney + Pika** ($0.75/video)
- 8 min per video
- Good automation while keeping Midjourney quality

### If you value: **100% Automation**
→ **Gemini + Runway** ($1.78/video)
- 5 min per video
- Zero manual work
- Good quality (not Midjourney-level though)

---

## 💡 My Honest Take

**For your use case** (weekly videos, already have Midjourney + Artlist):

### Phase 1: Start with Minimal Automation (This Week)
```bash
# Just add Eleven Labs voice to existing workflow
# Cost: $4/month
# No new tools to learn
```

**Why:** Test if AI voice meets your quality bar before investing in full automation.

### Phase 2: Add Pika if you want more automation (Next Month)
```bash
# Automate video generation from Midjourney images
# Added cost: +$8-10/month
# Total: ~$12-14/month
```

**Why:** If voice automation works well and you want to save more time.

### Phase 3: Full automation only if scaling up (Future)
```bash
# Switch to full Gemini/Runway pipeline
# Cost: ~$25-30/month
# Only if doing 20+ videos/month
```

**Why:** Economics only make sense at higher volume.

---

## 🎬 Next Steps (This Week)

### Day 1: Test Voice Automation
```bash
# 1. Get Eleven Labs API key (free trial available)
https://elevenlabs.io/

# 2. Create one video manually (your normal process)

# 3. Add AI voice:
python3 quick_example.py dub my_video.mp4

# 4. Compare quality vs manual voice
```

**Investment**: Free trial
**Time**: 30 minutes
**Output**: Proof of concept

### Day 2-3: Contact Artlist
```
Email: enterprise-api-support@artlist.io

Ask: "I'd like API access to automate music downloads with my current
subscription. What are my options?"
```

### Day 4-5: Decide on Video Automation
```
Option A: Keep manual video creation → Minimal automation
Option B: Add Pika API → Hybrid automation
Option C: Full Gemini/Runway → Full automation

Base decision on: Time savings worth the cost?
```

---

## Sources

- [Gemini API Pricing 2026](https://ai.google.dev/gemini-api/docs/pricing)
- [Google Veo Pricing Calculator](https://costgoat.com/pricing/google-veo)
- [Pika API Documentation](https://pika.art/api)
- [Artlist Enterprise API](https://developer.artlist.io/welcome)

---

## Bottom Line

**Don't overcomplicate it.**

Start with just Eleven Labs voice automation ($22/month or free trial). Add more automation only if it saves you meaningful time.

For 4 videos/week:
- **Manual approach**: 60-80 min/week
- **Voice automation**: 40-60 min/week (saves ~20 min)
- **Full automation**: 20-32 min/week (saves ~40 min)

Is saving 40 min/week worth $12-30/month? That's your call.
