# Production Deployment Guide - Lessons Learned

This guide documents the complete process for deploying the Coffee Copilot backend to Google Cloud Run and connecting it with a Firebase-hosted frontend, based on real production deployment experience.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Deployment (Google Cloud Run)](#backend-deployment-google-cloud-run)
3. [Frontend Configuration (Firebase Hosting)](#frontend-configuration-firebase-hosting)
4. [Common Issues and Solutions](#common-issues-and-solutions)
5. [Deployment Checklist](#deployment-checklist)

## Architecture Overview

**Production Architecture:**
```
Frontend (Firebase Hosting)
  └─> https://your-project.firebaseapp.com
  └─> https://your-project.web.app
       │
       │ HTTPS Requests
       ▼
Backend (Google Cloud Run)
  └─> https://your-backend-XXXXX.run.app
       │
       ├─> OpenAI API (AI responses)
       ├─> Gemini API (alternative AI)
       ├─> GitHub API (issue creation)
       └─> Google Secret Manager (API keys)
```

## Backend Deployment (Google Cloud Run)

### Why Cloud Run?

- ✅ **Auto-scaling**: Scales to zero when idle (cost-effective)
- ✅ **Managed**: No server management required
- ✅ **Built-in HTTPS**: Automatic SSL certificates
- ✅ **Secret Management**: Integrated with Google Secret Manager
- ✅ **Cost**: ~$0-5/month for typical usage

### Prerequisites

1. Google Cloud account with billing enabled
2. `gcloud` CLI installed
3. Firebase project (can reuse existing)
4. API keys (OpenAI, Gemini, Stripe)

### Step 1: Create Dockerfile

**Lesson Learned**: Use multi-stage builds to keep production image small and efficient.

```dockerfile
# Multi-stage build for Coffee Copilot Backend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]
```

**Key Points:**
- Use port 8080 (Cloud Run's default)
- Include health check endpoint
- Multi-stage build reduces final image size
- Alpine base image for smaller footprint

### Step 2: Create .dockerignore

**Lesson Learned**: Be careful what you exclude! We initially excluded TypeScript files which broke the build.

```dockerfile
# Node modules
node_modules/
npm-debug.log

# Environment files (will be provided by Cloud Run)
.env
.env.local
.env.*.local

# Git
.git/
.gitignore

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Testing
coverage/
test/
*.test.js
*.spec.js

# Documentation
*.md
docs/
README*

# Temporary files
tmp/
temp/

# IMPORTANT: Don't exclude TypeScript files or src/ during build!
# The multi-stage build needs these to compile
```

**Critical**: Do NOT exclude:
- `*.ts` files (needed for compilation)
- `src/` directory (contains source code)
- `tsconfig.json` (TypeScript config)

### Step 3: Fix TypeScript Configuration

**Lesson Learned**: Ensure `tsconfig.json` includes all necessary files.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Fix Type Errors** before deploying:

```typescript
// Bad: Unknown type from JSON
const issue = await response.json();

// Good: Type annotation
const issue = await response.json() as { number: number; html_url: string };
```

### Step 4: Create Secrets in Google Secret Manager

**Lesson Learned**: Secrets must be created in the SAME project as Cloud Run, not in your default GCP project.

```bash
# Set correct project
gcloud config set project your-firebase-project-id

# Create secrets
echo -n "your-openai-key" | gcloud secrets create openai-api-key --data-file=- --project=your-project-id
echo -n "your-gemini-key" | gcloud secrets create gemini-api-key --data-file=- --project=your-project-id
echo -n "your-stripe-key" | gcloud secrets create stripe-secret-key --data-file=- --project=your-project-id
```

**Important**: Use lowercase names (`openai-api-key` not `OPENAI_API_KEY`)

### Step 5: Grant Service Account Access to Secrets

**Lesson Learned**: Cloud Run uses a specific service account that needs explicit permission to read secrets.

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe your-project-id --format="value(projectNumber)")

# Grant access to secrets
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in openai-api-key gemini-api-key stripe-secret-key; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --project=your-project-id \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Step 6: Deploy to Cloud Run

**Lesson Learned**: Don't set PORT environment variable - Cloud Run sets it automatically!

```bash
# Build and deploy
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

**Key Parameters:**
- `--allow-unauthenticated`: Public access (required for frontend)
- `--min-instances 0`: Scales to zero (saves cost)
- `--max-instances 10`: Limit scale-up
- `--memory 512Mi`: Sufficient for Node.js backend
- Do NOT set `PORT` in `--set-env-vars` (Cloud Run manages it)

### Step 7: Fix CORS Configuration

**Lesson Learned**: THE MOST COMMON ISSUE! Backend must explicitly allow your frontend domains.

```typescript
// Bad: Only allows localhost
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
}));

// Good: Includes production domains
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'https://your-project.web.app',
    'https://your-project.firebaseapp.com'
  ]
}));
```

**Critical**: Add BOTH Firebase domains:
- `https://your-project.web.app`
- `https://your-project.firebaseapp.com`

**After updating CORS**, redeploy:
```bash
gcloud run deploy coffee-copilot-backend --source . --region us-central1
```

## Frontend Configuration (Firebase Hosting)

### Step 1: Add Backend URL to GitHub Secrets

**Lesson Learned**: Environment variables must be set as GitHub secrets AND added to workflow files.

```bash
# Get your Cloud Run URL
SERVICE_URL=$(gcloud run services describe coffee-copilot-backend \
  --region us-central1 --format "value(status.url)")

# Add to GitHub secrets
echo -n "${SERVICE_URL}/api/chat" | gh secret set VITE_COPILOT_API_URL
```

### Step 2: Update GitHub Actions Workflows

**Lesson Learned**: You must explicitly add environment variables to BOTH workflows (production AND preview).

**`.github/workflows/firebase-production.yml`:**
```yaml
- name: Build for production
  working-directory: coffee-website-react
  run: npm run build
  env:
    VITE_ENV: production
    VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
    VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
    VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}
    VITE_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    VITE_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
    VITE_COPILOT_API_URL: ${{ secrets.VITE_COPILOT_API_URL }}  # ← ADD THIS!
```

**`.github/workflows/firebase-preview.yml`:**
```yaml
- name: Build application
  working-directory: coffee-website-react
  run: npm run build
  env:
    VITE_ENV: preview
    # ... all the same env vars as production
    VITE_COPILOT_API_URL: ${{ secrets.VITE_COPILOT_API_URL }}  # ← ADD THIS!
```

### Step 3: Update Frontend Component

**Lesson Learned**: Use environment variables instead of hardcoded localhost URLs.

```typescript
// Bad: Hardcoded localhost
const response = await fetch('http://localhost:3001/api/chat', {

// Good: Environment variable with fallback
const apiUrl = import.meta.env.VITE_COPILOT_API_URL || 'http://localhost:3001/api/chat';
const response = await fetch(apiUrl, {
```

### Step 4: Trigger Deployment

```bash
# Commit and push changes
git add .github/workflows/
git commit -m "feat: add backend URL to deployment workflows"
git push

# Or manually trigger
gh workflow run firebase-production.yml
```

## Common Issues and Solutions

### Issue 1: "Sorry, I encountered an error"

**Symptoms:**
- Copilot widget loads
- Can type and send messages
- Always returns error message
- Browser console shows CORS error or network failure

**Root Causes & Solutions:**

1. **CORS not configured**
   ```bash
   # Check if CORS headers are present
   curl -I -H "Origin: https://your-project.firebaseapp.com" \
     https://your-backend.run.app/api/chat

   # Fix: Update server CORS configuration (see Step 7 above)
   # Then redeploy backend
   ```

2. **Backend URL not in build**
   ```bash
   # Verify URL is in deployed JavaScript
   curl -s https://your-project.firebaseapp.com/assets/index-HASH.js | grep "your-backend.run.app"

   # Fix: Add VITE_COPILOT_API_URL to workflow env vars
   # Then redeploy frontend
   ```

3. **Wrong backend URL**
   ```bash
   # Check GitHub secret
   gh secret list | grep VITE_COPILOT_API_URL

   # Fix: Update secret with correct URL
   echo -n "https://correct-url.run.app/api/chat" | gh secret set VITE_COPILOT_API_URL
   ```

### Issue 2: Build Fails with "Cannot find module"

**Symptoms:**
- Docker build fails during TypeScript compilation
- Error: `Cannot find module '../lib/stripe'`

**Solution:**
Check `.dockerignore` - you might be excluding necessary files:

```dockerfile
# Bad - excludes TypeScript files
*.ts
src/
tsconfig.json

# Good - includes them for build
# (Don't ignore .ts, src/, or tsconfig.json)
```

### Issue 3: Deployment Fails "Permission Denied on Secret"

**Symptoms:**
- Cloud Run deployment succeeds
- Service fails to start
- Error mentions "Permission denied on secret"

**Solution:**
Grant service account access to secrets:

```bash
PROJECT_NUMBER=$(gcloud projects describe your-project-id --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

### Issue 4: "PORT environment variable error"

**Symptoms:**
- Deployment fails with "PORT...reserved env names"

**Solution:**
Remove PORT from `--set-env-vars` - Cloud Run sets it automatically:

```bash
# Bad
--set-env-vars "NODE_ENV=production,PORT=8080"

# Good
--set-env-vars "NODE_ENV=production"
```

### Issue 5: TypeScript Compilation Errors

**Symptoms:**
- Build fails with type errors
- `'issue' is of type 'unknown'`

**Solution:**
Add explicit type annotations:

```typescript
// Before
const issue = await response.json();

// After
const issue = await response.json() as { number: number; html_url: string };
```

## Deployment Checklist

### Pre-Deployment

- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] All environment variables identified
- [ ] API keys obtained (OpenAI, Gemini, Stripe)
- [ ] CORS configured with production domains
- [ ] Health check endpoint exists (`/health`)
- [ ] Dockerfile tested locally
- [ ] .dockerignore reviewed (doesn't exclude build files)

### Backend Deployment

- [ ] gcloud CLI installed and authenticated
- [ ] Project set correctly (`gcloud config set project`)
- [ ] Secrets created in Secret Manager
- [ ] Service account granted access to secrets
- [ ] Docker image builds successfully
- [ ] Cloud Run deployment succeeds
- [ ] Health endpoint responds (`curl https://.../health`)
- [ ] API endpoints respond (`curl -X POST https://.../api/chat`)
- [ ] CORS headers present in responses

### Frontend Configuration

- [ ] Backend URL added to GitHub secrets
- [ ] VITE_COPILOT_API_URL in production workflow
- [ ] VITE_COPILOT_API_URL in preview workflow
- [ ] Frontend component uses environment variable
- [ ] Build includes backend URL in JavaScript bundle
- [ ] Deployment succeeds
- [ ] Site loads without errors

### Testing

- [ ] Open production site
- [ ] Clear browser cache (Cmd/Ctrl + Shift + R)
- [ ] Click copilot chat button
- [ ] Send test message
- [ ] Verify AI response received
- [ ] Check browser console (no CORS errors)
- [ ] Test on mobile device
- [ ] Test in incognito/private mode

### Monitoring

- [ ] View Cloud Run logs (`gcloud run services logs tail ...`)
- [ ] Check error rates in Cloud Console
- [ ] Monitor OpenAI API usage
- [ ] Set up cost alerts
- [ ] Configure uptime monitoring

## Automated Deployment (GitHub Actions)

### Backend Auto-Deployment

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Cloud Run

on:
  push:
    branches:
      - main
    paths:
      - 'server/**'
      - '.github/workflows/deploy-backend.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to Cloud Run
        working-directory: server
        run: |
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

**Setup:**
1. Create service account with Cloud Run permissions
2. Download JSON key
3. Add as `GCP_SA_KEY` GitHub secret

## Cost Optimization

### Cloud Run Pricing

Based on actual usage:
- **Free tier**: 2 million requests/month
- **Beyond free tier**: ~$0.40 per million requests
- **Min instances = 0**: No cost when idle
- **Expected monthly cost**: $0-5 for typical usage

### Tips to Minimize Costs

1. **Scale to zero**: Set `--min-instances 0`
2. **Right-size resources**: 512Mi memory is usually enough
3. **Set appropriate timeout**: 300s prevents hanging requests
4. **Cache responses**: Reduce OpenAI API calls
5. **Monitor usage**: Set up billing alerts

## Next Steps

1. **Set up monitoring**: Cloud Logging, Error Reporting
2. **Add authentication**: Protect backend endpoints
3. **Implement caching**: Redis for common queries
4. **Add analytics**: Track copilot usage
5. **Set up staging**: Test changes before production
6. **Configure CDN**: Cloud CDN for faster responses
7. **Implement rate limiting**: Protect against abuse

## Summary

**Key Lessons:**
1. ✅ Use multi-stage Docker builds
2. ✅ Don't exclude TypeScript files in .dockerignore
3. ✅ Create secrets in the SAME GCP project
4. ✅ Grant service account access to secrets
5. ✅ Don't set PORT environment variable
6. ✅ Configure CORS with ALL production domains
7. ✅ Add backend URL to BOTH workflows
8. ✅ Use environment variables, not hardcoded URLs
9. ✅ Test with cache cleared
10. ✅ Monitor logs for errors

**Deployment Time:**
- Initial setup: 30-60 minutes
- Subsequent deploys: 2-5 minutes
- Troubleshooting (if needed): 10-30 minutes

**Result:**
- ✅ Auto-scaling backend
- ✅ $0-5/month cost
- ✅ Automatic HTTPS
- ✅ Managed secrets
- ✅ Production-ready copilot

