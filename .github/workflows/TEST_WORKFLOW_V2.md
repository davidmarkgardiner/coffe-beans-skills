# Automated Workflow Test V2

## Purpose
Test the complete optimized automated workflow pipeline with:
- Fast pre-checks (TypeScript, lint, build)
- Firebase preview deployment + E2E tests
- Fast code review (1-2 min)

## Optimizations Applied
1. ✅ Playwright browser caching
2. ✅ Fast code review (minimal prompt)
3. ✅ E2E tests against live Firebase preview
4. ✅ Infinite loop prevention (bot filtering)

## Expected Flow
1. **Fast Pre-checks** (1-2 min)
   - TypeScript type checking
   - ESLint linting
   - Build verification
   - Unit tests (with continue-on-error)

2. **Firebase Preview** (2-3 min)
   - Deploy to preview channel
   - Install Playwright (with caching)
   - Run E2E smoke tests
   - Post results to PR

3. **Fast Code Review** (1-2 min)
   - Quick review with scoring
   - Decision: APPROVE / REQUEST_CHANGES / BLOCK
   - Tag @claude if fixes needed

## Success Criteria
- ✅ All workflows complete < 6 minutes total
- ✅ E2E tests pass
- ✅ Code review score ≥ 85
- ✅ PR gets automated approval

---
*Test started: $(date)*
