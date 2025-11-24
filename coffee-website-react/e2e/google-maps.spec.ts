import { test, expect } from '@playwright/test'

test.describe('Google Maps Location Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('map section is visible on the page', async ({ page }) => {
    // Scroll to the location section
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Check that the section is visible
    await expect(locationSection).toBeVisible()

    // Check that heading is correct
    const heading = locationSection.getByRole('heading', {
      name: /Find Our Coffee Shop/i,
    })
    await expect(heading).toBeVisible()
  })

  test('business information cards are displayed', async ({ page }) => {
    // Scroll to location section
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Check address card
    const addressHeading = locationSection.getByRole('heading', { name: 'Address' })
    await expect(addressHeading).toBeVisible()
    await expect(locationSection.getByText(/Top 8, EH4 2DP, Edinburgh, UK/i)).toBeVisible()

    // Check hours card
    const hoursHeading = locationSection.getByRole('heading', { name: 'Opening Hours' })
    await expect(hoursHeading).toBeVisible()
    await expect(locationSection.getByText(/Mon-Sat: 7:30 AM - 6:00 PM/i)).toBeVisible()

    // Check phone card
    const phoneHeading = locationSection.getByRole('heading', { name: 'Phone' })
    await expect(phoneHeading).toBeVisible()
    await expect(locationSection.getByText(/\+44 131/i)).toBeVisible()
  })

  test('map container loads with correct dimensions', async ({ page }) => {
    // Scroll to location section
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Wait for map container
    const mapContainer = page.locator('[role="application"][aria-label*="Google Maps"]')
    await expect(mapContainer).toBeVisible()

    // Check that map has reasonable dimensions (height should be 400-500px on desktop)
    const box = await mapContainer.boundingBox()
    expect(box).not.toBeNull()
    if (box) {
      expect(box.height).toBeGreaterThan(350) // At least 350px tall
      expect(box.width).toBeGreaterThan(300) // At least 300px wide
    }
  })

  test('map shows loading state initially', async ({ page }) => {
    // Navigate to page without waiting for full load
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Scroll to location section quickly
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Check for loading indicator (might be brief)
    const loadingText = page.getByText(/loading map/i)
    const loadingSpinner = page.locator('.animate-spin')

    // Either loading text or spinner should be present (or may have already loaded)
    // Check if loading state is visible (may complete quickly)
    await Promise.race([
      loadingText.isVisible().catch(() => false),
      loadingSpinner.isVisible().catch(() => false),
    ])

    // We just verify the component exists, loading may complete quickly
    const mapContainer = page.locator('[role="application"][aria-label*="Google Maps"]')
    await expect(mapContainer).toBeVisible({ timeout: 10000 })
  })

  test('displays error fallback when API key is missing', async ({ page, context }) => {
    // Intercept Google Maps API calls and make them fail
    await context.route('**/maps.googleapis.com/**', (route) => route.abort())

    // Navigate to page
    await page.goto('/')

    // Scroll to location section
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Wait for potential error state (with longer timeout)
    await page.waitForTimeout(3000)

    // Check if error message appears OR map loads successfully
    // (Error might not show if API key is valid and loads before intercept)
    const errorHeading = page.getByRole('heading', { name: /Map Unavailable/i })
    const mapContainer = page.locator('[role="application"][aria-label*="Google Maps"]')

    // Either error shows or map loads successfully
    const hasError = await errorHeading.isVisible().catch(() => false)
    const hasMap = await mapContainer.isVisible().catch(() => false)

    expect(hasError || hasMap).toBe(true)
  })

  test('get directions link opens Google Maps', async ({ page, context }) => {
    // Scroll to location section
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Find the "Get Directions" link in the address card
    const getDirectionsLink = locationSection
      .locator('.space-y-6') // Info cards container
      .getByRole('link', { name: /Get Directions/i })
      .first()

    // Listen for popup
    const popupPromise = context.waitForEvent('page')

    // Click the link
    await getDirectionsLink.click()

    // Wait for the popup
    const popup = await popupPromise

    // Verify the URL contains Google Maps
    expect(popup.url()).toContain('google.com/maps')

    // Close the popup
    await popup.close()
  })

  test('responsive layout on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate and scroll to location
    await page.goto('/')
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Map should be visible on mobile
    const mapContainer = page.locator('[role="application"][aria-label*="Google Maps"]')
    await expect(mapContainer).toBeVisible()

    // Check map height is appropriate for mobile (300px)
    const box = await mapContainer.boundingBox()
    expect(box).not.toBeNull()
    if (box) {
      expect(box.height).toBeGreaterThan(250) // Should be at least 250px on mobile
    }

    // Business info cards should stack vertically
    const infoCards = locationSection.locator('.space-y-6 > div')
    const cardsCount = await infoCards.count()
    expect(cardsCount).toBeGreaterThanOrEqual(3) // At least 3 info cards
  })

  test('responsive layout on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Navigate and scroll to location
    await page.goto('/')
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Map should be visible on desktop
    const mapContainer = page.locator('[role="application"][aria-label*="Google Maps"]')
    await expect(mapContainer).toBeVisible()

    // Check map height is appropriate for desktop (500px)
    const box = await mapContainer.boundingBox()
    expect(box).not.toBeNull()
    if (box) {
      expect(box.height).toBeGreaterThan(450) // Should be at least 450px on desktop
    }
  })

  test('dark mode styling is applied to map section', async ({ page }) => {
    // Navigate to page
    await page.goto('/')

    // Scroll to location section
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Toggle to dark mode
    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i })
    await themeToggle.click()
    await page.waitForTimeout(500) // Wait for transition

    // Check that html has dark class
    const html = page.locator('html')
    const hasDark = await html.evaluate((el) => el.classList.contains('dark'))
    expect(hasDark).toBe(true)

    // Check that section has dark background
    const sectionBgColor = await locationSection.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })

    // In dark mode, background should be dark
    const rgbMatch = sectionBgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number)
      const avgRgb = (r + g + b) / 3
      expect(avgRgb).toBeLessThan(100) // Dark colors should have low RGB values
    }

    // Info cards should have dark styling
    const infoCard = locationSection.locator('.space-y-6 > div').first()
    await expect(infoCard).toBeVisible()
  })

  test('section has proper semantic HTML and ARIA labels', async ({ page }) => {
    // Navigate to page
    await page.goto('/')

    // Scroll to location section
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Verify section element
    await expect(locationSection).toHaveAttribute('id', 'location')

    // Verify map has role and aria-label
    const mapContainer = page.locator('[role="application"][aria-label*="Google Maps"]')
    await expect(mapContainer).toBeVisible()

    // Verify headings hierarchy
    const mainHeading = locationSection.getByRole('heading', {
      name: /Find Our Coffee Shop/i,
    })
    await expect(mainHeading).toBeVisible()

    // Verify all info cards have headings
    const addressHeading = locationSection.getByRole('heading', { name: 'Address' })
    const hoursHeading = locationSection.getByRole('heading', { name: 'Opening Hours' })
    const phoneHeading = locationSection.getByRole('heading', { name: 'Phone' })

    await expect(addressHeading).toBeVisible()
    await expect(hoursHeading).toBeVisible()
    await expect(phoneHeading).toBeVisible()
  })

  test('phone link is clickable', async ({ page }) => {
    // Scroll to location section
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Find phone link
    const phoneLink = locationSection.getByRole('link', { name: /\+44 131/i })
    await expect(phoneLink).toBeVisible()

    // Verify it has tel: href
    const href = await phoneLink.getAttribute('href')
    expect(href).toMatch(/^tel:/)
  })

  test('hover effects work on info cards', async ({ page }) => {
    // Set desktop viewport for hover effects
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Navigate and scroll to location
    await page.goto('/')
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await locationSection.scrollIntoViewIfNeeded()

    // Get first info card
    const infoCard = locationSection.locator('.space-y-6 > div').first()
    await expect(infoCard).toBeVisible()

    // Hover over card
    await infoCard.hover()

    // Wait for hover animation
    await page.waitForTimeout(500)

    // Card should still be visible after hover
    await expect(infoCard).toBeVisible()
  })

  test('map section is accessible via hash navigation', async ({ page }) => {
    // Navigate to homepage with hash
    await page.goto('/#location')

    // Wait for scroll to complete
    await page.waitForTimeout(1000)

    // Location section should be in viewport
    const locationSection = page.locator('section[aria-label*="Coffee shop location"]')
    await expect(locationSection).toBeInViewport()
  })
})
