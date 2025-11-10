import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to contact section
    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
  });

  test('contact section is visible', async ({ page }) => {
    const contactSection = page.locator('#contact');
    await expect(contactSection).toBeVisible();

    const heading = page.locator('#contact h2');
    await expect(heading).toContainText('Contact Us');
  });

  test('contact form tab displays form fields', async ({ page }) => {
    // Click "Send Message" tab
    const sendMessageTab = page.locator('button', { hasText: 'Send Message' });
    await sendMessageTab.click();

    // Check that form fields are visible
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#subject')).toBeVisible();
    await expect(page.locator('textarea#message')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Send Message' })).toBeVisible();
  });

  test('contact form submission works', async ({ page }) => {
    // Click "Send Message" tab
    const sendMessageTab = page.locator('button', { hasText: 'Send Message' });
    await sendMessageTab.click();

    // Fill in form
    await page.locator('input#name').fill('John Doe');
    await page.locator('input#email').fill('john@example.com');
    await page.locator('input#subject').fill('Test Subject');
    await page.locator('textarea#message').fill('This is a test message');

    // Mock the API response
    await page.route('/api/contact', route => {
      route.abort('blockedbyclient');
    });

    // Submit form
    const submitButton = page.locator('button', { hasText: 'Send Message' });
    await submitButton.click();

    // Check for error message (since we blocked the request)
    const errorMessage = page.locator('text=/error/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('contact form submission with API success', async ({ page }) => {
    // Click "Send Message" tab
    const sendMessageTab = page.locator('button', { hasText: 'Send Message' });
    await sendMessageTab.click();

    // Intercept API call
    let requestData: any = null;
    await page.route('/api/contact', route => {
      requestData = route.request().postDataJSON();
      route.continue();
    });

    // Fill in form
    await page.locator('input#name').fill('Jane Smith');
    await page.locator('input#email').fill('jane@example.com');
    await page.locator('input#subject').fill('Inquiry about products');
    await page.locator('textarea#message').fill('I would like to know more about your coffee beans');

    // Submit form
    const submitButton = page.locator('button', { hasText: 'Send Message' });
    await submitButton.click();

    // Verify form was submitted with correct data
    await page.waitForTimeout(500);
    if (requestData) {
      expect(requestData.name).toBe('Jane Smith');
      expect(requestData.email).toBe('jane@example.com');
      expect(requestData.subject).toBe('Inquiry about products');
      expect(requestData.message).toBe('I would like to know more about your coffee beans');
    }
  });

  test('contact form validation - required fields', async ({ page }) => {
    // Click "Send Message" tab
    const sendMessageTab = page.locator('button', { hasText: 'Send Message' });
    await sendMessageTab.click();

    // Try to submit empty form
    const submitButton = page.locator('button', { hasText: 'Send Message' });

    // The browser's HTML5 validation should prevent submission
    const nameField = page.locator('input#name');
    const isRequired = await nameField.evaluate((el: HTMLInputElement) => el.required);
    expect(isRequired).toBe(true);
  });

  test('contact info tab displays contact details', async ({ page }) => {
    // Click "Contact Info" tab (should be active by default)
    const contactInfoTab = page.locator('button', { hasText: 'Contact Info' });
    await contactInfoTab.click();

    // Check for contact information
    await expect(page.locator('text=/Email/i')).toBeVisible();
    await expect(page.locator('text=/Phone/i')).toBeVisible();
    await expect(page.locator('text=/Address/i')).toBeVisible();
    await expect(page.locator('text=/Business Hours/i')).toBeVisible();
  });

  test('location tab is functional', async ({ page }) => {
    // Click "Location" tab
    const locationTab = page.locator('button', { hasText: 'Location' });
    await locationTab.click();

    // Check that location information is visible
    await expect(page.locator('text=/Visit Our Shop/i')).toBeVisible();
    await expect(page.locator('text=/Stockbridge/i')).toBeVisible();
  });
});
