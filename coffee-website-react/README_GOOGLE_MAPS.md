# Google Maps Setup Guide

## Overview

The Location tab in the Contact section includes an interactive Google Maps component showing the Stockbridge, Edinburgh area. The map requires a Google Maps API key to display.

## Current Status

- ✅ Map component implemented
- ✅ Shows general Stockbridge, Edinburgh area
- ✅ Custom coffee cup marker
- ✅ Dark mode support
- ✅ Lazy loading (only loads when Location tab is clicked)
- ⏳ **Requires Google Maps API key to display**

## ⚠️ Seeing "Sorry! Something went wrong" Error?

If you see **"This page didn't load Google Maps correctly"**, the most common causes are:

1. **Maps JavaScript API not enabled** → Enable it in [Google Cloud Console](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com)
2. **Billing not enabled** → Enable billing (free tier: $200/month credit)
3. **Invalid API key** → Double-check the key is copied correctly
4. **Domain restrictions** → Add `http://localhost:*/*` to allowed referrers

**Quick Fix**: Try creating a **new unrestricted API key** for testing:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new API key
3. Don't add any restrictions (for testing only)
4. Use this key in your `.env` file
5. Restart dev server: `npm run dev`

## What You'll See Without API Key

Without the API key configured, the Location tab will show:
- Grey placeholder box with "Loading map..." spinner
- All business information below the map (Based In, Delivery info)
- "Shop Beans" button

**This is normal!** The map needs an API key to load.

## How to Get the Map Working

### Step 1: Get a Google Maps API Key (Free Tier Available)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Enable billing (required, but free tier covers ~28,000 map loads/month)
4. Enable the **Maps JavaScript API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"

5. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the key immediately

### Step 2: Secure Your API Key (Important!)

1. Click "Edit API key" (restrict icon)
2. Under **Application restrictions**:
   - Select "HTTP referrers (websites)"
   - Add:
     - `http://localhost:5173/*` (local dev)
     - `http://localhost:*/*` (other local ports)
     - `https://your-production-domain.com/*`
     - `https://*.web.app/*` (Firebase hosting)
     - `https://*.firebaseapp.com/*` (Firebase hosting)

3. Under **API restrictions**:
   - Select "Restrict key"
   - Check "Maps JavaScript API"

4. Click "Save"

### Step 3: Add API Key to Your Project

1. Navigate to the project directory:
   ```bash
   cd coffee-website-react
   ```

2. Create or edit the `.env` file:
   ```bash
   # If .env doesn't exist
   cp .env.example .env

   # Or just create it
   touch .env
   ```

3. Add your API key to `.env`:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIza...your_key_here
   ```

4. **Important**: Never commit `.env` to git!
   - The `.env` file is already in `.gitignore`
   - Never share your API key publicly

### Step 4: Test Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. Navigate to Contact section

4. Click the **"Location"** tab

5. The map should now load showing Stockbridge, Edinburgh area!

### Step 5: Verify It Works

✅ You should see:
- Interactive map centered on Stockbridge, Edinburgh
- Custom coffee cup marker
- Click the marker → Info window appears
- Info window shows: "Stockbridge Coffee - Online Bean Shop"
- "Shop Beans" button in info window
- Dark mode: Map styles change when you toggle theme

## Map Details

### Location
- **Area**: Stockbridge, Edinburgh, Scotland
- **Coordinates**: 55.9645°N, 3.2086°W
- **Zoom**: Neighborhood view (not specific building)

### Features
- **Custom Marker**: Coffee cup icon in brand colors
- **Info Window**:
  - Name: Stockbridge Coffee
  - Type: Online Bean Shop
  - Message: "We're an online coffee bean shop based in Stockbridge, Edinburgh. Order premium beans for delivery across the UK."
  - Button: "Shop Beans" (links to products section)

- **Dark Mode**: Custom map styling that matches your website theme
- **Lazy Loading**: Map only loads when Location tab is clicked (performance optimization)
- **Responsive**: Works on mobile and desktop

## Troubleshooting

### Map shows "Loading map..." forever

**Cause**: API key not configured or invalid

**Fix**:
1. Check `.env` file exists in `coffee-website-react/` directory
2. Verify `VITE_GOOGLE_MAPS_API_KEY=...` is set correctly
3. Restart dev server: `npm run dev`
4. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### Map shows error or blank screen

**Possible causes**:
1. **Invalid API key**: Check the key is copied correctly
2. **API not enabled**: Ensure "Maps JavaScript API" is enabled in Google Cloud Console
3. **Domain restrictions**: If testing on different domain, add it to API key restrictions
4. **Billing not enabled**: Google Maps requires billing account (free tier available)

**How to debug**:
1. Open browser console (F12)
2. Look for errors mentioning "Google Maps" or "API key"
3. Check error message for specific issue

### Common errors:

- `"Google Maps API key is missing"` → Add key to `.env`
- `"RefererNotAllowedMapError"` → Add your domain to API key restrictions
- `"ApiNotActivatedMapError"` → Enable Maps JavaScript API in Console
- `"REQUEST_DENIED"` → Check billing is enabled

## Cost Information

### Google Maps Pricing (2024)
- **Free tier**: $200 monthly credit
- **Map loads**: $7 per 1,000 loads
- **Free loads per month**: ~28,000

### Typical Usage
- Small site (1,000 visits/month): **FREE**
- Medium site (10,000 visits/month): **FREE**
- Large site (50,000 visits/month): ~$12/month

### How to Control Costs

1. **Set daily quotas** in Google Cloud Console:
   - Go to "APIs & Services" > "Maps JavaScript API"
   - Set quota: 500 requests/day (safe limit)

2. **Enable billing alerts**:
   - Go to "Billing" > "Budgets & alerts"
   - Create alert for $5, $10, $20 thresholds

3. **Monitor usage**:
   - Check "APIs & Services" > "Dashboard" monthly
   - Our lazy loading helps reduce unnecessary loads

## Alternative: Run Without API Key

If you don't want to set up Google Maps:

**The Location tab still works great!** It shows:
- "Based In: Stockbridge, Edinburgh"
- "Delivery: UK-wide delivery available"
- "Shop Beans" button
- Clean, professional layout

The map placeholder won't be interactive, but all information is still accessible.

## For Production Deployment

Before deploying to production:

1. **Update API key restrictions**:
   - Add production domain to HTTP referrers
   - Example: `https://stockbridgecoffee.com/*`

2. **Set environment variable** on hosting platform:
   - Firebase: `firebase functions:config:set maps.api_key="your_key"`
   - Netlify: Add to Environment Variables in dashboard
   - Vercel: Add to Environment Variables in dashboard

3. **Test on production URL** before going live

4. **Monitor usage** in first month to estimate costs

## Files Modified

- `src/components/LocationMap.tsx` - Map component
- `src/components/Contact.tsx` - Location tab integration
- `.env.example` - Example environment variables

## Support

### Official Documentation
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [API Key Setup Guide](https://developers.google.com/maps/documentation/javascript/get-api-key)

### Common Questions

**Q: Do I need a credit card?**
A: Yes, Google requires a billing account, but you get $200 free credit monthly (covers ~28,000 map loads).

**Q: Will I be charged automatically?**
A: Only if you exceed the free tier. Set quotas to prevent unexpected charges.

**Q: Can I use the map without an API key?**
A: No, Google Maps requires a valid API key. However, the Location tab displays all info without the map.

**Q: Is the API key secure in the code?**
A: Yes! It's in `.env` (not committed to git) and can be restricted to specific domains in Google Cloud Console.

## Summary

1. ✅ Map component is ready
2. ⏳ Get Google Maps API key (free tier available)
3. ⏳ Add key to `.env` file
4. ✅ Map will load showing Stockbridge area
5. ✅ Deploy when ready

---

**Status**: Implementation complete, waiting for API key configuration.
**Location**: Contact → Location Tab
**Area**: Stockbridge, Edinburgh
**Type**: Online Bean Shop (no physical storefront)
