# Phase 2: AI Creative Ideation Engine ✅ COMPLETE

## Overview
Phase 2 adds **AI-powered creative video idea generation** using Claude 3.5 Sonnet! This phase enables automated generation of 5-10 unique video concepts per news article, with human curation workflow.

## What Was Built

### 1. Database Layer
- **video_ideas table** with fields:
  - id, article_id (foreign key)
  - title, concept, video_prompt
  - style, estimated_duration
  - is_approved, approved_by, approved_at
  - created_at

**Files:**
- `backend/src/content_gen_backend/models/idea.py` - Database and API models

### 2. Idea Service with Claude Integration
- Claude 3.5 Sonnet API integration for creative ideation
- Intelligent prompt engineering for viral video concepts
- Support for 8 video styles:
  - Comedic, Dramatic, Satirical
  - Educational, Action, Slow Motion
  - Documentary, Meme
- Generates detailed video prompts for Sora/Veo generation
- JSON response parsing with error handling
- Automatic article marking as "processed"

**Files:**
- `backend/src/content_gen_backend/services/idea_service.py` - Claude-powered idea generation

### 3. REST API Endpoints
All endpoints available at `/api/v1/ideas`:

#### POST /api/v1/ideas/generate
Generate video ideas from a news article using Claude
```json
{
  "article_id": "uuid",
  "num_ideas": 5,
  "styles": ["comedic", "dramatic"]  // optional
}
```

**Response:**
```json
{
  "article_id": "uuid",
  "ideas_generated": 5,
  "ideas": [
    {
      "id": "uuid",
      "title": "The Fall Heard Round the World",
      "concept": "Dramatic slow-motion recreation",
      "video_prompt": "Detailed prompt for AI video generation...",
      "style": "dramatic",
      "estimated_duration": 45,
      "is_approved": false
    }
  ]
}
```

#### GET /api/v1/ideas
List ideas with filtering and pagination
- Query params: `article_id`, `is_approved`, `style`, `page`, `page_size`

#### GET /api/v1/ideas/{id}
Get specific idea

#### PUT /api/v1/ideas/{id}/approve
Approve or reject an idea
```json
{
  "is_approved": true,
  "approved_by": "username"
}
```

#### DELETE /api/v1/ideas/{id}
Delete an idea

### 4. Claude Prompt Engineering

The system uses carefully crafted prompts to generate:

1. **Catchy Titles** (max 60 chars) - Clickbait-worthy
2. **Concept Descriptions** - One-sentence video summaries
3. **Detailed Video Prompts** - Specific instructions for AI video models:
   - Visual descriptions
   - Camera angles and movement
   - Lighting and mood
   - Style and aesthetic
   - Action and pacing

**Example Generated Idea:**
```json
{
  "title": "Honor's Robo-Cam: Tech's Weirdest Flex",
  "concept": "Comedic breakdown of Honor's robotic camera phone in meme format",
  "video_prompt": "Fast-paced montage of a smartphone with a robotic camera arm extending dramatically, intercut with confused people's reactions, bright colorful lighting, dynamic quick cuts, techno music background, modern minimalist aesthetic with floating text overlays saying 'Why tho?', shot in 4K with trendy TikTok-style editing",
  "style": "meme",
  "estimated_duration": 45
}
```

## Database Structure

```sql
video_ideas
├── id (UUID, primary key)
├── article_id (UUID, foreign key → news_articles)
├── title (string, max 200)
├── concept (text)
├── video_prompt (text)
├── style (string, indexed)
├── estimated_duration (integer, seconds)
├── is_approved (boolean, indexed)
├── approved_by (string)
├── approved_at (datetime)
└── created_at (datetime, auto)
```

## How to Use

### 1. Restart the Server

```bash
# Stop the server (Ctrl+C if running)
cd apps/content-gen
./start.sh
```

The new `video_ideas` table will be created automatically on startup.

### 2. Generate Ideas for an Article

**Step 1: Get an article ID**
```bash
curl http://localhost:4444/api/v1/news | python3 -m json.tool | grep '"id"' | head -1
```

**Step 2: Generate ideas**
```bash
curl -X POST http://localhost:4444/api/v1/ideas/generate \
  -H "Content-Type: application/json" \
  -d '{
    "article_id": "386ebe58-ce3c-4f66-be2e-ebe872fa30ce",
    "num_ideas": 5
  }'
```

**Step 3: List generated ideas**
```bash
curl http://localhost:4444/api/v1/ideas?article_id=386ebe58-ce3c-4f66-be2e-ebe872fa30ce
```

### 3. Curate Ideas (Approve/Reject)

**Approve an idea:**
```bash
curl -X PUT http://localhost:4444/api/v1/ideas/{idea_id}/approve \
  -H "Content-Type: application/json" \
  -d '{
    "is_approved": true,
    "approved_by": "david"
  }'
```

**List only approved ideas:**
```bash
curl "http://localhost:4444/api/v1/ideas?is_approved=true"
```

## API Examples

### Generate Ideas with Specific Styles

```bash
curl -X POST http://localhost:4444/api/v1/ideas/generate \
  -H "Content-Type: application/json" \
  -d '{
    "article_id": "YOUR_ARTICLE_ID",
    "num_ideas": 3,
    "styles": ["comedic", "meme"]
  }'
```

### Filter Ideas by Style

```bash
curl "http://localhost:4444/api/v1/ideas?style=comedic&page=1&page_size=10"
```

### Get All Unapproved Ideas

```bash
curl "http://localhost:4444/api/v1/ideas?is_approved=false"
```

### Batch Workflow

```bash
# 1. Fetch news
curl -X POST http://localhost:4444/api/v1/news/fetch \
  -H "Content-Type: application/json" \
  -d '{"category": "technology", "page_size": 5}'

# 2. Get article IDs
curl http://localhost:4444/api/v1/news?category=technology | python3 -m json.tool

# 3. Generate ideas for each article
for article_id in "id1" "id2" "id3"; do
  curl -X POST http://localhost:4444/api/v1/ideas/generate \
    -H "Content-Type: application/json" \
    -d "{\"article_id\": \"$article_id\", \"num_ideas\": 5}"
done

# 4. Review and approve favorite ideas
curl http://localhost:4444/api/v1/ideas | python3 -m json.tool
```

## Success Criteria ✅

- [x] Claude 3.5 Sonnet integration working
- [x] Video ideas generated with creative titles
- [x] Detailed video prompts suitable for Sora/Veo
- [x] Multiple video styles supported
- [x] Approval/rejection workflow
- [x] Filtering by style and approval status
- [x] Articles marked as processed
- [x] All API endpoints functional

## Files Created/Modified

**New Files:**
- `backend/src/content_gen_backend/models/idea.py`
- `backend/src/content_gen_backend/services/idea_service.py`
- `backend/src/content_gen_backend/routers/ideas.py`

**Modified Files:**
- `backend/src/content_gen_backend/main.py` - Added ideas router
- `backend/.env` - Added ANTHROPIC_API_KEY

## Claude Model Details

**Model:** `claude-3-5-sonnet-20241022`
**Temperature:** 0.9 (high creativity)
**Max Tokens:** 4000
**Cost:** ~$0.003/1K input tokens, ~$0.015/1K output tokens

Typical cost per idea generation (5 ideas):
- Input: ~1K tokens
- Output: ~1.5K tokens
- **Total: ~$0.025 per article**

## Example Generated Ideas

### Input: Honor's Robotic Camera Phone (Tech News)

**Generated Ideas:**

1. **"Honor's Robo-Cam: Tech's Weirdest Flex"**
   - Style: Meme
   - Concept: Comedic breakdown in viral format
   - Prompt: Fast-paced montage with confused reactions...

2. **"The Future is Folding: Honor's Camera Revolution"**
   - Style: Documentary
   - Concept: Professional tech analysis
   - Prompt: Sleek product showcase with voiceover...

3. **"Unboxing the ROBOT PHONE"**
   - Style: Action
   - Concept: Dynamic unboxing experience
   - Prompt: Explosive unboxing with dramatic reveals...

4. **"Camera Arm Fail Compilation"**
   - Style: Comedic
   - Concept: Imagined humorous scenarios
   - Prompt: Split-screen scenarios of arm getting stuck...

5. **"Honor's AI Phone: What It Means for Photography"**
   - Style: Educational
   - Concept: Technical breakdown for creators
   - Prompt: Clean educational style with graphics...

## Architecture

```
┌─────────────────────────────────────────────────┐
│            News Article (Phase 1)               │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│          IdeaService                            │
│  - generate_ideas(article_id, num_ideas)        │
│  - Claude 3.5 Sonnet API call                   │
│  - Prompt engineering                           │
│  - JSON parsing                                 │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│          SQLite Database                        │
│          video_ideas table                      │
│          (5-10 ideas per article)               │
└─────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│          Ideas Router (REST API)                │
│  POST /api/v1/ideas/generate                    │
│  GET  /api/v1/ideas                             │
│  GET  /api/v1/ideas/{id}                        │
│  PUT  /api/v1/ideas/{id}/approve                │
│  DELETE /api/v1/ideas/{id}                      │
└─────────────────────────────────────────────────┘
```

## Performance Metrics

- **Generation Time**: 5-10 seconds for 5 ideas
- **Claude API**: ~2-5 seconds response time
- **Database Save**: < 100ms for 5 ideas
- **Total API Response**: 5-10 seconds end-to-end

## Workflow

```
1. User fetches news articles (Phase 1)
   ↓
2. User selects article to generate ideas
   ↓
3. POST /api/v1/ideas/generate
   ↓
4. Claude generates 5-10 creative concepts
   ↓
5. Ideas saved to database
   ↓
6. Article marked as "processed"
   ↓
7. User reviews ideas in UI/API
   ↓
8. User approves favorite ideas
   ↓
9. Approved ideas ready for Phase 3 (Video Generation)
```

## Next Steps: Phase 3

Phase 3 will add **Multi-Model Video Generation**:
1. Extend existing Sora service
2. Add Google Veo3 integration
3. Create model router service
4. Support multiple video models per idea
5. Video comparison features

---

**Phase 2 Status**: ✅ **COMPLETE**

**Date Completed**: 2025-10-16

**Ready for**: Phase 3 - Multi-Model Video Generation

## Quick Test Script

```bash
#!/bin/bash
# Phase 2 Quick Test

# Get first article
ARTICLE_ID=$(curl -s http://localhost:4444/api/v1/news | python3 -c "import sys, json; print(json.load(sys.stdin)['articles'][0]['id'])")

echo "Generating ideas for article: $ARTICLE_ID"

# Generate ideas
curl -s -X POST http://localhost:4444/api/v1/ideas/generate \
  -H "Content-Type: application/json" \
  -d "{\"article_id\": \"$ARTICLE_ID\", \"num_ideas\": 5}" | python3 -m json.tool

# List ideas
echo "\nAll generated ideas:"
curl -s http://localhost:4444/api/v1/ideas | python3 -m json.tool
```

Save as `test_phase2.sh` and run: `chmod +x test_phase2.sh && ./test_phase2.sh`
