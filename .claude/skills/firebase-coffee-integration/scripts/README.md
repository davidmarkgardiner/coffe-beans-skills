# Firebase Verification Scripts

Automated scripts for verifying Firebase configuration and deployment.

## Available Scripts

### 1. verify-firebase-deployment.sh

Comprehensive post-deployment verification script that checks all Firebase services.

**Usage:**
```bash
bash scripts/verify-firebase-deployment.sh
```

**What it checks:**
- ✓ Firebase project is correctly selected
- ✓ Web app exists in project
- ✓ Authentication is enabled
- ✓ Firestore database(s) are created
- ✓ Firestore rules compile successfully
- ✓ Hosting deployment is live (HTTP 200)
- ✓ Firebase APIs are enabled (requires gcloud CLI)
- ✓ Firebase config is embedded in build files

**Example output:**
```
🔍 Verifying Firebase Deployment for: coffee-65c46
================================================

✓ Project: coffee-65c46
Checking web app... ✓ Found 1 web app(s)
Checking Authentication... ✓ Enabled
Checking Firestore databases... ✓ Found 2 database(s)
Checking Firestore rules... ✓ Valid
Checking hosting deployment... ✓ Live at https://coffee-65c46.web.app
Checking enabled Firebase APIs... ✓ 10 Firebase APIs enabled
Checking build configuration... ✓ Firebase config embedded in build

================================================
🎉 Deployment verification complete!

📊 Summary:
  Project: coffee-65c46
  Hosting: https://coffee-65c46.web.app
  Status: All checks passed ✓
```

**Exit codes:**
- `0` - All checks passed
- `1` - One or more checks failed

**Use in CI/CD:**
```bash
# Add to your CI/CD pipeline
npm run build && \
firebase deploy --only hosting --token "$FIREBASE_TOKEN" && \
bash scripts/verify-firebase-deployment.sh || exit 1
```

---

### 2. firebase-status.sh

Service status dashboard showing current state of all Firebase services.

**Usage:**
```bash
bash scripts/firebase-status.sh
```

**What it shows:**
- 🔐 Authentication status and user count
- 📊 Firestore databases and their details
- 🌐 Hosting deployment status and URL
- ⚙️ Enabled Firebase APIs
- 🔗 Quick links to Firebase Console

**Example output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Firebase Project Status Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project: coffee-65c46

🔐 Authentication
─────────────────────────────────────────
  Status: ✓ Enabled
  Users: 0 registered

📊 Firestore Database
─────────────────────────────────────────
  Database: (default)
  Database: coffee

🌐 Hosting
─────────────────────────────────────────
  Status: ✓ Live
  URL: https://coffee-65c46.web.app
  Last Deploy: 2025-10-20 15:29:02

⚙️  Enabled APIs
─────────────────────────────────────────
  ✓ firebase.googleapis.com
  ✓ firestore.googleapis.com
  ✓ firebasestorage.googleapis.com
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quick Links:
  Console: https://console.firebase.google.com/project/coffee-65c46
  Auth: https://console.firebase.google.com/project/coffee-65c46/authentication
  Firestore: https://console.firebase.google.com/project/coffee-65c46/firestore
  Hosting: https://console.firebase.google.com/project/coffee-65c46/hosting
```

**When to use:**
- Before starting development (verify setup)
- Before deployment (check service status)
- After deployment (confirm everything works)
- Debugging issues (quick service overview)
- Team handoffs (show current state)

---

## Prerequisites

### Required Tools

1. **Firebase CLI** (required)
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **curl** (usually pre-installed)
   ```bash
   # Test if available
   curl --version
   ```

3. **gcloud CLI** (optional, for API checks)
   ```bash
   # Install from: https://cloud.google.com/sdk/docs/install
   gcloud --version
   ```

### Project Setup

Ensure you're in a Firebase project directory:
```bash
# Check current project
firebase use

# If not set, select project
firebase use <project-id>
```

## Integration with Development Workflow

### Local Development
```bash
# Before starting work
bash scripts/firebase-status.sh

# Start development
npm run dev
```

### Pre-Deployment
```bash
# Build project
npm run build

# Verify build
ls -lh dist/

# Check config embedded
grep -q "$(firebase use | tail -1)" dist/assets/*.js && echo "✓" || echo "✗"
```

### Deployment
```bash
# Deploy
firebase deploy --only hosting

# Verify deployment
bash scripts/verify-firebase-deployment.sh
```

### Continuous Integration
```yaml
# Example GitHub Actions workflow
- name: Build
  run: npm run build

- name: Deploy to Firebase
  run: firebase deploy --only hosting --token ${{ secrets.FIREBASE_TOKEN }}

- name: Verify Deployment
  run: bash scripts/verify-firebase-deployment.sh
```

## Troubleshooting

### Script not executable
```bash
chmod +x scripts/verify-firebase-deployment.sh
chmod +x scripts/firebase-status.sh
```

### "Project not found" error
```bash
# Make sure you're logged in
firebase login

# Select the correct project
firebase use <project-id>
```

### "curl: command not found"
```bash
# macOS
brew install curl

# Ubuntu/Debian
sudo apt-get install curl

# Windows (use Git Bash or WSL)
```

### "gcloud: command not found"
The gcloud CLI is optional. If not installed, the scripts will skip API verification.

To install: https://cloud.google.com/sdk/docs/install

## Advanced Usage

### Custom Project Verification
```bash
# Verify specific project
firebase use staging
bash scripts/verify-firebase-deployment.sh

firebase use production
bash scripts/verify-firebase-deployment.sh
```

### Scheduled Status Checks
```bash
# Add to crontab for daily status check
0 9 * * * cd /path/to/project && bash scripts/firebase-status.sh >> firebase-status.log
```

### Integration with Monitoring
```bash
# Send status to monitoring service
STATUS=$(bash scripts/firebase-status.sh)
curl -X POST https://monitoring-service.com/status \
  -H "Content-Type: text/plain" \
  -d "$STATUS"
```

## Related Documentation

- **Pre-Deployment Checklist**: `../references/pre-deployment-checklist.md`
- **CLI Commands Reference**: `../references/cli-commands-reference.md`
- **Lessons Learned**: `../LESSONS_LEARNED.md`
- **Main Skill Documentation**: `../SKILL.md`

## Support

For issues or improvements to these scripts:
1. Check the Lessons Learned document for known issues
2. Review the CLI Commands Reference for command details
3. Check Firebase CLI documentation: https://firebase.google.com/docs/cli

## Version History

- **v1.0** (2025-10-20) - Initial verification scripts
  - `verify-firebase-deployment.sh` - Comprehensive deployment verification
  - `firebase-status.sh` - Service status dashboard
