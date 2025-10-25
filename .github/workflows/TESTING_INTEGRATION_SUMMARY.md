# Playwright Testing Integration - Summary

## Overview

Automated Playwright testing has been successfully integrated into the Claude Code workflows. Tests now run automatically on every PR and influence the code review score.

---

## What Was Added

### 1. New Workflow: `playwright.yml`

**Purpose:** Automated test suite that runs on every PR

**Features:**
- ✅ Runs linting checks (ESLint)
- ✅ Verifies build succeeds
- ✅ Executes test scripts:
  - `npm run test:inventory` - Inventory management tests
  - `npm run test:checkout` - Checkout flow tests
  - `npm run test:stripe` - Stripe integration tests
- ✅ Runs Playwright E2E tests (when configured)
- ✅ Uploads test artifacts (reports, screenshots, videos)
- ✅ Comments test summary on PR
- ✅ Supports multiple apps via matrix strategy

**Triggers:**
- PR opened, synchronized, ready for review, or reopened
- Changes to `coffee-website-react/**` or `apps/content-gen/frontend/**`
- Manual dispatch (`workflow_dispatch`)

**Test Artifacts:**
- Playwright HTML reports (30-day retention)
- Test results and coverage
- Screenshots and videos of test runs

---

### 2. Enhanced Workflow: `claude-code-review-custom.yml`

**New Test Integration:**

1. **Wait for Tests Job** (`wait-for-tests`)
   - Monitors Playwright workflow execution
   - Waits up to 10 minutes for test completion
   - Outputs test status (success/failure/timeout)

2. **Test-Aware Review** (`claude-review`)
   - Receives test results before starting review
   - Includes test status in review prompt
   - Deducts points from Testing score if tests fail
   - Tags @claude with specific test failures

**Scoring Impact:**

| Test Result | Score Impact | Action |
|-------------|--------------|--------|
| ✅ All pass | No deduction | Normal review |
| ⚠️ Some fail | -10 to -15 pts | Claude fixes failures |
| ❌ All fail | -15 to -20 pts | Likely REQUEST_CHANGES |
| ⏱️ Timeout | Warning only | Review notes concern |

---

### 3. Updated Documentation

**Files Updated:**

1. **WORKFLOW_GUIDE.md** - Added comprehensive test section:
   - Test requirements philosophy
   - Test status impact table
   - Available test commands
   - Guide for adding Playwright E2E tests
   - Test artifacts information

2. **QUICK_REFERENCE.md** - Added test quick reference:
   - Updated workflow triggers table
   - Test results impact on score
   - Local test running commands
   - Configuration file links

3. **WORKFLOW_DIAGRAM.md** - Enhanced flow diagram:
   - Shows parallel execution of tests and review wait
   - Illustrates test result handoff to review
   - Updated scoring section with test penalties

---

## How It Works

### Complete Flow

```
1. User creates issue with @claude
   ↓
2. Claude implements feature → Creates PR
   ↓
3. PR triggers TWO workflows in parallel:

   A. playwright.yml                    B. claude-code-review-custom.yml
      - Lint                                - Waits for tests
      - Build                               - (polling every 30s)
      - Test scripts                        - (max 10 min)
      - Playwright E2E
      - Upload artifacts
      - Comment on PR
      ↓                                     ↓
   Test results ────────────────────────→ Review receives results
                                            ↓
                                         4. Review analyzes code + tests
                                            ↓
                                         5. Scores (with test penalty if needed)
                                            ↓
                                         6. Posts review with @claude tag if needed
                                            ↓
                                         7. Claude fixes issues (if any)
                                            ↓
                                         8. Loop until score ≥85 or 3 iterations
```

### Test Integration Details

**Before Review Starts:**
- Review workflow waits for `playwright.yml` to complete
- Maximum wait time: 10 minutes
- Checks test status every 30 seconds
- Proceeds even if timeout (with warning)

**During Review:**
- Test status included in review prompt
- Claude reviewer knows:
  - Which tests passed/failed
  - Test logs location
  - Severity of failures
- Scoring adjusted automatically:
  - Failed tests = reduced Testing score
  - Specific test failures mentioned in review

**After Review:**
- If tests failed AND score <85:
  - Review tags @claude with test fixes
  - Claude addresses test failures
  - New commit triggers re-test + re-review
- If tests passed AND score ≥85:
  - Review approves PR
  - User can merge

---

## Test Scripts Available

### Coffee Website React

Located in: `coffee-website-react/package.json`

```json
{
  "scripts": {
    "test:inventory": "tsx scripts/test-inventory.ts",
    "test:checkout": "tsx scripts/test-checkout.ts",
    "test:stripe": "tsx scripts/test-stripe.ts",
    "lint": "eslint .",
    "build": "tsc -b && vite build"
  }
}
```

**What Each Test Does:**

1. **test:inventory**
   - Tests product inventory management
   - Validates stock updates
   - Checks inventory logging
   - Prevents negative stock

2. **test:checkout**
   - Tests checkout flow
   - Validates cart operations
   - Checks order creation
   - Verifies data persistence

3. **test:stripe**
   - Tests Stripe integration
   - Validates payment flows
   - Checks webhook handling
   - Verifies test card processing

---

## Adding Playwright E2E Tests

Currently, the test scripts use TypeScript (tsx). To add full Playwright E2E tests:

### Step 1: Install Playwright

```bash
cd coffee-website-react
npm install --save-dev @playwright/test
npx playwright install chromium
```

### Step 2: Initialize Config

```bash
npm init playwright@latest
```

This creates:
- `playwright.config.ts` - Configuration
- `tests/` directory - Test files
- `tests/example.spec.ts` - Sample test

### Step 3: Write Tests

```typescript
// tests/shopping-cart.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('can add items to cart', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');

    // Add first product
    await page.click('button:has-text("Add to Cart")').first();

    // Verify cart count
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');
  });

  test('can remove items from cart', async ({ page }) => {
    // Add item
    await page.click('button:has-text("Add to Cart")').first();

    // Open cart
    await page.click('[data-testid="cart-icon"]');

    // Remove item
    await page.click('[data-testid="remove-item"]');

    // Verify cart empty
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).not.toBeVisible();
  });

  test('calculates total correctly', async ({ page }) => {
    // Add 2 different products
    const productCards = page.locator('[data-testid="product-card"]');
    await productCards.nth(0).locator('button:has-text("Add to Cart")').click();
    await productCards.nth(1).locator('button:has-text("Add to Cart")').click();

    // Open cart
    await page.click('[data-testid="cart-icon"]');

    // Verify total
    const total = page.locator('[data-testid="cart-total"]');
    await expect(total).toContainText('$');
  });
});
```

### Step 4: Run Tests

```bash
# Run all tests
npx playwright test

# Run in UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test tests/shopping-cart.spec.ts

# Generate HTML report
npx playwright show-report
```

### Step 5: Commit

Once committed, tests will automatically run in CI on every PR!

---

## Viewing Test Results

### In GitHub Actions

1. Go to PR → **Checks** tab
2. Click **Playwright Tests** workflow
3. View test logs and results
4. Download artifacts for detailed reports

### Test Artifacts

Each test run uploads:

**Playwright Report** (`playwright-report-{app-name}`):
- HTML report with:
  - Test pass/fail summary
  - Screenshots of failures
  - Video recordings
  - Trace files for debugging
- View locally: `npx playwright show-report playwright-report`

**Test Results** (`test-results-{app-name}`):
- JSON test results
- Coverage reports (if configured)
- Raw test output

### PR Comments

The test workflow automatically comments on PRs:

```markdown
## 🧪 Test Results for abc1234

**Application:** `coffee-website-react`

### Test Summary

- ✅ Linting: Passed
- 🏗️ Build: Passed
- 🧪 Test Scripts: 3/3 passed
- 🎭 Playwright: 12/12 passed

[View full test logs](https://github.com/owner/repo/actions/runs/123456)

**Artifacts:**
- Playwright Report: Available in artifacts
- Test Results: Available in artifacts
```

---

## Configuration

### Test Matrix (playwright.yml)

The workflow uses a matrix strategy to test multiple apps:

```yaml
strategy:
  matrix:
    app:
      - name: coffee-website-react
        path: coffee-website-react
        port: 5173
        test_scripts: ['test:inventory', 'test:checkout', 'test:stripe']
      # Add more apps here:
      # - name: content-gen-frontend
      #   path: apps/content-gen/frontend
      #   port: 5174
      #   test_scripts: []
```

To add a new app:
1. Add new matrix entry
2. Specify path, port, and test scripts
3. Tests will run automatically

### Review Wait Timeout

The review waits up to 10 minutes for tests. To adjust:

```yaml
# claude-code-review-custom.yml
const maxWaitTime = 10 * 60 * 1000; // Change to 15 * 60 * 1000 for 15 min
```

### Test Score Penalty

Currently deducts 10-20 points for test failures. To adjust:

```yaml
# claude-code-review-custom.yml, in the prompt:
**IMPORTANT:** If tests failed, you MUST:
...
3. Reduce the Testing dimension score by 10-20 points
   # Change to different range, e.g., 5-15 points
```

---

## Benefits

### Before Test Integration

❌ Tests had to be run manually
❌ No test enforcement on PRs
❌ Easy to forget to run tests
❌ Test failures discovered late
❌ No test artifacts in CI

### After Test Integration

✅ Tests run automatically on every PR
✅ Test results influence review score
✅ Impossible to forget tests
✅ Failures caught immediately
✅ Test reports saved as artifacts
✅ Test status visible in PR comments
✅ Claude auto-fixes test failures
✅ Complete audit trail

---

## Troubleshooting

### Tests Not Running

**Check:**
1. Is PR a draft? (Tests skip drafts)
2. Is PR from dependabot? (Tests skip dependabot)
3. Did PR change relevant files? (Check `paths:` filter)
4. Check Actions tab for error logs

### Review Not Waiting for Tests

**Check:**
1. Is test workflow named exactly "Playwright Tests"?
2. Is test workflow running for the same commit SHA?
3. Did test workflow timeout (>10 minutes)?
4. Check `wait-for-tests` job output

### Test Artifacts Not Uploading

**Check:**
1. Did tests actually run?
2. Is `playwright-report/` directory created?
3. Check workflow permissions
4. Verify upload-artifact action version

### Tests Passing Locally But Failing in CI

**Common causes:**
- Different Node.js versions (CI uses LTS)
- Missing environment variables
- Different browser versions
- Timing issues (add more waits)
- Port conflicts (CI uses clean environment)

**Solutions:**
```bash
# Match CI environment locally
nvm use --lts
npm ci  # Instead of npm install
npm run build  # Test production build
```

---

## Future Enhancements

Potential improvements:

- [ ] **Parallel test execution** - Shard tests across multiple runners
- [ ] **Visual regression testing** - Percy or Chromatic integration
- [ ] **Performance testing** - Lighthouse CI for Core Web Vitals
- [ ] **Accessibility testing** - Axe-core integration
- [ ] **Coverage tracking** - Istanbul/NYC coverage reports
- [ ] **Test flakiness detection** - Retry flaky tests
- [ ] **Smoke tests** - Quick sanity checks before full suite
- [ ] **Database seeding** - Automated test data setup
- [ ] **Mock services** - MSW for API mocking
- [ ] **Cross-browser testing** - Firefox, WebKit, Mobile browsers

---

## Summary

**Test integration is now live!** 🎉

Every PR will:
1. ✅ Run automated tests (lint, build, test scripts)
2. ✅ Upload test artifacts
3. ✅ Comment results on PR
4. ✅ Influence code review score
5. ✅ Trigger Claude to fix failures
6. ✅ Ensure quality before merge

**Next steps:**
1. Create your first Playwright E2E test
2. Watch it run automatically on your next PR
3. See Claude respond to test failures
4. Enjoy automated quality enforcement!

---

**Files Created/Modified:**
- ✅ `.github/workflows/playwright.yml` (NEW)
- ✅ `.github/workflows/claude-code-review-custom.yml` (UPDATED)
- ✅ `.github/workflows/WORKFLOW_GUIDE.md` (UPDATED)
- ✅ `.github/workflows/QUICK_REFERENCE.md` (UPDATED)
- ✅ `.github/workflows/WORKFLOW_DIAGRAM.md` (UPDATED)
- ✅ `.github/workflows/TESTING_INTEGRATION_SUMMARY.md` (NEW - this file)

**Documentation:** Complete ✅
**Integration:** Complete ✅
**Testing:** Ready for first PR ✅
