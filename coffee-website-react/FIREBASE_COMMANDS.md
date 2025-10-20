# Firebase CLI Commands - Quick Reference

## 🔥 Setup Complete!

Your Firebase configuration was automated using these CLI commands:

### What Was Executed

```bash
# 1. Listed available Firebase projects
firebase projects:list

# 2. Created web app in coffee-65c46 project
firebase apps:create WEB "Coffee Website" --project coffee-65c46

# 3. Retrieved SDK configuration
firebase apps:sdkconfig WEB 1:607433247301:web:115973512fd32baea4b12c --project coffee-65c46

# 4. Deployed Firestore security rules
firebase deploy --only firestore:rules --project coffee-65c46
```

## 📋 Useful Firebase CLI Commands

### Project Management

```bash
# List all projects
firebase projects:list

# Select project
firebase use coffee-65c46

# View current project
firebase projects:list

# View project info
firebase projects:info
```

### App Management

```bash
# List apps in project
firebase apps:list --project coffee-65c46

# Get app config
firebase apps:sdkconfig WEB APP_ID

# Create new web app
firebase apps:create WEB "App Name" --project PROJECT_ID
```

### Deployment

```bash
# Deploy everything
firebase deploy

# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Deploy hosting only
firebase deploy --only hosting

# Deploy storage rules only
firebase deploy --only storage

# Deploy to specific project
firebase deploy --project coffee-65c46
```

### Firestore

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Delete all data in Firestore (DANGEROUS!)
firebase firestore:delete --all-collections
```

### Hosting

```bash
# Deploy hosting
firebase deploy --only hosting

# View hosting URL
firebase hosting:sites:list

# Disable hosting
firebase hosting:disable
```

### Authentication

```bash
# List auth users
firebase auth:export users.json --project coffee-65c46

# Import auth users
firebase auth:import users.json --project coffee-65c46
```

### Functions (if you add them later)

```bash
# Deploy functions
firebase deploy --only functions

# View function logs
firebase functions:log

# Delete function
firebase functions:delete FUNCTION_NAME
```

### Local Development

```bash
# Start Firebase emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only firestore,auth

# Export emulator data
firebase emulators:export ./emulator-data

# Import emulator data
firebase emulators:start --import ./emulator-data
```

### Debugging

```bash
# Enable debug mode
firebase --debug deploy

# View logs
firebase functions:log

# Check Firebase status
firebase status
```

## 🚀 Common Workflows

### Initial Setup (Already Done!)
```bash
firebase projects:list
firebase apps:create WEB "Coffee Website" --project coffee-65c46
firebase apps:sdkconfig WEB [APP_ID] --project coffee-65c46
firebase deploy --only firestore:rules --project coffee-65c46
```

### Deploy Changes
```bash
# After updating firestore.rules
firebase deploy --only firestore:rules

# After building website
npm run build
firebase deploy --only hosting

# Deploy everything
firebase deploy
```

### Test Locally with Emulators
```bash
# Install emulators
firebase init emulators

# Start emulators
firebase emulators:start

# Update .env.local to use emulators
# VITE_USE_FIREBASE_EMULATORS=true
```

### Update Environment Variables
```bash
# Get latest config
firebase apps:sdkconfig WEB 1:607433247301:web:115973512fd32baea4b12c

# Update .env.local manually or via script
```

## 🔄 Automated Setup Script

Want to automate this for future projects? Here's the script:

```bash
#!/bin/bash
# auto-setup-firebase.sh

PROJECT_ID="coffee-65c46"
APP_NAME="Coffee Website"

echo "Setting up Firebase..."

# Create web app
APP_INFO=$(firebase apps:create WEB "$APP_NAME" --project $PROJECT_ID --json)
APP_ID=$(echo $APP_INFO | jq -r '.appId')

# Get SDK config
CONFIG=$(firebase apps:sdkconfig WEB $APP_ID --project $PROJECT_ID --json)

# Extract values and write to .env.local
echo "# Firebase Configuration" > .env.local
echo "VITE_FIREBASE_API_KEY=$(echo $CONFIG | jq -r '.apiKey')" >> .env.local
echo "VITE_FIREBASE_AUTH_DOMAIN=$(echo $CONFIG | jq -r '.authDomain')" >> .env.local
echo "VITE_FIREBASE_PROJECT_ID=$(echo $CONFIG | jq -r '.projectId')" >> .env.local
echo "VITE_FIREBASE_STORAGE_BUCKET=$(echo $CONFIG | jq -r '.storageBucket')" >> .env.local
echo "VITE_FIREBASE_MESSAGING_SENDER_ID=$(echo $CONFIG | jq -r '.messagingSenderId')" >> .env.local
echo "VITE_FIREBASE_APP_ID=$(echo $CONFIG | jq -r '.appId')" >> .env.local
echo "VITE_FIREBASE_MEASUREMENT_ID=$(echo $CONFIG | jq -r '.measurementId')" >> .env.local

# Deploy rules
firebase deploy --only firestore:rules --project $PROJECT_ID

echo "✅ Firebase setup complete!"
```

## 📚 Resources

- **Firebase CLI Docs**: https://firebase.google.com/docs/cli
- **Your Project Console**: https://console.firebase.google.com/project/coffee-65c46
- **Setup Guide**: `FIREBASE_CLI_SETUP_COMPLETE.md`

## ⚡ Pro Tips

1. **Use aliases** for quick deployment:
   ```bash
   alias fdeploy='firebase deploy'
   alias flog='firebase functions:log'
   alias femulate='firebase emulators:start'
   ```

2. **Test rules locally** before deploying:
   ```bash
   firebase emulators:start --only firestore
   # Test in browser with emulator
   ```

3. **Backup before major changes**:
   ```bash
   firebase firestore:delete --all-collections # CAREFUL!
   # Better: use emulators for testing
   ```

4. **Use `.firebaserc` for multiple environments**:
   ```json
   {
     "projects": {
       "default": "coffee-65c46",
       "staging": "coffee-staging",
       "production": "coffee-prod"
     }
   }
   ```

   Then deploy with: `firebase use staging && firebase deploy`

---

**Your Firebase project is fully configured via CLI! 🎉**

Project: `coffee-65c46`
App ID: `1:607433247301:web:115973512fd32baea4b12c`
