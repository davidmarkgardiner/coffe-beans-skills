#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────
# run-test.sh — Daily Stockbridge Coffee checkout smoke test
#
# Usage:
#   ./run-test.sh                         # test localhost:5173
#   SITE_URL=https://stockbridgecoffee.co.uk ./run-test.sh
#
# Exit codes:
#   0 — all tests passed
#   1 — one or more tests failed
#
# On failure, prints a Telegram-ready alert message to stdout.
# ────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SITE_URL="${SITE_URL:-http://localhost:5173}"
TIMESTAMP="$(date -u '+%Y-%m-%d %H:%M UTC')"
LOG_FILE="test-results/run-$(date -u '+%Y%m%d-%H%M%S').log"

echo "🧪 Stockbridge Coffee — daily checkout test"
echo "   Site: $SITE_URL"
echo "   Time: $TIMESTAMP"
echo ""

# Ensure output dirs exist
mkdir -p test-results

# Install deps if node_modules missing
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  npx playwright install chromium --with-deps 2>&1 | tail -5
fi

# Run tests — capture output and exit code
set +e
SITE_URL="$SITE_URL" npx playwright test \
  --reporter=list \
  2>&1 | tee "$LOG_FILE"
EXIT_CODE=${PIPESTATUS[0]}
set -e

echo ""

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✅ All tests passed — $TIMESTAMP"
  exit 0
else
  # Count failed tests from log
  FAILED_COUNT=$(grep -c 'FAILED\|✘\|×' "$LOG_FILE" 2>/dev/null || echo "?")

  # Telegram-ready alert (Markdown-safe, no special chars in URL)
  cat <<EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 STOCKBRIDGE COFFEE — CHECKOUT ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:  ❌ FAILED
Site:    ${SITE_URL}
Time:    ${TIMESTAMP}
Errors:  ~${FAILED_COUNT} test(s) failed

Action required — checkout flow may be broken.
Check report: ${SCRIPT_DIR}/playwright-report/index.html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

  exit 1
fi
