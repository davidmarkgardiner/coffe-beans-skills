<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface PublishedVideo {
  id: string
  video_id: string
  idea_id?: string
  platform: string
  status: string
  platform_video_id?: string
  platform_url?: string
  title: string
  description?: string
  tags?: string[]
  category?: string
  privacy: string
  scheduled_at?: string
  published_at?: string
  created_at: string
  updated_at: string
  views: number
  likes: number
  comments: number
  shares: number
  last_analytics_update?: string
  error_message?: string
  retry_count: number
}

interface PublishListResponse {
  videos: PublishedVideo[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

const videos = ref<PublishedVideo[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const refreshing = ref<Record<string, boolean>>({})
const selectedPlatform = ref<string>('all')
const selectedStatus = ref<string>('all')

const fetchVideos = async () => {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams()
    if (selectedPlatform.value !== 'all') {
      params.append('platform', selectedPlatform.value)
    }
    if (selectedStatus.value !== 'all') {
      params.append('status', selectedStatus.value)
    }

    const url = `http://localhost:4444/api/v1/publish${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch published videos')
    }

    const data: PublishListResponse = await response.json()
    videos.value = data.videos
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Failed to fetch videos:', err)
  } finally {
    loading.value = false
  }
}

const refresh = async (videoId: string) => {
  refreshing.value[videoId] = true

  try {
    const response = await fetch(
      `http://localhost:4444/api/v1/publish/${videoId}/analytics?refresh=true`
    )

    if (!response.ok) {
      throw new Error('Failed to refresh analytics')
    }

    await fetchVideos()
  } catch (err) {
    console.error('Failed to refresh analytics:', err)
    alert('Failed to refresh analytics. Please try again.')
  } finally {
    refreshing.value[videoId] = false
  }
}

const retryPublish = async (videoId: string) => {
  if (!confirm('Retry publishing this video?')) {
    return
  }

  try {
    const response = await fetch(
      `http://localhost:4444/api/v1/publish/${videoId}/retry`,
      { method: 'POST' }
    )

    if (!response.ok) {
      throw new Error('Failed to retry publish')
    }

    await fetchVideos()
    alert('Publish retried successfully!')
  } catch (err) {
    console.error('Failed to retry publish:', err)
    alert('Failed to retry publish. Please try again.')
  }
}

const deleteVideo = async (videoId: string) => {
  if (!confirm('Delete this published video record? (This will NOT delete from YouTube)')) {
    return
  }

  try {
    const response = await fetch(
      `http://localhost:4444/api/v1/publish/${videoId}`,
      { method: 'DELETE' }
    )

    if (!response.ok) {
      throw new Error('Failed to delete video')
    }

    await fetchVideos()
  } catch (err) {
    console.error('Failed to delete video:', err)
    alert('Failed to delete video. Please try again.')
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return '#4caf50'
    case 'failed':
      return '#f44336'
    case 'publishing':
      return '#ff9800'
    case 'draft':
      return '#9e9e9e'
    case 'scheduled':
      return '#2196f3'
    default:
      return '#666'
  }
}

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return '📺'
    case 'tiktok':
      return '🎵'
    case 'instagram':
      return '📸'
    default:
      return '🎬'
  }
}

onMounted(fetchVideos)
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>Published Videos Dashboard</h2>
      <button @click="fetchVideos" :disabled="loading" class="refresh-all-btn">
        {{ loading ? 'Loading...' : 'Refresh All' }}
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label for="platform-filter">Platform:</label>
        <select id="platform-filter" v-model="selectedPlatform" @change="fetchVideos">
          <option value="all">All Platforms</option>
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="status-filter">Status:</label>
        <select id="status-filter" v-model="selectedStatus" @change="fetchVideos">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
          <option value="publishing">Publishing</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading && videos.length === 0" class="loading-state">
      Loading published videos...
    </div>

    <!-- Empty State -->
    <div v-if="!loading && videos.length === 0" class="empty-state">
      <p>No published videos found.</p>
      <p class="hint">Start by publishing a video from the Library tab.</p>
    </div>

    <!-- Video Cards -->
    <div v-if="videos.length > 0" class="video-grid">
      <div v-for="video in videos" :key="video.id" class="video-card">
        <div class="card-header">
          <div class="platform-badge">
            {{ getPlatformIcon(video.platform) }} {{ video.platform.toUpperCase() }}
          </div>
          <div class="status-badge" :style="{ background: getStatusColor(video.status) }">
            {{ video.status.toUpperCase() }}
          </div>
        </div>

        <h3 class="video-title">{{ video.title }}</h3>

        <div class="video-meta">
          <div class="meta-item">
            <span class="meta-label">Published:</span>
            <span class="meta-value">{{ formatDate(video.published_at) }}</span>
          </div>
          <div v-if="video.platform_video_id" class="meta-item">
            <span class="meta-label">Video ID:</span>
            <span class="meta-value mono">{{ video.platform_video_id }}</span>
          </div>
        </div>

        <!-- Analytics -->
        <div v-if="video.status === 'published'" class="stats">
          <div class="stat">
            <span class="stat-icon">👁️</span>
            <span class="stat-value">{{ video.views.toLocaleString() }}</span>
            <span class="stat-label">views</span>
          </div>
          <div class="stat">
            <span class="stat-icon">👍</span>
            <span class="stat-value">{{ video.likes.toLocaleString() }}</span>
            <span class="stat-label">likes</span>
          </div>
          <div class="stat">
            <span class="stat-icon">💬</span>
            <span class="stat-value">{{ video.comments.toLocaleString() }}</span>
            <span class="stat-label">comments</span>
          </div>
          <div class="stat">
            <span class="stat-icon">🔄</span>
            <span class="stat-value">{{ video.shares.toLocaleString() }}</span>
            <span class="stat-label">shares</span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="video.status === 'failed' && video.error_message" class="error-box">
          <strong>Error:</strong> {{ video.error_message }}
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <a
            v-if="video.platform_url"
            :href="video.platform_url"
            target="_blank"
            class="action-btn primary"
          >
            View on {{ video.platform }}
          </a>

          <button
            v-if="video.status === 'published'"
            @click="refresh(video.id)"
            :disabled="refreshing[video.id]"
            class="action-btn secondary"
          >
            {{ refreshing[video.id] ? 'Refreshing...' : 'Refresh Stats' }}
          </button>

          <button
            v-if="video.status === 'failed'"
            @click="retryPublish(video.id)"
            class="action-btn retry"
          >
            Retry Publish
          </button>

          <button @click="deleteVideo(video.id)" class="action-btn danger">
            Delete
          </button>
        </div>

        <!-- Last Updated -->
        <div class="card-footer">
          <small>
            Last updated: {{ formatDate(video.updated_at) }}
            <span v-if="video.last_analytics_update">
              | Analytics: {{ formatDate(video.last_analytics_update) }}
            </span>
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: black;
}

.refresh-all-btn {
  padding: 0.75rem 1.5rem;
  background: black;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.refresh-all-btn:hover:not(:disabled) {
  background: #333;
}

.refresh-all-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: black;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: black;
  cursor: pointer;
}

.error-message {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state .hint {
  color: #999;
  font-size: 0.9rem;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.video-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: box-shadow 0.2s;
}

.video-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.platform-badge {
  padding: 0.25rem 0.75rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: black;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.video-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: black;
  line-height: 1.4;
}

.video-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
}

.meta-label {
  font-weight: 500;
  color: #666;
}

.meta-value {
  color: black;
}

.meta-value.mono {
  font-family: monospace;
  font-size: 0.85rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: black;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
}

.error-box {
  padding: 0.75rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
  font-size: 0.9rem;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s;
}

.action-btn.primary {
  background: black;
  color: white;
}

.action-btn.primary:hover {
  background: #333;
}

.action-btn.secondary {
  background: white;
  color: black;
  border: 1px solid #ccc;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #999;
}

.action-btn.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.retry {
  background: #ff9800;
  color: white;
}

.action-btn.retry:hover {
  background: #f57c00;
}

.action-btn.danger {
  background: white;
  color: #f44336;
  border: 1px solid #f44336;
}

.action-btn.danger:hover {
  background: #f44336;
  color: white;
}

.card-footer {
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
}

.card-footer small {
  color: #999;
  font-size: 0.8rem;
}
</style>
