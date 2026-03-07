# AI Video Automation Pipeline

Fully automated workflow to create videos with AI-generated images, animations, voiceovers, and sound effects - **all via API, no manual UI work**.

## What It Does

1. **Generates character images** from text descriptions (DALL-E/Midjourney/Flux)
2. **Animates images into videos** with motion prompts (Runway/Pika/Luma)
3. **Adds professional voiceovers** with custom voices (Eleven Labs)
4. **Generates sound effects** from text descriptions (Eleven Labs)
5. **Combines everything** into a polished final video (FFmpeg)

## Prerequisites

### Required Software
```bash
# Install FFmpeg (for video/audio processing)
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from: https://ffmpeg.org/download.html
```

### Python Dependencies
```bash
pip install requests python-dotenv
```

### API Keys Needed

| Service | Purpose | Cost | Get Key |
|---------|---------|------|---------|
| **Eleven Labs** | Voice + SFX (required) | ~$0.30/min audio | [Get Key](https://elevenlabs.io/app/settings/api-keys) |
| **OpenAI** | Image generation | ~$0.04-0.12/image | [Get Key](https://platform.openai.com/api-keys) |
| **Runway ML** | Video generation | ~$0.05/sec video | [Get Key](https://runwayml.com/) |

**Alternative video APIs**: Pika, Luma AI, Stability AI Video

## Quick Start

### 1. Set Up Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

### 2. Get Your Eleven Labs Voice ID
```bash
# List all available voices
curl -X GET "https://api.elevenlabs.io/v1/voices" \
  -H "xi-api-key: YOUR_ELEVENLABS_API_KEY"
```

Find a voice you like and copy its `voice_id`. Popular voices:
- `21m00Tcm4TlvDq8ikWAM` - Rachel (calm, friendly female)
- `ErXwobaYiN019PkySvjV` - Antoni (warm male)
- `pNInz6obpgDQGcFmaJgB` - Adam (deep male)

### 3. Run the Pipeline
```python
from ai_video_automation import VideoAutomationPipeline

pipeline = VideoAutomationPipeline()

final_video = pipeline.run_full_pipeline(
    character_description="A cheerful robot mascot waving, cinematic lighting",
    motion_prompt="Robot waves and smiles at camera, subtle head tilt",
    script="Hello! Welcome to the future of automation.",
    voice_id="21m00Tcm4TlvDq8ikWAM",  # Your chosen voice
    sfx_descriptions=["Robot servo whir", "Friendly beep"]
)
```

### 4. Check Output
```bash
ls -lh output/
# character.png          - Generated character image
# video_no_audio.mp4     - Animated video (silent)
# voiceover.mp3          - AI-generated voice
# sfx_*.mp3              - Sound effects
# final_video.mp4        - 🎉 Your finished video!
```

## Advanced Eleven Labs Features

### Voice Cloning
Clone your own voice for custom narration:

```python
# 1. Upload voice samples via API
import requests

files = [
    ("files", open("sample1.mp3", "rb")),
    ("files", open("sample2.mp3", "rb")),
    ("files", open("sample3.mp3", "rb"))
]

response = requests.post(
    "https://api.elevenlabs.io/v1/voices/add",
    headers={"xi-api-key": ELEVENLABS_API_KEY},
    files=files,
    data={
        "name": "My Cloned Voice",
        "description": "My professional narration voice"
    }
)

cloned_voice_id = response.json()["voice_id"]

# 2. Use your cloned voice
pipeline.step3_generate_voiceover(
    script="This is me speaking with my cloned voice!",
    voice_id=cloned_voice_id
)
```

### Video Dubbing (Add Voice to Existing Video)
Already have a video? Just add AI voice without regenerating:

```python
# Dub existing video with AI voice
response = requests.post(
    "https://api.elevenlabs.io/v1/dubbing",
    headers={"xi-api-key": ELEVENLABS_API_KEY},
    files={"file": open("existing_video.mp4", "rb")},
    data={
        "target_lang": "en",
        "source_lang": "en",  # Or translate: "es", "fr", etc.
        "voice_id": "21m00Tcm4TlvDq8ikWAM"
    }
)

dubbing_id = response.json()["dubbing_id"]

# Poll for completion
import time
while True:
    status = requests.get(
        f"https://api.elevenlabs.io/v1/dubbing/{dubbing_id}",
        headers={"xi-api-key": ELEVENLABS_API_KEY}
    ).json()

    if status["status"] == "dubbed":
        dubbed_url = status["target_url"]
        break
    time.sleep(5)
```

### Advanced Audio Controls
```python
# Fine-tune voice parameters
response = requests.post(
    f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
    headers={"xi-api-key": ELEVENLABS_API_KEY},
    json={
        "text": "Your script here",
        "model_id": "eleven_turbo_v2",  # Faster model
        "voice_settings": {
            "stability": 0.5,        # 0-1: Lower = more expressive
            "similarity_boost": 0.8, # 0-1: Higher = closer to original
            "style": 0.5,            # 0-1: Exaggeration level
            "use_speaker_boost": True
        }
    }
)
```

## Cost Estimation

For a **30-second video**:

| Component | Service | Cost |
|-----------|---------|------|
| 1 character image | OpenAI DALL-E 3 | $0.04 |
| 30-sec video | Runway Gen-3 | $1.50 |
| 30-sec voiceover | Eleven Labs | $0.15 |
| 2 sound effects | Eleven Labs | $0.01 |
| **Total** | | **~$1.70** |

## Workflow Variants

### Variant 1: Batch Production
Generate multiple videos in parallel:

```python
video_configs = [
    {"character": "Robot in office", "script": "Welcome to product A"},
    {"character": "Robot in lab", "script": "Welcome to product B"},
    {"character": "Robot outdoors", "script": "Welcome to product C"}
]

for config in video_configs:
    pipeline.run_full_pipeline(
        character_description=config["character"],
        motion_prompt="Friendly greeting wave",
        script=config["script"],
        voice_id="21m00Tcm4TlvDq8ikWAM"
    )
```

### Variant 2: Multi-Language Dubbing
Create one video, dub it in multiple languages:

```python
# Generate base video (steps 1-2)
base_video = pipeline.step2_generate_video(image_path, motion_prompt)

# Dub in multiple languages
languages = ["en", "es", "fr", "de", "ja"]
for lang in languages:
    response = requests.post(
        "https://api.elevenlabs.io/v1/dubbing",
        headers={"xi-api-key": ELEVENLABS_API_KEY},
        files={"file": open(base_video, "rb")},
        data={"target_lang": lang, "source_lang": "en"}
    )
    # Save dubbed version
```

### Variant 3: Live Commentary Over Screen Recordings
Record screen, add AI voiceover:

```python
# You record screen → existing_screen_recording.mp4
# Generate AI commentary
voiceover = pipeline.step3_generate_voiceover(
    script="Let me walk you through this feature...",
    voice_id="21m00Tcm4TlvDq8ikWAM"
)

# Combine with screen recording
pipeline.step4_combine_audio_video(
    video_path="existing_screen_recording.mp4",
    voiceover_path=voiceover,
    sfx_paths=[]
)
```

## Troubleshooting

### Error: "Video generation timeout"
- Video APIs can take 2-5 minutes for complex prompts
- Increase timeout in `_poll_video_completion()`
- Or use simpler motion prompts

### Error: "Eleven Labs rate limit"
- Free tier: 10k chars/month
- Paid tier: Rate limits vary by plan
- Add retry logic with exponential backoff

### Warning: "1GB file size limit" (from review article)
- Compress videos before dubbing:
```bash
ffmpeg -i large_video.mp4 -vcodec h264 -crf 28 compressed.mp4
```

### YouTube URL dubbing doesn't work
- Known issue (from review article)
- Workaround: Download video first, then dub local file
```bash
yt-dlp "youtube_url" -o input.mp4
# Then dub the local file
```

## API Documentation Links

- [Eleven Labs API Docs](https://elevenlabs.io/docs/eleven-api/quickstart)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Runway ML API](https://docs.runwayml.com/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

## Next Steps

1. **Optimize costs**: Use cheaper models for drafts, premium for finals
2. **Add error handling**: Retry logic, fallback options
3. **Queue system**: Process multiple videos in background
4. **Webhook integration**: Get notified when videos complete
5. **Storage**: Auto-upload to S3/YouTube/Vimeo

---

**Need help?** Check the Eleven Labs [developer community](https://discord.gg/elevenlabs) or their support (response time: few days per the review).
