# Firebase Preview Channels - Complete Guide

## Overview

Firebase Preview Channels allow you to deploy and test your web app on temporary URLs without affecting your live production site. This is ideal for:
- Testing features before production
- Sharing work-in-progress with stakeholders
- PR-based review workflows
- Staging environments
- A/B testing variations

## Key Concepts

### What is a Preview Channel?

A Preview Channel is a separate hosting environment that:
- Has its own unique URL
- Runs independently from your live site
- Can have different content/versions
- Expires after a set time period
- Can be created, updated, or deleted anytime

### Channel Types

1. **Live Channel** (Production)
   - The main production site
   - Accessed via your primary domain
   - Permanent (never expires)
   - Updated via `firebase deploy --only hosting`

2. **Preview Channels** (Staging/Testing)
   - Temporary testing environments
   - Accessed via generated URLs
   - Can expire automatically
   - Updated via `firebase hosting:channel:deploy CHANNEL_ID`

## URL Structure

Preview channel URLs follow this pattern:
```
PROJECT_ID--CHANNEL_ID-RANDOM_HASH.web.app
```

Example:
```
coffee-beans-app--staging-abc123def.web.app
coffee-beans-app--pr-42-xyz789ghi.web.app
```

The random hash prevents URL prediction for security.

## Creating Preview Channels

### Basic Deployment
```bash
firebase hosting:channel:deploy CHANNEL_ID
```

### With Custom Expiration
```bash
# Expire in 30 minutes
firebase hosting:channel:deploy my-feature --expires 30m

# Expire in 12 hours
firebase hosting:channel:deploy my-feature --expires 12h

# Expire in 7 days (default)
firebase hosting:channel:deploy my-feature --expires 7d

# Expire in 30 days
firebase hosting:channel:deploy my-feature --expires 30d
```

### Channel Naming Rules

Valid channel IDs must:
- Be lowercase
- Contain only letters, numbers, and hyphens
- Not start or end with a hyphen
- Be between 1-63 characters

Valid examples:
- `staging`
- `feature-auth`
- `pr-123`
- `test-2024-01-15`

Invalid examples:
- `Staging` (uppercase)
- `feature_auth` (underscore)
- `PR#123` (special character)
- `-staging` (starts with hyphen)

## Complete Deployment Workflow

### Step-by-Step Process

1. **Build Your Application**
   ```bash
   npm run build
   ```

2. **Deploy to Preview Channel**
   ```bash
   firebase hosting:channel:deploy staging
   ```

3. **Review Output**
   The CLI will output:
   ```
   ✔  Deploy complete!

   Channel URL (staging): https://PROJECT_ID--staging-HASH.web.app
   Expires: 2024-01-22 10:30:00
   ```

4. **Share and Test**
   - Share the URL with your team
   - Test all functionality
   - Verify environment-specific settings

5. **Iterate if Needed**
   ```bash
   # Make changes, rebuild, redeploy to same channel
   npm run build
   firebase hosting:channel:deploy staging
   ```

6. **Promote to Production** (if approved)
   ```bash
   firebase hosting:clone PROJECT_ID:staging PROJECT_ID:live
   ```

## Managing Channels

### List All Channels
```bash
firebase hosting:channel:list
```

Output example:
```
Channel ID    URL                                              Expiry
live          https://coffee-beans-app.web.app                Never
staging       https://PROJECT_ID--staging-HASH.web.app        2024-01-22
pr-123        https://PROJECT_ID--pr-123-HASH.web.app         2024-01-18
feature-auth  https://PROJECT_ID--feature-auth-HASH.web.app   2024-01-20
```

### Update an Existing Channel
Simply deploy again to the same channel ID:
```bash
firebase hosting:channel:deploy staging
```

This updates the content and resets the expiration timer.

### Delete a Channel
```bash
firebase hosting:channel:delete staging
```

Confirm when prompted. The channel and its URL will be immediately removed.

### Extend Channel Expiration
```bash
# Redeploy with new expiration time
firebase hosting:channel:deploy staging --expires 60d
```

## Cloning Between Channels

### Why Clone?

Cloning copies the exact deployment from one channel to another without rebuilding. Benefits:
- Ensures identical code in production
- Faster than rebuilding
- No risk of build differences

### Clone to Production
```bash
firebase hosting:clone SOURCE_SITE_ID:CHANNEL_ID TARGET_SITE_ID:live
```

Example:
```bash
# Clone staging to live
firebase hosting:clone coffee-beans-app:staging coffee-beans-app:live
```

### Clone Between Preview Channels
```bash
# Clone one preview to another
firebase hosting:clone coffee-beans-app:feature-a coffee-beans-app:feature-b
```

## Multi-Site Projects

If you have multiple sites in one Firebase project:

### Configure in firebase.json
```json
{
  "hosting": [
    {
      "target": "main-site",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    },
    {
      "target": "admin-site",
      "public": "admin/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    }
  ]
}
```

### Deploy Specific Site to Preview
```bash
firebase hosting:channel:deploy staging --only main-site
```

### Clone Specific Site
```bash
firebase hosting:clone main-site:staging main-site:live
```

## Environment-Specific Deployments

### Different Builds for Different Channels

```bash
# Build for staging
VITE_ENV=staging npm run build
firebase hosting:channel:deploy staging

# Build for production
VITE_ENV=production npm run build
firebase deploy --only hosting
```

### Using .env Files

**.env.staging**
```env
VITE_API_URL=https://staging-api.example.com
VITE_ANALYTICS_ID=UA-STAGING-123
```

**.env.production**
```env
VITE_API_URL=https://api.example.com
VITE_ANALYTICS_ID=UA-PROD-456
```

**Deploy script**
```bash
#!/bin/bash

# Load staging environment
cp .env.staging .env
npm run build
firebase hosting:channel:deploy staging

# Load production environment
cp .env.production .env
npm run build
firebase deploy --only hosting
```

## Security Considerations

### 1. Preview URLs are Public
- Anyone with the URL can access your preview
- Don't rely on URL obscurity for security
- The random hash helps but isn't foolproof

### 2. Implement Authentication
```javascript
// Add basic auth for preview channels
if (window.location.hostname.includes('--')) {
  // This is a preview channel
  const password = prompt('Enter preview password:');
  if (password !== 'your-secret-password') {
    document.body.innerHTML = 'Unauthorized';
  }
}
```

### 3. Environment Variables
- Never commit secrets to source code
- Use Firebase environment configuration
- Different API keys for preview vs production

### 4. Firebase Security Rules
Preview channels use the same Firestore/Storage rules as production:
```javascript
// Example: Stricter rules for preview
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Check if production domain
      allow read, write: if request.auth != null
        && (!request.domain.matches('.*--.*') || debug.mode);
    }
  }
}
```

## Troubleshooting

### Problem: Channel deployment fails with 403 error

**Cause:** Insufficient permissions

**Solution:**
```bash
# Re-authenticate
firebase logout
firebase login

# Verify project access
firebase projects:list

# Use correct project
firebase use PROJECT_ID
```

### Problem: Preview URL shows 404

**Cause:** Build output directory mismatch

**Solution:**
1. Check `firebase.json` public path:
   ```json
   {
     "hosting": {
       "public": "dist"  // Must match your build output
     }
   }
   ```

2. Verify build output:
   ```bash
   ls -la dist/  # Should show index.html and assets
   ```

3. Rebuild and redeploy:
   ```bash
   npm run build
   firebase hosting:channel:deploy staging
   ```

### Problem: Old content still showing

**Cause:** Browser cache

**Solution:**
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Try incognito/private mode
4. Configure cache headers in firebase.json:
   ```json
   {
     "hosting": {
       "headers": [
         {
           "source": "/**",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "no-cache, no-store, must-revalidate"
             }
           ]
         }
       ]
     }
   }
   ```

### Problem: Channel expired unexpectedly

**Cause:** Default 7-day expiration

**Solution:**
```bash
# Set longer expiration
firebase hosting:channel:deploy staging --expires 90d
```

### Problem: "Channel name contains invalid characters"

**Cause:** Invalid channel ID format

**Solution:**
Use only lowercase letters, numbers, and hyphens:
```bash
# Invalid
firebase hosting:channel:deploy Feature_Branch
firebase hosting:channel:deploy pr#123

# Valid
firebase hosting:channel:deploy feature-branch
firebase hosting:channel:deploy pr-123
```

## Best Practices

### 1. Naming Conventions
```bash
# Feature branches
firebase hosting:channel:deploy feature-user-auth

# Pull requests
firebase hosting:channel:deploy pr-${PR_NUMBER}

# Long-lived environments
firebase hosting:channel:deploy staging
firebase hosting:channel:deploy qa
firebase hosting:channel:deploy demo
```

### 2. Expiration Times
- **Feature branches:** 7 days (default)
- **PR previews:** Delete when PR closes
- **Staging:** 30-90 days
- **Demo sites:** 180+ days or manual deletion

### 3. Automation
Automate repetitive deployments:
```bash
#!/bin/bash
# deploy-preview.sh

CHANNEL=$1
EXPIRY=${2:-7d}

echo "Building application..."
npm run build

echo "Deploying to channel: $CHANNEL"
firebase hosting:channel:deploy $CHANNEL --expires $EXPIRY

echo "Preview URL:"
firebase hosting:channel:open $CHANNEL
```

Usage:
```bash
./deploy-preview.sh feature-auth 14d
```

### 4. Documentation
Document your channels:
```markdown
# Active Preview Channels

| Channel   | Purpose           | URL                                    | Expires    |
|-----------|-------------------|----------------------------------------|------------|
| staging   | Pre-production    | PROJECT_ID--staging-HASH.web.app      | 2024-02-01 |
| qa        | QA testing        | PROJECT_ID--qa-HASH.web.app           | 2024-02-15 |
| demo      | Client demos      | PROJECT_ID--demo-HASH.web.app         | 2024-03-01 |
```

### 5. Cleanup
Regularly remove unused channels:
```bash
# List all channels
firebase hosting:channel:list

# Delete unused channels
firebase hosting:channel:delete old-feature
firebase hosting:channel:delete pr-123
```

## Advanced Use Cases

### A/B Testing
```bash
# Deploy variant A
firebase hosting:channel:deploy variant-a

# Deploy variant B
firebase hosting:channel:deploy variant-b

# Send 50% traffic to each in Firebase Console
```

### Rollback Strategy
```bash
# Keep previous version in a channel
firebase hosting:clone PROJECT_ID:live PROJECT_ID:rollback

# Deploy new version
firebase deploy --only hosting

# If issues, rollback
firebase hosting:clone PROJECT_ID:rollback PROJECT_ID:live
```

### Client Approval Workflow
```bash
# Deploy for client review
firebase hosting:channel:deploy client-review-jan-2024 --expires 30d

# Share URL with client
echo "Preview: https://PROJECT_ID--client-review-jan-2024-HASH.web.app"

# After approval, deploy to production
firebase hosting:clone PROJECT_ID:client-review-jan-2024 PROJECT_ID:live
```

## Resources

- **Official Documentation:** https://firebase.google.com/docs/hosting/test-preview-deploy
- **CLI Reference:** https://firebase.google.com/docs/cli#hosting_commands
- **Video Tutorial:** https://www.youtube.com/watch?v=zk6vNbpcei4
- **Community Support:** https://stackoverflow.com/questions/tagged/firebase-hosting

## Quick Reference Card

```bash
# Deploy to preview
firebase hosting:channel:deploy CHANNEL_ID

# With expiration
firebase hosting:channel:deploy CHANNEL_ID --expires 30d

# List channels
firebase hosting:channel:list

# Delete channel
firebase hosting:channel:delete CHANNEL_ID

# Clone to production
firebase hosting:clone PROJECT:CHANNEL PROJECT:live

# Deploy to production
firebase deploy --only hosting

# Open channel in browser
firebase hosting:channel:open CHANNEL_ID
```
