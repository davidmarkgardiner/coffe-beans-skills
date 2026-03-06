# 🫘 Bean Ledger — Stockbridge Coffee Inventory System

MVP inventory management for Stockbridge Coffee. Tracks bean stock, packaging supplies, and provides an audit trail of all changes.

## Firestore Schema

### `stock_levels` collection
Aggregate stock per bean type. One doc per bean variety.

| Field | Type | Description |
|-------|------|-------------|
| `beanType` | string | Display name (e.g. "Yirgacheffe") |
| `beanId` | string | Slug key (e.g. "yirgacheffe") |
| `totalKg` | number | Current stock in kg |
| `lastRoastDate` | timestamp | Most recent roast date |
| `updatedAt` | timestamp | Last modification |

### `inventory` collection
Individual roast batches. Each roast creates one document.

| Field | Type | Description |
|-------|------|-------------|
| `beanType` | string | Bean variety name |
| `beanId` | string | Slug key |
| `batchNumber` | string | Auto-generated batch ID |
| `weightKg` | number | Original roast weight |
| `remainingKg` | number | Remaining from this batch |
| `roastDate` | timestamp | When beans were roasted |
| `createdAt` | timestamp | Record creation time |
| `status` | string | `active` or `depleted` |

### `packaging` collection
Packaging supply counts. One doc per item type.

| Field | Type | Description |
|-------|------|-------------|
| `item` | string | Item name (e.g. "250g bags") |
| `count` | number | Current count |
| `minStock` | number | Low-stock threshold |
| `updatedAt` | timestamp | Last modification |

### `inventory_log` collection
Immutable audit trail of all stock changes.

| Field | Type | Description |
|-------|------|-------------|
| `action` | string | `roast_added` or `sale_deducted` |
| `beanType` | string | Bean variety |
| `beanId` | string | Slug key |
| `weightKg` | number | Amount changed |
| `batchId` | string | Related batch (for roasts) |
| `orderId` | string | Related order (for sales) |
| `previousKg` | number | Stock before change (sales) |
| `newKg` | number | Stock after change (sales) |
| `timestamp` | timestamp | When the change occurred |

## Scripts

### Add a roast batch
```bash
node add-roast.js "Yirgacheffe" 10 "2026-03-06"
node add-roast.js "Colombian Supremo" 15
```

### Check stock levels
```bash
node check-stock.js          # Pretty print
node check-stock.js --json   # JSON output
```

### Deduct a sale
```bash
node deduct-sale.js "Yirgacheffe" 0.25 "order_abc123"

# Or pipe JSON (webhook-ready):
echo '{"beanType":"Yirgacheffe","weightKg":0.25,"orderId":"stripe_pi_xxx"}' | node deduct-sale.js
```

## Setup

```bash
cd apps/inventory
npm install
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

Uses the same Firebase project as the main website. Auth via `GOOGLE_APPLICATION_CREDENTIALS` or Application Default Credentials.

## Safety Stock

Default alert threshold: **5kg per bean type**. When stock drops below this after a sale, a `🚨 LOW STOCK ALERT` is printed. Configurable in the scripts (`SAFETY_STOCK_KG` constant).

## Next Steps

- [ ] Integrate `deduct-sale.js` into Stripe webhook on order completion
- [ ] Add packaging supply management scripts
- [ ] Dashboard UI in the admin panel
- [ ] Email/Telegram alerts for low stock
