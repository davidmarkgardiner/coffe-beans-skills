# Backend Deployment Quick Start Guide

This guide will help you deploy the Coffee Copilot backend to Google Cloud Run in under 10 minutes.

## 🎯 Goal

Deploy the backend server so your copilot widget on https://coffee-65c46.firebaseapp.com/ can communicate with AI services.

## 📋 Prerequisites

- Google Cloud account with billing enabled
- gcloud CLI installed ([install guide](https://cloud.google.com/sdk/docs/install))
- GitHub CLI installed (you already have this)

## 🚀 Quick Deployment Steps

### Step 1: Authenticate with Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project coffee-65c46
```

### Step 2: Create Secrets in Google Secret Manager

```bash
# Create OpenAI API key secret (use your actual OpenAI key)
echo -n "your-openai-api-key" | \
  gcloud secrets create OPENAI_API_KEY --data-file=-

# Create Gemini API key secret (use your actual Gemini key)
echo -n "your-gemini-api-key" | \
  gcloud secrets create GEMINI_API_KEY --data-file=-

# Create Stripe secret key (get from your Stripe dashboard)
echo -n "your-stripe-secret-key" | \
  gcloud secrets create STRIPE_SECRET_KEY --data-file=-
```

> **Note**: Replace `your-openai-api-key`, `your-gemini-api-key`, and `your-stripe-secret-key`
> with your actual API keys. These are the same keys you added to GitHub secrets.

### Step 3: Grant Cloud Run Access to Secrets

```bash
# Get your service account
PROJECT_ID="coffee-65c46"
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

# Grant access to secrets
for SECRET in OPENAI_API_KEY GEMINI_API_KEY STRIPE_SECRET_KEY; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Step 4: Deploy the Backend

```bash
# Navigate to server directory
cd coffee-website-react/server

# Run the deployment script
./deploy-cloud-run.sh
```

The script will:
1. ✅ Enable required APIs
2. ✅ Build Docker image
3. ✅ Deploy to Cloud Run
4. ✅ Show you the service URL

### Step 5: Configure Frontend

After deployment completes, copy the service URL from the output and run:

```bash
# Replace with your actual Cloud Run URL
SERVICE_URL="https://coffee-copilot-backend-XXXXX-uc.a.run.app"

# Set GitHub secret for frontend
echo -n "${SERVICE_URL}/api/chat" | gh secret set VITE_COPILOT_API_URL
```

### Step 6: Trigger Frontend Redeployment

```bash
# Trigger a new deployment to pick up the backend URL
gh workflow run firebase-production.yml
```

## ✅ Verify Deployment

### Test the backend health endpoint:

```bash
SERVICE_URL=$(gcloud run services describe coffee-copilot-backend \
  --region us-central1 --format "value(status.url)")

curl ${SERVICE_URL}/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-10-24T..."}
```

### Test the copilot:

Once the frontend redeploys (takes ~2-3 minutes), visit:
https://coffee-65c46.firebaseapp.com/

1. Click the copilot chat button (☕️) in the bottom right
2. Type a message like "What coffee beans do you recommend?"
3. You should get an AI response!

## 🔍 Monitoring

View logs:
```bash
gcloud run services logs tail coffee-copilot-backend --region us-central1
```

View metrics:
```bash
# Open Cloud Run console
open "https://console.cloud.google.com/run?project=coffee-65c46"
```

## 🤖 Automated Deployments (Optional)

To enable automatic deployments via GitHub Actions:

### 1. Create Service Account

```bash
# Create service account for GitHub Actions
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"

# Grant necessary roles
for ROLE in run.admin storage.admin iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding coffee-65c46 \
    --member="serviceAccount:github-actions@coffee-65c46.iam.gserviceaccount.com" \
    --role="roles/${ROLE}"
done
```

### 2. Create and Add Service Account Key

```bash
# Create key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@coffee-65c46.iam.gserviceaccount.com

# Add to GitHub secrets
gh secret set GCP_SA_KEY < key.json
gh secret set GCP_PROJECT_ID -b "coffee-65c46"

# Delete local key
rm key.json
```

### 3. Test Automated Deployment

Make a change to the backend and push:

```bash
# Make a trivial change
echo "# Updated" >> coffee-website-react/server/README.md

# Commit and push
git add coffee-website-react/server/README.md
git commit -m "test: trigger backend deployment"
git push
```

The GitHub Action will automatically deploy to Cloud Run!

## 💰 Cost Estimate

Cloud Run pricing (approximate):
- **Free tier**: 2 million requests/month
- **Beyond free tier**: ~$0.40 per million requests
- **Min instances = 0**: No cost when idle

Expected monthly cost: **$0-5** depending on usage

## 🆘 Troubleshooting

### Error: "Caller does not have permission"

Make sure you've granted the service account access to secrets (Step 3).

### Error: "Container failed to start"

Check logs:
```bash
gcloud run services logs read coffee-copilot-backend --region us-central1
```

### Copilot still shows error after deployment

1. Verify `VITE_COPILOT_API_URL` is set in GitHub secrets
2. Check that frontend redeployment completed
3. Clear browser cache and refresh

## 📚 Full Documentation

For detailed information, see:
- [coffee-website-react/server/CLOUD_RUN_DEPLOYMENT.md](coffee-website-react/server/CLOUD_RUN_DEPLOYMENT.md)

## 🎉 Success!

Once deployed, your copilot should be fully functional with:
- ✅ AI-powered responses using OpenAI/Gemini
- ✅ Coffee-specific knowledge
- ✅ Order management capabilities
- ✅ Bug reporting to GitHub

Enjoy your AI-powered coffee copilot! ☕️
