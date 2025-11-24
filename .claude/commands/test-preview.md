# Preview Testing Command

Deploy to Firebase preview channel and run comprehensive tests against the preview URL.

## What This Command Does

1. **Deploy to preview channel** - Create temporary Firebase hosting environment
2. **Run E2E tests** - Test against preview URL (production-like environment)
3. **Run Lighthouse audit** - Check performance, accessibility, SEO
4. **Report results** - Preview URL + test results

## Execution Steps

### 1. Navigate to Project Directory

```bash
cd coffee-website-react
```

### 2. Build Production Bundle

```bash
echo "🔨 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ Build successful"
```

### 3. Deploy to Preview Channel

```bash
echo "🚀 Deploying to Firebase preview channel..."

# Generate unique preview channel ID
PREVIEW_ID="preview-$(date +%s)"

# Deploy to preview channel
firebase hosting:channel:deploy $PREVIEW_ID --expires 7d --json > preview-deploy.json

if [ $? -ne 0 ]; then
  echo "❌ Preview deployment failed"
  cat preview-deploy.json
  exit 1
fi

# Extract preview URL
PREVIEW_URL=$(cat preview-deploy.json | jq -r '.result.url')

echo "✅ Preview deployed: $PREVIEW_URL"
echo "   Channel: $PREVIEW_ID"
echo "   Expires: 7 days"
```

### 4. Run E2E Tests Against Preview

```bash
echo "🎭 Running E2E tests against preview..."

# Set preview URL for Playwright
export PREVIEW_URL=$PREVIEW_URL

# Run tests with preview config
npx playwright test \
  --config preview.config.ts \
  --reporter=json \
  > preview-e2e-results.json

E2E_EXIT_CODE=$?

# Parse results
E2E_TOTAL=$(cat preview-e2e-results.json | jq '.suites | map(.specs | length) | add')
E2E_PASSED=$(cat preview-e2e-results.json | jq '[.suites[].specs[].tests[] | select(.status == "expected")] | length')
E2E_FAILED=$(cat preview-e2e-results.json | jq '[.suites[].specs[].tests[] | select(.status == "unexpected")] | length')

echo "E2E tests (preview): $E2E_PASSED/$E2E_TOTAL passed"

if [ $E2E_EXIT_CODE -ne 0 ]; then
  echo "⚠️ $E2E_FAILED E2E test(s) failed on preview"
  # Don't exit - continue to Lighthouse audit
fi
```

### 5. Run Lighthouse Performance Audit

```bash
echo "🔍 Running Lighthouse audit..."

# Run Lighthouse
npx lighthouse $PREVIEW_URL \
  --output=json \
  --output-path=lighthouse-results.json \
  --chrome-flags="--headless" \
  --quiet

# Parse Lighthouse scores
PERFORMANCE=$(cat lighthouse-results.json | jq '.categories.performance.score * 100')
ACCESSIBILITY=$(cat lighthouse-results.json | jq '.categories.accessibility.score * 100')
BEST_PRACTICES=$(cat lighthouse-results.json | jq '.categories["best-practices"].score * 100')
SEO=$(cat lighthouse-results.json | jq '.categories.seo.score * 100')

echo "Lighthouse scores:"
echo "  Performance: $PERFORMANCE"
echo "  Accessibility: $ACCESSIBILITY"
echo "  Best Practices: $BEST_PRACTICES"
echo "  SEO: $SEO"

# Check if performance meets threshold (85+)
if [ $(echo "$PERFORMANCE < 85" | bc) -eq 1 ]; then
  echo "⚠️ Performance score below threshold (85)"
fi
```

### 6. Collect and Report Results

```bash
# Create consolidated report
cat > preview-test-results.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "preview_url": "$PREVIEW_URL",
  "preview_channel": "$PREVIEW_ID",
  "expires": "7 days",
  "e2e_tests": {
    "total": $E2E_TOTAL,
    "passed": $E2E_PASSED,
    "failed": $E2E_FAILED,
    "status": $([ $E2E_EXIT_CODE -eq 0 ] && echo '"pass"' || echo '"fail"')
  },
  "lighthouse": {
    "performance": $PERFORMANCE,
    "accessibility": $ACCESSIBILITY,
    "best_practices": $BEST_PRACTICES,
    "seo": $SEO
  },
  "overall": $([ $E2E_EXIT_CODE -eq 0 ] && echo '"pass"' || echo '"fail"')
}
EOF

echo ""
echo "📊 Preview Test Results:"
cat preview-test-results.json | jq '.'

if [ $E2E_EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ All preview tests passed!"
  echo "🔗 Preview URL: $PREVIEW_URL"
else
  echo ""
  echo "❌ Preview tests failed"
  echo "🔗 Preview URL: $PREVIEW_URL (check manually)"
  exit 1
fi
```

## Output Format

Returns JSON with preview test results:

```json
{
  "timestamp": "2025-11-24T10:35:00Z",
  "preview_url": "https://project-name--preview-1234567890.web.app",
  "preview_channel": "preview-1234567890",
  "expires": "7 days",
  "e2e_tests": {
    "total": 12,
    "passed": 12,
    "failed": 0,
    "status": "pass"
  },
  "lighthouse": {
    "performance": 94,
    "accessibility": 98,
    "best_practices": 92,
    "seo": 100
  },
  "overall": "pass"
}
```

## Preview Channel Management

Preview channels automatically expire after 7 days. To manage manually:

```bash
# List active preview channels
firebase hosting:channel:list

# Delete a preview channel
firebase hosting:channel:delete <channel-id>

# Delete expired channels
firebase hosting:channel:list | grep expired | awk '{print $1}' | xargs -I {} firebase hosting:channel:delete {}
```

## Error Handling

- **Build fails**: Check TypeScript errors
- **Deployment fails**: Check Firebase CLI authentication and project config
- **E2E fails**: Screenshots saved in `test-results/screenshots/`
- **Lighthouse fails**: May be network/timeout issues, retry once

## Integration with Orchestration

This command is called automatically after local tests pass:

```bash
# In orchestration workflow
/test-local     # If pass →
/test-preview   # If pass →
/review         # Quality review
```

## Manual Usage

You can run this command manually anytime:

```bash
/test-preview
```

## Tips

- Preview URL is shareable - send to stakeholders for review
- Preview channel expires in 7 days (configurable with `--expires`)
- Check `preview-test-results.json` for detailed results
- Failed test screenshots in `test-results/screenshots/`
- Lighthouse report HTML in `lighthouse-results.html`

---

**Now execute the preview testing pipeline as described above.**
