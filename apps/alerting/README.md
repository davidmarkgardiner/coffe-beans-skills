# Stockbridge Coffee — Health Check & Alerting System

Production monitoring for [stockbridgecoffee.co.uk](https://stockbridgecoffee.co.uk).

## What It Checks

| # | Check | Alert Condition |
|---|-------|----------------|
| 1 | **Website uptime** | HTTP status ≠ 200 |
| 2 | **Stripe webhook endpoint** | `/api/stripe-webhook` unreachable (network error) |
| 3 | **Firebase / Firestore** | Cannot read from Firestore |
| 4 | **Low stock** | Any bean in `stock_levels` collection has `totalKg < 2` |
| 5 | **Stripe failed charges** | Any failed charges in last hour (optional) |

## Setup

### 1. Install dependencies

```bash
cd apps/alerting
npm install
```

### 2. Credentials

Firebase credentials are loaded automatically from **Google Cloud Secret Manager**:

```bash
# Verify the secret exists
/opt/google-cloud-sdk/bin/gcloud secrets versions access latest --secret=COFFEE_FIREBASE_SERVICE_ACCOUNT
```

If the secret isn't set up:
```bash
# Create it from a downloaded service account JSON
/opt/google-cloud-sdk/bin/gcloud secrets create COFFEE_FIREBASE_SERVICE_ACCOUNT \
  --data-file=/path/to/serviceAccount.json
```

Stripe key is read from `STRIPE_SECRET_KEY` env var or `COFFEE_STRIPE_SECRET_KEY` / `STRIPE_SECRET_KEY` GCloud secrets.

### 3. Run manually

```bash
cd apps/alerting
node health-check.js

# With verbose debug output
DEBUG=true node health-check.js

# Override stock threshold (default: 2kg)
LOW_STOCK_THRESHOLD=5 node health-check.js
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SITE_URL` | `https://stockbridgecoffee.co.uk` | Website URL to check |
| `LOW_STOCK_THRESHOLD` | `2` | Alert if bean stock below this (kg) |
| `FIRESTORE_HEALTH_DOC` | `_health/ping` | Firestore doc path for connectivity ping |
| `STOCK_COLLECTION` | `stock_levels` | Firestore collection name for stock |
| `REQUEST_TIMEOUT_MS` | `10000` | HTTP request timeout (ms) |
| `STRIPE_SECRET_KEY` | _(from GCloud)_ | Stripe secret key for failed charge check |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | _(from GCloud)_ | Firebase service account JSON (overrides GCloud) |
| `DEBUG` | `false` | Enable verbose debug logging |

## Output Format

All status messages go to **stderr** (for clean log capture).

If alerts are found, a Telegram-formatted message is printed to **stdout** prefixed with `TELEGRAM:`.

Exit codes:
- `0` — All checks passed
- `1` — One or more alerts
- `2` — Unexpected crash

## Cron Setup

### Option A: Simple cron

```bash
# Add to crontab: crontab -e
# Run every 30 minutes, send Telegram alert on failure

*/30 * * * * cd /home/david/clawd/projects/coffe-beans-skills/apps/alerting && \
  node health-check.js 2>>/var/log/coffee-health.log | \
  grep '^TELEGRAM:' | \
  sed 's/^TELEGRAM: //' | \
  xargs -I{} curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d "chat_id=$TELEGRAM_CHAT_ID&text={}&parse_mode=Markdown"
```

### Option B: Shell wrapper (recommended)

Use the companion `health-check.sh` which handles Telegram forwarding:

```bash
*/30 * * * * /home/david/clawd/projects/coffe-beans-skills/apps/alerting/health-check.sh
```

### Option C: Via OpenClaw cron skill

```
openclaw cron add "coffee-health" "*/30 * * * *" \
  "cd ~/clawd/projects/coffe-beans-skills/apps/alerting && node health-check.js"
```

## Firestore Data Schema

The stock check expects documents in the `stock_levels` collection with one of these field names for the quantity in kg:

- `totalKg`
- `total_kg`
- `stock_kg`

And one of these for the display name:

- `name`
- `beanName`
- `bean_name`

Example document:
```json
{
  "name": "Ethiopian Yirgacheffe",
  "totalKg": 1.5,
  "sku": "ETH-YIR-01"
}
```

## Files

```
apps/alerting/
├── health-check.js    # Main Node.js health check (this is the one to run)
├── health-check.sh    # Lightweight bash fallback (website + webhook only)
├── package.json       # Dependencies
└── README.md          # This file
```

## Fallback

`health-check.sh` is a bash fallback that covers the two curl-based checks (website uptime + webhook reachability) without any Node.js dependencies. Useful if the Node environment is broken.
