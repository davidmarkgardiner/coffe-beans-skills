#!/usr/bin/env tsx

/**
 * Test Video Generation Script
 *
 * Generates a test video using Google Veo (takes 10-15 minutes!)
 *
 * Usage:
 *   npm run test:video
 *   tsx scripts/test-video-generation.ts --season=autumn
 */

import { GoogleGenAI } from '@google/genai'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

// Configuration
const API_KEY = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY
const OUTPUT_DIR = './test-generated-content'

// Video prompts for testing
const TEST_VIDEO_PROMPTS = {
  winter: 'Cinematic slow-motion video of steam rising from a freshly brewed cappuccino with intricate latte art, placed on a rustic wooden table in a cozy Edinburgh cafe. Warm golden lighting, soft bokeh background with blurred fairy lights, frost patterns visible on the window. Professional 4K quality, 16:9 landscape, 6-second seamless loop.',

  spring: 'Bright, airy video of iced coffee being poured into a tall glass on a sunny cafe table. Fresh spring flowers in a small vase beside it, natural window light streaming in, Edinburgh cobblestones visible through window. Light, refreshing mood, professional videography, 16:9 landscape, 6-second loop.',

  summer: 'Vibrant video of iced latte with condensed milk swirls in a tall glass, condensation droplets on the glass, placed on sunny outdoor Stockbridge cafe table. Bright natural daylight, blue sky visible, refreshing summer vibe. Cinematic 4K, 16:9, 6-second loop.',

  autumn: 'Warm cinematic video of a latte with autumn leaf latte art on a wooden table surrounded by fallen autumn leaves (maple, oak). Golden hour lighting, cozy Edinburgh cafe, rich amber and orange tones. Professional videography, 16:9 landscape, 6-second seamless loop.'
}

/**
 * Detect current season
 */
function detectSeason(): keyof typeof TEST_VIDEO_PROMPTS {
  const now = new Date()
  const month = now.getMonth() + 1
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
 * Generate test video
 */
async function generateTestVideo(season: keyof typeof TEST_VIDEO_PROMPTS) {
  console.log('🎬 Starting video generation for season:', season)
  console.log('📝 Prompt:', TEST_VIDEO_PROMPTS[season].substring(0, 100) + '...')
  console.log()
  console.log('⏰ WARNING: Video generation takes 10-15 minutes!')
  console.log('☕ Perfect time for a coffee break...')
  console.log()

  if (!API_KEY) {
    throw new Error('❌ API_KEY or VITE_GEMINI_API_KEY not found in environment variables')
  }

  // Initialize Gemini client
  const ai = new GoogleGenAI({ apiKey: API_KEY })

  try {
    console.log('🚀 Sending request to Veo...')

    // Generate video using Veo
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: TEST_VIDEO_PROMPTS[season],
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
      }
    })

    console.log('✅ Request accepted, video is being generated...')
    console.log()

    const pollInterval = 15000 // Poll every 15 seconds
    let pollCount = 0

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, pollInterval))
      pollCount++

      const elapsed = Math.floor((pollCount * pollInterval) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60

      console.log(`⏳ Checking status... (${minutes}m ${seconds}s elapsed)`)

      try {
        operation = await ai.operations.getVideosOperation({ operation })
      } catch (e: any) {
        if (e.message.includes('Requested entity was not found')) {
          throw new Error('❌ API key error. Please check your API_KEY in .env.local')
        }
        throw e
      }
    }

    console.log()
    console.log('✅ Video generation complete!')
    console.log()

    // Debug: Log the full response structure
    console.log('🔍 Response structure:', JSON.stringify(operation.response, null, 2))

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri
    if (!downloadLink) {
      console.error('❌ Full operation object:', JSON.stringify(operation, null, 2))
      throw new Error('No download link in response. Check the logs above for the actual response structure.')
    }

    console.log('📥 Downloading video...')
    const response = await fetch(`${downloadLink}&key=${API_KEY}`)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('✅ Video downloaded successfully!')
    console.log()

    return buffer

  } catch (error: any) {
    if (error.message?.includes('API key')) {
      throw new Error('❌ Invalid API key. Please check your API_KEY in .env.local')
    }
    if (error.message?.includes('quota')) {
      throw new Error('❌ API quota exceeded. Check your usage at https://aistudio.google.com/')
    }
    throw error
  }
}

/**
 * Save video to file
 */
async function saveVideo(videoBuffer: Buffer, season: string) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
  const filename = `test-${season}-video-${timestamp}.mp4`
  const filepath = path.join(OUTPUT_DIR, filename)

  // Create output directory if it doesn't exist
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  // Save video
  await fs.writeFile(filepath, videoBuffer)

  console.log('💾 Video saved to:', filepath)
  console.log('📊 File size:', (videoBuffer.length / 1024 / 1024).toFixed(2), 'MB')
  console.log()

  return filepath
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting video generation test')
  console.log('━'.repeat(60))

  // Get season from command line or auto-detect
  const args = process.argv.slice(2)
  const seasonArg = args.find(arg => arg.startsWith('--season='))?.split('=')[1]
  const season = (seasonArg as keyof typeof TEST_VIDEO_PROMPTS) || detectSeason()

  console.log('🌍 Season:', season)
  console.log('━'.repeat(60))
  console.log()

  try {
    // Generate video
    const videoBuffer = await generateTestVideo(season)

    // Save to file
    const filepath = await saveVideo(videoBuffer, season)

    console.log('━'.repeat(60))
    console.log('✨ Test completed successfully!')
    console.log('━'.repeat(60))
    console.log()
    console.log('📁 Video saved at:')
    console.log('  ', filepath)
    console.log()
    console.log('🎯 Next steps:')
    console.log('   1. Play the video to check quality')
    console.log('   2. Upload to Firebase: npm run upload:content')
    console.log('   3. Test on website: npm run dev')
    console.log()

  } catch (error: any) {
    console.error('━'.repeat(60))
    console.error('❌ Test failed!')
    console.error('━'.repeat(60))
    console.error('\nError:', error.message)

    if (error.message?.includes('API_KEY')) {
      console.error('\n💡 Solution:')
      console.error('   Add your Gemini API key to .env.local:')
      console.error('   API_KEY=your_gemini_api_key_here')
      console.error('\n   Get your API key from: https://aistudio.google.com/app/apikey')
    }

    if (error.message?.includes('quota')) {
      console.error('\n💡 Note:')
      console.error('   Video generation is expensive (~$0.10-0.30 per video)')
      console.error('   Check your quota at: https://aistudio.google.com/')
    }

    console.error()
    process.exit(1)
  }
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
