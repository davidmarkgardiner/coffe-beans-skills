#!/bin/bash
# Firebase Service Status Dashboard
# Provides a quick overview of all Firebase services

PROJECT_ID=$(firebase use 2>&1 | tail -1 | xargs)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Firebase Project Status Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project: $PROJECT_ID"
echo ""

# Authentication
echo "🔐 Authentication"
echo "─────────────────────────────────────────"
AUTH_EXPORT=$(firebase auth:export /tmp/auth.json 2>&1)
if echo "$AUTH_EXPORT" | grep -q "Exporting"; then
  AUTH_USERS=$(cat /tmp/auth.json 2>/dev/null | grep -o '"users":\[' | wc -l | xargs)
  if [ -s /tmp/auth.json ]; then
    USER_COUNT=$(cat /tmp/auth.json | grep -o '"localId"' | wc -l | xargs)
    echo "  Status: ✓ Enabled"
    echo "  Users: $USER_COUNT registered"
  else
    echo "  Status: ✓ Enabled"
    echo "  Users: 0 registered"
  fi
else
  echo "  Status: ✗ Not enabled"
fi
rm -f /tmp/auth.json
echo ""

# Firestore
echo "📊 Firestore Database"
echo "─────────────────────────────────────────"
firebase firestore:databases:list 2>&1 | tail -n +2 | while read -r line; do
  if [[ $line == *"projects/"* ]]; then
    DB_NAME=$(echo "$line" | grep -oE '(default)|([a-z0-9-]+)$')
    echo "  Database: $DB_NAME"
  fi
done
echo ""

# Hosting
echo "🌐 Hosting"
echo "─────────────────────────────────────────"
HOSTING_INFO=$(firebase hosting:channel:list 2>&1)
if echo "$HOSTING_INFO" | grep -q "live"; then
  HOSTING_URL=$(echo "$HOSTING_INFO" | grep "live" | grep -oE 'https://[^ ]+')
  LAST_DEPLOY=$(echo "$HOSTING_INFO" | grep "live" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}')
  echo "  Status: ✓ Live"
  echo "  URL: $HOSTING_URL"
  echo "  Last Deploy: $LAST_DEPLOY"
else
  echo "  Status: ⚠ Not deployed"
fi
echo ""

# Enabled APIs
echo "⚙️  Enabled APIs"
echo "─────────────────────────────────────────"
if command -v gcloud &> /dev/null; then
  gcloud services list --enabled --project="$PROJECT_ID" 2>/dev/null | grep -E "(firebase|firestore|storage)" | while read -r line; do
    SERVICE_NAME=$(echo "$line" | awk '{print $1}')
    echo "  ✓ $SERVICE_NAME"
  done
else
  echo "  ⚠ gcloud CLI not available"
  echo "  Install: https://cloud.google.com/sdk/docs/install"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Quick Links:"
echo "  Console: https://console.firebase.google.com/project/$PROJECT_ID"
echo "  Auth: https://console.firebase.google.com/project/$PROJECT_ID/authentication"
echo "  Firestore: https://console.firebase.google.com/project/$PROJECT_ID/firestore"
echo "  Hosting: https://console.firebase.google.com/project/$PROJECT_ID/hosting"
