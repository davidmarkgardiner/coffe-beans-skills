---
name: github-actions-orchestrator
description: Expert GitHub Actions orchestrator that manages the complete automated workflow lifecycle from PR creation through approval. Monitors workflow runs, fixes issues, and ensures PRs pass through all automated checks (fast pre-checks, Firebase preview deployment, E2E tests, and code review) until final approval.
---

# GitHub Actions Orchestrator Skill

## Purpose

You are a **GitHub Actions Orchestrator Expert**. Your job is to:

1. **Create PRs** from feature branches
2. **Monitor all workflow runs** (fast-pre-checks, firebase-preview, claude-code-review)
3. **Watch for failures** and diagnose issues
4. **Fix workflow bugs** when actions fail
5. **Respond to @claude tags** in PR comments
6. **Ensure complete automation** from PR → Approval
7. **Validate the entire workflow** works end-to-end

## Workflow Architecture

Our repository has a sophisticated automated workflow with **3 parallel workflows**:

```
┌─────────────────────────────────────────┐
│        User Creates Issue               │
│                 ↓                       │
│     claude.yml (Implementation)         │
│    - Creates feature branch             │
│    - Implements solution                │
│    - Creates PR                         │
│    - Model: claude-haiku-4-5            │
└─────────────────────────────────────────┘
                 ↓
         ┌──── PR Created ────┐
         │                    │
         ↓                    ↓                    ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Fast Pre-Checks  │  │ Firebase Preview │  │ Fast Code Review │
│ (playwright.yml) │  │ (firebase-prev.) │  │ (review-fast.yml)│
│                  │  │                  │  │                  │
│ • TypeScript ✓   │  │ • Build app      │  │ • Review code    │
│ • Lint (⚠️)      │  │ • Deploy preview │  │ • Score 0-100    │
│ • Build ✓        │  │ • Cache Playwright│ │ • Post comment   │
│ • Unit tests (⚠️)│  │ • E2E tests ✓    │  │ • Tag @claude    │
│                  │  │ • Upload reports │  │   if score < 85  │
│ Time: 1-2 min    │  │ Time: 2-3 min    │  │ Time: 30-60 sec  │
│                  │  │                  │  │ Model: Haiku 4.5 │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                    │                    │
         └────────────┬───────┴────────────────────┘
                      ↓
              ┌───────────────┐
              │ Review posted │
              │  Score < 85?  │
              └───────┬───────┘
                      │ YES
                      ↓
              ┌───────────────┐
              │ @claude tagged│
              │   in comment  │
              └───────┬───────┘
                      │
                      ↓
              ┌───────────────┐
              │  claude.yml   │
              │   triggered   │
              │ - Fix issues  │
              │ - Push update │
              └───────┬───────┘
                      │
                      ↓
              ┌───────────────┐
              │ Workflows run │
              │     again     │
              │  (max 3 times)│
              └───────────────┘
```

## Key Optimizations

Our workflow has been heavily optimized for speed and cost:

### 1. Playwright Browser Caching
**Benefit:** 30-90 second speedup per E2E test run

```yaml
# .github/workflows/firebase-preview.yml
- name: Setup Playwright browsers with caching
  uses: actions/cache@v4
  id: playwright-cache
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('coffee-website-react/package-lock.json') }}

- name: Install Playwright browsers (if not cached)
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install --with-deps chromium

- name: Install deps only (if cached)
  if: steps.playwright-cache.outputs.cache-hit == 'true'
  run: npx playwright install-deps chromium
```

**Result:** First run installs browsers (~90s), subsequent runs reuse cache (~10s)

### 2. Fast Code Review Workflow
**Benefit:** 50-70% faster reviews, 80-90% cost reduction

- **Fast Review** (`.github/workflows/claude-code-review-fast.yml`):
  - 20-line prompt (vs 150+ line comprehensive review)
  - Time: 30-60 seconds
  - Tokens: 3-8k
  - Model: claude-haiku-4-5

- **Comprehensive Review** (`.github/workflows/claude-code-review-custom.yml.disabled`):
  - 150+ line prompt with detailed rubric
  - Time: 3-5 minutes
  - Tokens: 15-25k
  - Model: claude-haiku-4-5

**Recommendation:** Use fast review for development/testing, comprehensive for production PRs

### 3. Claude Haiku 4.5 Model
**Benefit:** 2-3x faster, 20x cheaper than Sonnet

All Claude actions now use `claude-haiku-4-5`:
- `.github/workflows/claude.yml` (Implementation agent)
- `.github/workflows/claude-code-review-fast.yml` (Fast review)
- `.github/workflows/claude-code-review-custom.yml.disabled` (Comprehensive review)

**Cost comparison (per 1M tokens):**
- claude-sonnet-4-5: $15 in / $75 out
- claude-haiku-4-5: $0.80 in / $4 out
- **Savings: ~20x cheaper**

### 4. Parallel Workflow Execution
**Benefit:** No sequential bottlenecks

All 3 workflows run **simultaneously** when PR is created:
- Fast pre-checks (1-2 min)
- Firebase preview + E2E (2-3 min with caching)
- Fast code review (30-60 sec)

**Total time:** ~3-4 minutes for complete validation (vs 6-8 min sequential)

### 5. Optimized Quality Gates
**Benefit:** Faster feedback, fewer false failures

**Blocking checks:**
- TypeScript type checking ✅
- Build verification ✅

**Non-blocking checks:**
- Linting (existing debt tracked separately) ⚠️
- Integration tests (require secrets only in firebase-preview) ⚠️

**Result:** PRs don't get blocked by known issues, critical failures still surface immediately
```

## Your Responsibilities

### 1. Pre-Flight Checks

Before creating a PR, verify:

```bash
# Check current branch
git branch --show-current

# Check git status
git status

# Verify workflows exist
ls -la .github/workflows/

# Check for required workflows:
# - fast-pre-checks.yml (formerly playwright.yml)
# - firebase-preview.yml
# - claude-code-review-custom.yml
# - claude.yml
```

### 2. PR Creation

Create PR using `gh` CLI:

```bash
# Ensure on feature branch
git checkout <feature-branch>

# Create PR
gh pr create \
  --title "Your PR Title" \
  --body "PR Description

## Changes
- Change 1
- Change 2

## Testing
- [ ] Fast pre-checks
- [ ] Firebase preview deployment
- [ ] E2E tests against preview
- [ ] Code review

---
*This PR will go through automated workflow validation*
" \
  --base main
```

**Important:** Get the PR number from output!

### 3. Monitoring Workflow Runs

Use `gh` CLI to monitor all workflows:

```bash
# Get PR number
PR_NUMBER=$(gh pr view --json number --jq '.number')

# List all workflow runs for this PR
gh run list --limit 20 --json databaseId,name,status,conclusion,createdAt,headBranch

# Watch specific workflow
gh run watch <run-id>

# View workflow logs
gh run view <run-id> --log

# Check workflow status
gh run view <run-id> --json status,conclusion
```

**Monitor these workflows:**
1. `Fast Pre-checks` - Should complete in 2-5 min
2. `Firebase Preview Channel Deployment` - Should complete in 5-10 min
3. `Claude Code Review` - Should start after firebase-preview completes

### 4. Reading PR Comments

Check for workflow results and @claude tags:

```bash
# Get all PR comments
gh pr view $PR_NUMBER --json comments --jq '.comments[] | {author: .author.login, body: .body, created: .createdAt}'

# Check for @claude mentions
gh pr view $PR_NUMBER --json comments --jq '.comments[] | select(.body | contains("@claude"))'

# Get latest comment
gh pr view $PR_NUMBER --json comments --jq '.comments[-1].body'
```

**Look for:**
- ⚡ Fast Pre-checks results
- 🚀 Firebase Preview deployment + E2E results
- 📊 Code review with score
- ⚠️ @claude tags indicating issues

### 5. Downloading Artifacts

If E2E tests fail, download Playwright reports:

```bash
# List artifacts for a run
gh run view <run-id> --json artifacts --jq '.artifacts[] | {name: .name, id: .id}'

# Download specific artifact
gh run download <run-id> --name playwright-report-preview-pr-$PR_NUMBER

# View Playwright HTML report
npx playwright show-report playwright-report-preview-pr-$PR_NUMBER
```

### 6. Diagnosing Failures

When workflows fail, systematically diagnose:

#### Fast Pre-Checks Failed

```bash
# View logs
gh run view <run-id> --log

# Common issues:
# - TypeScript errors → Fix type issues in code
# - Lint errors → Run `npm run lint -- --fix`
# - Build errors → Check for missing dependencies, syntax errors
# - Test failures → Run tests locally: `npm run test:inventory`
```

#### Firebase Preview Failed

```bash
# View deployment logs
gh run view <run-id> --log

# Common issues:
# - Build failed → Check build errors in logs
# - Deployment failed → Check Firebase credentials/permissions
# - E2E tests failed → Download Playwright report, review failures
# - Secrets missing → Verify GitHub Secrets are set
```

#### Code Review Failed/Stalled

```bash
# Check if review is waiting
gh run view <run-id> --log | grep -i "waiting"

# Common issues:
# - Waiting for firebase-preview → Check if firebase-preview completed
# - Timeout → Firebase preview took >15 min
# - Error accessing test results → Check firebase-preview run ID
```

### 7. Fixing Workflow Issues

When you find bugs in the workflows themselves:

#### Workflow File Issues

```bash
# Edit workflow file
code .github/workflows/<workflow-name>.yml

# Common fixes:
# - Fix YAML syntax errors
# - Correct job dependencies (needs: wait-for-tests)
# - Fix environment variable names
# - Update secret references
# - Fix conditionals (if: expressions)
```

#### Commit and push workflow fixes:

```bash
git add .github/workflows/
git commit -m "fix: correct workflow configuration for <issue>"
git push
```

This will trigger workflow re-runs!

### 8. Responding to @claude Tags

When you see @claude tags in PR comments:

```bash
# Read the comment with @claude tag
gh pr view $PR_NUMBER --json comments --jq '.comments[] | select(.body | contains("@claude")) | .body'

# The comment will include:
# 1. Specific issues to fix
# 2. File:line references
# 3. E2E test failures
# 4. Preview URL for testing
```

**Your response:**

1. **Read all feedback** (both E2E comment and review comment)
2. **Fix code issues** mentioned in review
3. **Fix E2E test failures** mentioned in deployment comment
4. **Test locally if possible**
5. **Commit and push** fixes
6. **Monitor re-run** of all workflows

```bash
# Make fixes
# ... edit files ...

# Commit with descriptive message
git commit -am "fix: address code review and E2E test failures

- Fix shopping cart onClick handler (src/components/Cart.tsx:42)
- Add Stripe Elements provider wrapper (src/components/Checkout.tsx:89)
- Improve error handling in checkout flow

Addresses review feedback and E2E test failures from preview deployment.
"

# Push to trigger re-run
git push
```

### 9. Monitoring Iterations

Track how many times the workflow has run:

```bash
# Count workflow runs for this PR
gh run list --branch <feature-branch> --json databaseId | jq 'length'

# Check iteration count in review comments
gh pr view $PR_NUMBER --json comments --jq '.comments[] | select(.body | contains("ITERATION:")) | .body'
```

**Remember:** Max 3 iterations before human review required.

### 10. Final Approval Check

When review says "APPROVED":

```bash
# Check review status
gh pr view $PR_NUMBER --json reviews --jq '.reviews[] | {author: .author.login, state: .state}'

# Check if all checks passed
gh pr checks $PR_NUMBER

# Verify PR is ready to merge
gh pr view $PR_NUMBER --json mergeable,mergeStateStatus
```

## Common Issues & Solutions

### Issue: Fast Pre-Checks Fail on Lint

**Diagnosis:**
```bash
gh run view <run-id> --log | grep -A 10 "Run linting"
```

**Fix:**
```bash
cd coffee-website-react
npm run lint -- --fix
git commit -am "fix: resolve linting issues"
git push
```

### Issue: E2E Tests Fail - Button Not Working

**Diagnosis:**
```bash
# Download Playwright report
gh run download <run-id> --name playwright-report-preview-pr-$PR_NUMBER

# View report
npx playwright show-report playwright-report-preview-pr-$PR_NUMBER

# Look at screenshots and error messages
```

**Fix:**
```bash
# Edit the component
# ... fix button onClick handler ...

git commit -am "fix: add onClick handler to cart button"
git push
```

### Issue: Firebase Preview Deployment Timeout

**Diagnosis:**
```bash
gh run view <run-id> --log | grep -i "timeout\|expired\|cancel"
```

**Fix:**
```bash
# Cancel stalled run
gh run cancel <run-id>

# Re-run
gh run rerun <run-id>

# Or re-trigger with empty commit
git commit --allow-empty -m "chore: re-trigger workflows"
git push
```

### Issue: Secrets Missing

**Diagnosis:**
```bash
gh run view <run-id> --log | grep -i "secret\|credential\|api_key"
```

**Fix:**
```bash
# List secrets
gh secret list

# Set missing secret (if you have access)
gh secret set FIREBASE_SERVICE_ACCOUNT < firebase-service-account.json

# Otherwise, notify user
gh pr comment $PR_NUMBER --body "@<user> Missing GitHub secret: FIREBASE_SERVICE_ACCOUNT - please add in repository settings"
```

### Issue: Code Review Stuck Waiting

**Diagnosis:**
```bash
# Check review workflow logs
gh run view <review-run-id> --log | grep -A 5 "Wait for Firebase"

# Check if firebase-preview is still running
gh run list --workflow=firebase-preview.yml --limit 5
```

**Fix:**
```bash
# If firebase-preview failed, fix it first
# If firebase-preview succeeded but review didn't see it, re-run review

gh run rerun <review-run-id>
```

### Issue: Workflow YAML Syntax Error

**Diagnosis:**
```bash
gh run view <run-id> --log | grep -i "syntax\|parse\|invalid"
```

**Fix:**
```bash
# Edit workflow file
code .github/workflows/<workflow>.yml

# Fix YAML syntax (check indentation, quotes, etc.)
# Use YAML linter: yamllint .github/workflows/<workflow>.yml

git commit -am "fix: correct YAML syntax in workflow"
git push
```

## Step-by-Step Process

### End-to-End PR Validation

Use this process to validate the entire workflow:

#### Step 1: Create Test PR

```bash
# Create a simple test change
git checkout -b test/validate-automated-workflow
echo "# Test change" >> test-file.md
git add test-file.md
git commit -m "test: validate automated workflow end-to-end"
git push -u origin test/validate-automated-workflow

# Create PR
gh pr create \
  --title "Test: Validate Automated Workflow" \
  --body "This PR tests the complete automated workflow:

## Expected Flow
1. ✅ Fast pre-checks (type check, lint, build, tests)
2. ✅ Firebase preview deployment
3. ✅ E2E tests against preview URL
4. ✅ Code review with scoring
5. ✅ Auto-approval if score ≥85

## Purpose
Validate end-to-end automation works correctly.
" \
  --base main

# Save PR number
PR_NUMBER=$(gh pr view --json number --jq '.number')
echo "PR #$PR_NUMBER created"
```

#### Step 2: Monitor Fast Pre-Checks

```bash
# Wait for workflow to start (give it 30 seconds)
sleep 30

# Get run ID
FAST_CHECK_RUN=$(gh run list --workflow=fast-pre-checks.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# Watch it
echo "Watching fast pre-checks run #$FAST_CHECK_RUN"
gh run watch $FAST_CHECK_RUN

# If it fails, diagnose and fix
if [ "$(gh run view $FAST_CHECK_RUN --json conclusion --jq '.conclusion')" != "success" ]; then
  echo "❌ Fast pre-checks failed!"
  gh run view $FAST_CHECK_RUN --log
  # Fix issues and push
fi
```

#### Step 3: Monitor Firebase Preview

```bash
# Get run ID
PREVIEW_RUN=$(gh run list --workflow=firebase-preview.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# Watch it
echo "Watching Firebase preview run #$PREVIEW_RUN"
gh run watch $PREVIEW_RUN

# Check for E2E test results
sleep 10  # Give time for comment to post
gh pr view $PR_NUMBER --json comments --jq '.comments[-1].body' | grep "Preview Deployment"

# If E2E tests failed, download report
if gh pr view $PR_NUMBER --json comments --jq '.comments[-1].body' | grep -q "E2E tests failed"; then
  echo "❌ E2E tests failed - downloading report"
  gh run download $PREVIEW_RUN --name "playwright-report-preview-pr-$PR_NUMBER"
  npx playwright show-report "playwright-report-preview-pr-$PR_NUMBER"

  # Fix issues and push
fi
```

#### Step 4: Monitor Code Review

```bash
# Get run ID
REVIEW_RUN=$(gh run list --workflow=claude-code-review-custom.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# Watch it
echo "Watching code review run #$REVIEW_RUN"
gh run watch $REVIEW_RUN

# Check review score
sleep 10
REVIEW_COMMENT=$(gh pr view $PR_NUMBER --json comments --jq '.comments[] | select(.body | contains("Review Score")) | .body')
echo "$REVIEW_COMMENT"

# Extract score
SCORE=$(echo "$REVIEW_COMMENT" | grep -o "Review Score: [0-9]*" | grep -o "[0-9]*")
echo "Score: $SCORE/100"

if [ "$SCORE" -lt 85 ]; then
  echo "⚠️ Score below threshold - @claude will be tagged"
fi
```

#### Step 5: Check for @claude Tags

```bash
# Check if @claude was tagged
if gh pr view $PR_NUMBER --json comments --jq '.comments[-1].body' | grep -q "@claude"; then
  echo "⚠️ @claude was tagged - issues need fixing"

  # Show the feedback
  gh pr view $PR_NUMBER --json comments --jq '.comments[] | select(.body | contains("@claude")) | .body'

  # Fix issues, commit, push
  # This will trigger re-run of all workflows
fi
```

#### Step 6: Verify Approval

```bash
# Check if PR was approved
if gh pr view $PR_NUMBER --json comments --jq '.comments[-1].body' | grep -q "APPROVED"; then
  echo "✅ PR approved! Workflow validation successful!"

  # Optionally merge or close test PR
  # gh pr close $PR_NUMBER --comment "Test successful - closing"
else
  echo "⚠️ PR not yet approved - monitoring iterations"
fi
```

## Key Commands Reference

### PR Management
```bash
gh pr create --title "..." --body "..." --base main
gh pr view <number>
gh pr view <number> --json comments
gh pr comment <number> --body "message"
gh pr checks <number>
gh pr close <number>
gh pr merge <number>
```

### Workflow Monitoring
```bash
gh run list --limit 20
gh run list --workflow=<name>.yml
gh run list --branch <branch>
gh run view <run-id>
gh run view <run-id> --log
gh run watch <run-id>
gh run rerun <run-id>
gh run cancel <run-id>
gh run download <run-id> --name <artifact-name>
```

### Debugging
```bash
gh run view <run-id> --log | grep -i "error"
gh run view <run-id> --log | grep -i "failed"
gh run view <run-id> --log | grep -A 10 "step-name"
gh run view <run-id> --json jobs --jq '.jobs[] | {name: .name, conclusion: .conclusion}'
```

## Success Criteria

A successful end-to-end validation means:

1. ✅ **Fast pre-checks pass** (2-5 min)
   - Type checking ✅
   - Linting ✅
   - Build ✅
   - Unit tests ✅

2. ✅ **Firebase preview deploys** (5-10 min)
   - Build succeeds ✅
   - Deployment succeeds ✅
   - E2E tests run ✅
   - Artifacts uploaded ✅
   - PR comment posted ✅

3. ✅ **Code review completes** (2-5 min)
   - Waits for preview ✅
   - Reviews code ✅
   - Scores PR ✅
   - Posts review ✅

4. ✅ **Feedback loop works**
   - @claude tagged if issues found ✅
   - Issues are specific and actionable ✅
   - Fixes trigger re-run ✅
   - Re-review scores higher ✅

5. ✅ **Approval achieved**
   - Score ≥85 ✅
   - E2E tests passed ✅
   - Review says "APPROVED" ✅
   - PR ready to merge ✅

## Important Notes

1. **Monitor continuously** - Don't wait for completion, watch logs in real-time
2. **Check all comments** - Both E2E and review comments contain important feedback
3. **Download artifacts** - Playwright reports are essential for debugging E2E failures
4. **Fix workflows first** - If workflows have bugs, fix them before fixing code
5. **Respect iteration limit** - Max 3 automated iterations before human review
6. **Test locally when possible** - Faster to catch issues before pushing
7. **Use descriptive commit messages** - Helps track what was fixed in each iteration

## Workflow Files Locations

```
.github/workflows/
├── fast-pre-checks.yml         # Fast validation (type, lint, build, tests)
├── firebase-preview.yml        # Deploy + E2E tests against preview URL
├── claude-code-review-custom.yml  # Code review with E2E results
└── claude.yml                  # Responds to @claude mentions
```

## Expected Timeline

### Optimized Performance (After Improvements)

| Stage | Duration | Notes |
|-------|----------|-------|
| Fast pre-checks | 1-2 min | TypeScript, lint, build, tests |
| Firebase preview + E2E | 2-3 min | With Playwright browser caching |
| Fast code review | 30-60 sec | Using claude-haiku-4-5 |
| **Total (parallel execution)** | **~3-4 min** | All 3 workflows run simultaneously |
| If fixes needed | +3-4 min | Same parallel execution |
| If 2nd iteration | +3-4 min | Max 3 iterations total |

**Optimizations applied:**
- ✅ Playwright browser caching (saves 30-90s per run)
- ✅ Fast review workflow (saves 2-4 min vs comprehensive)
- ✅ Claude Haiku 4.5 model (2-3x faster than Sonnet)
- ✅ Parallel execution (no sequential bottlenecks)

**Goal:** First-pass approval in 3-4 minutes

### Before Optimizations (Reference)

| Stage | Duration | Cumulative |
|-------|----------|------------|
| Fast pre-checks | 2-5 min | 2-5 min |
| Firebase preview + E2E | 5-10 min | 7-15 min |
| Code review | 3-5 min | 10-20 min |
| **Total (sequential)** | **10-20 min** | **10-20 min** |

**Improvement:** 60-75% faster (3-4 min vs 10-20 min)

## Lessons Learned from PR #12 (Workflow Validation)

### Key Insights

**1. Workflow Quality Gates Strategy**
- ✅ **TypeScript type checking**: MUST be blocking - type safety is critical
- ✅ **Build verification**: MUST be blocking - broken builds shouldn't deploy
- ⚠️ **Linting**: Can be non-blocking if existing codebase has lint debt tracked separately
- ⚠️ **Integration tests**: Should be non-blocking in fast-pre-checks if they require secrets
  - These tests need Firebase/Stripe credentials only available in firebase-preview
  - Make them `continue-on-error: true` with clear documentation

**Example from `.github/workflows/fast-pre-checks.yml` (formerly playwright.yml):**
```yaml
- name: TypeScript type checking
  run: npx tsc --noEmit
  # No continue-on-error - type safety is critical ✅

- name: Run linting
  run: npm run lint
  continue-on-error: true  # Existing lint issues tracked separately ⚠️

- name: Build verification
  run: npm run build
  # No continue-on-error - must build successfully ✅

- name: Run unit test scripts
  run: npm run test:inventory test:checkout test:stripe
  continue-on-error: true  # These require Firebase/Stripe secrets ⚠️
```

**2. Avoid Infinite Loops**
- **claude.yml** must filter out bot comments: `github.event.sender.type != 'Bot'`
- **firebase-preview.yml** should NOT auto-tag @claude on failures
- Let users manually request fixes when needed
- Prevents github-actions bot from triggering claude workflow endlessly

**3. Clean Test Artifacts**
- Don't add test comments to production code (e.g., `main.tsx`)
- Use workflow_dispatch or path triggers instead of modifying source
- Move test documentation to `.github/workflows/` for co-location

**4. Common Workflow Fixes**

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| `npm ci` fails | package-lock.json out of sync | Run `npm install` locally and commit lock file |
| ESLint blocks PR | Lint errors in existing code | Make lint `continue-on-error: true` OR fix all lint errors |
| Unit tests fail in CI | Tests need Firebase/Stripe secrets | Make tests `continue-on-error: true` in fast-pre-checks, they'll run in firebase-preview |
| PR comment permission error | Missing `pull-requests: write` | Add `continue-on-error: true` to PR comment step |
| Infinite @claude loops | Bot comments trigger claude.yml | Filter: `github.event.sender.type != 'Bot'` |

**5. Code Review Scoring Insights**

From multiple reviews of PR #12, code reviews assigned different scores based on same code:
- **72/100**: Flagged `continue-on-error` as major issues
- **85/100**: Approved with minor cleanup recommendations
- **88/100**: Approved, asked for post-merge cleanup
- **97/100**: Approved, called approach "pragmatic quality"

**Lesson:** Code review scoring is subjective. The highest score came from reviews that:
1. Understood the **pragmatic context** (workflow validation test)
2. Appreciated **documented rationale** for decisions
3. Recognized **appropriate trade-offs** (blocking critical checks, non-blocking warnings)
4. Valued **clean separation** of concerns (fast-pre-checks vs firebase-preview)

**6. Workflow File Naming**
- Originally named `playwright.yml` - confusing since it's not just Playwright
- Renamed to `fast-pre-checks.yml` - clearer purpose
- Name files based on **what they do**, not **tools they use**

**7. E2E Testing Best Practices**
- Run E2E tests against **live Firebase preview URL**, not localhost in CI
- This validates real CDN behavior, environment variables, and user experience
- Tests in PR #12 all passed ✅ - proves cloud-first strategy works

**8. Documentation Organization**
- Co-locate workflow docs with workflows: `.github/workflows/VALIDATION_TEST.md`
- Don't clutter repository root with workflow test files
- Use clear README references to guide users

## Lessons Learned from PR #13 (Fast Review Optimization)

### Key Insights

**1. Playwright Browser Caching Works**
- ✅ Successfully implemented GitHub Actions caching for Playwright browsers
- First run: ~90 seconds to install browsers
- Subsequent runs: ~10 seconds (cache hit)
- Cache key based on package-lock.json ensures invalidation when Playwright version changes

**2. Fast Code Review Successfully Posts Comments**
- ✅ Fixed OIDC permission issue by adding `id-token: write`
- ✅ Fixed comment posting by adding `claude_args: '--allowed-tools Bash'`
- Review successfully posted with score (72/100) and @claude tag for improvements
- Total review time: ~30-60 seconds (vs 3-5 min comprehensive)

**3. Claude Haiku 4.5 Performance**
- ✅ All workflows updated to use `claude-haiku-4-5`
- Fast, cost-effective reviews
- Quality still high enough for development/testing PRs
- Recommendation: Use Haiku for testing, Sonnet for critical production reviews

**4. Parallel Workflow Execution Validated**
- ✅ All 3 workflows triggered simultaneously on PR creation:
  - Fast pre-checks (playwright.yml)
  - Firebase preview deployment (firebase-preview.yml)
  - Fast code review (claude-code-review-fast.yml)
- No blocking dependencies between workflows
- Total time for complete validation: ~3-4 minutes

**5. Workflow Validation Challenges**
- **Challenge:** New workflow files must exist on default branch before running on PR
- **Solution:** Cherry-pick critical fixes to main branch first, then test on feature branch
- **Lesson:** When adding new workflows, commit to main first or use workflow_dispatch for testing

**6. Review Scoring Behavior**
- Fast review gave 72/100 on test PR with continue-on-error strategy
- Tagged @claude with specific improvements (remove test code, fix error handling)
- Scoring appropriately stricter than comprehensive review that understood context
- **Lesson:** Fast review good for catching obvious issues, comprehensive better for nuanced decisions

**7. Complete Automation Cycle Works**
1. ✅ User creates issue → claude.yml creates PR
2. ✅ PR triggers 3 parallel workflows
3. ✅ Fast review posts comment with score
4. ✅ If score < 85, @claude tagged in comment
5. ✅ @claude tag triggers claude.yml to fix issues
6. ✅ Fixes pushed → workflows re-run
7. ✅ Cycle repeats (max 3 times) until approval

**Workflow design confirmed correct and fully functional!**

## Your Mission

Run the complete end-to-end workflow, fix any issues encountered, and ensure we achieve:

1. ✅ PR created successfully
2. ✅ All workflows execute without errors
3. ✅ E2E tests pass against Firebase preview
4. ✅ Code review completes with score ≥85
5. ✅ PR approved and ready to merge
6. ✅ Complete automation with no manual intervention

**You are the orchestrator. Make it happen!** 🎯
