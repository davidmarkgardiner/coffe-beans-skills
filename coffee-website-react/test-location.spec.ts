import { test, expect } from '@playwright/test'

test('test location tab click', async ({ page }) => {
  // Listen for console messages
  const consoleMessages: string[] = []
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`)
  })

  // Listen for errors
  const errors: string[] = []
  page.on('pageerror', error => {
    errors.push(error.message)
  })

  // Navigate to the site
  await page.goto('http://localhost:5174')

  // Wait for page to load
  await page.waitForLoadState('networkidle')

  // Scroll to contact section
  await page.locator('#contact').scrollIntoViewIfNeeded()

  // Click the Location tab
  await page.getByRole('button', { name: 'Location' }).click()

  // Wait a bit to see if any errors occur
  await page.waitForTimeout(2000)

  // Log all captured errors and console messages
  console.log('=== CONSOLE MESSAGES ===')
  console.log(consoleMessages.join('\n'))

  console.log('\n=== ERRORS ===')
  console.log(errors.join('\n'))

  // Take a screenshot
  await page.screenshot({ path: 'location-tab-error.png', fullPage: true })
})
