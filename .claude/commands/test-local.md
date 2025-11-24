# Local Testing Command

Run comprehensive local tests before deploying.

## What This Command Does

Runs the complete local testing pipeline:
1. **Lint check** - Code style and quality
2. **TypeScript check** - Type safety and build
3. **Unit tests** - Component and logic tests
4. **E2E tests** - End-to-end user flows (local dev server)

## Execution Steps

### 1. Navigate to Project Directory

```bash
cd coffee-website-react
```

### 2. Lint Check

```bash
echo "🔍 Running lint check..."
npm run lint

if [ $? -ne 0 ]; then
  echo "❌ Lint check failed"
  exit 1
fi

echo "✅ Lint check passed"
```

### 3. TypeScript Build Check

```bash
echo "🔨 Running TypeScript build check..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ Build successful"
```

### 4. Unit Tests

```bash
echo "🧪 Running unit tests..."
npm test -- --run --reporter=json > test-results.json

# Parse results
TOTAL=$(cat test-results.json | jq '.numTotalTests')
PASSED=$(cat test-results.json | jq '.numPassedTests')
FAILED=$(cat test-results.json | jq '.numFailedTests')

echo "Unit tests: $PASSED/$TOTAL passed"

if [ $FAILED -gt 0 ]; then
  echo "❌ $FAILED unit test(s) failed"
  cat test-results.json | jq '.testResults[].assertionResults[] | select(.status == "failed")'
  exit 1
fi

echo "✅ All unit tests passed"
```

### 5. E2E Tests (Local)

```bash
echo "🎭 Running E2E tests (local)..."

# Start dev server in background
npm run dev &
DEV_PID=$!

# Wait for server to be ready
echo "Waiting for dev server..."
npx wait-on http://localhost:5173 -t 30000

if [ $? -ne 0 ]; then
  echo "❌ Dev server failed to start"
  kill $DEV_PID
  exit 1
fi

# Run Playwright tests
npx playwright test --reporter=json > e2e-results.json

E2E_EXIT_CODE=$?

# Stop dev server
kill $DEV_PID

# Parse E2E results
E2E_TOTAL=$(cat e2e-results.json | jq '.suites | map(.specs | length) | add')
E2E_PASSED=$(cat e2e-results.json | jq '[.suites[].specs[].tests[] | select(.status == "expected")] | length')
E2E_FAILED=$(cat e2e-results.json | jq '[.suites[].specs[].tests[] | select(.status == "unexpected")] | length')

echo "E2E tests: $E2E_PASSED/$E2E_TOTAL passed"

if [ $E2E_EXIT_CODE -ne 0 ]; then
  echo "❌ $E2E_FAILED E2E test(s) failed"
  cat e2e-results.json | jq '.suites[].specs[].tests[] | select(.status == "unexpected")'
  exit 1
fi

echo "✅ All E2E tests passed"
```

### 6. Collect and Report Results

```bash
# Create consolidated report
cat > local-test-results.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "lint": "pass",
  "build": "pass",
  "unit_tests": {
    "total": $TOTAL,
    "passed": $PASSED,
    "failed": $FAILED,
    "coverage": $(cat coverage/coverage-summary.json | jq '.total.lines.pct' 2>/dev/null || echo 0)
  },
  "e2e_tests": {
    "total": $E2E_TOTAL,
    "passed": $E2E_PASSED,
    "failed": $E2E_FAILED
  },
  "overall": "pass"
}
EOF

echo ""
echo "📊 Local Test Results:"
cat local-test-results.json | jq '.'

echo ""
echo "✅ All local tests passed!"
```

## Output Format

Returns JSON with test results:

```json
{
  "timestamp": "2025-11-24T10:30:00Z",
  "lint": "pass",
  "build": "pass",
  "unit_tests": {
    "total": 45,
    "passed": 45,
    "failed": 0,
    "coverage": 78.5
  },
  "e2e_tests": {
    "total": 12,
    "passed": 12,
    "failed": 0
  },
  "overall": "pass"
}
```

## Error Handling

- **Lint fails**: Report specific linting errors
- **Build fails**: Report TypeScript errors
- **Unit tests fail**: Show failed test names and errors
- **E2E tests fail**: Show failed scenarios and screenshots
- **Dev server fails**: Check port 5173 availability

## Integration with Orchestration

This command is called automatically during orchestration:

```bash
# In orchestration workflow
/test-local

# If tests pass, continue to /test-preview
# If tests fail, include results in quality review
```

## Manual Usage

You can run this command manually anytime:

```bash
/test-local
```

## Tips

- Run before committing major changes
- Check `local-test-results.json` for detailed results
- Failed test artifacts saved in `test-results/` directory
- Screenshots for failed E2E tests in `test-results/screenshots/`

---

**Now execute the local testing pipeline as described above.**
