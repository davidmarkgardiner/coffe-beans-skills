# Get Your Stripe Publishable Key

## Issue Found

The `stripe-publishable-key` stored in Google Secret Manager is **incorrectly** a secret key (`sk_test_...`) instead of a publishable key (`pk_test_...`).

## Quick Fix

### Step 1: Get Your Actual Publishable Key

1. Go to your Stripe Dashboard: https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **Test Mode** (toggle in top right)
3. Find the **Publishable key** section
4. Click **"Reveal test key"**
5. Copy the key (it starts with `pk_test_`)

### Step 2: Update Local .env File

Replace the placeholder in your `.env` file:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
```

### Step 3: Upload Correct Key to Google Secret Manager

```bash
# Replace YOUR_ACTUAL_KEY with the pk_test_ key from Step 1
echo -n "pk_test_YOUR_ACTUAL_KEY" | gcloud secrets versions add stripe-publishable-key --data-file=- --project=240676728422
```

### Step 4: Verify the Update

```bash
# Check the first characters - should now be "pk_test_"
gcloud secrets versions access latest --secret=stripe-publishable-key --project=240676728422 | head -c 20
```

Should output: `pk_test_...` (not `sk_test_...`)

## Alternative: Use Environment Variable Directly

If you want to test immediately without updating GSM:

1. Get your publishable key from Stripe Dashboard
2. Update `.env`:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51LDrONF6ueldlDsNYOUR_KEY_HERE
   ```
3. Restart the dev servers

## Why This Matters

- **Secret Key** (`sk_test_`): Used on the backend/server only, never exposed to frontend
- **Publishable Key** (`pk_test_`): Used on the frontend, safe to expose in client-side code

The React app needs the **publishable key** with the `VITE_` prefix so Vite can inject it into the frontend code.

## Test After Fixing

1. Update the `.env` with correct publishable key
2. Restart servers:
   ```bash
   npm run dev:all --prefix coffee-website-react
   ```
3. Open http://localhost:5173
4. Click "Buy Now" on a product
5. The checkout modal should load the Stripe payment form

## Current Status

✅ Backend configured correctly with secret key
✅ Stripe API connection tested successfully
❌ Frontend needs correct publishable key

Once you add the publishable key, the payment integration will be fully functional!
