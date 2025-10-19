# Phase 4 Setup Guide - Social Media Publishing

Quick setup guide for Phase 4 social media publishing features.

## Prerequisites

- Phase 1, 2, and 3 completed
- ffmpeg installed (`brew install ffmpeg` on macOS)
- Google Cloud Project with YouTube Data API v3 enabled
- Anthropic API key (for metadata generation)

## Quick Setup

### 1. Install Dependencies

```bash
cd apps/content-gen/backend
arch -arm64 uv sync
```

Dependencies added:
- google-auth, google-auth-oauthlib, google-api-python-client (YouTube)
- pillow (thumbnail processing)
- httpx (async HTTP)

### 2. Configure YouTube OAuth

**Step 2.1: Create Google Cloud Project**
1. Go to https://console.cloud.google.com
2. Create new project: "Content Gen Publishing"
3. Enable YouTube Data API v3:
   - APIs & Services → Library
   - Search "YouTube Data API v3"
   - Click Enable

**Step 2.2: Create OAuth Credentials**
1. APIs & Services → Credentials
2. Create Credentials → OAuth client ID
3. Application type: **Desktop app**
4. Name: "Content Gen Desktop"
5. Download JSON file

**Step 2.3: Save Credentials**
```bash
mkdir -p apps/content-gen/backend/credentials
# Save downloaded file as:
# apps/content-gen/backend/credentials/youtube_credentials.json
```

### 3. Update Environment Variables

Add to `apps/content-gen/backend/.env`:

```bash
# Phase 4: Social Media Publishing

# YouTube
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_CREDENTIALS_FILE=./credentials/youtube_credentials.json

# Anthropic (for metadata generation)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Future platforms
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=

# Redis (for scheduled publishing - future)
REDIS_URL=redis://localhost:6379/0
ENABLE_SCHEDULED_PUBLISHING=false
```

### 4. Start the Server

```bash
cd apps/content-gen
./start.sh
```

API endpoints available at:
- `http://localhost:4444/api/v1/publish/*`

### 5. First-Time YouTube Authentication

When you first publish a video, a browser window will open:

1. Sign in to your YouTube account
2. Grant permissions to the app
3. Token saved to `credentials/youtube_token.json`
4. Future requests use this token (auto-refreshes)

## API Endpoints

### Generate Metadata
```bash
POST /api/v1/publish/metadata
```
AI-powered metadata generation using Claude

### Publish to YouTube
```bash
POST /api/v1/publish/youtube
```
Upload video with optimized metadata

### Bulk Publish
```bash
POST /api/v1/publish/bulk
```
Publish to multiple platforms (currently YouTube only)

### List Published Videos
```bash
GET /api/v1/publish?platform=youtube&status=published
```

### Get Video Analytics
```bash
GET /api/v1/publish/{id}/analytics?refresh=true
```
Fetch views, likes, comments from YouTube

### Retry Failed Publish
```bash
POST /api/v1/publish/{id}/retry
```

### Delete Published Video
```bash
DELETE /api/v1/publish/{id}?delete_from_platform=true
```

## Quick Test

```bash
# 1. Generate a test video (from Phase 3)
curl -X POST http://localhost:4444/api/v1/videos \
  -F 'prompt=A beautiful sunset over mountains' \
  -F 'model=sora-2' \
  -F 'seconds=4' \
  -F 'size=1920x1080'

# 2. Wait for completion (get video_id from response)
VIDEO_ID="video_abc123"

# 3. Generate metadata
curl -X POST http://localhost:4444/api/v1/publish/metadata \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": "'$VIDEO_ID'",
    "platform": "youtube",
    "target_audience": "Nature lovers",
    "tone": "peaceful and inspiring"
  }' > metadata.json

# 4. Publish to YouTube (browser OAuth first time)
curl -X POST http://localhost:4444/api/v1/publish/youtube \
  -H "Content-Type: application/json" \
  -d @metadata.json

# 5. Check result
curl http://localhost:4444/api/v1/publish
```

## Troubleshooting

### OAuth Issues
```bash
# Delete token and re-authenticate
rm credentials/youtube_token.json

# Next publish will trigger OAuth flow again
```

### YouTube API Quota
- Free tier: 10,000 units/day
- Video upload: ~1,600 units
- Check quota: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas

### ffmpeg Not Found
```bash
# macOS
brew install ffmpeg

# Linux
sudo apt-get install ffmpeg
```

### Dependencies Not Installing
```bash
# Reinstall with architecture flag
cd apps/content-gen/backend
arch -arm64 uv sync --reinstall
```

## What's Included

- ✅ YouTube full integration (upload, metadata, analytics, thumbnails)
- ✅ AI-powered metadata generation (Claude)
- ✅ Video format conversion (ffmpeg)
- ✅ Platform-specific optimization
- ✅ Bulk publishing support
- ✅ Analytics tracking
- ⏳ TikTok (coming soon)
- ⏳ Instagram (coming soon)
- ⏳ Scheduled publishing (coming soon)

## Files Created

```
apps/content-gen/backend/src/content_gen_backend/
├── models/
│   └── publishing.py              # Publishing data models
├── services/
│   ├── metadata_service.py        # Claude AI metadata generation
│   ├── youtube_service.py         # YouTube API integration
│   └── video_formatter.py         # Video format conversion
└── routers/
    └── publishing.py              # Publishing API endpoints
```

## Next Steps

1. Test metadata generation
2. Publish a video to YouTube
3. Check analytics
4. Explore bulk publishing
5. Review Phase 4 Complete documentation

See `PHASE4_COMPLETE.md` for full documentation.
