# Phase 3 Extended: 4-Model Video Generation Platform ✅ COMPLETE

## Overview
Phase 3 has been extended to support **4 video generation models** across 3 providers:
- **OpenAI Sora 2** - Fast, general-purpose generation
- **OpenAI Sora 2 Pro** - High quality, artistic generation
- **Google Veo 3.1** (via Kie.ai) - Cinematic, realistic generation
- **Alibaba Wan 2.5** (via Kie.ai) - Image-to-video with lip-sync

## What Was Built

### 1. Abstract Video Service Interface
Base class defining standard interface for all video services.

**File:** `backend/src/content_gen_backend/services/abstract_video_service.py`

**Methods:**
- `create_video()` - Start video generation
- `get_video_status()` - Check generation status
- `poll_until_complete()` - Poll until done
- `download_video_content()` - Download finished video

### 2. Kie.ai Veo 3.1 Service
Integration with Google's Veo 3.1 via Kie.ai API.

**File:** `backend/src/content_gen_backend/services/kie_veo_service.py`

**Features:**
- Text-to-video generation
- 720p and 1080p resolutions
- 5 or 10 second duration
- Status polling with exponential backoff
- Direct video URL downloads

**API Endpoints Used:**
- Create: `POST https://api.kie.ai/api/v1/veo/generate`
- Status: `GET https://api.kie.ai/api/v1/veo/record-info?taskId={taskId}`

**Request Format:**
```json
{
  "prompt": "Video description",
  "model": "veo3",
  "aspectRatio": "16:9"
}
```

**Response Format:**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "abc123..."
  }
}
```

**Status Response:**
```json
{
  "code": 200,
  "data": {
    "successFlag": 1,  // 0=pending, 1=success, 2=failed, 3=processing
    "resultUrls": "[\"https://...\"]",
    "createTime": 1234567890000,
    "updateTime": 1234567890000
  }
}
```

### 3. Kie.ai Wan 2.5 Service
Integration with Alibaba's Wan 2.5 for image-to-video with lip-sync.

**File:** `backend/src/content_gen_backend/services/kie_wan_service.py`

**Features:**
- **Image-to-video generation** (requires image_url)
- Advanced lip-sync for human subjects
- Prompt expansion (AI enhancement)
- 720p and 1080p resolutions
- 5 or 10 second duration

**API Endpoints Used:**
- Create: `POST https://api.kie.ai/api/v1/jobs/createTask`
- Status: `GET https://api.kie.ai/api/v1/jobs/getTask/{taskId}`

**Request Format:**
```json
{
  "model": "wan/2-5-image-to-video",
  "input": {
    "prompt": "Person speaking with enthusiasm",
    "image_url": "https://example.com/person.jpg",
    "duration": "5",
    "resolution": "1080p",
    "enable_prompt_expansion": true
  }
}
```

**IMPORTANT:** Wan 2.5 **requires** an `image_url` - it will fail without one.

### 4. Model Router Service
Intelligent routing to best model based on prompt analysis.

**File:** `backend/src/content_gen_backend/services/model_router_service.py`

**Auto-Selection Logic:**

```python
# Priority 1: Human speech/dialogue (Wan 2.5)
Keywords: speak, talking, dialogue, lip-sync, voice, announce
Duration: 5 or 10 seconds
→ Returns: "wan-2.5"

# Priority 2: Realistic/cinematic (Veo 3.1)
Keywords: realistic, cinematic, documentary, photorealistic, professional
Duration: 5 or 10 seconds
→ Returns: "veo-3.1"

# Priority 3: Artistic/creative (Sora 2 Pro)
Keywords: artistic, abstract, surreal, dreamlike, fantasy, painting, anime
→ Returns: "sora-2-pro"

# Default: General purpose (Sora 2)
→ Returns: "sora-2"
```

**Fallback Strategy:**
- If selected model fails → Falls back to Sora 2
- Logs all fallback attempts for debugging

### 5. Updated API Endpoints

**File:** `backend/src/content_gen_backend/routers/videos.py`

**Create Video Endpoint:**
```
POST /api/v1/videos

Form Parameters:
- prompt (string, required): Video description
- model (string): "sora-2", "sora-2-pro", "veo-3.1", "wan-2.5", or "auto"
- seconds (int): Duration (4, 5, 8, 10, or 12 depending on model)
- size (string): Resolution like "1920x1080"
- input_reference (file, optional): Image for Sora image-to-video
- image_url (string, optional): Image URL for Wan 2.5 image-to-video
```

**Duration Validation:**
- **Sora 2/2 Pro**: 4, 8, or 12 seconds
- **Veo 3.1**: 5 or 10 seconds
- **Wan 2.5**: 5 or 10 seconds
- **Auto**: All valid durations (4, 5, 8, 10, 12)

**Status Routing:**
The status endpoint automatically detects the service:
- Video IDs starting with `video_` → Sora
- Other IDs → Try Veo first, then Wan (both use Kie.ai)

## Model Comparison

| Model | Provider | Best For | Cost/10s | Duration | Resolutions | Special Features |
|-------|----------|----------|----------|----------|-------------|------------------|
| **Sora 2** | OpenAI | General purpose, fast | $0.15 | 4, 8, 12s | 1280x720, 720x1280, etc | Text/image-to-video |
| **Sora 2 Pro** | OpenAI | Artistic, creative | $0.30 | 4, 8, 12s | 1280x720, 720x1280, etc | High quality |
| **Veo 3.1** | Google (Kie.ai) | Cinematic, realistic | $0.10 | 5, 10s | 720p, 1080p | Photorealistic |
| **Wan 2.5** | Alibaba (Kie.ai) | Human speech, lip-sync | $0.08 | 5, 10s | 720p, 1080p | **Image-to-video + lip-sync** |

## Configuration

**Environment Variables Required:**

```bash
# backend/.env
OPENAI_API_KEY=sk-...          # For Sora 2 and Sora 2 Pro
KIE_API_KEY=...                # For Veo 3.1 and Wan 2.5

# Optional
DEFAULT_MODEL=auto             # Default: sora-2
DEFAULT_SECONDS=4              # Default duration
DEFAULT_SIZE=1280x720          # Default resolution
```

## Usage Examples

### 1. Sora 2 (Fast, General Purpose)
```bash
curl -X POST http://localhost:4444/api/v1/videos \
  -F 'prompt=A cat playing piano' \
  -F 'model=sora-2' \
  -F 'seconds=4' \
  -F 'size=1280x720'
```

### 2. Sora 2 Pro (Artistic)
```bash
curl -X POST http://localhost:4444/api/v1/videos \
  -F 'prompt=A surreal watercolor painting of a floating city' \
  -F 'model=sora-2-pro' \
  -F 'seconds=8' \
  -F 'size=1280x720'
```

### 3. Veo 3.1 (Cinematic/Realistic)
```bash
curl -X POST http://localhost:4444/api/v1/videos \
  -F 'prompt=A professional news anchor delivering breaking news' \
  -F 'model=veo-3.1' \
  -F 'seconds=5' \
  -F 'size=1920x1080'
```

### 4. Wan 2.5 (Image-to-Video with Lip-Sync)
```bash
curl -X POST http://localhost:4444/api/v1/videos \
  -F 'prompt=A woman smiling and speaking: Have you heard about Wan 2.5?' \
  -F 'model=wan-2.5' \
  -F 'seconds=5' \
  -F 'size=1920x1080' \
  -F 'image_url=https://example.com/person.jpg'
```
**Note:** Wan 2.5 **requires** `image_url`

### 5. Auto-Selection
```bash
curl -X POST http://localhost:4444/api/v1/videos \
  -F 'prompt=A realistic documentary scene of wildlife' \
  -F 'model=auto' \
  -F 'seconds=5' \
  -F 'size=1920x1080'
```
**Result:** Auto-selects Veo 3.1 based on "realistic" + "documentary" keywords

### 6. Check Video Status
```bash
# For any model
curl http://localhost:4444/api/v1/videos/{video_id}

# Example response:
{
  "id": "ae988fa9d775...",
  "status": "completed",
  "model": "kie-wan-2.5",
  "video_url": "https://...",
  "progress": 100
}
```

### 7. Poll Until Complete
```bash
curl 'http://localhost:4444/api/v1/videos/{video_id}/poll?timeout=300'
```

## Integration with Phase 2 (Ideas)

Generate videos from approved ideas:

```bash
# 1. Get an approved idea
IDEA_ID=$(curl -s 'http://localhost:4444/api/v1/ideas?is_approved=true' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['ideas'][0]['id'])")

# 2. Get the idea details
IDEA=$(curl -s "http://localhost:4444/api/v1/ideas/$IDEA_ID")

# 3. Extract prompt and generate video
PROMPT=$(echo $IDEA | python3 -c "import sys, json; print(json.load(sys.stdin)['video_prompt'])")

curl -X POST http://localhost:4444/api/v1/videos \
  -F "prompt=$PROMPT" \
  -F 'model=auto' \
  -F 'seconds=5' \
  -F 'size=1920x1080'
```

## Complete Workflow

```
Phase 1: News Aggregation
    ↓
  Fetch trending news
    ↓
Phase 2: Creative Ideation (Claude)
    ↓
  Generate video ideas
    ↓
  Human approves ideas
    ↓
Phase 3: Multi-Model Video Generation ← YOU ARE HERE
    ↓
  ModelRouter selects best model:
    ├─→ Sora 2 (fast, general)
    ├─→ Sora 2 Pro (artistic)
    ├─→ Veo 3.1 (realistic)
    └─→ Wan 2.5 (lip-sync)
    ↓
  Video generated and ready
    ↓
Next: Phase 4 - Social Media Publishing
```

## Success Criteria ✅

- [x] Abstract video service interface created
- [x] Kie.ai Veo 3.1 service implemented
- [x] Kie.ai Wan 2.5 service implemented
- [x] Model router with intelligent selection
- [x] Auto-selection based on prompt keywords and duration
- [x] Duration-aware model compatibility checking
- [x] Fallback to Sora 2 if primary model fails
- [x] Support for 4 models: Sora 2, Sora 2 Pro, Veo 3.1, Wan 2.5
- [x] Configuration for Kie.ai API key
- [x] Direct video URL support for non-OpenAI providers
- [x] Multi-service status checking (Sora vs Kie.ai routing)

## Files Created/Modified

### New Files:
- `backend/src/content_gen_backend/services/abstract_video_service.py` - Base interface
- `backend/src/content_gen_backend/services/kie_veo_service.py` - Veo 3.1 integration
- `backend/src/content_gen_backend/services/kie_wan_service.py` - Wan 2.5 integration
- `backend/src/content_gen_backend/services/model_router_service.py` - Model routing

### Modified Files:
- `backend/src/content_gen_backend/models/video_response.py` - Added video_url field
- `backend/src/content_gen_backend/routers/videos.py` - Added wan-2.5, image_url, updated validation and status routing
- `backend/src/content_gen_backend/config.py` - Added kie_api_key
- `backend/.env` - Added KIE_API_KEY

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Video Generation Request                │
│    (prompt + model + optional image_url)        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│          ModelRouterService                     │
│  - Auto-select best model                       │
│  - Duration compatibility check                 │
│  - Route to appropriate service                 │
│  - Fallback handling                            │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┼─────────┬─────────┐
         │         │         │         │
         ▼         ▼         ▼         ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │ Sora 2 │ │Sora 2  │ │Veo 3.1 │ │Wan 2.5 │
    │        │ │  Pro   │ │(Kie.ai)│ │(Kie.ai)│
    └────────┘ └────────┘ └────────┘ └────────┘
         │         │         │         │
         └─────────┴─────────┴─────────┘
                   │
                   ▼
         Generated Video (MP4)
```

## Cost Optimization

**Cheapest to Most Expensive:**
1. **Wan 2.5**: $0.08/10s (via Kie.ai) - Best value for human speech/lip-sync
2. **Veo 3.1**: $0.10/10s (via Kie.ai) - Best value for realistic content
3. **Sora 2**: $0.15/10s (OpenAI) - Fast, general purpose
4. **Sora 2 Pro**: $0.30/10s (OpenAI) - Premium quality

**Recommendation:** Use `model=auto` to optimize cost vs. quality automatically.

## Known Issues & Limitations

### 1. Wan 2.5 Requires Image URL
- **Issue:** Wan 2.5 will fail without an `image_url` parameter
- **Error:** "image_url is required"
- **Solution:** Always provide an image URL when using Wan 2.5

### 2. Status Checking for Kie.ai Videos
- **Issue:** Veo and Wan use different endpoints but same task ID format
- **Solution:** Status endpoint tries Veo first, then Wan as fallback
- **Minor Issue:** First attempt may fail if wrong service is tried first

### 3. Duration Compatibility
- **Issue:** Different models support different durations
- **Solution:** Validation checks duration per model before generation
- **Auto-mode:** Accepts all valid durations, routes to compatible model

## Testing Results

All models tested and working:

✅ **Sora 2**: `video_68f10f6b...` - Generated successfully
✅ **Sora 2 Pro**: `video_68f110574...` - Auto-selected for artistic prompt
✅ **Veo 3.1**: `7df8abc656a4...` - Generated successfully
✅ **Veo 3.1 (auto)**: `c03f1fabbb9f...` - Auto-selected for realistic prompt
✅ **Wan 2.5**: `ae988fa9d775...` - Generated with image_url

## Next Steps: Phase 4

Phase 4 will add **Social Media Publishing**:
1. YouTube API integration
2. TikTok, Instagram support
3. Video metadata optimization (titles, descriptions, tags)
4. Scheduled publishing
5. Analytics tracking
6. Platform-specific formatting (vertical for TikTok, etc.)

---

**Phase 3 Extended Status**: ✅ **COMPLETE**

**Date Completed**: 2025-10-16

**Models Available**: 4 (Sora 2, Sora 2 Pro, Veo 3.1, Wan 2.5)

**Ready for**: Phase 4 - Social Media Integration

## Quick Reference

### Start Server
```bash
cd apps/content-gen
./start.sh
```

### Check Health
```bash
curl http://localhost:4444/health
```

### API Base URL
```
http://localhost:4444/api/v1/videos
```

### Required API Keys
- `OPENAI_API_KEY` - For Sora models
- `KIE_API_KEY` - For Veo 3.1 and Wan 2.5

### Model Selection Quick Guide
- **Fast & cheap** → `sora-2` or `veo-3.1`
- **High quality** → `sora-2-pro`
- **Realistic/cinematic** → `veo-3.1`
- **Human speech/lip-sync** → `wan-2.5` (requires image)
- **Let AI decide** → `auto`
