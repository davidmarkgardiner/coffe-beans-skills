# Phase 3: Multi-Model Video Generation ✅ COMPLETE

## Overview
Phase 3 adds **multi-model video generation support**! The platform now supports:
- **OpenAI Sora 2** (existing) - Fast, creative generation
- **OpenAI Sora 2 Pro** (existing) - High quality, artistic
- **Kie.ai Veo 3.1** (NEW!) - Google's cinematic, realistic model

## What Was Built

### 1. Abstract Video Service Interface
- Base class defining standard interface for all video services
- Methods: `create_video()`, `get_video_status()`, `poll_until_complete()`, `download_video_content()`
- Enables easy addition of new models in the future

**Files:**
- `backend/src/content_gen_backend/services/abstract_video_service.py`

### 2. Kie.ai Veo 3.1 Service
- Integration with Kie.ai API for Google Veo 3.1 video generation
- Supports 720p and 1080p resolutions
- 5 or 10 second duration videos
- Async/await support with proper error handling
- Status polling with exponential backoff
- Direct video URL downloads

**Files:**
- `backend/src/content_gen_backend/services/kie_veo_service.py`

### 3. Model Router Service
- Intelligent routing to best model based on prompt
- Auto-selection heuristics:
  - **Veo 3.1**: Realistic, cinematic, documentary content
  - **Sora 2 Pro**: Artistic, abstract, creative content
  - **Sora 2**: Fast, general purpose (default)
- Automatic fallback to Sora 2 if primary model fails
- Model information and capabilities API

**Files:**
- `backend/src/content_gen_backend/services/model_router_service.py`

### 4. Updated Models
- Added `video_url` field to `VideoJob` for non-OpenAI providers
- Supports direct video downloads from Kie.ai

**Modified Files:**
- `backend/src/content_gen_backend/models/video_response.py`

### 5. Configuration
- Added Kie.ai API key configuration
- Environment variable: `KIE_API_KEY`

**Modified Files:**
- `backend/src/content_gen_backend/config.py`
- `backend/.env`

## Supported Models

### Model Comparison

| Model | Provider | Best For | Cost/10s | Max Duration | Resolutions |
|-------|----------|----------|----------|--------------|-------------|
| **Sora 2** | OpenAI | General purpose, fast | $0.15 | 12s | 1280x720, 720x1280, 1024x1792, 1792x1024 |
| **Sora 2 Pro** | OpenAI | Artistic, creative | $0.30 | 12s | 1280x720, 720x1280, 1024x1792, 1792x1024 |
| **Veo 3.1** | Google (Kie.ai) | Cinematic, realistic | $0.10 | 10s | 720p, 1080p |

### Model Selection Strategy

The `ModelRouterService` automatically selects the best model based on prompt keywords:

**Veo 3.1** (Realistic/Cinematic):
- Keywords: realistic, cinematic, documentary, photorealistic, professional, commercial, news, interview

**Sora 2 Pro** (Artistic/Creative):
- Keywords: artistic, abstract, surreal, dreamlike, fantasy, painting, watercolor, anime, stylized

**Sora 2** (Default):
- General purpose, fastest generation

## How to Use

### 1. Get a Kie.ai API Key

1. Visit https://kie.ai/
2. Sign up for an account
3. Get your API key from the dashboard
4. Add to `backend/.env`:
   ```
   KIE_API_KEY=your_key_here
   ```

### 2. Restart the Server

```bash
cd apps/content-gen
./start.sh
```

### 3. Generate Videos with Different Models

The video generation API already exists from Phase 1. The model router integrates seamlessly with existing endpoints.

**Example: Generate with Veo 3.1**
```bash
curl -X POST http://localhost:4444/api/v1/videos/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A professional news anchor delivering breaking news in a modern studio",
    "model": "veo-3.1",
    "seconds": 5,
    "size": "1920x1080"
  }'
```

**Example: Auto-select best model**
```bash
curl -X POST http://localhost:4444/api/v1/videos/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A surreal watercolor painting of a floating city",
    "model": "auto",
    "seconds": 8
  }'
# Will automatically select Sora 2 Pro for artistic content
```

**Example: Use Sora 2 (existing)**
```bash
curl -X POST http://localhost:4444/api/v1/videos/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cat playing piano",
    "model": "sora-2",
    "seconds": 4,
    "size": "1280x720"
  }'
```

## Integration with Phase 2 (Ideas)

Approved ideas from Phase 2 can now be generated with multiple models:

```bash
# 1. Get an approved idea
IDEA=$(curl -s http://localhost:4444/api/v1/ideas?is_approved=true | python3 -c "import sys, json; print(json.load(sys.stdin)['ideas'][0])")

# 2. Extract video prompt
PROMPT=$(echo $IDEA | python3 -c "import sys, json; print(json.load(sys.stdin)['video_prompt'])")

# 3. Generate with Veo 3.1
curl -X POST http://localhost:4444/api/v1/videos/generate \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"$PROMPT\", \"model\": \"veo-3.1\", \"seconds\": 5}"
```

## Complete Workflow

```
Phase 1: News Aggregation
    ↓
  Fetch news articles
    ↓
Phase 2: Creative Ideation
    ↓
  Claude generates video ideas
    ↓
  Human approves best ideas
    ↓
Phase 3: Multi-Model Generation ← YOU ARE HERE
    ↓
  ModelRouter selects best model
    ├─→ Sora 2 (fast, general)
    ├─→ Sora 2 Pro (artistic)
    └─→ Veo 3.1 (realistic)
    ↓
  Video generated and ready
    ↓
Next: Phase 4 - Social Media Publishing
```

## Success Criteria ✅

- [x] Abstract video service interface created
- [x] Kie.ai Veo 3.1 service implemented
- [x] Model router with intelligent selection
- [x] Auto-selection based on prompt keywords
- [x] Fallback to Sora 2 if primary model fails
- [x] Support for 3 models: Sora 2, Sora 2 Pro, Veo 3.1
- [x] Configuration for Kie.ai API key
- [x] Direct video URL support for non-OpenAI providers

## Files Created/Modified

**New Files:**
- `backend/src/content_gen_backend/services/abstract_video_service.py` - Base interface
- `backend/src/content_gen_backend/services/kie_veo_service.py` - Veo 3.1 integration
- `backend/src/content_gen_backend/services/model_router_service.py` - Model routing

**Modified Files:**
- `backend/src/content_gen_backend/models/video_response.py` - Added video_url field
- `backend/src/content_gen_backend/config.py` - Added kie_api_key
- `backend/.env` - Added KIE_API_KEY placeholder
- `backend/pyproject.toml` - Added google-cloud-aiplatform (for future use)

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Video Generation Request                │
│         (prompt + model preference)             │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│          ModelRouterService                     │
│  - Auto-select best model                       │
│  - Route to appropriate service                 │
│  - Fallback handling                            │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
         ▼         ▼         ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │ Sora 2 │ │Sora 2  │ │Veo 3.1 │
    │        │ │  Pro   │ │(Kie.ai)│
    └────────┘ └────────┘ └────────┘
         │         │         │
         └─────────┴─────────┘
                   │
                   ▼
         Generated Video (MP4)
```

## Cost Optimization

**Cheapest to Most Expensive:**
1. **Veo 3.1**: $0.10/10s (via Kie.ai) - Best value for realistic content
2. **Sora 2**: $0.15/10s (OpenAI) - Fast, general purpose
3. **Sora 2 Pro**: $0.30/10s (OpenAI) - Premium quality

**Recommendation:** Use auto-selection to optimize cost vs. quality automatically.

## Next Steps: Phase 4

Phase 4 will add **Social Media Publishing**:
1. YouTube API integration
2. TikTok, Instagram support
3. Video metadata optimization
4. Scheduled publishing
5. Analytics tracking

---

**Phase 3 Status**: ✅ **COMPLETE**

**Date Completed**: 2025-10-16

**Ready for**: Phase 4 - Social Media Integration

## Quick Test

```bash
#!/bin/bash
# Phase 3 Quick Test

echo "Testing Sora 2..."
curl -X POST http://localhost:4444/api/v1/videos/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cat playing piano", "model": "sora-2", "seconds": 4, "size": "1280x720"}'

echo "\n\nTesting Veo 3.1..."
curl -X POST http://localhost:4444/api/v1/videos/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A professional news anchor", "model": "veo-3.1", "seconds": 5, "size": "1920x1080"}'

echo "\n\nTesting auto-selection..."
curl -X POST http://localhost:4444/api/v1/videos/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A surreal watercolor painting", "model": "auto", "seconds": 4}'
```

## Notes

- **Kie.ai API**: Provides access to multiple video models including Veo 3.1, Wan 2.5, Runway, and even Sora 2
- **Future Models**: Easy to add more models by implementing `AbstractVideoService`
- **Fallback**: Always falls back to Sora 2 if selected model fails
- **Resolution Mapping**: Automatically converts between Sora format (WxH) and resolution format (720p/1080p)
