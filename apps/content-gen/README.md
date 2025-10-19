# Content Generation App - Sora Video Generation

A full-stack application for AI-powered video generation using **OpenAI's Sora API**.

## Overview

This application provides a complete interface for generating videos using OpenAI's Sora text-to-video models. It consists of a FastAPI backend that wraps the Sora API and a Vue.js frontend for user interaction.

**Yes, this uses the OpenAI Sora API** for all video generation capabilities.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                    Vue.js Frontend (Port 3333)               │
│  - Video creation form with templates                        │
│  - Real-time status polling                                  │
│  - Video library with playback                               │
│  - Download & management features                            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Port 4444)               │
│  - REST API endpoints                                        │
│  - Service layer (SoraService)                               │
│  - Video storage management                                  │
│  - Status polling & progress tracking                        │
└────────────────────────┬────────────────────────────────────┘
                         │ AsyncOpenAI Client
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenAI Sora API                           │
│  - Text-to-video generation                                  │
│  - Video status & progress                                   │
│  - Video content delivery                                    │
│  - Model: sora-2, sora-2-pro                                 │
└─────────────────────────────────────────────────────────────┘
```

## How It Works

### Video Generation Flow

```
User submits prompt → Backend creates Sora job → Polls for completion → Returns video
```

**Detailed Steps:**

1. **User Input**: User provides a text prompt describing the desired video
2. **API Request**: Frontend sends POST to `/api/v1/videos/generate`
3. **Sora Job Creation**: Backend calls `AsyncOpenAI().videos.create()` with:
   - `prompt`: Text description
   - `model`: "sora-2" or "sora-2-pro"
   - `seconds`: Duration (4, 8, or 12 seconds)
   - `size`: Resolution (1280x720, 720x1280, 1024x1792, 1792x1024)
4. **Status Polling**: Backend polls Sora API every 5 seconds using exponential backoff
5. **Video Retrieval**: On completion, video is downloaded and stored locally
6. **User Notification**: Frontend receives completion status and displays video

### Sora API Integration

The backend uses OpenAI's official Python client (see `backend/src/content_gen_backend/services/sora_service.py:18-28`):

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=settings.openai_api_key)

# Create video
video_job = await client.videos.create(
    prompt=prompt,
    model=model,
    seconds=seconds,
    size=size
)
```

### Supported Features

**Models:**
- `sora-2`: Fast generation, standard quality
- `sora-2-pro`: Slower generation, high quality

**Resolutions:**
- `1280x720`: HD 720p Landscape
- `720x1280`: HD 720p Portrait
- `1024x1792`: Vertical 9:16
- `1792x1024`: Wide 16:9

**Durations:**
- 4 seconds
- 8 seconds
- 12 seconds

**Additional Features:**
- Reference image upload for style guidance
- Prompt templates for quick start
- Video remixing (modify existing videos)
- Video library with management

## Project Structure

```
apps/content-gen/
├── README.md                           # This file
├── start.sh                            # Convenience launcher
├── backend/                            # FastAPI backend (Port 4444)
│   ├── .env                            # Configuration
│   ├── .venv/                          # Python virtual environment
│   ├── videos/                         # Generated video storage
│   ├── pyproject.toml                  # Python dependencies
│   └── src/
│       └── content_gen_backend/
│           ├── main.py                 # FastAPI app entry point
│           ├── config.py               # Settings (Pydantic)
│           ├── api/
│           │   └── v1/
│           │       └── videos.py       # Video endpoints
│           └── services/
│               └── sora_service.py     # Sora API wrapper
├── frontend/                           # Vue.js frontend (Port 3333)
│   ├── package.json                    # npm dependencies
│   ├── vite.config.ts                  # Vite configuration
│   └── src/
│       ├── App.vue                     # Root component
│       ├── main.ts                     # Vue app entry point
│       ├── components/
│       │   ├── VideoGenerator.vue      # Main video creation UI
│       │   └── VideoCreator.vue        # Alternative form layout
│       ├── composables/
│       │   └── useVideoGeneration.ts   # API client logic
│       └── types/
│           └── video.ts                # TypeScript types
└── agents/                             # Agent working directory
```

## Quick Start

### Prerequisites

- Python 3.12.8+
- Node.js 22.16.0+
- npm 10.9.2+
- uv (Python package manager)
- OpenAI API key with Sora access

### Start Both Services (Recommended)

```bash
./start.sh
```

This will:
1. Kill any processes on ports 4444 and 3333
2. Start backend at http://localhost:4444
3. Start frontend at http://localhost:3333

**Access:**
- Frontend UI: http://localhost:3333
- Backend API: http://localhost:4444
- Health Check: http://localhost:4444/health

### Or Start Individually

**Backend:**
```bash
cd backend
# Ensure .env file exists with OPENAI_API_KEY
arch -arm64 uv run uvicorn src.content_gen_backend.main:app --reload --port 4444
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev -- --port 3333
```

## Configuration

### Backend Environment Variables

**Required:**
- `OPENAI_API_KEY`: Your OpenAI API key with Sora access

**Optional:**
- `VIDEO_STORAGE_PATH`: Local storage directory (default: "./videos")
- `MAX_POLL_TIMEOUT`: Max seconds to wait for video (default: 600)
- `DEFAULT_MODEL`: Default Sora model (default: "sora-2")
- `DEFAULT_SIZE`: Default resolution (default: "1280x720")
- `DEFAULT_SECONDS`: Default duration (default: 4)
- `MAX_FILE_SIZE`: Max upload file size in bytes (default: 10485760)

**Setup .env:**
```bash
cd backend
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
VIDEO_STORAGE_PATH=./videos
MAX_POLL_TIMEOUT=600
DEFAULT_MODEL=sora-2
DEFAULT_SIZE=1280x720
DEFAULT_SECONDS=4
MAX_FILE_SIZE=10485760
EOF
```

## API Endpoints

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "content-gen-backend"
}
```

### Create Video
```bash
POST /api/v1/videos/generate
```

**Request Body:**
```json
{
  "prompt": "A calico cat playing piano on stage under spotlight",
  "model": "sora-2",
  "seconds": 4,
  "size": "1280x720"
}
```

**Response:**
```json
{
  "id": "video_abc123",
  "status": "queued",
  "progress": 0,
  "model": "sora-2",
  "seconds": 4,
  "size": "1280x720",
  "created_at": 1704067200
}
```

### Get Video Status
```bash
GET /api/v1/videos/{video_id}
```

**Status Values:**
- `queued`: Waiting to start
- `in_progress`: Generating (includes progress percentage)
- `completed`: Ready to download
- `failed`: Generation failed

### Download Video
```bash
GET /api/v1/videos/{video_id}/download?output_type=video
```

**Response:** Binary video file (MP4)

### List Videos
```bash
GET /api/v1/videos?limit=20&order=desc
```

### Delete Video
```bash
DELETE /api/v1/videos/{video_id}
```

### Remix Video
```bash
POST /api/v1/videos/{video_id}/remix
```

## Usage Examples

### Using the Frontend UI

1. **Open the app**: http://localhost:3333
2. **Choose a template** or write your own prompt
3. **Select options**:
   - Model: sora-2 (fast) or sora-2-pro (high quality)
   - Duration: 4, 8, or 12 seconds
   - Resolution: Choose from 4 aspect ratios
4. **Optional**: Upload a reference image
5. **Click "Generate Video"**
6. **Watch progress**: Status updates every 2 seconds
7. **Download**: Once complete, click download button

### Using the API Directly

**Create a video:**
```bash
curl -X POST http://localhost:4444/api/v1/videos/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A serene mountain lake at sunrise with mist",
    "model": "sora-2",
    "seconds": 8,
    "size": "1792x1024"
  }'
```

**Check status:**
```bash
curl http://localhost:4444/api/v1/videos/video_abc123
```

**Download video:**
```bash
curl http://localhost:4444/api/v1/videos/video_abc123/download?output_type=video \
  --output my_video.mp4
```

## Troubleshooting

### "Port already in use"

```bash
lsof -ti:4444 | xargs kill -9  # Backend
lsof -ti:3333 | xargs kill -9  # Frontend
```

### "Architecture mismatch" error on Apple Silicon

If you see `ImportError: dlopen ... incompatible architecture`:

```bash
cd backend
arch -arm64 uv sync --reinstall
```

Ensure `start.sh` uses `arch -arm64` (see line 22).

### "OpenAI API key not found"

Verify your `.env` file:
```bash
cd backend
cat .env | grep OPENAI_API_KEY
```

### "Invalid resolution" error

Ensure you're using only supported resolutions:
- ✅ 1280x720, 720x1280, 1024x1792, 1792x1024
- ❌ 1920x1080, 1024x1024, 640x480

## Cost Management

Sora API usage incurs costs based on:
- **Model**: sora-2-pro costs more than sora-2
- **Duration**: Longer videos cost more
- **Resolution**: Higher resolutions cost more

**Tips to minimize costs:**
1. Use `sora-2` for development/testing
2. Start with 4-second videos
3. Use smaller resolutions (1280x720)
4. Delete unused videos regularly
5. Monitor usage via OpenAI dashboard

## Support

For issues with this app:
1. Check `backend/logs/` for error logs
2. Verify API key in `backend/.env`
3. Test backend health: `curl http://localhost:4444/health`
4. Check browser console for frontend errors

For complete deployment guide, see `DEPLOYMENT.md` and `SETUP_COMPLETE.md` in project root.

## Built With

- **Backend**: FastAPI, AsyncOpenAI, Pydantic, uvicorn
- **Frontend**: Vue.js 3, TypeScript, Vite
- **Video Generation**: OpenAI Sora API (sora-2, sora-2-pro)
- **Package Management**: uv (backend), npm (frontend)

---

**Ready to generate videos!** 🎥

Start with: `./start.sh`
