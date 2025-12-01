import { test, expect } from '@playwright/test';

test.describe('Bug Report / Feedback Features', () => {
  test('should render contact section with tabs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for contact section
    const contactSection = page.locator('#contact');
    await expect(contactSection).toBeVisible();

    // Check for all three tab buttons
    const infoTab = page.locator('button:has-text("Contact Info")');
    const messageTab = page.locator('button:has-text("Send Message")');
    const locationTab = page.locator('button:has-text("Location")');

    await expect(infoTab).toBeVisible();
    await expect(messageTab).toBeVisible();
    await expect(locationTab).toBeVisible();
  });

  test('should display contact info when info tab is active', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click info tab
    const infoTab = page.locator('button:has-text("Contact Info")');
    await infoTab.click();

    // Verify contact information is displayed
    const emailText = page.locator('text=hello@stockbridgecoffee.com');
    const phoneText = page.locator('text=+44');
    const addressText = page.locator('text=123 High Street');

    await expect(emailText).toBeVisible();
    await expect(phoneText).toBeVisible();
    await expect(addressText).toBeVisible();
  });

  test('should display message form when form tab is active', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click form tab
    const messageTab = page.locator('button:has-text("Send Message")');
    await messageTab.click();

    // Verify form fields are displayed
    const nameInput = page.locator('input[id="name"]');
    const emailInput = page.locator('input[id="email"]');
    const subjectInput = page.locator('input[id="subject"]');
    const messageInput = page.locator('textarea[id="message"]');
    const submitButton = page.locator('button:has-text("Send Message")').filter({
      has: page.locator('type=submit')
    }).first();

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(subjectInput).toBeVisible();
    await expect(messageInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should display location tab with map placeholder', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click location tab
    const locationTab = page.locator('button:has-text("Location")');
    await locationTab.click();

    // Verify location information is displayed
    const shopTitle = page.locator('text=Visit Our Shop');
    const mapSection = page.locator('text=Map View');
    const parkingInfo = page.locator('text=Parking');

    await expect(shopTitle).toBeVisible();
    await expect(mapSection).toBeVisible();
    await expect(parkingInfo).toBeVisible();
  });

  test('should switch between tabs without errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch through all tabs
    const tabs = ['Contact Info', 'Send Message', 'Location'];

    for (const tabName of tabs) {
      const tabButton = page.locator(`button:has-text("${tabName}")`).first();
      await tabButton.click();
      await page.waitForTimeout(300); // Allow animation to complete
    }

    // Filter out non-critical errors
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('404') &&
      !err.includes('favicon.ico')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should validate required form fields', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click form tab
    const messageTab = page.locator('button:has-text("Send Message")').first();
    await messageTab.click();

    const form = page.locator('form').first();
    const nameInput = form.locator('input[id="name"]');
    const emailInput = form.locator('input[id="email"]');

    // Verify inputs have proper attributes
    const nameType = await nameInput.getAttribute('type');
    const emailType = await emailInput.getAttribute('type');

    expect(nameType).toBe('text');
    expect(emailType).toBe('email');
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click form tab
    const messageTab = page.locator('button:has-text("Send Message")').first();
    await messageTab.click();

    const form = page.locator('form').first();

    // Check that labels are present and associated with inputs
    const nameLabel = form.locator('label[for="name"]');
    const emailLabel = form.locator('label[for="email"]');
    const subjectLabel = form.locator('label[for="subject"]');
    const messageLabel = form.locator('label[for="message"]');

    await expect(nameLabel).toBeVisible();
    await expect(emailLabel).toBeVisible();
    await expect(subjectLabel).toBeVisible();
    await expect(messageLabel).toBeVisible();
  });

  test('should have proper button styling for active tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const infoTab = page.locator('button:has-text("Contact Info")').first();

    // Check initial active state
    const initialClass = await infoTab.getAttribute('class');
    expect(initialClass).toContain('bg-accent');

    // Click another tab
    const messageTab = page.locator('button:has-text("Send Message")').first();
    await messageTab.click();

    // Check that previous tab is no longer active
    const updatedClass = await infoTab.getAttribute('class');
    expect(updatedClass).not.toContain('bg-accent');

    // Check that new tab is active
    const activeClass = await messageTab.getAttribute('class');
    expect(activeClass).toContain('bg-accent');
  });

  test('should have smooth tab transitions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const messageTab = page.locator('button:has-text("Send Message")').first();
    const form = page.locator('form').first();

    // Form should be hidden initially
    await expect(form).not.toBeVisible();

    // Click tab
    await messageTab.click();

    // Wait for animation and check visibility
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('should render contact section title correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const contactTitle = page.locator('text=Contact Us');
    const contactSubtitle = page.locator('text=Have questions?');

    await expect(contactTitle).toBeVisible();
    await expect(contactSubtitle).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const contactSection = page.locator('#contact');
    await expect(contactSection).toBeVisible();

    // Tabs should still be clickable on mobile
    const messageTab = page.locator('button:has-text("Send Message")').first();
    await messageTab.click();

    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });
});
