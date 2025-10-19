<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface VideoIdea {
  id: string
  article_id: string
  title: string
  concept: string
  video_prompt: string
  style: string
  target_audience?: string
  estimated_length?: string
  is_approved: boolean
  approved_by?: string
  approved_at?: string
  created_at: string
}

interface IdeasResponse {
  ideas: VideoIdea[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

interface GenerateResponse {
  article_id: string
  ideas_generated: number
  ideas: VideoIdea[]
}

const props = defineProps<{
  articleId?: string
}>()

const emit = defineEmits<{
  generateVideo: [idea: VideoIdea]
}>()

const ideas = ref<VideoIdea[]>([])
const loading = ref(false)
const generating = ref(false)
const approving = ref<Record<string, boolean>>({})
const error = ref<string | null>(null)
const filterApproved = ref<string>('all')
const selectedIdea = ref<VideoIdea | null>(null)
const showPromptDialog = ref(false)

const filteredIdeas = computed(() => {
  if (filterApproved.value === 'all') return ideas.value
  if (filterApproved.value === 'approved') return ideas.value.filter(i => i.is_approved)
  return ideas.value.filter(i => !i.is_approved)
})

const loadIdeas = async () => {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams()
    if (props.articleId) {
      params.append('article_id', props.articleId)
    }
    params.append('page_size', '100')

    const url = `http://localhost:4444/api/v1/ideas?${params.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to load ideas')
    }

    const data: IdeasResponse = await response.json()
    ideas.value = data.ideas
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Failed to load ideas:', err)
  } finally {
    loading.value = false
  }
}

const generateIdeas = async (articleId: string) => {
  generating.value = true
  error.value = null

  try {
    const response = await fetch('http://localhost:4444/api/v1/ideas/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article_id: articleId,
        num_ideas: 5
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to generate ideas')
    }

    const data: GenerateResponse = await response.json()
    alert(`Generated ${data.ideas_generated} video ideas!`)
    await loadIdeas()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Failed to generate ideas:', err)
    alert(`Failed to generate ideas: ${error.value}`)
  } finally {
    generating.value = false
  }
}

const approveIdea = async (ideaId: string, isApproved: boolean) => {
  approving.value[ideaId] = true

  try {
    const response = await fetch(`http://localhost:4444/api/v1/ideas/${ideaId}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_approved: isApproved,
        approved_by: 'user'
      })
    })

    if (!response.ok) {
      throw new Error('Failed to approve idea')
    }

    await loadIdeas()
  } catch (err) {
    console.error('Failed to approve idea:', err)
    alert('Failed to approve idea. Please try again.')
  } finally {
    approving.value[ideaId] = false
  }
}

const handleGenerateVideo = (idea: VideoIdea) => {
  emit('generateVideo', idea)
}

const viewPrompt = (idea: VideoIdea) => {
  selectedIdea.value = idea
  showPromptDialog.value = true
}

const closePromptDialog = () => {
  showPromptDialog.value = false
  selectedIdea.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const getStyleColor = (style: string) => {
  const styles: Record<string, string> = {
    comedic: '#ff9800',
    dramatic: '#9c27b0',
    educational: '#2196f3',
    inspirational: '#4caf50',
    documentary: '#795548',
    entertaining: '#e91e63'
  }
  return styles[style.toLowerCase()] || '#666'
}

// If articleId prop is provided, generate ideas automatically
if (props.articleId) {
  generateIdeas(props.articleId)
}

onMounted(loadIdeas)
</script>

<template>
  <div class="ideas-dashboard">
    <div class="dashboard-header">
      <h2>✨ Video Ideas</h2>
      <div class="header-actions">
        <select v-model="filterApproved" class="filter-select">
          <option value="all">All Ideas</option>
          <option value="approved">Approved Only</option>
          <option value="pending">Pending Review</option>
        </select>
      </div>
    </div>

    <p class="hint">Review AI-generated video ideas and approve the ones you want to create</p>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading && ideas.length === 0" class="loading-state">
      <p>{{ generating ? 'AI is generating creative ideas...' : 'Loading ideas...' }}</p>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !generating && filteredIdeas.length === 0" class="empty-state">
      <p>No video ideas yet.</p>
      <p class="hint">Go to News tab and click "Generate Ideas" on an article.</p>
    </div>

    <!-- Ideas Grid -->
    <div v-if="filteredIdeas.length > 0" class="ideas-grid">
      <div v-for="idea in filteredIdeas" :key="idea.id" class="idea-card">
        <div class="card-header">
          <span class="style-badge" :style="{ background: getStyleColor(idea.style) }">
            {{ idea.style }}
          </span>
          <span v-if="idea.is_approved" class="approved-badge">✓ Approved</span>
        </div>

        <h3 class="idea-title">{{ idea.title }}</h3>

        <p class="idea-concept">{{ idea.concept }}</p>

        <div class="idea-meta">
          <div v-if="idea.target_audience" class="meta-item">
            <span class="meta-label">👥 Audience:</span>
            <span class="meta-value">{{ idea.target_audience }}</span>
          </div>
          <div v-if="idea.estimated_length" class="meta-item">
            <span class="meta-label">⏱️ Length:</span>
            <span class="meta-value">{{ idea.estimated_length }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">📅 Created:</span>
            <span class="meta-value">{{ formatDate(idea.created_at) }}</span>
          </div>
        </div>

        <div class="card-actions">
          <button @click="viewPrompt(idea)" class="action-btn secondary">
            View Prompt
          </button>

          <button
            v-if="!idea.is_approved"
            @click="approveIdea(idea.id, true)"
            :disabled="approving[idea.id]"
            class="action-btn approve"
          >
            {{ approving[idea.id] ? 'Approving...' : '✓ Approve' }}
          </button>

          <button
            v-if="idea.is_approved"
            @click="handleGenerateVideo(idea)"
            class="action-btn primary"
          >
            🎬 Create Video
          </button>

          <button
            v-if="idea.is_approved"
            @click="approveIdea(idea.id, false)"
            :disabled="approving[idea.id]"
            class="action-btn secondary"
          >
            Unapprove
          </button>
        </div>
      </div>
    </div>

    <!-- Prompt Dialog -->
    <div v-if="showPromptDialog && selectedIdea" class="dialog-overlay" @click="closePromptDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>Video Generation Prompt</h3>
          <button @click="closePromptDialog" class="close-btn">×</button>
        </div>

        <div class="dialog-body">
          <div class="prompt-section">
            <h4>{{ selectedIdea.title }}</h4>
            <p class="style-tag">Style: {{ selectedIdea.style }}</p>
          </div>

          <div class="prompt-section">
            <h5>Concept:</h5>
            <p>{{ selectedIdea.concept }}</p>
          </div>

          <div class="prompt-section">
            <h5>AI Prompt for Video Generation:</h5>
            <div class="prompt-box">
              {{ selectedIdea.video_prompt }}
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button @click="closePromptDialog" class="action-btn secondary">Close</button>
          <button
            v-if="!selectedIdea.is_approved"
            @click="approveIdea(selectedIdea.id, true); closePromptDialog()"
            class="action-btn approve"
          >
            ✓ Approve
          </button>
          <button
            v-if="!selectedIdea.is_approved"
            @click="async () => { await approveIdea(selectedIdea.id, true); handleGenerateVideo(selectedIdea); closePromptDialog(); }"
            class="action-btn primary"
          >
            🎬 Approve & Create Video
          </button>
          <button
            v-if="selectedIdea.is_approved"
            @click="handleGenerateVideo(selectedIdea); closePromptDialog()"
            class="action-btn primary"
          >
            🎬 Create Video
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ideas-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: black;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: black;
  font-size: 1rem;
  cursor: pointer;
}

.hint {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
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

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.idea-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: box-shadow 0.2s;
}

.idea-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.style-badge {
  padding: 0.25rem 0.75rem;
  color: white;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.approved-badge {
  padding: 0.25rem 0.75rem;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.idea-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: black;
  line-height: 1.4;
}

.idea-concept {
  margin: 0;
  color: #666;
  line-height: 1.5;
  flex: 1;
}

.idea-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
  font-size: 0.85rem;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
}

.meta-label {
  color: #666;
  min-width: 80px;
}

.meta-value {
  color: black;
  font-weight: 500;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
}

.action-btn {
  flex: 1;
  min-width: 120px;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn.primary {
  background: black;
  color: white;
}

.action-btn.primary:hover {
  background: #333;
}

.action-btn.approve {
  background: #4caf50;
  color: white;
}

.action-btn.approve:hover:not(:disabled) {
  background: #45a049;
}

.action-btn.approve:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
}

.action-btn.secondary {
  background: white;
  color: black;
  border: 1px solid #ccc;
}

.action-btn.secondary:hover {
  background: #f5f5f5;
  border-color: #999;
}

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: black;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: black;
}

.dialog-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.prompt-section {
  margin-bottom: 1.5rem;
}

.prompt-section:last-child {
  margin-bottom: 0;
}

.prompt-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: black;
}

.prompt-section h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.prompt-section p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.style-tag {
  color: #999;
  font-size: 0.9rem;
  font-style: italic;
}

.prompt-box {
  padding: 1rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  color: black;
  white-space: pre-wrap;
}

.dialog-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
}
</style>
