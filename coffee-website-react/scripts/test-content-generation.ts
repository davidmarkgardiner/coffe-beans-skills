#!/usr/bin/env tsx

/**
 * Test Content Generation Script
 *
 * Simple test to validate AI content generation using Google Gemini API
 * Generates one test image to verify setup before full automation
 *
 * Usage:
 *   npm run test:content
 *   tsx scripts/test-content-generation.ts
 *   tsx scripts/test-content-generation.ts --season=winter
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

// Coffee Bean Seasonal Prompts  (simplified for testing)
const TEST_PROMPTS = {
  winter: 'High-resolution professional photograph of premium whole coffee beans scattered artistically on a rustic wooden table. Rich brown beans with glossy oil sheen, caramel and mahogany highlights visible. Warm golden hour lighting creates soft shadows and enhances the beans\' texture. Burlap bag partially visible in background. Shallow depth of field, 16:9 composition, inviting winter atmosphere, professional product photography.',

  spring: 'Professional spring photograph of fresh-roasted coffee beans in a clear glass container beside a small vase of tulips on a light wooden table. Bright natural window light, soft pastel color palette contrasting with rich brown beans. Edinburgh cafe with view of spring trees outside, shallow depth of field, 16:9 composition.',

  summer: 'Professional summer photograph of whole coffee beans in a modern glass jar on an outdoor table, Edinburgh\'s summer festival banners softly blurred in background. Bright, vibrant daylight emphasizing rich bean color and texture. Refreshing and energetic mood, 16:9 composition.',

  autumn: 'Professional autumn photograph of whole coffee beans in a vintage container on a wooden table with scattered autumn leaves. Warm scarf partially visible, golden afternoon light creates long shadows. Rich brown beans contrast beautifully with orange and red leaves. Cozy, inviting fall mood, Edinburgh cafe setting, shallow depth of field, 16:9 composition.',

  christmas: 'Professional Christmas-themed photograph of whole coffee beans in a rustic wooden bowl surrounded by pine branches, cinnamon sticks, and soft candlelight. Rich brown beans with glossy sheen, warm golden lighting, shallow depth of field. Edinburgh cafe ambiance, festive yet sophisticated aesthetic, 16:9 landscape, high resolution.',

  newyear: 'Fresh, minimalist photograph of premium coffee beans arranged in a perfect circle on a clean white marble surface. Bright natural light suggests new beginnings, single green coffee plant leaf for growth symbolism. Professional, clean aesthetic emphasizing bean quality, 16:9 landscape.'
}

/**
 * Detect current season
 */
function detectSeason(): keyof typeof TEST_PROMPTS {
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
 * Generate test image
 */
async function generateTestImage(season: keyof typeof TEST_PROMPTS) {
  console.log('🎨 Generating test image for season:', season)
  console.log('📝 Prompt:', TEST_PROMPTS[season].substring(0, 100) + '...')
  console.log('⏳ This may take 10-30 seconds...\n')

  if (!API_KEY) {
    throw new Error('❌ API_KEY or VITE_GEMINI_API_KEY not found in environment variables')
  }

  // Initialize Gemini client
  const ai = new GoogleGenAI({ apiKey: API_KEY })

  try {
    // Generate image using Imagen
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: TEST_PROMPTS[season],
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    })

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('No images generated')
    }

    console.log('✅ Image generated successfully!\n')

    return response.generatedImages[0].image.imageBytes
  } catch (error: any) {
    if (error.message?.includes('API key')) {
      throw new Error('❌ Invalid API key. Please check your API_KEY in .env.local')
    }
    throw error
  }
}

/**
 * Save image to file
 */
async function saveImage(imageBase64: string, season: string) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
  const filename = `test-${season}-photo-${timestamp}.jpg`
  const filepath = path.join(OUTPUT_DIR, filename)

  // Create output directory if it doesn't exist
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  // Decode base64 and save
  const buffer = Buffer.from(imageBase64, 'base64')
  await fs.writeFile(filepath, buffer)

  console.log('💾 Image saved to:', filepath)
  console.log('📊 File size:', (buffer.length / 1024).toFixed(2), 'KB\n')

  return filepath
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting content generation test\n')
  console.log('━'.repeat(60))

  // Get season from command line or auto-detect
  const args = process.argv.slice(2)
  const seasonArg = args.find(arg => arg.startsWith('--season='))?.split('=')[1]
  const season = (seasonArg as keyof typeof TEST_PROMPTS) || detectSeason()

  console.log('🌍 Current season:', season)
  console.log('━'.repeat(60))
  console.log()

  try {
    // Generate image
    const imageBase64 = await generateTestImage(season)

    // Save to file
    const filepath = await saveImage(imageBase64, season)

    console.log('━'.repeat(60))
    console.log('✨ Test completed successfully!')
    console.log('━'.repeat(60))
    console.log('\n📁 Check the generated image at:')
    console.log('  ', filepath)
    console.log('\n🎯 Next steps:')
    console.log('   1. Review the generated image quality')
    console.log('   2. Test with different seasons: tsx scripts/test-content-generation.ts --season=spring')
    console.log('   3. If satisfied, proceed with full automation setup')
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

    console.error()
    process.exit(1)
  }
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
