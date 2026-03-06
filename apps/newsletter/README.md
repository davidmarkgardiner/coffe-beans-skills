# Newsletter System — Stockbridge Coffee

## Overview
Automated weekly newsletter drafting and subscriber management for Stockbridge Coffee.

## How It Works

1. **Sunday 09:00 UTC** — Newsletter draft generated
2. **Content pulled** from templates + recent products/blog posts
3. **Draft saved** to Gmail (stockbridgecoffee@gmail.com)
4. **David notified** via Telegram to review
5. **David approves** → newsletter sent to subscriber list

## Scripts

### `draft-newsletter.js`
Generates this week's newsletter draft using a template and saves it as a Gmail draft.

### `send-newsletter.js`
Sends the approved draft to all active newsletter subscribers from Firestore.

### `manage-subscribers.js`
- List active subscribers
- Add/remove subscribers
- Export subscriber list

## Templates

Newsletter templates live in `templates/`. Each template is an HTML file with `{{variable}}` placeholders:
- `{{featured_product}}` — This week's highlighted coffee
- `{{brewing_tip}}` — A brewing method tip
- `{{fox_update}}` — Fun fox mascot content
- `{{discount_code}}` — Optional promotional code
