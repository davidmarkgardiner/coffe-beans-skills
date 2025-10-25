# GitHub Secrets Setup

This document explains how to configure GitHub Secrets for the weekly content generation workflow.

## Required Secrets

The GitHub Actions workflow requires the following secrets to be configured in your repository:

### 1. Google Gemini API Key

**Secret Name:** `GEMINI_API_KEY`

**How to Get:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Copy the API key

**How to Add to GitHub:**
```bash
gh secret set GEMINI_API_KEY --body "YOUR_API_KEY_HERE"
```

Or via GitHub UI:
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `GEMINI_API_KEY`
5. Value: Your Google AI API key
6. Click **Add secret**

---

### 2. Firebase Configuration Secrets

You need to add all Firebase configuration values as separate secrets. These are the same values you have in your `.env` file.

#### Get Your Firebase Config

Your Firebase config can be found in:
- `coffee-website-react/.env` (local)
- Firebase Console → Project Settings → General → Your apps → SDK setup and configuration

#### Required Firebase Secrets:

| Secret Name | Example Value | Description |
|-------------|---------------|-------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyC...` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `coffee-65c46.firebaseapp.com` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | `coffee-65c46` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `coffee-65c46.firebasestorage.app` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | `1:123456789:web:abc123` | Firebase app ID |

---

## Quick Setup Using GitHub CLI

If you have the GitHub CLI installed (`gh`), you can set all secrets at once:

```bash
# Navigate to your repository
cd /path/to/coffe-beans-skills

# Set Gemini API Key
gh secret set GEMINI_API_KEY --body "YOUR_GEMINI_API_KEY"

# Set Firebase secrets (replace with your actual values)
gh secret set VITE_FIREBASE_API_KEY --body "AIzaSyC..."
gh secret set VITE_FIREBASE_AUTH_DOMAIN --body "coffee-65c46.firebaseapp.com"
gh secret set VITE_FIREBASE_PROJECT_ID --body "coffee-65c46"
gh secret set VITE_FIREBASE_STORAGE_BUCKET --body "coffee-65c46.firebasestorage.app"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "123456789"
gh secret set VITE_FIREBASE_APP_ID --body "1:123456789:web:abc123"
```

---

## Setup Using GitHub Web UI

### Step-by-Step:

1. **Navigate to your repository on GitHub**
   - Go to https://github.com/YOUR_USERNAME/YOUR_REPO

2. **Open Settings**
   - Click the **Settings** tab

3. **Navigate to Secrets**
   - In the left sidebar, click **Secrets and variables** → **Actions**

4. **Add Each Secret**
   - Click **New repository secret**
   - Enter the **Name** (e.g., `GEMINI_API_KEY`)
   - Enter the **Value** (the actual API key or config value)
   - Click **Add secret**
   - Repeat for all 7 secrets

---

## Verify Secrets Are Set

After adding all secrets, you should see them listed on the Secrets page:

```
✓ GEMINI_API_KEY
✓ VITE_FIREBASE_API_KEY
✓ VITE_FIREBASE_AUTH_DOMAIN
✓ VITE_FIREBASE_PROJECT_ID
✓ VITE_FIREBASE_STORAGE_BUCKET
✓ VITE_FIREBASE_MESSAGING_SENDER_ID
✓ VITE_FIREBASE_APP_ID
```

**Note:** You won't be able to see the values of the secrets after adding them - this is expected for security reasons.

---

## Testing the Workflow

Once all secrets are configured, you can test the workflow manually:

### Using GitHub CLI:

```bash
# Trigger the workflow manually
gh workflow run generate-weekly-content.yml

# Check workflow status
gh run list --workflow=generate-weekly-content.yml

# View workflow logs
gh run view --log
```

### Using GitHub Web UI:

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Click **Generate Weekly Content** in the left sidebar
4. Click **Run workflow** button
5. Optionally override:
   - Season (leave empty for auto-detect)
   - Number of videos (default: 1)
   - Number of photos (default: 2)
6. Click **Run workflow**

---

## Troubleshooting

### Workflow Fails with "Secret not found"

**Cause:** Secret name mismatch or secret not set

**Fix:**
1. Check the workflow file expects the correct secret names
2. Verify all secrets are set in GitHub Settings
3. Secret names are case-sensitive

### Workflow Fails with "Invalid API key"

**Cause:** API key is incorrect or expired

**Fix:**
1. Verify your Gemini API key is valid
2. Test locally first: `npm run test:content`
3. Generate a new API key if needed

### Firebase Errors During Upload

**Cause:** Firebase configuration is incorrect

**Fix:**
1. Verify all Firebase secrets match your `.env` file
2. Test locally first: `npm run upload:content`
3. Check Firebase project permissions

---

## Security Best Practices

1. **Never commit secrets to git**
   - Secrets should only exist in GitHub Secrets
   - Local secrets should be in `.env` (git-ignored)

2. **Rotate API keys regularly**
   - Generate new keys every 3-6 months
   - Update GitHub Secrets when rotating

3. **Use minimum required permissions**
   - Gemini API key: Only enable required APIs
   - Firebase: Use service account with minimum permissions

4. **Monitor API usage**
   - Check Google Cloud billing for unexpected usage
   - Set up billing alerts

---

## Cost Monitoring

The workflow generates AI content weekly, which incurs costs:

**Expected Weekly Costs:**
- 1 video (Veo): ~$0.10-0.30
- 2 photos (Imagen): ~$0.04-0.08
- **Total per week:** ~$0.14-0.38
- **Total per month:** ~$0.56-1.52

**How to Monitor:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Billing** → **Reports**
3. Filter by **Google AI Studio** or **Vertex AI**

**Set Up Billing Alerts:**
1. Go to **Billing** → **Budgets & alerts**
2. Create budget (e.g., $5/month)
3. Set alerts at 50%, 90%, 100%

---

## Next Steps

After setting up all secrets:

1. ✅ All 7 secrets configured in GitHub
2. ✅ Test workflow manually via GitHub Actions UI
3. ✅ Verify content appears on website after generation
4. ✅ Set up billing alerts in Google Cloud
5. ✅ Schedule remains at Sunday 3:00 AM UTC

---

Last Updated: 2025-10-25
