# Firebase CLI Commands Reference

Complete reference of useful Firebase CLI commands for managing your coffee website deployment.

## Project Management

### List Projects
```bash
# List all Firebase projects
firebase projects:list

# Show current project
firebase use

# Switch to a different project
firebase use <project-id>

# Add project alias
firebase use --add
```

### Web App Management
```bash
# List all apps in project
firebase apps:list

# Create new web app
firebase apps:create WEB "App Name"

# Get SDK configuration
firebase apps:sdkconfig WEB <app-id>

# Get SDK config as JSON
firebase apps:sdkconfig WEB <app-id> --out firebase-config.json
```

## Authentication

### Verify Auth Status
```bash
# Check if Auth is enabled
firebase auth:export /tmp/auth-check.json

# View auth export
cat /tmp/auth-check.json

# Export all users (backup)
firebase auth:export users-backup.json --format=json

# Import users (restore)
firebase auth:import users-backup.json --hash-algo=SCRYPT
```

### Auth Management (requires Firebase Admin)
```bash
# Delete user
firebase auth:users:delete <user-id>

# List users
firebase auth:users:list
```

## Firestore Database

### Database Management
```bash
# List all databases
firebase firestore:databases:list

# Get database details
firebase firestore:databases:get "(default)"

# Get named database details
firebase firestore:databases:get "coffee"

# Create new database (requires Console)
# Can't be done via CLI - use Firebase Console
```

### Data Operations
```bash
# Export Firestore data
firebase firestore:export gs://your-bucket/backup

# Import Firestore data
firebase firestore:import gs://your-bucket/backup

# Delete all documents in collection (careful!)
firebase firestore:delete --all-collections --recursive
```

### Rules Management
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Dry-run rules (test without deploying)
firebase deploy --only firestore:rules --dry-run

# Get current rules
firebase firestore:rules get

# Test rules locally
firebase emulators:start --only firestore
```

### Indexes
```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# List deployed indexes
firebase firestore:indexes list

# Create index (usually done via Console or auto-prompted)
```

## Cloud Storage

### Storage Management
```bash
# Deploy storage rules
firebase deploy --only storage:rules

# Get storage bucket info
firebase storage:buckets:list
```

## Hosting

### Deployment
```bash
# Deploy hosting only
firebase deploy --only hosting

# Deploy specific hosting site
firebase deploy --only hosting:<site-id>

# Deploy with message
firebase deploy --only hosting -m "Deploy message"
```

### Hosting Status
```bash
# List hosting sites
firebase hosting:sites:list

# Get site details
firebase hosting:sites:get <site-id>

# List hosting channels (preview, live)
firebase hosting:channel:list

# Create preview channel
firebase hosting:channel:create <channel-name>

# Deploy to preview channel
firebase hosting:channel:deploy <channel-name>
```

### Hosting History
```bash
# List recent deployments
firebase hosting:releases:list

# Rollback to previous version
firebase hosting:rollback
```

## Multi-Service Deployment

### Deploy Multiple Services
```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules,hosting

# Deploy with targets
firebase deploy --only hosting:production

# Deploy without prompts (CI/CD)
firebase deploy --non-interactive --token "$FIREBASE_TOKEN"
```

## Firebase Emulators

### Start Emulators
```bash
# Start all emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only firestore,auth

# Start with UI
firebase emulators:start --import=./emulator-data --export-on-exit

# Kill emulators
firebase emulators:kill
```

### Emulator Data
```bash
# Export emulator data
firebase emulators:export ./emulator-data

# Import emulator data
firebase emulators:start --import=./emulator-data
```

## CI/CD & Automation

### Login Methods
```bash
# Interactive login
firebase login

# Login for CI/CD
firebase login:ci

# Use token in CI/CD
firebase deploy --token "$FIREBASE_TOKEN"

# Logout
firebase logout
```

### Non-Interactive Deployment
```bash
# Full deployment without prompts
firebase deploy --non-interactive --force

# Deploy with project specified
firebase deploy --project <project-id>
```

## Verification Commands

### Quick Service Checks
```bash
# Check Authentication
firebase auth:export /tmp/check.json 2>&1 | grep -q "Exporting" && echo "✓ Auth enabled" || echo "✗ Auth disabled"

# Check Firestore
firebase firestore:databases:list

# Check Hosting
firebase hosting:sites:list

# Check current project
firebase use
```

### Deployment Verification
```bash
# Get project ID
PROJECT_ID=$(firebase use 2>&1 | tail -1)

# Verify site is live
curl -I https://${PROJECT_ID}.web.app

# Check HTTP status
curl -s -o /dev/null -w "%{http_code}" https://${PROJECT_ID}.web.app
```

## Google Cloud Platform (gcloud)

### API Management
```bash
# List enabled APIs
gcloud services list --enabled --project=<project-id>

# Enable Firebase APIs
gcloud services enable firebase.googleapis.com --project=<project-id>
gcloud services enable firestore.googleapis.com --project=<project-id>
gcloud services enable firebasestorage.googleapis.com --project=<project-id>

# Filter Firebase services
gcloud services list --enabled --project=<project-id> | grep -E "(firebase|firestore|storage)"
```

## Troubleshooting Commands

### Debug Mode
```bash
# Enable debug logging
firebase --debug deploy

# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools

# Clear cache
firebase logout && firebase login
```

### Configuration Check
```bash
# Show current config
cat .firebaserc
cat firebase.json

# Validate firebase.json
firebase deploy --dry-run

# Check environment
echo $GOOGLE_APPLICATION_CREDENTIALS
```

## Useful Combinations

### Complete Verification Flow
```bash
# 1. Check project
firebase use

# 2. Verify services
firebase apps:list
firebase firestore:databases:list
firebase hosting:sites:list

# 3. Test rules
firebase deploy --only firestore:rules --dry-run

# 4. Deploy
firebase deploy --only hosting,firestore:rules

# 5. Verify live
curl -I https://$(firebase use | tail -1).web.app
```

### Fresh Deploy
```bash
# Complete fresh deployment
npm run build && \
firebase deploy --only firestore:rules && \
firebase deploy --only hosting && \
bash scripts/verify-firebase-deployment.sh
```

### Emergency Rollback
```bash
# Rollback hosting to previous version
firebase hosting:rollback

# Verify rollback
firebase hosting:releases:list --limit 5
```

## Custom Scripts

### Get All Project Info
```bash
#!/bin/bash
PROJECT_ID=$(firebase use | tail -1)
echo "Project: $PROJECT_ID"
echo ""
echo "Apps:"
firebase apps:list
echo ""
echo "Databases:"
firebase firestore:databases:list
echo ""
echo "Hosting:"
firebase hosting:sites:list
```

### Quick Deploy Script
```bash
#!/bin/bash
set -e
npm run build
firebase deploy --only hosting
curl -I https://$(firebase use | tail -1).web.app | grep "200 OK" && echo "✓ Deployed successfully"
```

## Cheat Sheet

```bash
# Most common commands
firebase login                          # Authenticate
firebase use <project-id>              # Select project
npm run build                          # Build app
firebase deploy --only hosting         # Deploy to hosting
firebase deploy --only firestore:rules # Deploy security rules
firebase hosting:channel:list          # Check deployment status
bash scripts/firebase-status.sh        # Service overview
```

## Environment Variables

### For CI/CD
```bash
# Generate token
firebase login:ci

# Set in CI/CD environment
export FIREBASE_TOKEN="your-token-here"

# Use in deployment
firebase deploy --token "$FIREBASE_TOKEN" --non-interactive
```

### For Scripts
```bash
# Get project ID programmatically
PROJECT_ID=$(firebase use 2>&1 | tail -1 | xargs)

# Get hosting URL
HOSTING_URL="https://${PROJECT_ID}.web.app"

# Check if command exists
command -v gcloud &> /dev/null && echo "gcloud installed" || echo "gcloud not found"
```

## Pro Tips

1. **Always use `--dry-run`** when testing new rules or configurations
2. **Use aliases** for multiple environments (dev, staging, prod)
3. **Keep tokens secure** - never commit them to git
4. **Use emulators** for local development to avoid production costs
5. **Automate verification** with scripts after every deployment
6. **Monitor logs** in Firebase Console after deployment
7. **Set up billing alerts** to avoid unexpected charges

## Additional Resources

- **Firebase CLI Reference**: https://firebase.google.com/docs/cli
- **Firestore Security Rules**: https://firebase.google.com/docs/firestore/security/get-started
- **Firebase Hosting**: https://firebase.google.com/docs/hosting
- **Firebase Emulators**: https://firebase.google.com/docs/emulator-suite

---

**Quick Reference Card**

| Task | Command |
|------|---------|
| Check project | `firebase use` |
| List databases | `firebase firestore:databases:list` |
| Deploy hosting | `firebase deploy --only hosting` |
| Deploy rules | `firebase deploy --only firestore:rules` |
| Check Auth | `firebase auth:export /tmp/test.json` |
| Verify deployment | `bash scripts/verify-firebase-deployment.sh` |
| Service status | `bash scripts/firebase-status.sh` |
| Rollback | `firebase hosting:rollback` |
