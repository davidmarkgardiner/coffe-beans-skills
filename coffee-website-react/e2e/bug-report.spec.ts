import { test, expect } from '@playwright/test';

test.describe('Bug Report Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('CoffeeCopilot button is visible on page', async ({ page }) => {
    // Look for the floating coffee copilot button
    const copilotButton = page.locator('button:has-text("☕")').first();
    await expect(copilotButton).toBeVisible();
  });

  test('can open and close CoffeeCopilot widget', async ({ page }) => {
    // Click to open the copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    // Check that the widget is visible
    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');
    await expect(widget).toBeVisible();

    // Check that the chat mode button exists
    const chatButton = widget.locator('button:has-text("💬 Chat")');
    await expect(chatButton).toBeVisible();

    // Check that the report issue button exists
    const reportButton = widget.locator('button:has-text("🐛 Report Issue")');
    await expect(reportButton).toBeVisible();

    // Click close button to close the widget
    const closeButton = widget.locator('button:has-text("×")');
    await closeButton.click();

    // Widget should no longer be visible
    await expect(widget).not.toBeVisible();
  });

  test('can switch between Chat and Report Issue modes', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Initially in Chat mode
    const chatButton = widget.locator('button:has-text("💬 Chat")');
    await expect(chatButton).toHaveClass(/bg-gray-900/);

    // Switch to Report Issue mode
    const reportButton = widget.locator('button:has-text("🐛 Report Issue")');
    await reportButton.click();

    // Report Issue should now be active
    await expect(reportButton).toHaveClass(/bg-gray-900/);

    // Check that screenshot upload button appears in bug report mode
    const screenshotButton = widget.locator('label:has-text("📷")').first();
    await expect(screenshotButton).toBeVisible();

    // Switch back to Chat mode
    await chatButton.click();

    // Chat button should be active again
    await expect(chatButton).toHaveClass(/bg-gray-900/);

    // Screenshot button should not be visible
    await expect(screenshotButton).not.toBeVisible();
  });

  test('Report Issue mode shows warning message', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Switch to Report Issue mode
    const reportButton = widget.locator('button:has-text("🐛 Report Issue")');
    await reportButton.click();

    // Check for the warning message
    const warningMessage = widget.locator('text=Bug Report Mode');
    await expect(warningMessage).toBeVisible();
  });

  test('can type message in Chat mode', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Get the input field
    const input = widget.locator('input[aria-label="Message input"]');
    await expect(input).toBeVisible();

    // Type a message
    await input.fill('Tell me about espresso');

    // Check that the message was entered
    await expect(input).toHaveValue('Tell me about espresso');

    // Send button should be enabled
    const sendButton = widget.locator('button:has-text("Send")');
    await expect(sendButton).not.toBeDisabled();
  });

  test('can type message in Report Issue mode', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Switch to Report Issue mode
    const reportButton = widget.locator('button:has-text("🐛 Report Issue")');
    await reportButton.click();

    // Get the input field
    const input = widget.locator('input[aria-label="Message input"]');

    // Check placeholder changes
    await expect(input).toHaveAttribute('placeholder', /Describe the bug/i);

    // Type a bug report
    await input.fill('The shopping cart is not updating when I add items');

    // Check that the message was entered
    await expect(input).toHaveValue('The shopping cart is not updating when I add items');

    // Submit button should be enabled (instead of Send in Chat mode)
    const submitButton = widget.locator('button:has-text("Submit")');
    await expect(submitButton).not.toBeDisabled();
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Get the send button
    const sendButton = widget.locator('button:has-text("Send")');

    // Initially should be disabled (no input)
    await expect(sendButton).toBeDisabled();

    // Type something
    const input = widget.locator('input[aria-label="Message input"]');
    await input.fill('test');

    // Button should now be enabled
    await expect(sendButton).not.toBeDisabled();

    // Clear the input
    await input.clear();

    // Button should be disabled again
    await expect(sendButton).toBeDisabled();
  });

  test('can use keyboard Enter to send message in Chat mode', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Get the input field
    const input = widget.locator('input[aria-label="Message input"]');
    await input.fill('Hello');

    // Get initial message count
    const messages = widget.locator('[role="article"]');
    const initialCount = await messages.count();

    // Press Enter to send
    await input.press('Enter');

    // Wait a bit for the message to appear
    await page.waitForTimeout(500);

    // User message should appear in the messages
    const userMessage = widget.locator('text=Hello');
    await expect(userMessage).toBeVisible();
  });

  test('can upload screenshot in Report Issue mode', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Switch to Report Issue mode
    const reportButton = widget.locator('button:has-text("🐛 Report Issue")');
    await reportButton.click();

    // Find the file input
    const fileInput = widget.locator('input[type="file"]');

    // Create a simple test image
    const testImagePath = '/tmp/test-screenshot.png';

    // Upload the file (using a simple 1x1 png)
    // PNG header for a 1x1 transparent image
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9C, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);

    // Set the file input value
    await fileInput.setInputFiles({
      name: 'test-screenshot.png',
      mimeType: 'image/png',
      buffer: pngBuffer
    });

    // Wait a moment for the preview to load
    await page.waitForTimeout(500);

    // Check that the screenshot preview appears
    const preview = widget.locator('img[alt="Screenshot preview"]');
    await expect(preview).toBeVisible();

    // Check for remove button (X button)
    const removeButton = widget.locator('button[aria-label="Remove screenshot"]');
    await expect(removeButton).toBeVisible();
  });

  test('can remove uploaded screenshot', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Switch to Report Issue mode
    const reportButton = widget.locator('button:has-text("🐛 Report Issue")');
    await reportButton.click();

    // Upload a screenshot
    const fileInput = widget.locator('input[type="file"]');

    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9C, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);

    await fileInput.setInputFiles({
      name: 'test-screenshot.png',
      mimeType: 'image/png',
      buffer: pngBuffer
    });

    await page.waitForTimeout(500);

    // Verify the preview is visible
    const preview = widget.locator('img[alt="Screenshot preview"]');
    await expect(preview).toBeVisible();

    // Click the remove button
    const removeButton = widget.locator('button[aria-label="Remove screenshot"]');
    await removeButton.click();

    // Preview should disappear
    await expect(preview).not.toBeVisible();

    // Remove button should also disappear
    await expect(removeButton).not.toBeVisible();
  });

  test('chat widget displays assistant greeting message', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Check for the greeting message
    const greeting = widget.locator('text=Coffee Copilot');
    await expect(greeting).toBeVisible();

    const greetingText = widget.locator('text=Ask me about beans');
    await expect(greetingText).toBeVisible();
  });

  test('widget scrolls to bottom when new messages arrive', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Get the messages container
    const messagesContainer = widget.locator('div[role="log"]');

    // Get initial scroll position
    const initialScroll = await messagesContainer.evaluate(el => el.scrollTop);

    // The widget should be auto-scrolling, so initial scroll should be at or near bottom
    const scrollHeight = await messagesContainer.evaluate(el => el.scrollHeight);
    const offsetHeight = await messagesContainer.evaluate(el => el.offsetHeight);

    // Initial state should be scrolled to bottom (or close to it)
    expect(initialScroll + offsetHeight).toBeGreaterThanOrEqual(scrollHeight - 10);
  });

  test('message timestamp is displayed', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Check for timestamp in the greeting message
    const timestamps = widget.locator('text=/\\d{1,2}:\\d{2} (AM|PM)/');
    await expect(timestamps).toHaveCount(1); // At least the greeting message should have a timestamp
  });

  test('input field has correct placeholder in Chat mode', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Get the input field
    const input = widget.locator('input[aria-label="Message input"]');

    // Check placeholder for Chat mode
    await expect(input).toHaveAttribute('placeholder', /Ask about beans/i);
  });

  test('input field has correct placeholder in Report Issue mode', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Switch to Report Issue mode
    const reportButton = widget.locator('button:has-text("🐛 Report Issue")');
    await reportButton.click();

    // Get the input field
    const input = widget.locator('input[aria-label="Message input"]');

    // Check placeholder for Report Issue mode
    await expect(input).toHaveAttribute('placeholder', /Describe the bug/i);
  });

  test('button text changes from Send to Submit in Report Issue mode', async ({ page }) => {
    // Open copilot
    const copilotButton = page.locator('button:has-text("☕")').first();
    await copilotButton.click();

    const widget = page.locator('[role="dialog"][aria-label="Coffee Copilot Chat"]');

    // Initially should show Send button
    let actionButton = widget.locator('button:has-text("Send")');
    await expect(actionButton).toBeVisible();

    // Switch to Report Issue mode
    const reportButton = widget.locator('button:has-text("🐛 Report Issue")');
    await reportButton.click();

    // Should now show Submit button
    actionButton = widget.locator('button:has-text("Submit")');
    await expect(actionButton).toBeVisible();

    // Send button should no longer exist
    const sendButton = widget.locator('button:has-text("Send")');
    await expect(sendButton).not.toBeVisible();
  });
});
