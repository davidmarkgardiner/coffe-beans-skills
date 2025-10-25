# Claude Workflow Quick Reference

## Quick Start Commands

### Request Implementation
```markdown
# In a new issue:
@claude implement user authentication with OAuth
```

### Request Code Changes
```markdown
# In PR comments:
@claude fix the authentication error handling in src/auth.ts:45
```

### Request Manual Review
```markdown
# In PR comments:
@claude review the database migrations for performance issues
```

## Review Score Guide

| Score | Meaning | What Happens |
|-------|---------|--------------|
| 85-100 | ✅ Excellent | Auto-approved, ready to merge |
| 70-84 | ⚠️ Good | Claude will fix issues (max 3 tries) |
| 0-69 | ❌ Needs work | Human review requested |

## Score Breakdown (Total: 100)

- **Architecture & Design**: 20 points
- **Functionality & Correctness**: 20 points
- **Security**: 20 points ⚡ (Critical)
- **Maintainability**: 15 points
- **Testing**: 15 points
- **Performance**: 10 points

## Workflow Triggers

| Event | Workflow | What Happens |
|-------|----------|--------------|
| Issue opened with @claude | claude.yml | Claude implements feature |
| PR opened | playwright.yml + claude-code-review-custom.yml | Tests run, then review |
| PR updated | playwright.yml + claude-code-review-custom.yml | Re-test, then re-review |
| @claude in PR comment | claude.yml | Claude fixes requested issues |
| @claude in review | claude.yml | Claude addresses feedback |

### Test Results in Review

| Test Status | Impact on Score | Action |
|-------------|-----------------|--------|
| ✅ All pass | No penalty | Normal review |
| ⚠️ Some fail | -10 to -20 pts | Claude auto-fixes |
| ❌ All fail | -20 pts | REQUEST_CHANGES |
| ⏱️ Timeout | Warning only | Proceed cautiously |

## Common Patterns

### 1. Feature Implementation
```
You: Create issue "Add user profiles"
     Include @claude in description
     ↓
Claude: Creates branch, implements, tests, creates PR
     ↓
Tests: Automated test suite runs (lint, build, tests)
     ↓
Review: Waits for tests, then reviews with test results
     ↓
Result: Approved (if score ≥85 & tests pass) or requests changes
```

### 2. Iterative Improvement
```
Review: Score 76/100 - "Fix error handling" + @claude
     ↓
Claude: Pushes fixes to same PR
     ↓
Review: Re-runs automatically, new score 88/100
     ↓
Result: Approved ✅
```

### 3. Human Intervention
```
Review: Score 65/100 after 3 iterations
     ↓
Review: "❌ Human review required"
     ↓
You: Review code, provide guidance
     ↓
You: "@claude here's what needs to change..."
     ↓
Claude: Implements your feedback
```

## Useful GitHub Commands

```bash
# View all Claude-created PRs
gh pr list --author "github-actions[bot]"

# Check review score for a PR
gh pr view 123 --json comments --jq '.comments[] | select(.body | contains("Review Score"))'

# See all @claude mentions
gh issue list --search "@claude"

# Count automated approvals
gh pr list --state closed --label "claude-approved"
```

## Tips for Better Results

### ✅ DO
- Be specific in issue descriptions
- Include acceptance criteria
- Reference files and line numbers
- Let automated iteration complete
- Review approved PRs before merging

### ❌ DON'T
- Use vague requirements like "make it better"
- Mention @claude multiple times in one comment
- Interrupt iteration cycles prematurely
- Merge without checking test results
- Commit secrets or credentials

## Emergency Actions

### Stop a Runaway Workflow
```bash
# List running workflows
gh run list --workflow=claude.yml --status in_progress

# Cancel a specific run
gh run cancel <run-id>
```

### Disable Auto-Review
```bash
# Temporarily disable
mv .github/workflows/claude-code-review-custom.yml \
   .github/workflows/claude-code-review-custom.yml.disabled
```

### Force Human Review
```markdown
# In PR comment:
/cc @username - needs human review, bypassing automated cycle
```

## Blocked Operations (Security)

Claude **cannot** run these dangerous commands:
- ❌ `rm -rf` - Recursive deletion
- ❌ `sudo` - Privilege escalation
- ❌ `chmod` - Permission changes
- ❌ `chown` - Ownership changes

Claude **can** run safe operations:
- ✅ Read/write/copy files
- ✅ Git operations
- ✅ Run tests and builds
- ✅ Package management
- ✅ GitHub CLI

## Status Indicators

| Symbol | Meaning |
|--------|---------|
| ✅ | Approved, ready to merge |
| ⚠️ | Changes requested, Claude working on it |
| ❌ | Blocked, needs human intervention |
| 🔄 | Review iteration in progress |
| 🔒 | Security issue flagged |
| 🧪 | Tests failing |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Claude not responding | Check Actions tab, verify @claude mention |
| Review not triggering | Ensure PR is not draft, check permissions |
| Low score on good code | Adjust thresholds in workflow file |
| Stuck in review loop | Check iteration count, should stop at 3 |
| Permission denied errors | Check workflow permissions in YAML |

## Configuration Files

- **Implementation**: `.github/workflows/claude.yml`
- **Testing**: `.github/workflows/playwright.yml`
- **Review**: `.github/workflows/claude-code-review-custom.yml`
- **Conventions**: `CLAUDE.md`
- **Full guide**: `.github/workflows/WORKFLOW_GUIDE.md`
- **This reference**: `.github/workflows/QUICK_REFERENCE.md`

## Running Tests Locally

```bash
# Coffee website tests
cd coffee-website-react

# Run all test scripts
npm run test:inventory
npm run test:checkout
npm run test:stripe

# Lint check
npm run lint

# Build check
npm run build

# View test artifacts
ls -la playwright-report/
```

## Examples

### Good Issue Description
```markdown
Title: Add shopping cart

Requirements:
- Add item to cart with quantity
- Remove items from cart
- Calculate total price with tax
- Persist cart in localStorage
- Display cart icon with item count

Acceptance Criteria:
- User can add/remove items
- Cart persists across page reloads
- Tax calculated at 10%
- Tests cover edge cases

@claude please implement
```

### Good Review Response
```markdown
Thanks for the review! I've addressed all feedback:

1. ✅ Added null checks in cart.ts:42
2. ✅ Improved error messages in checkout.ts:89
3. ✅ Added tests for edge cases
4. ✅ Optimized cart rendering performance

@claude please re-review
```

---

**Quick Links:**
- [Full Workflow Guide](./WORKFLOW_GUIDE.md)
- [GitHub Actions](../../actions)
- [Claude Code Docs](https://docs.claude.com/en/docs/claude-code)
