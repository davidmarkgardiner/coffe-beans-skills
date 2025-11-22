#!/usr/bin/env tsx

/**
 * Check what season the system detects
 */

function detectCurrentSeason(): string {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  console.log('📅 Current Date:')
  console.log('   Date:', now.toISOString().split('T')[0])
  console.log('   Month:', month)
  console.log('   Day:', day)
  console.log()

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

const season = detectCurrentSeason()
console.log('🌍 Detected Season:', season)
console.log()

if (season === 'winter') {
  console.log('✅ Season is winter - your video should show!')
} else {
  console.log(`⚠️  Season is ${season} - but your video is marked as "winter"`)
  console.log('   This is why the video is not showing!')
  console.log()
  console.log('💡 Solution options:')
  console.log(`   1. Change video season to "${season}"`)
  console.log('   2. Keep as winter and wait until winter season')
  console.log('   3. Use a season-agnostic approach')
}
