---
name: video-automation
description: Automate AI video creation pipelines using ElevenLabs for voiceover and sound effects combined with image/video generation APIs. Supports full automation (Gemini + Veo), hybrid workflows (Midjourney + Pika), and lip-sync video generation (OmniHuman). Use when building automated video production, adding AI voiceovers to video, or creating talking-head content from a single image.
license: MIT
compatibility: Requires Python 3.8+, FFmpeg, internet access, and API keys for chosen providers (ELEVENLABS_API_KEY required, plus GEMINI_API_KEY, FAL_API_KEY, OPENAI_API_KEY, or RUNWAY_API_KEY depending on pipeline).
metadata: {"openclaw": {"requires": {"bins": ["python3", "ffmpeg"], "env": ["ELEVENLABS_API_KEY"]}, "primaryEnv": "ELEVENLABS_API_KEY"}}
---

# AI Video Automation

Automated pipelines for creating videos with AI-generated images, animations, voiceovers, and sound effects.

> **Setup:** Run `./scripts/setup.sh` to install dependencies and configure API keys.

## Pipelines

| Script | Pipeline | Best For |
|--------|----------|----------|
| `scripts/ai_video_automation.py` | OpenAI DALL-E + Runway + ElevenLabs TTS/SFX + FFmpeg | Full end-to-end video from a text prompt |
| `scripts/gemini_automation.py` | Gemini Image + Veo 3.1 + Artlist + ElevenLabs + FFmpeg | Cost-effective full automation with Google APIs |
| `scripts/hybrid_automation.py` | ElevenLabs TTS + fal.ai OmniHuman v1.5 lip-sync | Talking-head video from a single image + script |
| `scripts/quick_example.py` | ElevenLabs TTS/SFX/Dubbing + FFmpeg | Add AI voice to existing video, list voices |

## Quick Start

### 1. Setup

```bash
# Install dependencies
./scripts/setup.sh

# Or manually:
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
```

### 2. List available voices

```bash
python3 scripts/quick_example.py voices
```

### 3. Create a lip-synced talking video from an image

```bash
python3 scripts/hybrid_automation.py \
  --image character.png \
  --script "Hello! Welcome to our product demo." \
  --voice-id JBFqnCBsd6RMkjVDRZzb
```

### 4. Add voiceover to an existing video

```bash
python3 scripts/quick_example.py voiceover
```

### 5. Dub an existing video with AI voice

```bash
python3 scripts/quick_example.py dub my_video.mp4
```

### 6. Full automated pipeline (Gemini)

```python
from scripts.gemini_automation import GeminiVideoAutomation

pipeline = GeminiVideoAutomation()
pipeline.run_full_pipeline(
    character_prompt="Friendly robot mascot, blue metallic, cinematic lighting",
    motion_prompt="Robot waves hello warmly",
    script="Hello everyone! Welcome to our product.",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    music_mood="upbeat"
)
```

## API Keys

| Key | Required By | Get From |
|-----|-------------|----------|
| `ELEVENLABS_API_KEY` | All pipelines | [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys) |
| `GEMINI_API_KEY` | gemini_automation.py | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| `FAL_API_KEY` | hybrid_automation.py | [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) |
| `OPENAI_API_KEY` | ai_video_automation.py | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `RUNWAY_API_KEY` | ai_video_automation.py | [runwayml.com](https://runwayml.com/) |
| `ARTLIST_API_KEY` | gemini_automation.py (music) | Email enterprise-api-support@artlist.io |

## ElevenLabs Features Used

- **Text-to-Speech**: Voiceover generation with voice settings (stability, similarity, style)
- **Sound Effects**: Generate SFX from text descriptions with duration and prompt control
- **Dubbing**: Add AI voice to existing video with language support

### Popular Voice IDs

| Voice ID | Name | Style |
|----------|------|-------|
| `JBFqnCBsd6RMkjVDRZzb` | George | Male, narrative |
| `EXAVITQu4vr4xnSDxMaL` | Sarah | Female, soft |
| `onwK4e9ZLuTAKqWW03F9` | Daniel | Male, authoritative |
| `XB0fDUnXU5powFXDhCwa` | Charlotte | Female, conversational |
| `21m00Tcm4TlvDq8ikWAM` | Rachel | Female, calm |

## Prerequisites

- **Python 3.8+**
- **FFmpeg** for audio/video combining (`brew install ffmpeg` on macOS)
- API keys for your chosen pipeline (see table above)

## References

- [Pipeline Guide](references/pipeline-guide.md) - Detailed walkthrough of each pipeline
- [Cost Comparison](references/cost-comparison.md) - Side-by-side cost and quality analysis
- [Actual API Costs](references/actual-costs.md) - Real per-video pricing breakdown
