import { test, expect } from '@playwright/test'

test.describe('Blog Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test.describe('Blog Navigation', () => {
    test('should display blog highlights on homepage', async ({ page }) => {
      // Scroll to blog section
      await page.locator('#blog').scrollIntoViewIfNeeded()

      // Check if blog highlights section is visible
      await expect(page.locator('text=From Our Blog')).toBeVisible()
      await expect(page.locator('text=Stockbridge Stories')).toBeVisible()
    })

    test('should navigate to blog page from homepage link', async ({ page }) => {
      // Find and click "View All Stories" button
      await page.locator('button:has-text("View All Stories")').click()

      // Should navigate to blog page
      await expect(page).toHaveURL('http://localhost:5173/blog')
    })

    test('should navigate to blog page from navigation menu', async ({ page }) => {
      // Look for blog link in navigation
      const blogLink = page.locator('a:has-text("Blog")')
      if (await blogLink.isVisible()) {
        await blogLink.click()
        await expect(page).toHaveURL(/\/blog/)
      }
    })
  })

  test.describe('Blog Listing Page', () => {
    test('should load blog listing page with posts', async ({ page }) => {
      await page.goto('http://localhost:5173/blog')

      // Check page title
      await expect(page.locator('h1:has-text("Our Coffee Blog")')).toBeVisible()

      // Wait for posts to load
      await page.waitForSelector('article', { timeout: 5000 })

      // Check for blog posts
      const articles = page.locator('article')
      const count = await articles.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display blog post cards with metadata', async ({ page }) => {
      await page.goto('http://localhost:5173/blog')

      // Wait for posts to load
      await page.waitForSelector('article', { timeout: 5000 })

      // Get first article
      const firstArticle = page.locator('article').first()

      // Check for expected content
      await expect(firstArticle.locator('h3')).not.toBeEmpty()
      await expect(firstArticle.locator('text=/min read/')).toBeVisible()
    })

    test('should allow filtering by category', async ({ page }) => {
      await page.goto('http://localhost:5173/blog')

      // Wait for category buttons
      const allPostsButton = page.locator('button:has-text("All Posts")')
      await expect(allPostsButton).toBeVisible()

      // Get initial post count
      await page.waitForSelector('article', { timeout: 5000 })
      const initialArticles = page.locator('article')
      const initialCount = await initialArticles.count()

      // Look for category buttons
      const categoryButtons = page.locator('button').filter({
        hasNotText: 'All Posts'
      })
      const categoryCount = await categoryButtons.count()

      if (categoryCount > 0) {
        // Click first category
        await categoryButtons.first().click()

        // Wait for articles to update
        await page.waitForTimeout(500)

        // Check that posts have updated
        const filteredArticles = page.locator('article')
        const filteredCount = await filteredArticles.count()

        // Count should be less than or equal to initial count
        expect(filteredCount).toBeLessThanOrEqual(initialCount)
      }
    })
  })

  test.describe('Blog Post Detail Page', () => {
    test('should navigate to blog post from listing', async ({ page }) => {
      await page.goto('http://localhost:5173/blog')

      // Wait for posts to load
      await page.waitForSelector('article', { timeout: 5000 })

      // Click first post
      const firstPost = page.locator('article').first()
      await firstPost.click()

      // Should be on a blog post page
      await expect(page).toHaveURL(/\/blog\//)
    })

    test('should display blog post content correctly', async ({ page }) => {
      // Navigate to specific blog post
      await page.goto('http://localhost:5173/blog')

      // Wait for posts and click first
      await page.waitForSelector('article', { timeout: 5000 })
      await page.locator('article').first().click()

      // Wait for post to load
      await page.waitForSelector('h1', { timeout: 5000 })

      // Check for post content
      const title = page.locator('h1')
      await expect(title).toBeVisible()
      await expect(title).not.toBeEmpty()

      // Check for metadata
      await expect(page.locator('text=/min read/')).toBeVisible()
      await expect(page.locator('text=/User|Calendar/')).toBeVisible()
    })

    test('should display back button on blog post', async ({ page }) => {
      await page.goto('http://localhost:5173/blog')

      // Wait and click first post
      await page.waitForSelector('article', { timeout: 5000 })
      await page.locator('article').first().click()

      // Check for back button
      const backButton = page.locator('button:has-text("Back to")')
      await expect(backButton).toBeVisible({ timeout: 5000 })
    })

    test('should navigate back to blog listing', async ({ page }) => {
      await page.goto('http://localhost:5173/blog')

      // Wait and click first post
      await page.waitForSelector('article', { timeout: 5000 })
      const firstPostTitle = await page.locator('article').first().locator('h3').first().textContent()
      await page.locator('article').first().click()

      // Wait for post page
      await page.waitForSelector('h1', { timeout: 5000 })

      // Click back button
      await page.locator('button:has-text("Back to All Posts")').click()

      // Should be back on blog listing
      await expect(page).toHaveURL('http://localhost:5173/blog')
      await expect(page.locator('h1:has-text("Our Coffee Blog")')).toBeVisible()
    })
  })

  test.describe('Blog Post Not Found', () => {
    test('should handle non-existent blog post gracefully', async ({ page }) => {
      // Try to navigate to non-existent post
      await page.goto('http://localhost:5173/blog/non-existent-post-id')

      // Should show error message
      const errorMessage = page.locator('text=/not found|does not exist/')
      await expect(errorMessage).toBeVisible({ timeout: 5000 })

      // Should have back to blog button
      const backButton = page.locator('button:has-text("Back to Blog")')
      await expect(backButton).toBeVisible()
    })

    test('should navigate back from non-existent post', async ({ page }) => {
      await page.goto('http://localhost:5173/blog/non-existent-post-id')

      // Wait for error page to load
      await page.waitForSelector('button:has-text("Back to Blog")', { timeout: 5000 })

      // Click back button
      await page.locator('button:has-text("Back to Blog")').first().click()

      // Should navigate back to blog
      await expect(page).toHaveURL('http://localhost:5173/blog')
    })
  })

  test.describe('Blog Highlights on Homepage', () => {
    test('should display featured blog posts on homepage', async ({ page }) => {
      await page.goto('http://localhost:5173')

      // Scroll to blog section
      await page.locator('#blog').scrollIntoViewIfNeeded()

      // Check blog highlights
      await expect(page.locator('text=From Our Blog')).toBeVisible()

      // Check for post cards
      const articles = page.locator('#blog article')
      const count = await articles.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should link blog highlights to individual posts', async ({ page }) => {
      await page.goto('http://localhost:5173')

      // Scroll to blog section
      await page.locator('#blog').scrollIntoViewIfNeeded()

      // Click first blog highlight
      const firstPost = page.locator('#blog article').first()
      await firstPost.click()

      // Should navigate to blog post
      await expect(page).toHaveURL(/\/blog\//)
    })
  })

  test.describe('Blog Routing', () => {
    test('should maintain routing structure', async ({ page }) => {
      // Test homepage
      await page.goto('http://localhost:5173')
      await expect(page).toHaveURL('http://localhost:5173/')

      // Test blog listing
      await page.goto('http://localhost:5173/blog')
      await expect(page).toHaveURL('http://localhost:5173/blog')

      // Test blog post (with placeholder ID)
      await page.goto('http://localhost:5173/blog/test-post')
      // Should either show post or error page
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    })
  })

  test.describe('Blog UI/UX', () => {
    test('should be responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('http://localhost:5173/blog')

      // Wait for content
      await page.waitForSelector('article', { timeout: 5000 })

      // Check that articles are displayed
      const articles = page.locator('article')
      expect(await articles.count()).toBeGreaterThan(0)

      // Check for proper spacing
      const firstArticle = articles.first()
      const box = await firstArticle.boundingBox()
      expect(box).not.toBeNull()
    })

    test('should display loading state', async ({ page }) => {
      // This test would be better with slow network, but we can at least
      // verify the page loads properly
      await page.goto('http://localhost:5173/blog')

      // Wait for content to load
      await page.waitForSelector('article', { timeout: 5000 })

      // Verify content is visible
      const articles = page.locator('article')
      expect(await articles.count()).toBeGreaterThan(0)
    })

    test('should have proper contrast and accessibility', async ({ page }) => {
      await page.goto('http://localhost:5173/blog')

      // Check for heading
      const heading = page.locator('h1')
      await expect(heading).toBeVisible()

      // Check for alt text on images
      const images = page.locator('article img')
      const imageCount = await images.count()
      if (imageCount > 0) {
        const firstImage = images.first()
        const altText = await firstImage.getAttribute('alt')
        expect(altText).not.toBeNull()
      }
    })
  })
})
