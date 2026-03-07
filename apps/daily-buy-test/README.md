# Stockbridge Coffee — Daily Checkout Test

Playwright end-to-end smoke test that verifies the entire purchase flow daily.

## What it tests

| Step | Assertion |
|------|-----------|
| 1. Home page loads | Hero section & navigation visible |
| 2. Product section visible | Format (whole/ground) + size (250g/1kg) options render |
| 3. Price updates on size selection | Selecting 1kg shows £28 |
| 4. Add to Cart | Cart drawer opens, item appears with correct name |
| 5. Stripe checkout loads | Clicking Checkout opens payment modal; Stripe iframe or spinner visible |
| 6. Order confirmation page | `/order-confirmation?session_id=…` shows "Thank You!" heading |
| 7. Routing smoke | Sub-routes don't 404; page body renders |

> **Note:** The test does NOT submit a real payment. It verifies the Stripe checkout component initialises correctly (step 5), then navigates directly to the confirmation page (step 6) to check that route renders.

---

## Quick start

```bash
cd apps/daily-buy-test

# Install deps (first time only)
npm install
npx playwright install chromium --with-deps

# Run against local dev server (start it first: npm run dev in coffee-website-react)
./run-test.sh

# Run against production
SITE_URL=https://stockbridgecoffee.co.uk ./run-test.sh

# Headed mode (watch the browser)
SITE_URL=https://stockbridgecoffee.co.uk npm run test:headed

# Debug mode (Playwright inspector)
npm run test:debug

# View HTML report after a run
npm run report
```

---

## Cron setup (daily at 08:00 UTC)

Add to crontab (`crontab -e`):

```cron
# Stockbridge Coffee daily checkout test
0 8 * * * cd /home/david/clawd/projects/coffe-beans-skills/apps/daily-buy-test && SITE_URL=https://stockbridgecoffee.co.uk ./run-test.sh >> /var/log/stockbridge-checkout-test.log 2>&1
```

Or with Telegram notification on failure (requires `curl` + bot token):

```cron
0 8 * * * cd /home/david/clawd/projects/coffe-beans-skills/apps/daily-buy-test && \
  SITE_URL=https://stockbridgecoffee.co.uk ./run-test.sh 2>&1 || \
  curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    --data-urlencode "chat_id=${TG_CHAT_ID}" \
    --data-urlencode "text=🚨 Stockbridge Coffee checkout test FAILED. Check logs."
```

---

## Output files

| Path | Contents |
|------|----------|
| `test-results/` | Screenshots, videos, traces (only on failure) |
| `test-results/run-YYYYMMDD-HHMMSS.log` | Full test run log |
| `playwright-report/index.html` | HTML report (open in browser) |

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SITE_URL` | `http://localhost:5173` | Base URL of the site to test |

---

## Troubleshooting

**"Stripe checkout not loading"** — The Stripe `createPaymentIntent` call hits the Firebase function. In dev, the function may not be running. The test handles this gracefully (accepts spinner as valid state).

**"Element not found"** — Run `npm run test:headed` to watch what's happening. Animations may need more time; adjust `actionTimeout` in `playwright.config.ts`.

**"Chromium not installed"** — Run `npx playwright install chromium --with-deps`.
