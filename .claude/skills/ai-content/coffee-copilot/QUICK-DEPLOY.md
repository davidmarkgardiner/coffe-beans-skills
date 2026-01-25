# Quick Deploy Guide - Coffee Copilot to Production

> **For detailed explanations and troubleshooting**, see `references/production-deployment.md`

This is a condensed checklist for deploying the Coffee Copilot backend to Google Cloud Run and connecting it with Firebase-hosted frontend. Use this after you've already set up your development environment.

## Prerequisites

- ✅ Coffee Copilot working locally (backend on :3001, frontend on :5173)
- ✅ Firebase project with hosting enabled
- ✅ `gcloud` CLI installed and authenticated
- ✅ API keys: OpenAI, Gemini (optional), Stripe (optional)

## Backend Deployment (15 minutes)

### 1. Create Dockerfile

Create `server/Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
```

### 2. Create .dockerignore

Create `server/.dockerignore`:

```dockerfile
node_modules/
.env
.git/
.vscode/
.DS_Store
*.log
coverage/
test/
*.md
docs/
tmp/
temp/

# IMPORTANT: Don't exclude TypeScript files
```

### 3. Fix CORS in server.ts

Update `server/src/server.ts`:

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'https://YOUR-PROJECT.web.app',
    'https://YOUR-PROJECT.firebaseapp.com'
  ]
}));
```

**Critical**: Add BOTH Firebase domains!

### 4. Create Secrets

```bash
# Set project
gcloud config set project YOUR-PROJECT-ID

# Create secrets
echo -n "your-openai-key" | gcloud secrets create openai-api-key --data-file=-
echo -n "your-gemini-key" | gcloud secrets create gemini-api-key --data-file=-
echo -n "your-stripe-key" | gcloud secrets create stripe-secret-key --data-file=-
```

### 5. Grant Secret Access

```bash
# Get project number
PROJECT_NUMBER=$(gcloud projects describe YOUR-PROJECT-ID --format="value(projectNumber)")

# Grant access
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in openai-api-key gemini-api-key stripe-secret-key; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done
```

### 6. Deploy to Cloud Run

```bash
cd server

gcloud run deploy coffee-copilot-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "OPENAI_API_KEY=openai-api-key:latest,GEMINI_API_KEY=gemini-api-key:latest,STRIPE_SECRET_KEY=stripe-secret-key:latest" \
  --port 8080
```

Save the URL from output (e.g., `https://coffee-copilot-backend-XXXXX.run.app`)

### 7. Test Backend

```bash
SERVICE_URL=$(gcloud run services describe coffee-copilot-backend \
  --region us-central1 --format "value(status.url)")

curl ${SERVICE_URL}/health
```

Expected: `{"status":"ok",...}`

## Frontend Configuration (5 minutes)

### 1. Add Backend URL to GitHub Secrets

```bash
# Get backend URL
SERVICE_URL=$(gcloud run services describe coffee-copilot-backend \
  --region us-central1 --format "value(status.url)")

# Add to GitHub secrets
echo -n "${SERVICE_URL}/api/chat" | gh secret set VITE_COPILOT_API_URL
```

### 2. Update GitHub Actions Workflows

Add to **both** `.github/workflows/firebase-production.yml` and `.github/workflows/firebase-preview.yml`:

```yaml
- name: Build application
  working-directory: coffee-website-react
  run: npm run build
  env:
    VITE_ENV: production
    VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
    # ... other secrets ...
    VITE_COPILOT_API_URL: ${{ secrets.VITE_COPILOT_API_URL }}  # ← ADD THIS
```

### 3. Update Frontend Component

Update `src/components/CoffeeCopilot.tsx`:

```typescript
const apiUrl = import.meta.env.VITE_COPILOT_API_URL || 'http://localhost:3001/api/chat';
const response = await fetch(apiUrl, {
  method: 'POST',
  // ...
});
```

### 4. Deploy Frontend

```bash
git add .
git commit -m "feat: connect copilot to Cloud Run backend"
git push

# Or manually trigger
gh workflow run firebase-production.yml
```

## Verification (2 minutes)

### Test Production Site

1. Wait for deployment to complete (~2-3 minutes)
2. Visit `https://YOUR-PROJECT.firebaseapp.com/`
3. Clear browser cache (Cmd/Ctrl + Shift + R)
4. Open copilot chat widget
5. Send test message: "What coffee beans do you recommend?"
6. Verify AI response received

### Check Browser Console

- ✅ No CORS errors
- ✅ No network errors
- ✅ Request goes to Cloud Run URL

### Check Backend Logs

```bash
gcloud run services logs tail coffee-copilot-backend --region us-central1
```

Look for successful requests.

## Common Issues

### "Sorry, I encountered an error"

**Symptoms**: Chat widget works but always returns error

**Fix 1 - CORS** (most common):
```bash
# Update server/src/server.ts CORS config
# Redeploy: cd server && gcloud run deploy coffee-copilot-backend --source . --region us-central1
```

**Fix 2 - Backend URL not in build**:
```bash
# Verify secret exists
gh secret list | grep VITE_COPILOT_API_URL

# Verify it's in workflow file
grep VITE_COPILOT_API_URL .github/workflows/firebase-production.yml

# Redeploy frontend
gh workflow run firebase-production.yml
```

### "Permission denied on secret"

```bash
# Grant access (see step 5 above)
```

### TypeScript Build Errors

```bash
# Fix type annotations in server.ts
const issue = await response.json() as { number: number; html_url: string };
```

## Cost Estimate

- **Cloud Run**: $0-5/month (free tier covers most usage)
- **Secret Manager**: $0.06/secret/month = ~$0.18/month
- **Total**: ~$0-5/month

## Next Steps

- [ ] Set up monitoring in Cloud Console
- [ ] Configure billing alerts
- [ ] Add authentication to backend
- [ ] Set up staging environment
- [ ] Implement rate limiting
- [ ] Add analytics tracking

## Quick Reference

**Backend URL**: `https://coffee-copilot-backend-XXXXX.run.app`
**Health Check**: `curl https://your-backend.run.app/health`
**View Logs**: `gcloud run services logs tail coffee-copilot-backend --region us-central1`
**Redeploy Backend**: `cd server && gcloud run deploy coffee-copilot-backend --source . --region us-central1`
**Redeploy Frontend**: `gh workflow run firebase-production.yml`

## Full Documentation

For detailed explanations, troubleshooting, and advanced configuration:
- **Complete Guide**: `references/production-deployment.md`
- **Architecture Details**: `references/backend-implementation.md`
- **Security Best Practices**: Main `skill.md` file
