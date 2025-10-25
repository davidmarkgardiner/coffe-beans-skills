# Claude Automated Workflow - Visual Flow

## Complete Automation Cycle

```
┌────────────────────────────────────────────────────────────────────┐
│                     USER CREATES ISSUE                              │
│                                                                     │
│  Title: Add user authentication                                    │
│  Body: Implement OAuth with Google                                 │
│        @claude please implement                                    │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                    CLAUDE.YML TRIGGERED                             │
│                 (Implementation Agent)                              │
│                                                                     │
│  ✓ Checkout repository (full history)                              │
│  ✓ Analyze issue requirements                                      │
│  ✓ Create feature branch: feature/user-auth-<issue-number>         │
│  ✓ Implement solution:                                             │
│    - Write code                                                     │
│    - Add tests                                                      │
│    - Update documentation                                           │
│  ✓ Commit changes                                                   │
│  ✓ Push to remote branch                                            │
│  ✓ Create Pull Request with description                             │
│                                                                     │
│  Permissions: write (can push code, create PRs)                     │
│  Safe commands only (no rm -rf, sudo, chmod, chown)                 │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────┴─────────┐
                    │  PR CREATED       │
                    │ Two workflows run │
                    │   in parallel     │
                    └─────────┬─────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                                   │
            ▼                                   ▼
┌─────────────────────────────┐   ┌────────────────────────────────┐
│  PLAYWRIGHT.YML TRIGGERED   │   │ CLAUDE-CODE-REVIEW-CUSTOM.YML  │
│   (Automated Test Suite)    │   │    (waits for tests)           │
│                             │   │                                │
│  ✓ Lint checks              │   │  ⏰ Waiting for test results   │
│  ✓ Build verification       │   │     (up to 10 minutes)         │
│  ✓ Test scripts:            │   │                                │
│    - test:inventory         │   │                                │
│    - test:checkout          │   │                                │
│    - test:stripe            │   │                                │
│  ✓ Playwright E2E tests     │   │                                │
│  ✓ Upload test artifacts    │   │                                │
│  ✓ Comment results on PR    │   │                                │
└─────────────┬───────────────┘   └────────────┬───────────────────┘
              │                                │
              │ Test results: ✅/⚠️/❌          │
              └────────────────┬───────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│              CLAUDE-CODE-REVIEW-CUSTOM.YML CONTINUES                │
│                    (Review Agent)                                   │
│                                                                     │
│  ✓ Received test results                                            │
│                                                                     │
│  ✓ Checkout repository                                             │
│  ✓ Get iteration count (track review cycles)                        │
│  ✓ Analyze PR changes comprehensively                               │
│  ✓ Score across 6 dimensions:                                       │
│    - Architecture & Design: __/20                                   │
│    - Functionality & Correctness: __/20                             │
│    - Security: __/20                                                │
│    - Maintainability: __/15                                         │
│    - Testing: __/15 (adjusted based on test results)                │
│      * -10 to -20 pts if tests fail                                 │
│    - Performance: __/10                                             │
│  ✓ Create inline comments on code                                   │
│  ✓ Include test failures in feedback                                │
│  ✓ Post review summary with total score                             │
│                                                                     │
│  Permissions: write PRs/issues (can comment, not push)              │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────┴─────────┐
                    │  DECISION POINT   │
                    │   (Score-based)   │
                    └─────────┬─────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Score 85-100 │  │ Score 70-84  │  │  Score 0-69  │
    │              │  │ Iteration<3  │  │  OR Iter>=3  │
    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
           │                 │                 │
           ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   APPROVED   │  │   REQUEST    │  │    BLOCK     │
    │      ✅      │  │   CHANGES    │  │      ❌      │
    └──────┬───────┘  │      ⚠️      │  └──────┬───────┘
           │          └──────┬───────┘         │
           │                 │                 │
           │                 ▼                 │
           │          ┌──────────────┐         │
           │          │ Post comment │         │
           │          │ with @claude │         │
           │          │ tag + issues │         │
           │          └──────┬───────┘         │
           │                 │                 │
           │                 ▼                 │
           │          ┌──────────────┐         │
           │          │  CLAUDE.YML  │         │
           │          │  RE-TRIGGERS │         │
           │          └──────┬───────┘         │
           │                 │                 │
           │                 ▼                 │
           │          ┌──────────────┐         │
           │          │Claude reads  │         │
           │          │review, fixes │         │
           │          │issues, pushes│         │
           │          └──────┬───────┘         │
           │                 │                 │
           │                 ▼                 │
           │          ┌──────────────┐         │
           │          │  PR updated  │         │
           │          │ (synchronize)│         │
           │          └──────┬───────┘         │
           │                 │                 │
           │                 ▼                 │
           │          ┌──────────────┐         │
           │          │  REVIEW.YML  │         │
           │          │  RE-TRIGGERS │         │
           │          └──────┬───────┘         │
           │                 │                 │
           │                 └────┐            │
           │                      │            │
           │         ┌────────────┘            │
           │         │                         │
           │         ▼                         │
           │  ┌──────────────┐                 │
           │  │ Max 3 loops  │                 │
           │  │ Then human   │                 │
           │  │    review    │                 │
           │  └──────────────┘                 │
           │                                   │
           ▼                                   ▼
    ┌──────────────┐                   ┌──────────────┐
    │ USER MERGES  │                   │ USER REVIEWS │
    │      PR      │                   │   MANUALLY   │
    └──────────────┘                   └──────────────┘
```

## Review Score Calculation

```
┌─────────────────────────────────────────────────────────────┐
│                    REVIEW DIMENSIONS                         │
└─────────────────────────────────────────────────────────────┘

Architecture & Design (20 pts)
├─ Design appropriateness        (/5)
├─ Modularity (SRP)              (/5)
├─ Complexity vs simplicity      (/5)
└─ PR atomicity                  (/5)

Functionality & Correctness (20 pts)
├─ Business logic correctness    (/5)
├─ Edge case handling            (/5)
├─ Error handling                (/5)
└─ Race conditions               (/5)

Security (20 pts) 🔒
├─ Input validation              (/5)
├─ Auth/authorization            (/5)
├─ Secrets management            (/5)
└─ XSS/SQLi prevention           (/5)

Maintainability (15 pts)
├─ Code readability              (/4)
├─ Naming conventions            (/4)
├─ Control flow clarity          (/4)
└─ Meaningful comments           (/3)

Testing (15 pts)
├─ Test coverage                 (/5)
├─ Failure mode testing          (/5)
└─ Test code quality             (/5)

Performance (10 pts)
├─ Database efficiency           (/3)
├─ Frontend bundle size          (/3)
├─ API design                    (/2)
└─ Caching strategy              (/2)

────────────────────────────────────
TOTAL: ___/100
```

## Iteration Loop Detail

```
┌─────────────────────────────────────────────────────────────┐
│              ITERATION TRACKING                              │
└─────────────────────────────────────────────────────────────┘

Iteration 1:
┌──────────────┐    Score: 76/100
│   Review     │───→ Decision: REQUEST_CHANGES
└──────────────┘    Issues: 3 items
        │
        ▼
┌──────────────┐
│ @claude tag  │    "Please fix:
│   triggers   │     1. Add null checks in auth.ts:42
│ implementation│     2. Improve error messages
│              │     3. Add edge case tests"
└──────────────┘
        │
        ▼
┌──────────────┐
│ Claude fixes │    Pushes commit: "fix: address review
│   issues     │     feedback iteration 1"
└──────────────┘
        │
        ▼
Iteration 2:
┌──────────────┐    Score: 88/100
│   Review     │───→ Decision: APPROVE ✅
└──────────────┘    Status: Ready to merge
```

## File Permission Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                  WORKFLOW PERMISSIONS                        │
└─────────────────────────────────────────────────────────────┘

claude.yml (Implementation Agent):
├─ contents: write        ✅ Create branches, commit, push
├─ pull-requests: write   ✅ Create and update PRs
├─ issues: write          ✅ Comment on issues
├─ id-token: write        ✅ OIDC authentication
└─ actions: read          ✅ Read CI results

claude-code-review-custom.yml (Review Agent):
├─ contents: read         👁️ Read code only
├─ pull-requests: write   ✅ Comment on PRs
├─ issues: write          ✅ Tag users/claude
└─ id-token: write        ✅ OIDC authentication

Security Blocks (Implementation Agent):
├─ rm -rf*     ❌ No recursive deletion
├─ sudo*       ❌ No privilege escalation
├─ chmod*      ❌ No permission changes
└─ chown*      ❌ No ownership changes
```

## Example Timeline

```
┌─────────────────────────────────────────────────────────────┐
│              EXAMPLE: FEATURE IMPLEMENTATION                 │
└─────────────────────────────────────────────────────────────┘

T+0m    User creates issue #42: "Add dark mode toggle"
        │
T+1m    claude.yml starts
        ├─ Analyzes requirements
        ├─ Creates branch: feature/dark-mode-42
        ├─ Implements CSS variables, toggle component
        ├─ Writes tests
        └─ Creates PR #43
        │
T+5m    claude-code-review-custom.yml starts
        ├─ Analyzes 15 changed files
        ├─ Scores: 78/100
        ├─ Posts review: "Add accessibility labels"
        └─ Tags: @claude fix these 2 issues
        │
T+6m    claude.yml re-triggers (PR comment)
        ├─ Reads review feedback
        ├─ Adds ARIA labels
        ├─ Improves keyboard navigation
        └─ Pushes update
        │
T+8m    claude-code-review-custom.yml re-runs (PR sync)
        ├─ Re-analyzes changes
        ├─ Scores: 92/100
        └─ Approves: ✅ Ready to merge
        │
T+10m   User merges PR #43
        └─ Feature deployed! 🎉
```

## Success Metrics

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW METRICS                          │
└─────────────────────────────────────────────────────────────┘

Target KPIs:
├─ First-pass approval rate: >50%
├─ Average iterations: <2
├─ Time to merge: <24h
├─ Manual intervention: <20%
└─ Security score: >18/20

Track with:
$ gh pr list --state closed --json reviews | \
  jq '[.[] | select(.reviews[].body | contains("APPROVED"))] | length'
```

---

**Legend:**
- ✅ = Approved/Allowed
- ⚠️ = Needs attention
- ❌ = Blocked/Not allowed
- 🔒 = Security-critical
- 👁️ = Read-only
- 🎉 = Success
