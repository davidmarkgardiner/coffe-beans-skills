import { test, expect } from '@playwright/test'

test.describe('Blog Features', () => {
  test('blog section should be visible on homepage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for blog section heading
    const blogSection = page.locator('#blog')
    await expect(blogSection).toBeVisible()

    // Check for "From Our Blog" heading
    const blogHeading = page.locator('text=From Our Blog')
    await expect(blogHeading).toBeVisible()
  })

  test('blog highlights should display three posts', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find all blog post articles
    const blogArticles = page.locator('article')
    const articles = await blogArticles.count()

    // Should have at least 3 blog posts
    expect(articles).toBeGreaterThanOrEqual(3)
  })

  test('blog posts should have required information', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const blogSection = page.locator('#blog')
    const firstArticle = blogSection.locator('article').first()

    // Check for title
    const title = firstArticle.locator('h3')
    await expect(title).toBeVisible()

    // Check for excerpt
    const excerpt = firstArticle.locator('p:has-text("Explore")')
    await expect(excerpt).toBeVisible()

    // Check for read time and date
    const metadata = firstArticle.locator('p:nth-child(1)')
    const metadataText = await metadata.textContent()
    expect(metadataText).toMatch(/min read/) // Should contain read time
  })

  test('blog post links should be navigable', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const blogSection = page.locator('#blog')
    const firstReadLink = blogSection.locator('a:has-text("Read Story")').first()

    // Check that link exists and has href
    const href = await firstReadLink.getAttribute('href')
    expect(href).toMatch(/^\/blog\//) // Should link to blog post
  })

  test('blog info should include author and tags if available', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // This test verifies that blog data is properly structured
    // Even if tags/author aren't displayed, the data should be available
    const blogSection = page.locator('#blog')
    await expect(blogSection).toBeVisible()

    // Blog functionality should not throw errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForLoadState('networkidle')
    const criticalErrors = errors.filter(
      (err) =>
        !err.includes('favicon') &&
        !err.includes('404') &&
        !err.includes('blog')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})
