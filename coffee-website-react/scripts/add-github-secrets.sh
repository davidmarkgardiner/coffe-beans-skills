#!/bin/bash

# Add GitHub Secrets via CLI
# This script uses GitHub CLI (gh) to add secrets to your repository

set -e

echo "========================================="
echo "GitHub Secrets - CLI Setup Tool"
echo "========================================="
echo ""
echo "This script will help you add all required secrets to GitHub"
echo "using the GitHub CLI (gh command)."
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

echo "✅ GitHub CLI is installed"
echo ""

# Check authentication
echo "Checking GitHub authentication..."
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub."
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ Authenticated with GitHub"
echo ""

# Get repository
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
if [ -z "$REPO" ]; then
    echo "❌ Not in a GitHub repository or unable to detect repo."
    echo "Make sure you're in the repository directory."
    exit 1
fi

echo "Repository: $REPO"
echo ""

echo "========================================="
echo "Adding Secrets to GitHub"
echo "========================================="
echo ""
echo "You'll be prompted to enter each secret value."
echo "For multi-line values (like JSON), paste the entire content."
echo ""
read -p "Press Enter to continue..."
echo ""

# Function to add a secret
add_secret() {
    local secret_name=$1
    local secret_description=$2
    local is_multiline=$3

    echo "----------------------------------------"
    echo "Secret: $secret_name"
    echo "Description: $secret_description"
    echo "----------------------------------------"

    if [ "$is_multiline" = "true" ]; then
        echo "This is a multi-line secret (like JSON)."
        echo "Paste the entire content, then press Ctrl+D when done:"
        echo ""
        secret_value=$(cat)
    else
        echo "Enter the value:"
        read -r secret_value
    fi

    if [ -z "$secret_value" ]; then
        echo "⚠️  Skipped (empty value)"
        echo ""
        return
    fi

    # Add the secret using gh CLI
    echo "$secret_value" | gh secret set "$secret_name" --repo="$REPO"

    if [ $? -eq 0 ]; then
        echo "✅ Added: $secret_name"
    else
        echo "❌ Failed to add: $secret_name"
    fi
    echo ""
}

# Add each secret
echo "Let's add all the required secrets..."
echo ""

# 1. FIREBASE_TOKEN
add_secret "FIREBASE_TOKEN" \
    "Firebase CI token (from 'firebase login:ci')" \
    false

# 2. FIREBASE_SERVICE_ACCOUNT
add_secret "FIREBASE_SERVICE_ACCOUNT" \
    "Firebase service account JSON (entire JSON content)" \
    true

# 3. FIREBASE_PROJECT_ID
add_secret "FIREBASE_PROJECT_ID" \
    "Firebase project ID (e.g., coffee-65c46)" \
    false

# 4. FIREBASE_API_KEY
add_secret "FIREBASE_API_KEY" \
    "Firebase API key from web app config" \
    false

# 5. FIREBASE_AUTH_DOMAIN
add_secret "FIREBASE_AUTH_DOMAIN" \
    "Firebase auth domain (e.g., coffee-65c46.firebaseapp.com)" \
    false

# 6. FIREBASE_STORAGE_BUCKET
add_secret "FIREBASE_STORAGE_BUCKET" \
    "Firebase storage bucket (e.g., coffee-65c46.firebasestorage.app)" \
    false

# 7. FIREBASE_MESSAGING_SENDER_ID
add_secret "FIREBASE_MESSAGING_SENDER_ID" \
    "Firebase messaging sender ID" \
    false

# 8. FIREBASE_APP_ID
add_secret "FIREBASE_APP_ID" \
    "Firebase app ID" \
    false

# 9. VITE_STRIPE_PUBLISHABLE_KEY
add_secret "VITE_STRIPE_PUBLISHABLE_KEY" \
    "Stripe publishable key (pk_test_... or pk_live_...)" \
    false

echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "All secrets have been added to your GitHub repository."
echo ""
echo "You can verify them at:"
echo "https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "Note: Secret values are hidden for security. You'll only see names."
echo ""
echo "Next steps:"
echo "1. Create a test branch and make a change"
echo "2. Open a pull request"
echo "3. Watch the preview deployment workflow run!"
echo ""
