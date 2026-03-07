#!/usr/bin/env bash
# daily-checkout-test.sh — Run Playwright checkout health test against the live site
# Usage: ./scripts/daily-checkout-test.sh
# Runnable from cron or the Command Center scheduler.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LIVE_URL="${BASE_URL:-https://stockbridgecoffee.co.uk}"
TIMESTAMP="$(date -u '+%Y-%m-%d %H:%M:%S UTC')"

cd "$PROJECT_DIR"

echo "[$TIMESTAMP] Running checkout health test against $LIVE_URL ..."

if BASE_URL="$LIVE_URL" PLAYWRIGHT_TEST_BASE_URL="$LIVE_URL" \
   npx playwright test e2e/checkout.test.ts --reporter=list 2>&1; then
  echo "✅ Checkout healthy — $TIMESTAMP"
  exit 0
else
  echo "❌ ALERT: Checkout test FAILED — $TIMESTAMP"
  echo "TELEGRAM_ALERT: 🚨 Stockbridge Coffee checkout health test FAILED at $TIMESTAMP — investigate https://stockbridgecoffee.co.uk"
  exit 1
fi
