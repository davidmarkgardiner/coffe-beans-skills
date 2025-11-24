import { test, expect } from '@playwright/test';

test.describe('Dark Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('theme toggle button is visible in navigation', async ({ page }) => {
    await page.goto('/');

    // Look for the theme toggle button (should have Moon or Sun icon)
    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    await expect(themeToggle).toBeVisible();
  });

  test('clicking toggle switches between light and dark mode', async ({ page }) => {
    await page.goto('/');

    // Get the html element
    const html = page.locator('html');

    // Initially should be light mode (no dark class on first visit, or based on system preference)
    // Let's check the current state and toggle
    const initialHasDark = await html.evaluate(el => el.classList.contains('dark'));

    // Click the theme toggle
    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    await themeToggle.click();

    // Wait a bit for the transition
    await page.waitForTimeout(400);

    // Check that dark class has been toggled
    const afterToggleHasDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(afterToggleHasDark).toBe(!initialHasDark);

    // Click again to toggle back
    await themeToggle.click();
    await page.waitForTimeout(400);

    // Should be back to initial state
    const finalHasDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(finalHasDark).toBe(initialHasDark);
  });

  test('dark mode persists across page reloads', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');

    // Toggle to dark mode
    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    await themeToggle.click();
    await page.waitForTimeout(400);

    // Verify dark mode is active
    const hasDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(hasDark).toBe(true);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Dark mode should persist
    const stillHasDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(stillHasDark).toBe(true);
  });

  test('localStorage is updated when theme changes', async ({ page }) => {
    await page.goto('/');

    // Get initial localStorage value
    const initialTheme = await page.evaluate(() => localStorage.getItem('theme'));

    // Toggle theme
    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    await themeToggle.click();
    await page.waitForTimeout(400);

    // Check localStorage has been updated
    const newTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(newTheme).not.toBe(initialTheme);
    expect(['light', 'dark']).toContain(newTheme);
  });

  test('dark mode styles are applied to key components', async ({ page }) => {
    await page.goto('/');

    // Toggle to dark mode
    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    await themeToggle.click();
    await page.waitForTimeout(400);

    // Check that body has dark background
    const bodyBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // In dark mode, background should be dark (rgb values low)
    // Check if it's a dark color (simple heuristic: check if RGB values are below 50)
    const rgbMatch = bodyBgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      const avgRgb = (r + g + b) / 3;
      expect(avgRgb).toBeLessThan(100); // Dark colors should have low RGB values
    }
  });

  test('icon changes when toggling between themes', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });

    // Get initial aria-label
    const initialLabel = await themeToggle.getAttribute('aria-label');

    // Click toggle
    await themeToggle.click();
    await page.waitForTimeout(400);

    // Aria-label should change
    const newLabel = await themeToggle.getAttribute('aria-label');
    expect(newLabel).not.toBe(initialLabel);

    // Should contain either "light" or "dark"
    expect(newLabel).toMatch(/switch to (dark|light) mode/i);
  });

  test('smooth transition between themes', async ({ page }) => {
    await page.goto('/');

    // Add a check for CSS transition property
    const body = page.locator('body');
    const hasTransition = await body.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.transition.includes('background-color') ||
             styles.transition.includes('color') ||
             styles.transition.includes('all');
    });

    // Verify transitions are enabled (should be true based on our CSS)
    expect(hasTransition).toBe(true);
  });
});
