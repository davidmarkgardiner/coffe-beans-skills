# Phase 5 Quick Start Guide

## 🎯 Goal
Build frontend UI for publishing dashboard and video-to-YouTube workflow.

## ⚡ 3-Minute Summary

### What's Already Done (Phase 4)
- ✅ Backend APIs for publishing (8 endpoints)
- ✅ YouTube OAuth and upload working
- ✅ AI metadata generation (Claude)
- ✅ First video published: https://www.youtube.com/watch?v=fhHhs2bSp5s

### What You Need to Build (Phase 5)
- 🎨 Publishing Dashboard UI
- 🎨 "Publish to YouTube" button in Video Library
- 🎨 Analytics display
- 🎨 Navigation menu

---

## 🚀 Start Here

### 1. Test the Backend (2 minutes)

```bash
# Start server (already running at http://localhost:4444)
cd apps/content-gen
./start.sh

# Test metadata generation
curl -X POST http://localhost:4444/api/v1/publish/metadata \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": "test_video",
    "platform": "youtube",
    "tone": "professional"
  }' | jq '.'

# Test list published videos
curl http://localhost:4444/api/v1/publish | jq '.'
```

### 2. Create Publishing Dashboard (10 minutes)

```bash
cd apps/content-gen/frontend
touch src/components/PublishingDashboard.vue
```

**Minimal working version:**

```vue
<template>
  <div class="dashboard">
    <h1>Published Videos</h1>

    <div v-for="video in videos" :key="video.id" class="video-card">
      <h3>{{ video.title }}</h3>
      <div class="stats">
        <span>👁️ {{ video.views }}</span>
        <span>👍 {{ video.likes }}</span>
        <span>💬 {{ video.comments }}</span>
      </div>
      <a :href="video.platform_url" target="_blank">View on YouTube</a>
      <button @click="refresh(video.id)">Refresh Stats</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const videos = ref([])

const fetchVideos = async () => {
  const response = await fetch('http://localhost:4444/api/v1/publish')
  const data = await response.json()
  videos.value = data.videos
}

const refresh = async (id) => {
  await fetch(`http://localhost:4444/api/v1/publish/${id}/analytics?refresh=true`)
  await fetchVideos()
}

onMounted(fetchVideos)
</script>

<style scoped>
.video-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
}
.stats span {
  margin-right: 1rem;
}
</style>
```

### 3. Add to App.vue (2 minutes)

```vue
<script setup>
import VideoGenerator from './components/VideoGenerator.vue'
import PublishingDashboard from './components/PublishingDashboard.vue'
import { ref } from 'vue'

const currentView = ref('generator')
</script>

<template>
  <div id="app">
    <nav>
      <button @click="currentView = 'generator'">Videos</button>
      <button @click="currentView = 'publishing'">Published</button>
    </nav>

    <VideoGenerator v-if="currentView === 'generator'" />
    <PublishingDashboard v-if="currentView === 'publishing'" />
  </div>
</template>
```

### 4. Add Publish Button to Video Library (5 minutes)

Add this to `VideoGenerator.vue` or `VideoCreator.vue`:

```vue
<template>
  <!-- After video is complete -->
  <div v-if="video.status === 'completed'">
    <button @click="publishToYouTube" :disabled="publishing">
      {{ publishing ? 'Publishing...' : 'Publish to YouTube' }}
    </button>
  </div>
</template>

<script setup>
const publishing = ref(false)

const publishToYouTube = async () => {
  publishing.value = true

  try {
    // 1. Generate metadata
    const metaResponse = await fetch('http://localhost:4444/api/v1/publish/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_id: video.value.id,
        platform: 'youtube',
        tone: 'engaging'
      })
    })
    const metadata = await metaResponse.json()

    // 2. Publish
    const pubResponse = await fetch('http://localhost:4444/api/v1/publish/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_id: video.value.id,
        platform: 'youtube',
        metadata: metadata.youtube_metadata
      })
    })
    const result = await pubResponse.json()

    // 3. Success!
    alert(`Published! ${result.platform_url}`)
    window.open(result.platform_url, '_blank')

  } catch (error) {
    alert(`Failed: ${error.message}`)
  } finally {
    publishing.value = false
  }
}
</script>
```

---

## 📚 API Reference (Copy-Paste Ready)

### Generate Metadata
```javascript
const response = await fetch('http://localhost:4444/api/v1/publish/metadata', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    video_id: 'video_abc123',
    platform: 'youtube',  // or 'tiktok', 'instagram'
    target_audience: 'Tech enthusiasts',
    tone: 'professional'
  })
})
const metadata = await response.json()
// Returns: { title, description, tags, youtube_metadata }
```

### Publish to YouTube
```javascript
const response = await fetch('http://localhost:4444/api/v1/publish/youtube', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    video_id: 'video_abc123',
    platform: 'youtube',
    metadata: {
      title: 'Video Title',
      description: 'Description...',
      tags: ['tag1', 'tag2'],
      category_id: '28',
      privacy: 'public',
      made_for_kids: false
    }
  })
})
const result = await response.json()
// Returns: { id, platform_url, status: 'published', ... }
```

### List Published Videos
```javascript
const response = await fetch('http://localhost:4444/api/v1/publish?platform=youtube')
const data = await response.json()
// Returns: { videos: [...], total, page, page_size }
```

### Get Analytics (with refresh)
```javascript
const response = await fetch(
  `http://localhost:4444/api/v1/publish/${publishId}/analytics?refresh=true`
)
const stats = await response.json()
// Returns: { views, likes, comments, shares, timestamp }
```

### Retry Failed Publish
```javascript
await fetch(`http://localhost:4444/api/v1/publish/${publishId}/retry`, {
  method: 'POST'
})
```

---

## 🎨 UI Mockup

```
┌────────────────────────────────────────────────────────────┐
│  Content Gen                                    [Videos] [Published] [Analytics]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Published Videos Dashboard                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ AI Tools for Content Creators in 2024               │  │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │ 🎬 YouTube  ✅ Published                             │  │
│  │ 👁️ 0 views  👍 0 likes  💬 0 comments               │  │
│  │                                                      │  │
│  │ [View on YouTube]  [Refresh Stats]  [Delete]       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ (Next video...)                                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

### Minimum Viable UI (1-2 hours)
- [ ] Create `PublishingDashboard.vue`
- [ ] Display list of published videos
- [ ] Show YouTube URL links
- [ ] Show basic stats (views, likes, comments)
- [ ] Add "Refresh Stats" button
- [ ] Add navigation in `App.vue`

### Enhanced Features (2-3 hours)
- [ ] Add "Publish to YouTube" button in video library
- [ ] Metadata generation UI
- [ ] Edit metadata before publish
- [ ] Retry failed publishes
- [ ] Delete published videos
- [ ] Platform filter (YouTube, TikTok, Instagram)
- [ ] Status badges (published, failed, publishing)

### Polish (1-2 hours)
- [ ] Loading states
- [ ] Error messages
- [ ] Success notifications
- [ ] Responsive design
- [ ] Icons and styling

---

## 🆘 Common Issues

### Issue: CORS Error
**Solution:** Backend already has CORS configured for localhost:3333

### Issue: 404 on API calls
**Solution:** Make sure backend is running on port 4444
```bash
curl http://localhost:4444/health
```

### Issue: No published videos showing
**Solution:** Publish a test video first:
```bash
# Generate a test video, then use the API to publish it
```

---

## 📖 Full Documentation

See detailed docs:
- `PHASE4_TO_PHASE5_HANDOFF.md` - Complete handoff guide
- `PHASE4_COMPLETE.md` - Technical documentation
- `PHASE4_TEST_RESULTS.md` - Test results

---

## 🎯 Success Criteria

Phase 5 is complete when:
- [ ] Users can view all published videos
- [ ] Users can see real-time analytics
- [ ] Users can publish a video in < 3 clicks
- [ ] Users can retry failed publishes
- [ ] Navigation works smoothly

**Time Estimate:** 4-6 hours for core features

Good luck! 🚀
