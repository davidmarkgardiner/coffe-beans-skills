# Claude Automated Development & Review Workflow Guide

## Overview

This repository uses an automated development cycle where Claude Code implements features and reviews code, creating an iterative improvement loop until quality standards are met.

## The Automated Flow

```
┌─────────────────────────────────────────────────────────────┐
│ AUTOMATED CLAUDE DEVELOPMENT & REVIEW CYCLE                 │
└─────────────────────────────────────────────────────────────┘

1. User creates issue with "@claude" mention
   ↓
2. claude.yml: Claude Implementation Agent
   - Reads issue requirements
   - Implements solution on feature branch
   - Runs tests
   - Creates PR with proper description
   ↓
3. playwright.yml: Automated Test Suite (runs in parallel)
   - Runs linting checks
   - Builds the application
   - Executes test scripts (test:inventory, test:checkout, etc.)
   - Runs Playwright end-to-end tests (if configured)
   - Uploads test reports as artifacts
   ↓
4. claude-code-review-custom.yml: Claude Review Agent
   - Waits for test results (up to 10 minutes)
   - Reviews PR changes comprehensively
   - Scores quality (0-100) across 6 dimensions
   - **Deducts points if tests fail** (10-20 points from Testing score)
   - Leaves inline comments on code
   - Posts review summary with score
   ↓
5. Decision Point (score-based + test-based):

   IF score >= 85:
   ├─→ Review approves PR ✅
   └─→ User can merge

   IF score 70-84 AND iteration < 3:
   ├─→ Review requests changes with @claude tag ⚠️
   ├─→ claude.yml triggers again (responds to PR comment)
   ├─→ Claude Implementation Agent fixes issues
   ├─→ Pushes updates to same PR branch
   └─→ Loop back to step 3 (automatic re-review)

   IF score < 70 OR iteration >= 3:
   └─→ Request human review ❌
```

## Workflow Files

### 1. `playwright.yml` - Automated Test Suite

**Purpose:** Runs automated tests on every PR to ensure code quality and prevent regressions.

**Triggers:**
- PR opened, synchronized, ready for review, or reopened
- Changes to specific paths (coffee-website-react, apps/content-gen/frontend)
- Manual dispatch

**Test Matrix:**
- Tests multiple applications in parallel
- Each app has its own configuration (port, test scripts)

**Test Stages:**
1. **Lint Check** - Runs ESLint to catch code style issues
2. **Build Check** - Ensures the app builds successfully
3. **Test Scripts** - Runs package.json test scripts:
   - `test:inventory` - Tests inventory management
   - `test:checkout` - Tests checkout flow
   - `test:stripe` - Tests Stripe integration
4. **Playwright E2E** - Runs end-to-end browser tests (if configured)

**Artifacts:**
- Playwright HTML reports (with screenshots and videos)
- Test results and coverage reports
- Retained for 30 days

**PR Comments:**
- Posts test summary to PR
- Links to full logs and artifacts
- Updates on each new commit

**Key Features:**
- Runs in parallel with code review for speed
- Continues on error to capture all failures
- Uploads artifacts even if tests fail
- Matrix strategy for multi-app repositories

---

### 2. `claude.yml` - Implementation Agent

**Purpose:** Responds to issues and review comments to implement and fix code.

**Triggers:**
- New issues with `@claude` mention
- Comments on issues with `@claude` mention
- PR review comments with `@claude` mention
- PR reviews with `@claude` mention

**Permissions:**
- ✅ `contents: write` - Create branches and push code
- ✅ `pull-requests: write` - Create and update PRs
- ✅ `issues: write` - Comment on issues
- ✅ `actions: read` - Read CI results

**Key Features:**
- Context-aware prompts based on event type
- Safe file operations (blocks `rm -rf`, `sudo`, `chmod`, `chown`)
- Full git history for better context
- Can create branches, commits, and PRs

**Example Usage:**

```markdown
# In an issue:
Add user authentication with OAuth

@claude please implement this feature with:
- Google OAuth integration
- User session management
- Protected route middleware
```

### 3. `claude-code-review-custom.yml` - Review Agent

**Purpose:** Automatically reviews all PRs and provides scored feedback based on code quality AND test results.

**Triggers:**
- PR opened
- PR synchronized (new commits)
- PR marked ready for review
- PR reopened

**Filters:**
- ❌ Skips draft PRs
- ❌ Skips dependabot PRs

**Permissions:**
- ✅ `contents: read` - Read code
- ✅ `pull-requests: write` - Comment on PRs
- ✅ `issues: write` - Comment on related issues
- ✅ `actions: read` - Read test workflow results

**Test Integration:**
- **Waits for Playwright tests** to complete (up to 10 minutes)
- **Includes test results** in review scoring
- **Deducts points** if tests fail:
  - Failing tests: -10 to -20 points from Testing dimension
  - Tags @claude with specific test failures to fix

**Review Dimensions:**

1. **Architecture & Design (20 points)**
   - Design appropriateness
   - Modularity and SRP
   - Complexity vs simplicity
   - PR atomicity

2. **Functionality & Correctness (20 points)**
   - Business logic correctness
   - Edge case handling
   - Error handling
   - Race conditions

3. **Security (20 points)** 🔒
   - Input validation
   - Authentication/authorization
   - Secrets management
   - XSS, SQLi prevention

4. **Maintainability (15 points)**
   - Code readability
   - Naming conventions
   - Control flow clarity
   - Meaningful comments

5. **Testing (15 points)**
   - Test coverage
   - Failure mode testing
   - Test code quality

6. **Performance (10 points)**
   - Database query efficiency
   - Frontend bundle size
   - API design
   - Caching strategy

**Scoring System:**

| Score Range | Decision | Action |
|-------------|----------|--------|
| 85-100 | ✅ APPROVE | PR is approved, ready to merge |
| 70-84 | ⚠️ REQUEST_CHANGES | Tag @claude with specific fixes (if iteration < 3) |
| 0-69 | ❌ BLOCK | Request human review |

**Iteration Limit:**
- Maximum 3 automated review cycles
- After 3 iterations, human review is requested regardless of score

## How to Use

### Creating a New Feature

1. **Create an issue** with clear requirements:

```markdown
Title: Add shopping cart functionality

Body:
Implement a shopping cart feature with:
- Add/remove items
- Update quantities
- Calculate totals
- Persist to localStorage

@claude please implement this
```

2. **Claude implements** automatically:
   - Creates feature branch
   - Writes code
   - Adds tests
   - Creates PR

3. **Automated review** begins:
   - Review agent analyzes code
   - Provides scored feedback
   - Tags @claude if changes needed

4. **Iterative improvement** (if score < 85):
   - Claude fixes issues
   - Pushes updates
   - Re-review triggers automatically
   - Continues up to 3 iterations

5. **Merge** when approved (score >= 85)

### Responding to Review Feedback

You can also manually guide Claude:

```markdown
# In a PR review comment:
@claude The authentication middleware needs to handle expired tokens better.
Please add:
1. Token expiry check
2. Automatic refresh logic
3. Tests for expired token scenarios
```

### Manual Review Requests

```markdown
# In any PR comment:
@claude Please review the performance of the database queries in src/api/products.ts
```

## Test Requirements

### Automated Testing Philosophy

**Tests are a quality gate, not a blocker.** The workflow is designed to:
1. Run tests automatically on every PR
2. Report results to reviewers
3. Influence the review score
4. Guide Claude to fix failing tests

### Test Status Impact on Score

| Test Status | Impact | Review Action |
|-------------|--------|---------------|
| ✅ All pass | +0 | Normal review scoring |
| ⚠️ Some fail | -10 to -20 pts | Claude tagged to fix failures |
| ❌ All fail | -20 pts | Likely triggers REQUEST_CHANGES |
| ⏱️ Timeout | Warning only | Review notes concern |

### Available Test Commands

```bash
# Coffee Website React
cd coffee-website-react

# Inventory management tests
npm run test:inventory

# Checkout flow tests
npm run test:checkout

# Stripe integration tests
npm run test:stripe

# Lint check
npm run lint

# Build check
npm run build

# Playwright E2E (if configured)
npx playwright test
```

### Adding Playwright E2E Tests

To add Playwright tests to your app:

1. **Install Playwright:**
   ```bash
   cd coffee-website-react
   npm install --save-dev @playwright/test
   npx playwright install chromium
   ```

2. **Create config:**
   ```bash
   # Creates playwright.config.ts
   npm init playwright@latest
   ```

3. **Write tests in `tests/` directory:**
   ```typescript
   // tests/homepage.spec.ts
   import { test, expect } from '@playwright/test';

   test('homepage loads successfully', async ({ page }) => {
     await page.goto('http://localhost:5173');
     await expect(page).toHaveTitle(/Coffee/);
   });

   test('can add item to cart', async ({ page }) => {
     await page.goto('http://localhost:5173');
     await page.click('button:has-text("Add to Cart")');
     await expect(page.locator('.cart-count')).toHaveText('1');
   });
   ```

4. **Tests will automatically run** on next PR

### Test Artifacts

After each test run, download artifacts from GitHub Actions:
- **Playwright Report** - HTML report with screenshots and videos
- **Test Results** - JSON test results and coverage
- **Retention**: 30 days

---

## Best Practices

### For Users

1. **Be specific in issues**: Clear requirements lead to better implementations
2. **Trust the process**: Let the automated review cycle complete before intervening
3. **Review approved PRs**: Even with score >= 85, do a final human review for critical features
4. **Monitor iterations**: If 3 iterations don't resolve issues, the problem may need human insight

### For Claude Implementation Agent

1. **Always create feature branches**: Never push directly to main
2. **Write comprehensive tests**: Aim for good coverage from the start
3. **Follow CLAUDE.md**: Repository conventions and patterns
4. **Clear PR descriptions**: Explain what, why, and how

### For Claude Review Agent

1. **Be constructive**: Focus on improvements, not criticism
2. **Reference specific files/lines**: Use `file.ts:42` format
3. **Explain principles**: Don't just say "fix this", explain why
4. **Score consistently**: Use the rubric faithfully

## Troubleshooting

### Claude isn't responding to @mentions

- Check that the mention is exactly `@claude` (lowercase)
- Verify the workflow files are in `.github/workflows/`
- Check Actions tab for workflow run status
- Ensure `CLAUDE_CODE_OAUTH_TOKEN` secret is set

### Reviews aren't triggering

- Confirm PR is not a draft
- Check that PR is not from dependabot
- Verify workflow has necessary permissions
- Check Actions tab for errors

### Infinite review loop

- Check iteration counter in review comments
- Should auto-stop at 3 iterations
- If stuck, manually approve or request changes

### Low scores on good code

- Review agent may be too strict
- Adjust scoring guidelines in workflow
- Consider lowering APPROVE threshold (currently 85)

## Configuration

### Adjusting Quality Thresholds

Edit `.github/workflows/claude-code-review-custom.yml`:

```yaml
# Current thresholds:
# 85-100: APPROVE
# 70-84: REQUEST_CHANGES
# 0-69: BLOCK

# To be more lenient:
# 75-100: APPROVE
# 60-74: REQUEST_CHANGES
# 0-59: BLOCK
```

### Changing Iteration Limit

Edit `.github/workflows/claude-code-review-custom.yml`:

```yaml
MAX_ITERATIONS: 3  # Change to 5 for more attempts
```

### Disabling Automated Reviews

Rename or disable the review workflow:

```bash
# Temporarily disable
mv .github/workflows/claude-code-review-custom.yml \
   .github/workflows/claude-code-review-custom.yml.disabled

# Re-enable
mv .github/workflows/claude-code-review-custom.yml.disabled \
   .github/workflows/claude-code-review-custom.yml
```

### Adding More Review Criteria

Edit the prompt in `claude-code-review-custom.yml` to add new dimensions:

```yaml
- Accessibility: XX/10
- Documentation: XX/10
```

## Security Notes

### Blocked Commands

The implementation agent cannot execute:
- `rm -rf*` - Recursive force deletion
- `sudo*` - Privilege escalation
- `chmod*` - Permission changes
- `chown*` - Ownership changes

### Safe Operations

Allowed operations include:
- File read/write/copy/move
- Git operations (branch, commit, push)
- Package management (npm, pip, etc.)
- Build and test commands
- GitHub CLI operations

### Secrets Management

- Never commit secrets or API keys
- Use GitHub Secrets for sensitive data
- Claude will flag hardcoded credentials in reviews

## Workflow Metrics

Track your automated workflow success:

```bash
# Count automated approvals
gh pr list --state closed --json reviews --jq '
  [.[] | select(.reviews[].body | contains("APPROVED"))] | length
'

# Average review iterations
gh pr list --json comments --jq '
  [.[] | [.comments[] | select(.body | contains("Review Score"))] | length] |
  add / length
'
```

## Future Enhancements

Potential improvements to consider:

- [ ] Automated benchmark comparisons
- [ ] Visual regression testing integration
- [ ] Dependency update automation
- [ ] Performance budget enforcement
- [ ] Accessibility testing integration
- [ ] Security scanning integration (SAST/DAST)
- [ ] Automatic changelog generation
- [ ] Deployment automation on approval

## Support

For issues or questions:
- Check the [Actions tab](../../actions) for workflow logs
- Review this guide for common solutions
- Open an issue for workflow improvements
- Mention `@claude` in issues for help

---

**Last Updated:** 2025-10-25
**Workflow Version:** 2.0
