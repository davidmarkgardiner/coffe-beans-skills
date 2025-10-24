#!/bin/bash

# Quick GitHub Secrets Setup
# Add secrets using environment variables or direct input

set -e

echo "Quick GitHub Secrets Setup"
echo "=========================="
echo ""

# Check gh CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not installed. Install from: https://cli.github.com/"
    exit 1
fi

# Check auth
if ! gh auth status &> /dev/null; then
    echo "❌ Run: gh auth login"
    exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
if [ -z "$REPO" ]; then
    echo "❌ Not in a GitHub repository"
    exit 1
fi

echo "Repository: $REPO"
echo ""

# Method 1: From environment variables (if set)
if [ -n "$FIREBASE_TOKEN" ]; then
    echo "$FIREBASE_TOKEN" | gh secret set FIREBASE_TOKEN
    echo "✅ FIREBASE_TOKEN"
fi

if [ -n "$FIREBASE_PROJECT_ID" ]; then
    echo "$FIREBASE_PROJECT_ID" | gh secret set FIREBASE_PROJECT_ID
    echo "✅ FIREBASE_PROJECT_ID"
fi

if [ -n "$FIREBASE_API_KEY" ]; then
    echo "$FIREBASE_API_KEY" | gh secret set FIREBASE_API_KEY
    echo "✅ FIREBASE_API_KEY"
fi

if [ -n "$FIREBASE_AUTH_DOMAIN" ]; then
    echo "$FIREBASE_AUTH_DOMAIN" | gh secret set FIREBASE_AUTH_DOMAIN
    echo "✅ FIREBASE_AUTH_DOMAIN"
fi

if [ -n "$FIREBASE_STORAGE_BUCKET" ]; then
    echo "$FIREBASE_STORAGE_BUCKET" | gh secret set FIREBASE_STORAGE_BUCKET
    echo "✅ FIREBASE_STORAGE_BUCKET"
fi

if [ -n "$FIREBASE_MESSAGING_SENDER_ID" ]; then
    echo "$FIREBASE_MESSAGING_SENDER_ID" | gh secret set FIREBASE_MESSAGING_SENDER_ID
    echo "✅ FIREBASE_MESSAGING_SENDER_ID"
fi

if [ -n "$FIREBASE_APP_ID" ]; then
    echo "$FIREBASE_APP_ID" | gh secret set FIREBASE_APP_ID
    echo "✅ FIREBASE_APP_ID"
fi

if [ -n "$VITE_STRIPE_PUBLISHABLE_KEY" ]; then
    echo "$VITE_STRIPE_PUBLISHABLE_KEY" | gh secret set VITE_STRIPE_PUBLISHABLE_KEY
    echo "✅ VITE_STRIPE_PUBLISHABLE_KEY"
fi

# For service account JSON, read from file
if [ -f "$FIREBASE_SERVICE_ACCOUNT_FILE" ]; then
    cat "$FIREBASE_SERVICE_ACCOUNT_FILE" | gh secret set FIREBASE_SERVICE_ACCOUNT
    echo "✅ FIREBASE_SERVICE_ACCOUNT"
elif [ -f "firebase-service-account.json" ]; then
    cat "firebase-service-account.json" | gh secret set FIREBASE_SERVICE_ACCOUNT
    echo "✅ FIREBASE_SERVICE_ACCOUNT"
fi

echo ""
echo "Done! Check: https://github.com/$REPO/settings/secrets/actions"
