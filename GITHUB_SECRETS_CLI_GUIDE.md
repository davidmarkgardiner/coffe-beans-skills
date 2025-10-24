# Adding GitHub Secrets via CLI

You have **3 methods** to add secrets using the GitHub CLI:

## Method 1: Interactive Script (Recommended)

This script prompts you for each value one by one:

```bash
cd coffee-website-react
./scripts/add-github-secrets.sh
```

**What it does:**
- Prompts for each secret
- Handles multi-line values (like JSON)
- Shows progress as secrets are added
- Perfect for first-time setup

## Method 2: One-Line Commands

Add secrets individually using `gh` commands:

```bash
# Simple values
echo "your-value-here" | gh secret set SECRET_NAME

# From a file (for JSON)
cat service-account.json | gh secret set FIREBASE_SERVICE_ACCOUNT
```

**Examples:**

```bash
# Add Firebase token
echo "1//abc123..." | gh secret set FIREBASE_TOKEN

# Add project ID
echo "coffee-65c46" | gh secret set FIREBASE_PROJECT_ID

# Add API key
echo "AIza..." | gh secret set FIREBASE_API_KEY

# Add auth domain
echo "coffee-65c46.firebaseapp.com" | gh secret set FIREBASE_AUTH_DOMAIN

# Add storage bucket
echo "coffee-65c46.firebasestorage.app" | gh secret set FIREBASE_STORAGE_BUCKET

# Add messaging sender ID
echo "607433247301" | gh secret set FIREBASE_MESSAGING_SENDER_ID

# Add app ID
echo "1:607433247301:web:..." | gh secret set FIREBASE_APP_ID

# Add Stripe key
echo "pk_test_..." | gh secret set VITE_STRIPE_PUBLISHABLE_KEY

# Add service account from file
cat path/to/service-account.json | gh secret set FIREBASE_SERVICE_ACCOUNT
```

## Method 3: Quick Script with Environment Variables

If you already have the values in environment variables:

```bash
# Set environment variables first
export FIREBASE_TOKEN="1//abc123..."
export FIREBASE_PROJECT_ID="coffee-65c46"
export FIREBASE_API_KEY="AIza..."
# ... etc

# Then run the quick script
cd coffee-website-react
./scripts/add-secrets-quick.sh
```

## Recommended Workflow

**For first-time setup:**
```bash
cd coffee-website-react
./scripts/add-github-secrets.sh
```

**For adding one secret:**
```bash
echo "value" | gh secret set SECRET_NAME
```

**For updating a secret:**
```bash
# Same command - it will overwrite
echo "new-value" | gh secret set SECRET_NAME
```

## List All Secrets

See what secrets are already set:

```bash
gh secret list
```

Output:
```
FIREBASE_API_KEY            Updated 2025-10-24
FIREBASE_APP_ID             Updated 2025-10-24
FIREBASE_SERVICE_ACCOUNT    Updated 2025-10-24
...
```

## Delete a Secret

```bash
gh secret delete SECRET_NAME
```

## View Secret in Browser

```bash
# Opens the secrets page in your browser
gh browse -- settings/secrets/actions
```

Or visit directly:
https://github.com/davidmarkgardiner/coffe-beans-skills/settings/secrets/actions

## Complete List of Required Secrets

```
1. FIREBASE_TOKEN                  - From: firebase login:ci
2. FIREBASE_SERVICE_ACCOUNT        - JSON from Firebase Console
3. FIREBASE_PROJECT_ID             - coffee-65c46
4. FIREBASE_API_KEY                - From Firebase web app config
5. FIREBASE_AUTH_DOMAIN            - coffee-65c46.firebaseapp.com
6. FIREBASE_STORAGE_BUCKET         - coffee-65c46.firebasestorage.app
7. FIREBASE_MESSAGING_SENDER_ID    - From Firebase web app config
8. FIREBASE_APP_ID                 - From Firebase web app config
9. VITE_STRIPE_PUBLISHABLE_KEY     - From Stripe Dashboard
```

## Tips

1. **For JSON values** (like service account):
   ```bash
   cat service-account.json | gh secret set FIREBASE_SERVICE_ACCOUNT
   ```

2. **Using heredoc** for multi-line values:
   ```bash
   gh secret set FIREBASE_SERVICE_ACCOUNT <<EOF
   {
     "type": "service_account",
     "project_id": "coffee-65c46",
     ...
   }
   EOF
   ```

3. **From clipboard** (macOS):
   ```bash
   pbpaste | gh secret set SECRET_NAME
   ```

4. **Check if secret exists** before adding:
   ```bash
   gh secret list | grep FIREBASE_TOKEN
   ```

## Troubleshooting

**Not authenticated:**
```bash
gh auth login
```

**Wrong repository:**
```bash
# Make sure you're in the repo directory
cd /path/to/coffe-beans-skills
gh repo view  # Verify current repo
```

**Permission denied:**
- Ensure you have admin access to the repository
- Check: Repository Settings → Secrets and variables → Actions

## After Adding Secrets

1. **Verify they're set:**
   ```bash
   gh secret list
   ```

2. **Test the workflow:**
   - Create a test branch
   - Make a change to `coffee-website-react/`
   - Open a PR
   - Watch GitHub Actions run

3. **View in browser:**
   ```bash
   gh browse -- settings/secrets/actions
   ```

---

**Quick Start:**
```bash
cd coffee-website-react
./scripts/add-github-secrets.sh
```
