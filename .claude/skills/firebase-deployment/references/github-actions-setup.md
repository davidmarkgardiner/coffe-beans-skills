# Setting Up GitHub Actions for Firebase Deployment

This guide walks you through setting up automated Firebase deployments using GitHub Actions.

## Prerequisites

- Firebase project created
- GitHub repository with your code
- Firebase CLI installed locally
- Admin access to both Firebase and GitHub repository

## Step 1: Create Firebase Service Account

### 1.1 Generate Service Account Key

```bash
# Login to Firebase
firebase login

# Generate service account (this will open browser)
firebase init hosting:github
```

**OR** manually create service account:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click gear icon → Project settings
4. Go to "Service accounts" tab
5. Click "Generate new private key"
6. Save the JSON file securely

### 1.2 Convert Service Account to GitHub Secret Format

The downloaded JSON needs to be added as a GitHub Secret. You can use it as-is (minified):

```bash
# Minify the JSON (remove whitespace)
cat service-account-key.json | jq -c
```

Copy the minified output.

## Step 2: Configure GitHub Secrets

### 2.1 Navigate to Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 2.2 Add Required Secrets

Add the following secrets:

#### Required for all workflows:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON (minified) | `{"type":"service_account",...}` |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | `coffee-beans-app` |

#### Optional (for environment-specific configs):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `PROD_API_URL` | Production API URL | `https://api.example.com` |
| `STAGING_API_URL` | Staging API URL | `https://staging-api.example.com` |
| `PREVIEW_API_URL` | Preview API URL | `https://dev-api.example.com` |
| `PROD_FIREBASE_API_KEY` | Production Firebase API key | `AIza...` |
| `STAGING_FIREBASE_API_KEY` | Staging Firebase API key | `AIza...` |
| `PROD_FIREBASE_AUTH_DOMAIN` | Auth domain | `app.firebaseapp.com` |

**Alternative: Using Firebase Token (Legacy)**

```bash
# Generate Firebase token
firebase login:ci

# Add as FIREBASE_TOKEN secret
```

⚠️ Service account is recommended over token for CI/CD.

## Step 3: Create Workflow Files

### 3.1 Create `.github/workflows` Directory

```bash
mkdir -p .github/workflows
```

### 3.2 Add Workflow Files

Copy the template files from `.claude/skills/firebase-deployment/templates/`:

**For PR Preview Deployments:**
```bash
cp .claude/skills/firebase-deployment/templates/github-actions-preview.yml \
   .github/workflows/firebase-preview.yml
```

**For Production Deployments:**
```bash
cp .claude/skills/firebase-deployment/templates/github-actions-production.yml \
   .github/workflows/firebase-production.yml
```

**For Staging Deployments:**
```bash
cp .claude/skills/firebase-deployment/templates/github-actions-staging.yml \
   .github/workflows/firebase-staging.yml
```

### 3.3 Customize Workflow Files

Edit the workflow files to match your project:

1. **Node.js version** (if not using 20):
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       node-version: '18'  # Change to your version
   ```

2. **Build command** (if different):
   ```yaml
   - name: Build application
     run: npm run build  # Or yarn build, pnpm build, etc.
   ```

3. **Test command** (adjust or remove):
   ```yaml
   - name: Run tests
     run: npm test
   ```

4. **Environment variables** (add your vars):
   ```yaml
   env:
     VITE_API_URL: ${{ secrets.PROD_API_URL }}
     VITE_CUSTOM_VAR: ${{ secrets.CUSTOM_VAR }}
   ```

## Step 4: Configure Firebase for GitHub Actions

### 4.1 Ensure `firebase.json` is Configured

Your `firebase.json` should have hosting configuration:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 4.2 Add `.firebaserc` (Optional)

```json
{
  "projects": {
    "default": "your-project-id",
    "production": "your-prod-project-id",
    "staging": "your-staging-project-id"
  }
}
```

## Step 5: Set Up Branch Protection (Optional)

### 5.1 Require Checks Before Merge

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select the preview deployment check

### 5.2 Require Approvals

1. Enable "Require pull request reviews before merging"
2. Set number of required approvals

## Step 6: Test the Workflows

### 6.1 Test PR Preview Workflow

```bash
# Create a new branch
git checkout -b test-preview

# Make a change
echo "test" >> README.md

# Commit and push
git add README.md
git commit -m "test: preview deployment"
git push origin test-preview

# Create PR on GitHub
# The preview workflow should trigger automatically
```

Check:
- ✅ Workflow runs successfully
- ✅ Preview URL is posted as comment on PR
- ✅ Preview site loads correctly
- ✅ Closing PR deletes the channel

### 6.2 Test Production Workflow

```bash
# Merge PR to main or push directly
git checkout main
git merge test-preview
git push origin main

# The production workflow should trigger
```

Check:
- ✅ Workflow runs successfully
- ✅ Production site updates
- ✅ No errors in deployment

## Step 7: Monitor Deployments

### 7.1 View Workflow Runs

1. Go to **Actions** tab in GitHub
2. Click on a workflow run to see details
3. Check each step for errors

### 7.2 View Deployment Logs

1. Click on a specific step
2. Expand the logs
3. Look for deployment URL

### 7.3 Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Hosting**
4. View deployment history and channels

## Troubleshooting

### Problem: "Error: HTTP Error: 403, Missing necessary permission"

**Cause:** Service account lacks permissions

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **IAM & Admin** → **IAM**
4. Find your service account
5. Add role: **Firebase Hosting Admin**

### Problem: "Error: Cannot understand what targets to deploy"

**Cause:** `firebase.json` configuration issue

**Solution:**
Ensure `firebase.json` has proper hosting config:
```json
{
  "hosting": {
    "public": "dist"
  }
}
```

### Problem: Preview channel not deleting on PR close

**Cause:** Workflow not triggering on PR close

**Solution:**
Ensure workflow has `closed` trigger:
```yaml
on:
  pull_request:
    types: [opened, reopened, synchronize, closed]
```

### Problem: "Resource not accessible by integration"

**Cause:** GitHub token lacks permissions

**Solution:**
Add permissions to workflow:
```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write
```

### Problem: Build fails with "ENOENT: no such file or directory"

**Cause:** Missing dependencies or wrong build path

**Solution:**
1. Ensure `npm ci` runs before build
2. Check build output directory matches `firebase.json`
3. Verify build command in `package.json`

### Problem: Environment variables not working

**Cause:** Secrets not properly configured

**Solution:**
1. Check secret names match exactly
2. Ensure secrets are set at repository level (not organization)
3. Re-check secret values (no extra spaces)

## Advanced Configuration

### Multiple Environments with Different Projects

```yaml
jobs:
  deploy:
    strategy:
      matrix:
        environment: [staging, production]
    runs-on: ubuntu-latest
    environment: ${{ matrix.environment }}
    steps:
      # ... build steps ...
      - name: Deploy
        env:
          FIREBASE_PROJECT: ${{ matrix.environment == 'production' && secrets.PROD_PROJECT_ID || secrets.STAGING_PROJECT_ID }}
        run: |
          firebase deploy --only hosting --project $FIREBASE_PROJECT
```

### Deployment Approvals (GitHub Environments)

1. Go to **Settings** → **Environments**
2. Create environment (e.g., "production")
3. Add **Required reviewers**
4. Add **Wait timer** if needed
5. Reference in workflow:
   ```yaml
   jobs:
     deploy:
       environment:
         name: production
         url: https://example.com
   ```

### Slack/Discord Notifications

Add notification step:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
    text: 'Deployment ${{ job.status }}'
```

### Lighthouse CI Integration

```yaml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --upload.target=temporary-public-storage
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

## Best Practices

1. **Use Environments**
   - Configure GitHub Environments for staging/production
   - Add required approvals for production
   - Set environment-specific secrets

2. **Protect Secrets**
   - Never log secrets
   - Use GitHub Secrets, not hardcoded values
   - Rotate service account keys regularly

3. **Test Before Production**
   - Always deploy to preview/staging first
   - Run automated tests
   - Manual QA on preview

4. **Monitor Deployments**
   - Set up alerts for failed deployments
   - Monitor error rates after deployment
   - Keep deployment logs

5. **Version Control**
   - Tag production releases
   - Document deployment in commit messages
   - Keep changelog updated

6. **Optimize Workflows**
   - Cache dependencies
   - Use matrix builds for multiple environments
   - Parallelize independent steps

7. **Security**
   - Use least-privilege service accounts
   - Enable branch protection
   - Require code reviews
   - Scan for vulnerabilities

## Resources

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Firebase GitHub Action:** https://github.com/FirebaseExtended/action-hosting-deploy
- **Firebase CLI:** https://firebase.google.com/docs/cli
- **Service Accounts:** https://cloud.google.com/iam/docs/service-accounts

## Next Steps

After setup:
1. ✅ Test all workflows
2. ✅ Document your deployment process
3. ✅ Train team on workflow
4. ✅ Set up monitoring and alerts
5. ✅ Create runbook for common issues
6. ✅ Schedule regular secret rotation
