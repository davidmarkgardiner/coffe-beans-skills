#!/usr/bin/env tsx
/**
 * Weekly Content Generation Script
 *
 * Orchestrates the complete content generation workflow:
 * 1. Detect current season
 * 2. Generate videos and photos using AI
 * 3. Upload to Firebase Storage
 * 4. Create Firestore metadata documents
 *
 * Usage:
 *   npm run generate:weekly
 *   npm run generate:weekly -- --season=autumn --videos=2 --photos=3
 */

import { execSync } from 'child_process'
import * as fs from 'fs/promises'
import * as path from 'path'

// Command line arguments
const args = process.argv.slice(2)
const getArg = (name: string, defaultValue: string) => {
  const arg = args.find(a => a.startsWith(`--${name}=`))
  return arg ? arg.split('=')[1] : defaultValue
}

const forcedSeason = getArg('season', '')
const videoCount = parseInt(getArg('videos', '1'), 10)
const photoCount = parseInt(getArg('photos', '2'), 10)

type Season = 'winter' | 'spring' | 'summer' | 'autumn'

/**
 * Detect current season based on date
 */
function detectSeason(): Season {
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
 * Main workflow
 */
async function main() {
  console.log('🎬 Starting weekly content generation workflow...\n')

  // Detect season
  const season = forcedSeason || detectSeason()
  console.log(`📅 Season: ${season}`)
  console.log(`🎥 Videos to generate: ${videoCount}`)
  console.log(`📸 Photos to generate: ${photoCount}\n`)

  // Create output directory
  const outputDir = path.join(process.cwd(), 'generated-content')
  await fs.mkdir(outputDir, { recursive: true })
  console.log(`📁 Output directory: ${outputDir}\n`)

  try {
    // Generate videos
    if (videoCount > 0) {
      console.log(`🎥 Generating ${videoCount} video(s)...`)
      for (let i = 0; i < videoCount; i++) {
        console.log(`\n  Video ${i + 1}/${videoCount}:`)
        execSync(`npm run test:video`, {
          stdio: 'inherit',
          env: { ...process.env, SEASON: season },
        })
      }
      console.log('✅ Videos generated\n')
    }

    // Generate photos
    if (photoCount > 0) {
      console.log(`📸 Generating ${photoCount} photo(s)...`)
      for (let i = 0; i < photoCount; i++) {
        console.log(`\n  Photo ${i + 1}/${photoCount}:`)
        execSync(`npm run test:content`, {
          stdio: 'inherit',
          env: { ...process.env, SEASON: season },
        })
      }
      console.log('✅ Photos generated\n')
    }

    // Upload to Firebase
    console.log('☁️  Uploading content to Firebase...')
    execSync(`npm run upload:content`, {
      stdio: 'inherit',
    })
    console.log('✅ Content uploaded\n')

    console.log('🎉 Weekly content generation completed successfully!')
    console.log(`\nSummary:`)
    console.log(`  Season: ${season}`)
    console.log(`  Videos: ${videoCount}`)
    console.log(`  Photos: ${photoCount}`)
    console.log(`\nNext: Content is now active and will appear in rotation`)

  } catch (error) {
    console.error('❌ Content generation failed:', error)
    process.exit(1)
  }
}

main()
