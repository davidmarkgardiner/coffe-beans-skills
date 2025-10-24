# Cloud Run Deployment Guide

This guide explains how to deploy the Coffee Copilot backend to Google Cloud Run.

## Prerequisites

1. **Google Cloud Project**: You need a GCP project with billing enabled
2. **gcloud CLI**: Install from https://cloud.google.com/sdk/docs/install
3. **Permissions**: Your GCP account needs the following roles:
   - Cloud Run Admin
   - Service Account User
   - Secret Manager Admin
   - Storage Admin (for Container Registry)

## Setup Instructions

### 1. Install and Configure gcloud CLI

```bash
# Install gcloud (if not already installed)
# Follow instructions at: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set your project
gcloud config set project coffee-65c46
```

### 2. Create Secrets in Google Secret Manager

The backend requires API keys stored in Secret Manager:

```bash
# Create OpenAI API key secret
echo -n "your-openai-api-key" | gcloud secrets create OPENAI_API_KEY --data-file=-

# Create Gemini API key secret
echo -n "your-gemini-api-key" | gcloud secrets create GEMINI_API_KEY --data-file=-

# Create Stripe secret key
echo -n "your-stripe-secret-key" | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
```

### 3. Grant Cloud Run Access to Secrets

```bash
# Get your Cloud Run service account
PROJECT_ID=$(gcloud config get-value project)
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

# Grant access to each secret
gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding STRIPE_SECRET_KEY \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

## Deployment Methods

### Option 1: Manual Deployment (Recommended for First Time)

```bash
# Navigate to the server directory
cd coffee-website-react/server

# Run the deployment script
./deploy-cloud-run.sh
```

The script will:
1. Enable required Google Cloud APIs
2. Build a Docker image
3. Deploy to Cloud Run
4. Display the service URL

### Option 2: Automated GitHub Actions Deployment

The repository includes a GitHub Actions workflow that automatically deploys when you push changes to the `coffee-website-react/server` directory.

#### Setup GitHub Secrets

You need to add these secrets to your GitHub repository:

1. **GCP_PROJECT_ID**: Your Google Cloud project ID
   ```bash
   echo -n "coffee-65c46" | gh secret set GCP_PROJECT_ID
   ```

2. **GCP_SA_KEY**: Service account JSON key
   ```bash
   # Create a service account
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions"

   # Grant necessary roles
   gcloud projects add-iam-policy-binding coffee-65c46 \
     --member="serviceAccount:github-actions@coffee-65c46.iam.gserviceaccount.com" \
     --role="roles/run.admin"

   gcloud projects add-iam-policy-binding coffee-65c46 \
     --member="serviceAccount:github-actions@coffee-65c46.iam.gserviceaccount.com" \
     --role="roles/storage.admin"

   gcloud projects add-iam-policy-binding coffee-65c46 \
     --member="serviceAccount:github-actions@coffee-65c46.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"

   # Create and download key
   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions@coffee-65c46.iam.gserviceaccount.com

   # Add to GitHub secrets (copy the contents of key.json)
   gh secret set GCP_SA_KEY < key.json

   # Delete the local key file for security
   rm key.json
   ```

#### Trigger Deployment

The workflow will automatically run when you:
- Push changes to `coffee-website-react/server/**`
- Push changes to `.github/workflows/deploy-backend.yml`
- Manually trigger via GitHub Actions UI

## Post-Deployment Configuration

### 1. Get Your Service URL

After deployment, get the service URL:

```bash
gcloud run services describe coffee-copilot-backend \
  --region us-central1 \
  --format "value(status.url)"
```

Example output: `https://coffee-copilot-backend-xyz123-uc.a.run.app`

### 2. Update Frontend Configuration

Add the backend URL as a GitHub secret for your frontend:

```bash
# Replace with your actual Cloud Run URL
SERVICE_URL="https://coffee-copilot-backend-xyz123-uc.a.run.app"
echo -n "${SERVICE_URL}/api/chat" | gh secret set VITE_COPILOT_API_URL
```

### 3. Redeploy Frontend

Trigger a frontend redeployment to pick up the new environment variable:

```bash
# Make a trivial change or use workflow_dispatch
gh workflow run firebase-production.yml
```

## Testing the Deployment

### Test Health Endpoint

```bash
SERVICE_URL=$(gcloud run services describe coffee-copilot-backend \
  --region us-central1 --format "value(status.url)")

curl ${SERVICE_URL}/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-10-24T..."}
```

### Test Chat Endpoint

```bash
curl -X POST ${SERVICE_URL}/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What coffee beans do you recommend?"}],
    "user": {"id": "test-user"}
  }'
```

## Monitoring and Logs

### View Logs

```bash
# View recent logs
gcloud run services logs read coffee-copilot-backend \
  --region us-central1 \
  --limit 50

# Tail logs (live)
gcloud run services logs tail coffee-copilot-backend \
  --region us-central1
```

### View Metrics

Visit Cloud Run Console: https://console.cloud.google.com/run

Select your service to view:
- Request count
- Request latency
- Error rate
- Container instance count
- Memory and CPU usage

## Updating Secrets

To update API keys:

```bash
# Update OpenAI API key
echo -n "new-openai-api-key" | gcloud secrets versions add OPENAI_API_KEY --data-file=-

# Update Gemini API key
echo -n "new-gemini-api-key" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Redeploy to pick up new secrets
gcloud run services update coffee-copilot-backend --region us-central1
```

## Troubleshooting

### Issue: Container fails to start

Check logs:
```bash
gcloud run services logs read coffee-copilot-backend --region us-central1
```

Common causes:
- Missing environment variables
- Secret Manager permissions not set
- Port mismatch (ensure app listens on PORT=8080)

### Issue: 403 Forbidden when accessing secrets

Grant service account access:
```bash
PROJECT_ID=$(gcloud config get-value project)
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

### Issue: Deployment hangs or times out

- Check Cloud Build logs in GCP Console
- Ensure Docker build completes successfully locally
- Verify billing is enabled on your GCP project

## Cost Optimization

Cloud Run charges based on:
- Request count
- CPU/Memory usage
- Instance time

To optimize costs:

1. **Set min instances to 0** (already configured)
   - Scales to zero when not in use

2. **Use appropriate memory limits**
   - Current: 512Mi (sufficient for this backend)

3. **Set request timeout**
   - Current: 300s (5 minutes)

Expected costs (approximate):
- Free tier: 2 million requests/month
- Beyond free tier: ~$0.40 per million requests

## Security Considerations

1. **Secrets**: Always use Secret Manager, never commit API keys
2. **Authentication**: Currently allows unauthenticated access
   - Consider adding Firebase Auth verification for production
3. **CORS**: Configure allowed origins in production
4. **Rate Limiting**: Implemented in the backend
5. **HTTPS**: Automatically provided by Cloud Run

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
