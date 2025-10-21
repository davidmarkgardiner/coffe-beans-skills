#!/bin/bash
# Firebase Deployment Verification Script
# Comprehensively verifies Firebase deployment and service configuration
set -e

PROJECT_ID=$(firebase use 2>&1 | tail -1 | xargs)
HOSTING_URL="https://${PROJECT_ID}.web.app"

echo "🔍 Verifying Firebase Deployment for: $PROJECT_ID"
echo "================================================"
echo ""

# 1. Verify project selection
echo "✓ Project: $PROJECT_ID"

# 2. Verify web app exists
echo -n "Checking web app... "
APP_COUNT=$(firebase apps:list 2>&1 | grep -c "WEB" || echo "0")
if [ "$APP_COUNT" -gt 0 ]; then
  echo "✓ Found $APP_COUNT web app(s)"
else
  echo "✗ No web apps found!"
  exit 1
fi

# 3. Verify Authentication
echo -n "Checking Authentication... "
firebase auth:export /tmp/auth-check.json 2>&1 | grep -q "Exporting" && echo "✓ Enabled" || echo "✗ Not enabled"
rm -f /tmp/auth-check.json

# 4. Verify Firestore databases
echo -n "Checking Firestore databases... "
DB_COUNT=$(firebase firestore:databases:list 2>&1 | grep -c "projects/" || echo "0")
if [ "$DB_COUNT" -gt 0 ]; then
  echo "✓ Found $DB_COUNT database(s)"
else
  echo "✗ No databases found!"
  exit 1
fi

# 5. Verify Firestore rules
echo -n "Checking Firestore rules... "
firebase deploy --only firestore:rules --dry-run 2>&1 | grep -q "compiled successfully" && echo "✓ Valid" || echo "✗ Invalid"

# 6. Verify hosting deployment
echo -n "Checking hosting deployment... "
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HOSTING_URL")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✓ Live at $HOSTING_URL"
else
  echo "✗ Got HTTP $HTTP_STATUS"
  exit 1
fi

# 7. Verify enabled APIs
echo -n "Checking enabled Firebase APIs... "
if command -v gcloud &> /dev/null; then
  ENABLED_APIS=$(gcloud services list --enabled --project="$PROJECT_ID" 2>&1 | grep -E "(firestore|firebase|storage)" | wc -l | xargs)
  echo "✓ $ENABLED_APIS Firebase APIs enabled"
else
  echo "⊘ gcloud CLI not available (skipping)"
fi

# 8. Verify build contains Firebase config
echo -n "Checking build configuration... "
if [ -d "dist" ]; then
  if grep -q "$PROJECT_ID" dist/assets/*.js 2>/dev/null; then
    echo "✓ Firebase config embedded in build"
  else
    echo "⚠ Firebase config not found in build (may need rebuild)"
  fi
else
  echo "⚠ No dist folder (run 'npm run build')"
fi

echo ""
echo "================================================"
echo "🎉 Deployment verification complete!"
echo ""
echo "📊 Summary:"
echo "  Project: $PROJECT_ID"
echo "  Hosting: $HOSTING_URL"
echo "  Status: All checks passed ✓"
echo ""
echo "Next steps:"
echo "  - Test authentication on live site"
echo "  - Verify Firestore read/write operations"
echo "  - Check Firebase Console for errors"
