#!/usr/bin/env tsx
/**
 * Blog Content Curation Script
 *
 * Uses Google Gemini AI to search for and curate coffee-related articles
 * focusing on brewing techniques, recipes, and coffee culture.
 *
 * Usage:
 *   npm run curate:blog
 *   npm run curate:blog -- --articles=5
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY not found in environment variables')
  console.error('Please set VITE_GEMINI_API_KEY in .env.local')
  console.error('')
  console.error('Current environment variables:')
  console.error('  VITE_GEMINI_API_KEY:', process.env.VITE_GEMINI_API_KEY ? '✓ Set' : '✗ Not set')
  console.error('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Not set')
  console.error('')
  console.error('Get an API key from: https://aistudio.google.com/app/apikey')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

interface CuratedArticle {
  title: string
  url: string
  source: string
  summary: string
  fullContent: string // Full blog article content
  imagePrompt: string // Prompt for generating accompanying image
  relevanceScore: number
  publishedDate?: string
}

interface BlogPost {
  title: string
  introduction: string
  articles: CuratedArticle[]
  conclusion: string
  tags: string[]
  category: 'brewing-techniques' | 'coffee-recipes' | 'coffee-culture' | 'coffee-science'
}

/**
 * Search for recent coffee articles using Gemini's knowledge
 */
async function searchCoffeeArticles(count: number = 4): Promise<CuratedArticle[]> {
  console.log(`🔍 Searching for ${count} coffee articles...`)

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  const searchPrompt = `You are an expert coffee content curator for Stockbridge Coffee, a premium Edinburgh-based coffee roastery.

Search for and provide ${count} high-quality, recent (within the last 3 months) articles specifically about COFFEE RECIPES.

For each article, provide:
1. Article title
2. URL (use real, reputable sources like: Perfect Daily Grind, Barista Magazine, James Hoffmann blog, Coffee Review, Sprudge, Serious Eats, Bon Appetit, etc.)
3. Source/publication name
4. A 2-3 sentence summary focusing on practical value
5. FULL BLOG CONTENT (400-600 words): Write a complete, engaging blog article about this recipe that includes:
   - Introduction to the recipe and why it's worth trying
   - Detailed step-by-step instructions
   - Tips for achieving the best results
   - Flavor profiles and what makes it special
   - Any variations or customizations
   - Why it's perfect for the season or occasion
6. IMAGE PROMPT: A detailed prompt for AI image generation describing the finished recipe (be specific about composition, lighting, styling)
7. A relevance score (1-10) for how useful this recipe is for coffee enthusiasts
8. Approximate publish date

FOCUS EXCLUSIVELY ON COFFEE RECIPES:
- Coffee drink recipes (lattes, cappuccinos, macchiatos, seasonal drinks)
- Iced coffee and cold brew recipes
- Coffee cocktails and coffee-based beverages
- Coffee dessert recipes (tiramisu, coffee cakes, etc.)
- Coffee-infused food recipes
- Specialty coffee preparations (affogato, Vietnamese coffee, etc.)
- Seasonal coffee drinks (pumpkin spice, peppermint mocha, etc.)

AVOID:
- General brewing techniques without specific recipes
- Equipment reviews or shopping guides
- Coffee shop business advice
- Coffee origin stories or culture articles
- News about coffee prices/economics

Return the results in this EXACT JSON format (valid JSON only, no markdown):
{
  "articles": [
    {
      "title": "Recipe Title",
      "url": "https://example.com/article",
      "source": "Publication Name",
      "summary": "Brief summary of the recipe and why it's valuable.",
      "fullContent": "Complete 400-600 word blog article with detailed recipe instructions, tips, and context...",
      "imagePrompt": "Professional food photography of [specific recipe]: overhead shot of a beautiful [drink/dessert] on a rustic wooden table, warm lighting, shallow depth of field, steam rising, cozy cafe atmosphere, 4K quality, no text or watermarks",
      "relevanceScore": 9,
      "publishedDate": "2025-01"
    }
  ]
}`

  try {
    const result = await model.generateContent(searchPrompt)
    const response = result.response
    const text = response.text()

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text

    const data = JSON.parse(jsonText)

    if (!data.articles || !Array.isArray(data.articles)) {
      throw new Error('Invalid response format: missing articles array')
    }

    console.log(`✅ Found ${data.articles.length} articles`)
    return data.articles
  } catch (error) {
    console.error('❌ Error searching for articles:', error)
    throw error
  }
}

/**
 * Generate a cohesive blog post from curated articles
 */
async function generateBlogPost(articles: CuratedArticle[]): Promise<BlogPost> {
  console.log('✍️  Generating blog post from curated articles...')

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  const articlesText = articles.map((article, index) => `
Article ${index + 1}:
Title: ${article.title}
Source: ${article.source}
URL: ${article.url}
Summary: ${article.summary}
Full Content Preview: ${article.fullContent.substring(0, 300)}...
`).join('\n')

  const blogPrompt = `You are a content writer for Stockbridge Coffee, a premium Edinburgh-based coffee roastery known for quality and craftsmanship.

Create a cohesive blog post that introduces and connects the following ${articles.length} curated COFFEE RECIPES:

${articlesText}

Generate:
1. A compelling blog post title focused on coffee recipes (should be engaging and appetizing)
2. An introduction paragraph (2-3 sentences) that makes readers excited to try these recipes
3. A conclusion paragraph (2-3 sentences) that encourages readers to experiment and share their creations
4. 3-5 relevant tags (focus on recipe types, ingredients, seasons)
5. Category should be "coffee-recipes"

The tone should be:
- Warm and inviting
- Inspiring and encouraging
- Focused on the joy of creating coffee drinks and treats
- Edinburgh/Stockbridge-friendly (mention our local coffee culture and community)

Return the result in this EXACT JSON format (valid JSON only, no markdown):
{
  "title": "Blog Post Title Here (Recipe-focused)",
  "introduction": "Introduction paragraph that makes readers excited about these recipes...",
  "conclusion": "Conclusion paragraph encouraging experimentation and creativity...",
  "tags": ["recipes", "coffee-drinks", "seasonal", "desserts", "cocktails"],
  "category": "coffee-recipes"
}`

  try {
    const result = await model.generateContent(blogPrompt)
    const response = result.response
    const text = response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text

    const data = JSON.parse(jsonText)

    const blogPost: BlogPost = {
      title: data.title,
      introduction: data.introduction,
      articles: articles,
      conclusion: data.conclusion,
      tags: data.tags,
      category: data.category,
    }

    console.log(`✅ Generated blog post: "${blogPost.title}"`)
    return blogPost
  } catch (error) {
    console.error('❌ Error generating blog post:', error)
    throw error
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2)
  const articlesArg = args.find(arg => arg.startsWith('--articles='))
  const articleCount = articlesArg ? parseInt(articlesArg.split('=')[1]) : 4

  console.log('🎯 Stockbridge Coffee - Blog Content Curation')
  console.log('=' .repeat(50))
  console.log(`Target articles: ${articleCount}`)
  console.log('')

  try {
    // Step 1: Search and curate articles
    const articles = await searchCoffeeArticles(articleCount)

    // Step 2: Generate blog post structure
    const blogPost = await generateBlogPost(articles)

    // Step 3: Output results
    console.log('')
    console.log('📝 Blog Post Generated')
    console.log('=' .repeat(50))
    console.log(`Title: ${blogPost.title}`)
    console.log(`Category: ${blogPost.category}`)
    console.log(`Tags: ${blogPost.tags.join(', ')}`)
    console.log(`Articles: ${blogPost.articles.length}`)
    console.log('')
    console.log('Introduction:')
    console.log(blogPost.introduction)
    console.log('')
    console.log('Curated Articles:')
    blogPost.articles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`)
      console.log(`   Source: ${article.source}`)
      console.log(`   URL: ${article.url}`)
      console.log(`   Relevance: ${article.relevanceScore}/10`)
      console.log(`   Summary: ${article.summary}`)
      console.log(`   Full Content:`)
      console.log(`   ${article.fullContent.substring(0, 200)}...`)
      console.log(`   Image Prompt: ${article.imagePrompt}`)
    })
    console.log('')
    console.log('Conclusion:')
    console.log(blogPost.conclusion)
    console.log('')

    // Step 4: Save to JSON file for upload script
    const fs = await import('fs/promises')
    const outputPath = './scripts/generated-blog-post.json'
    await fs.writeFile(outputPath, JSON.stringify(blogPost, null, 2))
    console.log(`✅ Blog post saved to: ${outputPath}`)
    console.log('')
    console.log('Next steps:')
    console.log('  1. Review the generated content')
    console.log('  2. Run: npm run upload:blog')
    console.log('  3. Newsletter will be sent automatically')

  } catch (error) {
    console.error('❌ Error during blog curation:', error)
    process.exit(1)
  }
}

main()
