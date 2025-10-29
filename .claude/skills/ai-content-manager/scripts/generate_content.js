#!/usr/bin/env node

/**
 * AI Content Generation Script
 *
 * Generates seasonal videos and photos using Google Gemini API (Imagen & Veo)
 * for the Stockbridge Coffee website.
 *
 * Usage:
 *   node generate_content.js
 *   node generate_content.js --season=winter --holiday=christmas
 *   node generate_content.js --videos=2 --photos=5
 */

const fs = require('fs').promises
const path = require('path')
const { GoogleGenerativeAI } = require('@google/generative-ai')

// Configuration
const config = {
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
  outputDir: process.argv.find(arg => arg.startsWith('--output-dir='))?.split('=')[1] || './generated-content',
  season: process.argv.find(arg => arg.startsWith('--season='))?.split('=')[1] || detectSeason(),
  holiday: process.argv.find(arg => arg.startsWith('--holiday='))?.split('=')[1] || null,
  videoCount: parseInt(process.argv.find(arg => arg.startsWith('--videos='))?.split('=')[1] || '1'),
  photoCount: parseInt(process.argv.find(arg => arg.startsWith('--photos='))?.split('=')[1] || '2'),
}

// Validate API key
if (!config.apiKey) {
  console.error('❌ Error: GEMINI_API_KEY or VITE_GEMINI_API_KEY environment variable not set')
  process.exit(1)
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.apiKey)

// Coffee Bean Seasonal Prompts Library (subset - full library in seasonal_prompts.md)
const seasonalPrompts = {
  winter: {
    general: {
      video: [
        'Close-up cinematic shot of premium whole coffee beans cascading from a burlap bag in slow motion. The beans tumble gracefully through soft, warm golden hour lighting, revealing their rich brown tones with subtle highlights of caramel and mahogany. Each bean glistens slightly, showing fresh oils on the surface. The beans pour onto a rustic wooden surface, bouncing and settling naturally. Steam or subtle vapor rises gently, suggesting freshness. Shallow depth of field with the falling beans in sharp focus against a softly blurred background. Warm color grading with enhanced contrast to emphasize the beans\' glossy, appetizing texture. Professional product photography aesthetic, 4K quality, 16:9 landscape, smooth 60fps motion, 5-second seamless loop.',
        'Cozy cinematic video of coffee beans being gently poured from a wooden scoop onto a vintage wooden table in an Edinburgh cafe. Warm amber lighting creates a rich, inviting atmosphere. Steam rises subtly from the fresh-roasted beans. Camera slowly pans across the pile of beans, highlighting their glossy surfaces and varied brown tones. Soft bokeh background with blurred winter window showing frost. Professional videography, 16:9 aspect ratio, 6-second loop.',
      ],
      photo: [
        'High-resolution professional photograph of premium whole coffee beans scattered artistically on a rustic wooden table. Rich brown beans with glossy oil sheen, caramel and mahogany highlights visible. Warm golden hour lighting creates soft shadows and enhances the beans\' texture. Burlap bag partially visible in background. Shallow depth of field, 16:9 composition, inviting winter atmosphere, professional product photography.',
        'Professional close-up photo of coffee beans in a vintage wooden bowl on a rustic Edinburgh cafe counter. Warm interior lighting, rich brown tones, subtle steam or vapor suggesting freshness. Frosted window with Scottish cobblestones visible in soft-focus background. 4K resolution, 16:9 landscape, appetizing and premium aesthetic.',
      ],
    },
    holidays: {
      christmas: {
        video: [
          'Festive cinematic video of premium coffee beans in a rustic wooden bowl surrounded by pine branches, cinnamon sticks, and soft fairy lights. Camera slowly pans across the glossy beans, warm amber glow highlighting their rich texture. Subtle steam rises from the beans. Blurred Christmas decorations in background, Scottish cafe holiday atmosphere. Professional quality, 16:9, 6-second seamless loop.',
        ],
        photo: [
          'Professional Christmas-themed photograph of whole coffee beans in a rustic wooden bowl surrounded by pine branches, cinnamon sticks, and soft candlelight. Rich brown beans with glossy sheen, warm golden lighting, shallow depth of field. Edinburgh cafe ambiance, festive yet sophisticated aesthetic, 16:9 landscape, high resolution.',
        ],
      },
    },
  },
  spring: {
    general: {
      video: [
        'Bright, airy video of coffee beans being poured into a glass jar on a sunny cafe table. Natural window light streaming through, Edinburgh spring blossoms visible outside window. Fresh, clean atmosphere. Beans flow smoothly, their glossy surfaces catching the bright daylight. Light, refreshing mood, professional videography, 16:9 landscape, 6-second loop.',
      ],
      photo: [
        'Professional spring photograph of fresh-roasted coffee beans in a clear glass container beside a small vase of tulips on a light wooden table. Bright natural window light, soft pastel color palette contrasting with rich brown beans. Edinburgh cafe with view of spring trees outside, shallow depth of field, 16:9 composition.',
      ],
    },
    holidays: {},
  },
  summer: {
    general: {
      video: [
        'Vibrant video of coffee beans being poured into a clear glass container on sunny outdoor Stockbridge cafe table. Bright natural daylight highlights the beans\' rich brown color and glossy texture. Blue sky visible, refreshing summer atmosphere. Beans cascade smoothly with slight bouncing motion. Cinematic 4K, 16:9, 6-second loop.',
      ],
      photo: [
        'Professional summer photograph of whole coffee beans in a modern glass jar on an outdoor table, Edinburgh\'s summer festival banners softly blurred in background. Bright, vibrant daylight emphasizing rich bean color and texture. Refreshing and energetic mood, 16:9 composition.',
      ],
    },
    holidays: {},
  },
  autumn: {
    general: {
      video: [
        'Warm cinematic video of coffee beans being poured from a burlap bag onto a wooden table surrounded by fallen autumn leaves (maple, oak). Golden hour lighting creates rich amber tones, highlighting the beans\' natural brown and caramel colors. Beans tumble smoothly in slow motion. Cozy Edinburgh cafe, professional videography, 16:9 landscape, 6-second seamless loop.',
      ],
      photo: [
        'Professional autumn photograph of whole coffee beans in a vintage container on a wooden table with scattered autumn leaves. Warm scarf partially visible, golden afternoon light creates long shadows. Rich brown beans contrast beautifully with orange and red leaves. Cozy, inviting fall mood, Edinburgh cafe setting, shallow depth of field, 16:9 composition.',
      ],
    },
    holidays: {},
  },
}

/**
 * Detect current season based on date
 */
function detectSeason() {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  if ((month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day < 21)) {
    return 'winter'
  } else if ((month === 3 && day >= 21) || month === 4 || month === 5 || (month === 6 && day < 21)) {
    return 'spring'
  } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 21)) {
    return 'summer'
  } else {
    return 'autumn'
  }
}

/**
 * Get prompts for current season and holiday
 */
function getPrompts(season, holiday, type) {
  const seasonPrompts = seasonalPrompts[season]

  if (holiday && seasonPrompts.holidays[holiday]) {
    return seasonPrompts.holidays[holiday][type] || seasonPrompts.general[type]
  }

  return seasonPrompts.general[type]
}

/**
 * Generate a random ID for content
 */
function generateContentId(season, type, holiday = null) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
  const random = Math.random().toString(36).substring(2, 8)
  const holidayPrefix = holiday ? `${holiday}-` : ''
  return `${holidayPrefix}${season}-${type}-${timestamp}-${random}`
}

/**
 * Generate image using Gemini Imagen
 */
async function generateImage(prompt) {
  console.log('🎨 Generating image...')
  console.log(`Prompt: ${prompt.substring(0, 100)}...`)

  try {
    const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' })

    const result = await model.generateContent(prompt)

    const response = await result.response
    const imageData = response.candidates[0].content.parts[0].inlineData

    console.log('✅ Image generated successfully')

    return {
      mimeType: imageData.mimeType,
      data: imageData.data // base64 encoded
    }
  } catch (error) {
    console.error('❌ Error generating image:', error.message)
    throw error
  }
}

/**
 * Generate video using Gemini Veo
 */
async function generateVideo(prompt) {
  console.log('🎬 Generating video (this may take 5-15 minutes)...')
  console.log(`Prompt: ${prompt.substring(0, 100)}...`)

  try {
    const model = genAI.getGenerativeModel({ model: 'veo-001' })

    const result = await model.generateContent(prompt)

    const response = await result.response

    // Veo generation is async - poll for completion
    if (response.status === 'PROCESSING') {
      console.log('⏳ Video is being generated, polling for completion...')
      const videoData = await pollVideoGeneration(response.operationId)
      console.log('✅ Video generated successfully')
      return videoData
    }

    const videoData = response.candidates[0].content.parts[0].inlineData

    console.log('✅ Video generated successfully')

    return {
      mimeType: videoData.mimeType,
      data: videoData.data // base64 encoded
    }
  } catch (error) {
    console.error('❌ Error generating video:', error.message)
    throw error
  }
}

/**
 * Poll for video generation completion (Veo is async)
 */
async function pollVideoGeneration(operationId, maxAttempts = 60, interval = 15000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Polling attempt ${attempt}/${maxAttempts}...`)

    try {
      // Check operation status
      const operation = await genAI.getOperation(operationId)

      if (operation.done) {
        if (operation.error) {
          throw new Error(`Video generation failed: ${operation.error.message}`)
        }
        return operation.response.candidates[0].content.parts[0].inlineData
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, interval))
    } catch (error) {
      console.error(`Polling error: ${error.message}`)
      throw error
    }
  }

  throw new Error('Video generation timed out')
}

/**
 * Save generated content to file
 */
async function saveContent(contentData, contentId, season, type, holiday) {
  const extension = type === 'video' ? 'mp4' : 'jpg'
  const seasonDir = path.join(config.outputDir, type + 's', season)
  const filePath = path.join(seasonDir, `${contentId}.${extension}`)

  // Create directory if it doesn't exist
  await fs.mkdir(seasonDir, { recursive: true })

  // Decode base64 and write to file
  const buffer = Buffer.from(contentData.data, 'base64')
  await fs.writeFile(filePath, buffer)

  console.log(`💾 Saved ${type} to: ${filePath}`)

  return {
    filePath,
    fileSize: buffer.length,
    mimeType: contentData.mimeType,
  }
}

/**
 * Generate manifest file with metadata
 */
async function generateManifest(generatedContent) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    season: config.season,
    holiday: config.holiday,
    content: generatedContent,
  }

  // Create output directory if it doesn't exist
  await fs.mkdir(config.outputDir, { recursive: true })

  const manifestPath = path.join(config.outputDir, 'manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))

  console.log(`📄 Manifest saved to: ${manifestPath}`)
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting AI content generation...')
  console.log(`Season: ${config.season}`)
  console.log(`Holiday: ${config.holiday || 'none'}`)
  console.log(`Videos to generate: ${config.videoCount}`)
  console.log(`Photos to generate: ${config.photoCount}`)
  console.log('---')

  const generatedContent = []

  // Generate videos
  for (let i = 0; i < config.videoCount; i++) {
    console.log(`\n📹 Generating video ${i + 1}/${config.videoCount}...`)

    const prompts = getPrompts(config.season, config.holiday, 'video')
    const prompt = prompts[Math.floor(Math.random() * prompts.length)]
    const contentId = generateContentId(config.season, 'video', config.holiday)

    try {
      const videoData = await generateVideo(prompt)
      const savedFile = await saveContent(videoData, contentId, config.season, 'video', config.holiday)

      generatedContent.push({
        id: contentId,
        type: 'video',
        season: config.season,
        holiday: config.holiday,
        prompt,
        ...savedFile,
      })
    } catch (error) {
      console.error(`Failed to generate video ${i + 1}:`, error.message)
    }
  }

  // Generate photos
  for (let i = 0; i < config.photoCount; i++) {
    console.log(`\n🖼️  Generating photo ${i + 1}/${config.photoCount}...`)

    const prompts = getPrompts(config.season, config.holiday, 'photo')
    const prompt = prompts[Math.floor(Math.random() * prompts.length)]
    const contentId = generateContentId(config.season, 'photo', config.holiday)

    try {
      const imageData = await generateImage(prompt)
      const savedFile = await saveContent(imageData, contentId, config.season, 'photo', config.holiday)

      generatedContent.push({
        id: contentId,
        type: 'photo',
        season: config.season,
        holiday: config.holiday,
        prompt,
        ...savedFile,
      })
    } catch (error) {
      console.error(`Failed to generate photo ${i + 1}:`, error.message)
    }
  }

  // Generate manifest
  await generateManifest(generatedContent)

  console.log('\n✅ Content generation completed!')
  console.log(`Generated ${generatedContent.length} items (${generatedContent.filter(c => c.type === 'video').length} videos, ${generatedContent.filter(c => c.type === 'photo').length} photos)`)
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
