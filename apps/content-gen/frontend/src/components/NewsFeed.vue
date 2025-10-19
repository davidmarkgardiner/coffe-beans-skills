<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface NewsArticle {
  id: string
  title: string
  description?: string
  content?: string
  author?: string
  source_name: string
  url: string
  image_url?: string
  published_at: string
  category: string
  is_processed: boolean
  created_at: string
}

interface NewsResponse {
  articles: NewsArticle[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

const emit = defineEmits<{
  generateIdeas: [articleId: string]
}>()

const articles = ref<NewsArticle[]>([])
const loading = ref(false)
const fetching = ref(false)
const error = ref<string | null>(null)
const selectedCategory = ref('general')
const selectedArticle = ref<NewsArticle | null>(null)

const categories = [
  { value: 'general', label: 'General' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'sports', label: 'Sports' },
  { value: 'science', label: 'Science' },
  { value: 'health', label: 'Health' }
]

const fetchFromAPI = async () => {
  fetching.value = true
  error.value = null

  try {
    const response = await fetch('http://localhost:4444/api/v1/news/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: selectedCategory.value,
        country: 'us',
        page_size: 20
      })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch news')
    }

    const data: NewsResponse = await response.json()
    articles.value = data.articles

    if (data.articles.length > 0) {
      alert(`Fetched ${data.articles.length} new articles!`)
    } else {
      alert('No new articles found. Showing cached articles.')
    }

    // Also load from database
    await loadArticles()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Failed to fetch news:', err)
  } finally {
    fetching.value = false
  }
}

const loadArticles = async () => {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams()
    if (selectedCategory.value !== 'all') {
      params.append('category', selectedCategory.value)
    }
    params.append('page_size', '50')

    const url = `http://localhost:4444/api/v1/news?${params.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to load articles')
    }

    const data: NewsResponse = await response.json()
    articles.value = data.articles
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Failed to load articles:', err)
  } finally {
    loading.value = false
  }
}

const handleGenerateIdeas = (article: NewsArticle) => {
  selectedArticle.value = article
  emit('generateIdeas', article.id)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(loadArticles)
</script>

<template>
  <div class="news-feed">
    <div class="feed-header">
      <h2>📰 News Feed</h2>
      <div class="header-actions">
        <select v-model="selectedCategory" @change="loadArticles" class="category-select">
          <option value="all">All Categories</option>
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
        <button @click="fetchFromAPI" :disabled="fetching" class="fetch-btn">
          {{ fetching ? 'Fetching...' : '🔄 Fetch Latest' }}
        </button>
      </div>
    </div>

    <p class="hint">Select a news article to generate creative video ideas</p>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading && articles.length === 0" class="loading-state">
      Loading articles...
    </div>

    <!-- Empty State -->
    <div v-if="!loading && articles.length === 0" class="empty-state">
      <p>No articles found.</p>
      <p class="hint">Click "Fetch Latest" to get news articles.</p>
    </div>

    <!-- Articles Grid -->
    <div v-if="articles.length > 0" class="articles-grid">
      <div v-for="article in articles" :key="article.id" class="article-card">
        <div v-if="article.image_url" class="article-image">
          <img :src="article.image_url" :alt="article.title" @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" />
        </div>

        <div class="article-content">
          <div class="article-meta">
            <span class="source">{{ article.source_name }}</span>
            <span class="separator">•</span>
            <span class="date">{{ formatDate(article.published_at) }}</span>
            <span v-if="article.is_processed" class="processed-badge">✓ Ideas Generated</span>
          </div>

          <h3 class="article-title">{{ article.title }}</h3>

          <p v-if="article.description" class="article-description">
            {{ article.description }}
          </p>

          <div class="article-actions">
            <a :href="article.url" target="_blank" class="action-btn secondary">
              Read Article
            </a>
            <button @click="handleGenerateIdeas(article)" class="action-btn primary">
              ✨ Generate Ideas
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-feed {
  max-width: 1400px;
  margin: 0 auto;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.feed-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: black;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.category-select {
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: black;
  font-size: 1rem;
  cursor: pointer;
}

.fetch-btn {
  padding: 0.75rem 1.5rem;
  background: black;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  white-space: nowrap;
}

.fetch-btn:hover:not(:disabled) {
  background: #333;
}

.fetch-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.article-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-image {
  width: 100%;
  height: 200px;
  background: #f5f5f5;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: #666;
}

.source {
  font-weight: 600;
  color: black;
}

.separator {
  color: #ccc;
}

.processed-badge {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.article-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: black;
  line-height: 1.4;
}

.article-description {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  flex: 1;
}

.article-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s;
  display: inline-block;
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

.action-btn.secondary:hover {
  background: #f5f5f5;
  border-color: #999;
}
</style>
