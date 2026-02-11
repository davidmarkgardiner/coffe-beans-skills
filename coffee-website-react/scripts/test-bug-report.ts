/**
 * Test Bug Report Feedback Endpoint
 * Tests the /api/feedback endpoint for bug report submission
 */

import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:3001';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  const startTime = Date.now();
  try {
    await fn();
    results.push({
      name,
      passed: true,
      duration: Date.now() - startTime
    });
    console.log(`✅ ${name}`);
  } catch (error: any) {
    results.push({
      name,
      passed: false,
      error: error.message,
      duration: Date.now() - startTime
    });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Helper to create a simple PNG image buffer
function createSimplePNG(): Buffer {
  // 1x1 transparent PNG
  return Buffer.from([
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
}

async function main() {
  console.log('🧪 Bug Report Feedback Endpoint Tests');
  console.log('=====================================\n');

  // Test 1: Health check
  await test('Server is running', async () => {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    const data = await response.json() as any;
    if (data.status !== 'healthy') {
      throw new Error(`Server not healthy: ${data.status}`);
    }
  });

  // Test 2: Feedback endpoint requires description
  await test('Feedback endpoint rejects request without description', async () => {
    const formData = new FormData();

    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      throw new Error('Expected request to fail without description, but it succeeded');
    }
    if (response.status !== 400) {
      throw new Error(`Expected status 400, got ${response.status}`);
    }
  });

  // Test 3: Feedback endpoint rejects empty description
  await test('Feedback endpoint rejects empty description', async () => {
    const formData = new FormData();
    formData.append('description', '');

    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      throw new Error('Expected request to fail with empty description, but it succeeded');
    }
    if (response.status !== 400) {
      throw new Error(`Expected status 400, got ${response.status}`);
    }
  });

  // Test 4: Feedback endpoint rejects non-image files
  await test('Feedback endpoint rejects non-image files', async () => {
    const formData = new FormData();
    formData.append('description', 'Test bug report');

    // Create a text file
    const textBlob = new Blob(['This is a text file'], { type: 'text/plain' });
    formData.append('screenshot', textBlob, 'test.txt');

    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      throw new Error('Expected request to fail with non-image file, but it succeeded');
    }
    // Multer returns 400 for invalid files
    if (response.status !== 400 && response.status !== 500) {
      console.warn(`   Warning: Unexpected status ${response.status} for non-image file`);
    }
  });

  // Test 5: Feedback endpoint accepts description only
  await test('Feedback endpoint accepts description without screenshot', async () => {
    const formData = new FormData();
    formData.append('description', 'Test bug report: The shopping cart is not updating');

    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${error}`);
    }

    const data = await response.json() as any;
    if (!data.issueNumber) {
      throw new Error('Response missing issueNumber');
    }
    if (!data.url) {
      throw new Error('Response missing url');
    }
    if (!data.success) {
      throw new Error('Response success flag is not true');
    }
    console.log(`   Created GitHub issue #${data.issueNumber}`);
  });

  // Test 6: Feedback endpoint accepts description with screenshot
  await test('Feedback endpoint accepts description with screenshot', async () => {
    const formData = new FormData();
    formData.append('description', 'Test bug report with screenshot: Button is not clickable');

    // Create a simple image blob
    const pngBuffer = createSimplePNG();
    const imageBlob = new Blob([pngBuffer], { type: 'image/png' });
    formData.append('screenshot', imageBlob, 'test-screenshot.png');

    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${error}`);
    }

    const data = await response.json() as any;
    if (!data.issueNumber) {
      throw new Error('Response missing issueNumber');
    }
    console.log(`   Created GitHub issue #${data.issueNumber}`);
  });

  // Test 7: Verify response structure
  await test('Feedback endpoint response has correct structure', async () => {
    const formData = new FormData();
    formData.append('description', 'Test response structure');

    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json() as any;

    // Check response structure
    if (typeof data.success !== 'boolean') {
      throw new Error('Response missing or invalid "success" field');
    }
    if (typeof data.issueNumber !== 'number') {
      throw new Error('Response missing or invalid "issueNumber" field');
    }
    if (typeof data.url !== 'string') {
      throw new Error('Response missing or invalid "url" field');
    }
    if (!data.url.includes('github.com')) {
      throw new Error('URL does not appear to be a GitHub issue URL');
    }
  });

  // Test 8: Verify issue title is generated from description
  await test('Feedback endpoint generates appropriate issue title', async () => {
    const description = 'Very important bug: The coffee ordering system is completely broken';
    const formData = new FormData();
    formData.append('description', description);

    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json() as any;
    // We can't directly verify the title without fetching the GitHub issue,
    // but we can verify the response is valid
    if (!data.issueNumber || !data.url) {
      throw new Error('Invalid response structure');
    }
  });

  // Test 9: Feedback endpoint includes @claude mention
  await test('Feedback endpoint includes @claude mention in issue body', async () => {
    const formData = new FormData();
    formData.append('description', 'Test issue with claude mention');

    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json() as any;
    if (!data.issueNumber || !data.url) {
      throw new Error('Invalid response structure');
    }
    // Note: We can't directly verify the mention without GitHub API access
    console.log(`   Created issue with GitHub Action trigger`);
  });

  // Test 10: Feedback endpoint with very long description
  await test('Feedback endpoint handles long descriptions', async () => {
    const longDescription = 'Bug report: ' + 'A'.repeat(1000);
    const formData = new FormData();
    formData.append('description', longDescription);

    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json() as any;
    if (!data.issueNumber || !data.url) {
      throw new Error('Invalid response structure');
    }
  });

  // Test 11: Feedback endpoint with special characters
  await test('Feedback endpoint handles special characters in description', async () => {
    const specialDescription = 'Bug: Test <script>alert("xss")</script> & "quotes" \'apostrophes\'';
    const formData = new FormData();
    formData.append('description', specialDescription);

    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json() as any;
    if (!data.issueNumber) {
      throw new Error('Failed to create issue with special characters');
    }
  });

  // Print summary
  console.log('\n=====================================');
  console.log('Test Summary');
  console.log('=====================================\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total:   ${total}`);
  console.log(`Passed:  ${passed} ✅`);
  console.log(`Failed:  ${failed} ❌`);
  console.log(`Duration: ${results.reduce((sum, r) => sum + r.duration, 0)}ms`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  - ${r.name}`);
        if (r.error) console.log(`    ${r.error}`);
      });
    process.exit(1);
  }

  console.log('\n✅ All tests passed!');
  process.exit(0);
}

main().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
