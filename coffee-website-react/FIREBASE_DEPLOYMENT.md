# Firebase Deployment Guide

This document provides comprehensive instructions for deploying the coffee website to Firebase Hosting, including both manual deployment and automated CI/CD workflows.

## Quick Start

### Production Deployment
```bash
npm run build
firebase deploy --only hosting --project coffee-65c46
```

### Preview Channel Deployment
```bash
npm run build
firebase hosting:channel:deploy CHANNEL_NAME --expires 7d --project coffee-65c46
```

## Deployment URLs

- **Production (Live)**: https://coffee-65c46.web.app
- **Firebase Console**: https://console.firebase.google.com/project/coffee-65c46/overview
- **Preview Channels**: https://coffee-65c46--CHANNEL-NAME-*.web.app

## CI/CD Workflows

This project has two automated GitHub Actions workflows:

### 1. Preview Channel Deployment (PRs)

**File**: `.github/workflows/firebase-preview.yml`

**Triggers**:
- When a PR is opened
- When new commits are pushed to a PR
- When a PR is closed (cleanup)

**What it does**:
1. Builds the application with preview environment variables
2. Deploys to a preview channel named `pr-{number}`
3. Comments on the PR with the preview URL
4. Deletes the channel when PR is closed

**Example**: PR #42 → `https://coffee-65c46--pr-42-*.web.app`

### 2. Production Deployment

**File**: `.github/workflows/firebase-production.yml`

**Triggers**:
- Push to `main` branch (affecting `coffee-website-react/`)
- Manual trigger via workflow_dispatch

**What it does**:
1. Runs linter
2. Builds production bundle
3. Deploys to live Firebase Hosting
4. Creates deployment summary

## Required GitHub Secrets

To enable the automated workflows, configure these secrets in your GitHub repository:

### Firebase Configuration Secrets

```
FIREBASE_SERVICE_ACCOUNT
  - Firebase service account JSON for GitHub Actions
  - Get from: Firebase Console → Project Settings → Service Accounts
  - Generate new private key and paste entire JSON

FIREBASE_PROJECT_ID
  - Value: coffee-65c46

FIREBASE_TOKEN
  - Firebase CLI token for legacy authentication
  - Generate: firebase login:ci
```

### Environment Variable Secrets

```
FIREBASE_API_KEY
  - Your Firebase Web API key
  - Get from: Firebase Console → Project Settings → General

FIREBASE_AUTH_DOMAIN
  - Value: coffee-65c46.firebaseapp.com

FIREBASE_STORAGE_BUCKET
  - Value: coffee-65c46.firebasestorage.app

FIREBASE_MESSAGING_SENDER_ID
  - Your Firebase messaging sender ID

FIREBASE_APP_ID
  - Your Firebase app ID

VITE_STRIPE_PUBLISHABLE_KEY
  - Your Stripe publishable key (pk_test_... or pk_live_...)
```

### How to Add Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret from the list above

## Manual Deployment Commands

### Deploy to Production
```bash
# Build the application
npm run build

# Deploy to live hosting
firebase deploy --only hosting --project coffee-65c46
```

### Create Preview Channel
```bash
# Build the application
npm run build

# Deploy to preview channel
firebase hosting:channel:deploy staging --expires 30d --project coffee-65c46
```

### List All Channels
```bash
firebase hosting:channel:list --project coffee-65c46
```

### Delete Preview Channel
```bash
firebase hosting:channel:delete CHANNEL_NAME --project coffee-65c46
```

### Clone Channel to Production
```bash
firebase hosting:clone coffee-65c46:staging coffee-65c46:live --project coffee-65c46
```

## Environment Variables

The application uses different environment variables for different deployment environments:

### Production
- `VITE_ENV`: production
- All Firebase config from GitHub Secrets
- Production Stripe key

### Preview/Staging
- `VITE_ENV`: preview
- Same Firebase config
- Test Stripe key (recommended)

### Local Development
Environment variables are loaded from `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=coffee-65c46.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=coffee-65c46
VITE_FIREBASE_STORAGE_BUCKET=coffee-65c46.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Firebase Configuration

### firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [{"key": "Cache-Control", "value": "max-age=31536000"}]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [{"key": "Cache-Control", "value": "max-age=31536000"}]
      }
    ]
  }
}
```

### .firebaserc
```json
{
  "projects": {
    "default": "coffee-65c46"
  }
}
```

## Deployment Workflow Best Practices

### For Feature Development
1. Create feature branch
2. Make changes and commit
3. Open PR → automatic preview deployment
4. Review preview URL
5. Merge to main → automatic production deployment

### For Hot Fixes
1. Create fix on feature branch
2. Deploy to preview channel manually for testing
3. Once verified, merge to main

### For Staging Environment
```bash
# Deploy to long-lived staging channel
npm run build
firebase hosting:channel:deploy staging --expires 90d --project coffee-65c46

# After testing, clone to production
firebase hosting:clone coffee-65c46:staging coffee-65c46:live
```

## Troubleshooting

### Build Fails
```bash
# Check TypeScript errors
npm run build

# Run linter
npm run lint
```

### Deployment Permission Error
```bash
# Re-authenticate with Firebase
firebase logout
firebase login
firebase use coffee-65c46
```

### Preview Channel Not Created
- Ensure `FIREBASE_SERVICE_ACCOUNT` secret is set correctly
- Check that the service account has "Firebase Hosting Admin" role
- Verify workflow file has correct `entryPoint: coffee-website-react`

### Environment Variables Not Loading
- Verify all secrets are set in GitHub repository settings
- Check that secret names match exactly in workflow file
- For local development, ensure `.env` file exists and is not committed

## Post-Deployment Checklist

After deploying to production:

- [ ] Visit https://coffee-65c46.web.app
- [ ] Test user authentication (login/logout)
- [ ] Verify product inventory loads
- [ ] Test shopping cart functionality
- [ ] Complete a test checkout with Stripe test card
- [ ] Check mobile responsiveness
- [ ] Verify all images and logos load
- [ ] Check browser console for errors
- [ ] Test navigation between pages
- [ ] Verify Firebase Firestore data access

## Monitoring and Analytics

### Firebase Console
- **Hosting Dashboard**: View deployment history and traffic
- **Performance Monitoring**: Track page load times
- **Analytics**: Monitor user behavior

### Links
- Firebase Console: https://console.firebase.google.com/project/coffee-65c46
- Hosting Dashboard: https://console.firebase.google.com/project/coffee-65c46/hosting

## Rollback Procedure

If you need to rollback a deployment:

1. **Via Firebase Console**:
   - Go to Hosting dashboard
   - Click on "Release history"
   - Find previous working version
   - Click "Rollback" button

2. **Via CLI**:
   ```bash
   # List recent versions
   firebase hosting:versions:list --project coffee-65c46

   # Clone specific version to live
   firebase hosting:clone coffee-65c46:VERSION_ID coffee-65c46:live
   ```

## Support

For issues related to:
- **Firebase Deployment**: Check Firebase status at https://status.firebase.google.com
- **GitHub Actions**: Review workflow logs in Actions tab
- **Build Errors**: Check TypeScript and linting errors locally
- **Stripe Integration**: Verify API keys and test in Stripe Dashboard

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [GitHub Actions for Firebase](https://github.com/marketplace/actions/deploy-to-firebase-hosting)
- [Vite Build Documentation](https://vite.dev/guide/build.html)
