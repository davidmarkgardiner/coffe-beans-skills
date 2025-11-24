# Production Testing Command

Run production smoke tests against the live production URL.

## What This Command Does

1. **Deploy to production** - If not already deployed
2. **Run critical path E2E tests** - Test essential user flows
3. **Monitor for errors** - Check error rates and performance
4. **Report results** - Production health check

## Prerequisites

⚠️ **IMPORTANT**: Only run this after quality review score ≥ 85

## Execution Steps

### 1. Navigate to Project Directory

```bash
cd coffee-website-react
```

### 2. Deploy to Production (if needed)

```bash
echo "🚀 Checking production deployment status..."

# Check if changes are already deployed
LAST_DEPLOY=$(firebase hosting:channel:list | grep live | awk '{print $4}')

# Deploy to production
echo "Deploying to production..."
firebase deploy --only hosting --json > production-deploy.json

if [ $? -ne 0 ]; then
  echo "❌ Production deployment failed"
  cat production-deploy.json
  exit 1
fi

# Extract production URL
PROD_URL=$(cat production-deploy.json | jq -r '.result.hosting')

echo "✅ Deployed to production: $PROD_URL"
```

### 3. Run Critical Path Smoke Tests

```bash
echo "🎭 Running production smoke tests..."

# Set production URL for Playwright
export PROD_URL=${PROD_URL:-"https://stockbridge-coffee.web.app"}

# Run only critical tests (tagged with @critical)
npx playwright test \
  --grep @critical \
  --config production.config.ts \
  --reporter=json \
  --retries=2 \
  > production-e2e-results.json

E2E_EXIT_CODE=$?

# Parse results
E2E_TOTAL=$(cat production-e2e-results.json | jq '.suites | map(.specs | length) | add')
E2E_PASSED=$(cat production-e2e-results.json | jq '[.suites[].specs[].tests[] | select(.status == "expected")] | length')
E2E_FAILED=$(cat production-e2e-results.json | jq '[.suites[].specs[].tests[] | select(.status == "unexpected")] | length')

echo "Critical path tests: $E2E_PASSED/$E2E_TOTAL passed"

if [ $E2E_EXIT_CODE -ne 0 ]; then
  echo "❌ $E2E_FAILED critical test(s) failed"
  echo "⚠️ Production may have issues - consider rollback"
  # Don't exit immediately - continue monitoring
fi
```

### 4. Monitor Error Rates

```bash
echo "📊 Monitoring production errors (5 minutes)..."

# Monitor Firebase Crashlytics for errors
# Monitor console errors
# Check Firebase Performance Monitoring

# Sample error monitoring (simplified)
START_TIME=$(date +%s)
END_TIME=$((START_TIME + 300))  # 5 minutes

ERROR_COUNT=0
REQUEST_COUNT=0

while [ $(date +%s) -lt $END_TIME ]; do
  # Check Firebase logs for errors
  # This is a placeholder - replace with actual monitoring

  sleep 30
done

ERROR_RATE=$(echo "scale=4; $ERROR_COUNT / $REQUEST_COUNT" | bc)

echo "Error monitoring complete:"
echo "  Total requests: $REQUEST_COUNT"
echo "  Errors: $ERROR_COUNT"
echo "  Error rate: $ERROR_RATE"

if [ $(echo "$ERROR_RATE > 0.01" | bc) -eq 1 ]; then
  echo "⚠️ Error rate above threshold (1%)"
fi
```

### 5. Check Performance Metrics

```bash
echo "⚡ Checking production performance..."

# Get average response times from Firebase Performance
# This is a placeholder - replace with actual performance check

AVG_RESPONSE_TIME=245  # milliseconds
P95_RESPONSE_TIME=450  # milliseconds

echo "Performance metrics:"
echo "  Avg response time: ${AVG_RESPONSE_TIME}ms"
echo "  P95 response time: ${P95_RESPONSE_TIME}ms"

if [ $AVG_RESPONSE_TIME -gt 500 ]; then
  echo "⚠️ Average response time above threshold (500ms)"
fi
```

### 6. Collect and Report Results

```bash
# Create consolidated report
cat > production-test-results.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "production_url": "$PROD_URL",
  "deployment": {
    "status": "success",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  },
  "smoke_tests": {
    "total": $E2E_TOTAL,
    "passed": $E2E_PASSED,
    "failed": $E2E_FAILED,
    "status": $([ $E2E_EXIT_CODE -eq 0 ] && echo '"pass"' || echo '"fail"')
  },
  "monitoring": {
    "duration_minutes": 5,
    "total_requests": $REQUEST_COUNT,
    "errors": $ERROR_COUNT,
    "error_rate": $ERROR_RATE
  },
  "performance": {
    "avg_response_time_ms": $AVG_RESPONSE_TIME,
    "p95_response_time_ms": $P95_RESPONSE_TIME
  },
  "overall": $([ $E2E_EXIT_CODE -eq 0 ] && echo '"pass"' || echo '"fail"')
}
EOF

echo ""
echo "📊 Production Test Results:"
cat production-test-results.json | jq '.'

if [ $E2E_EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Production deployment successful!"
  echo "🔗 Production URL: $PROD_URL"
else
  echo ""
  echo "❌ Production tests failed"
  echo "🔗 Production URL: $PROD_URL"
  echo "⚠️ Consider rollback if issues persist"
  exit 1
fi
```

## Critical Test Tags

Tag tests with `@critical` to include in production smoke tests:

```typescript
// tests/critical/checkout.spec.ts
test('@critical User can complete checkout', async ({ page }) => {
  // Test critical path
});

test('@critical User can add to cart', async ({ page }) => {
  // Test critical path
});
```

**Critical paths typically include:**
- Homepage loads
- Product browsing
- Add to cart
- Checkout process
- User authentication
- Payment processing

## Rollback Procedure

If production tests fail:

```bash
# Get previous deployment
firebase hosting:clone <SOURCE_SITE_ID>:<SOURCE_CHANNEL_ID> <TARGET_SITE_ID>:live

# Or manual rollback via Firebase Console
# 1. Go to Firebase Console → Hosting
# 2. Click on "Release History"
# 3. Find previous working version
# 4. Click "Rollback"
```

## Output Format

Returns JSON with production test results:

```json
{
  "timestamp": "2025-11-24T10:40:00Z",
  "production_url": "https://stockbridge-coffee.web.app",
  "deployment": {
    "status": "success",
    "timestamp": "2025-11-24T10:40:00Z"
  },
  "smoke_tests": {
    "total": 5,
    "passed": 5,
    "failed": 0,
    "status": "pass"
  },
  "monitoring": {
    "duration_minutes": 5,
    "total_requests": 1234,
    "errors": 0,
    "error_rate": 0.0
  },
  "performance": {
    "avg_response_time_ms": 245,
    "p95_response_time_ms": 450
  },
  "overall": "pass"
}
```

## Error Handling

- **Deployment fails**: Check Firebase authentication and permissions
- **Critical tests fail**: Consider rollback immediately
- **High error rate**: Investigate logs, consider rollback
- **Slow performance**: Check Firebase Performance Monitoring

## Integration with Orchestration

This command is called automatically after quality review passes:

```bash
# In orchestration workflow
/test-local     # If pass →
/test-preview   # If pass →
/review         # If score ≥85 →
/test-production # Deploy and test
```

## Manual Usage

You can run this command manually anytime:

```bash
/test-production
```

## Tips

- Only run after thorough testing (local + preview)
- Monitor Firebase Console during deployment
- Keep previous version available for quick rollback
- Check Firebase Performance Monitoring dashboard
- Set up alerts for error rate spikes
- Run during low-traffic periods if possible

---

**Now execute the production testing pipeline as described above.**
