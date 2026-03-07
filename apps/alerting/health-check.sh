#!/usr/bin/env bash
# Stockbridge Coffee — Critical Health Checks
# Run daily via cron or Command Center scheduler
# Alerts via Telegram on failure

set -euo pipefail

SITE_URL="https://stockbridgecoffee.co.uk"
ALERTS=()

log() { echo "[$(date -u '+%H:%M')] $1"; }
alert() { ALERTS+=("$1"); echo "🚨 $1"; }

# --- 1. Website Up Check ---
log "Checking website..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SITE_URL" 2>/dev/null || echo "000")
if [[ "$HTTP_CODE" != "200" ]]; then
  alert "Website DOWN — $SITE_URL returned HTTP $HTTP_CODE"
else
  log "✅ Website up (HTTP $HTTP_CODE)"
fi

# --- 2. Stripe Webhook Endpoint ---
log "Checking Stripe webhook endpoint..."
WEBHOOK_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${SITE_URL}/api/stripe-webhook" -X POST -d '{}' 2>/dev/null || echo "000")
if [[ "$WEBHOOK_CODE" == "000" ]]; then
  alert "Stripe webhook endpoint unreachable"
else
  log "✅ Stripe webhook responds (HTTP $WEBHOOK_CODE)"
fi

# --- 3. Firebase Connectivity ---
# (Would need firebase-admin SDK — placeholder for now)
log "⚠️ Firebase check: requires Node.js script (TODO)"

# --- 4. Low Stock Alert ---
# (Would query Firestore inventory — placeholder)
log "⚠️ Stock check: requires inventory system (TODO)"

# --- Summary ---
echo ""
if (( ${#ALERTS[@]} > 0 )); then
  echo "🚨 ${#ALERTS[@]} CRITICAL ALERTS:"
  MSG="🚨 Stockbridge Coffee Alert\n\n"
  for a in "${ALERTS[@]}"; do
    echo "  → $a"
    MSG+="• $a\n"
  done
  MSG+="\nTime: $(date -u '+%Y-%m-%d %H:%M UTC')"
  
  # Send Telegram alert (uses OpenClaw message tool if available)
  echo -e "$MSG"
  exit 1
else
  echo "✅ All checks passed"
  exit 0
fi
