#!/bin/bash

# Firebase Deployment - GitHub Secrets Setup Helper
# This script helps you gather the required values for GitHub Secrets

set -e

echo "========================================="
echo "Firebase Deployment Setup Helper"
echo "========================================="
echo ""
echo "This script will help you collect the values needed for GitHub Secrets."
echo "You'll need to manually add these to your GitHub repository."
echo ""
echo "Repository Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "========================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI is installed"
echo ""

# Check authentication
echo "Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not authenticated with Firebase."
    echo "Run: firebase login"
    exit 1
fi

echo "✅ Authenticated with Firebase"
echo ""

# Get project ID
PROJECT_ID="coffee-65c46"
echo "Using Firebase Project: $PROJECT_ID"
echo ""

# Generate Firebase CI token
echo "========================================="
echo "1. FIREBASE_TOKEN"
echo "========================================="
echo ""
echo "Generating Firebase CI token..."
echo "This token is used for the cleanup job in GitHub Actions."
echo ""
echo "Run this command and copy the output:"
echo ""
echo "  firebase login:ci"
echo ""
read -p "Press Enter after you've copied the token..."
echo ""

# Firebase Service Account
echo "========================================="
echo "2. FIREBASE_SERVICE_ACCOUNT"
echo "========================================="
echo ""
echo "To get your Firebase Service Account JSON:"
echo ""
echo "1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/settings/serviceaccounts/adminsdk"
echo "2. Click 'Generate new private key'"
echo "3. Copy the ENTIRE JSON content"
echo "4. Add it as a GitHub Secret named 'FIREBASE_SERVICE_ACCOUNT'"
echo ""
read -p "Press Enter after you've copied the service account JSON..."
echo ""

# Firebase Project ID
echo "========================================="
echo "3. FIREBASE_PROJECT_ID"
echo "========================================="
echo ""
echo "Value: $PROJECT_ID"
echo ""
read -p "Press Enter to continue..."
echo ""

# Firebase Configuration
echo "========================================="
echo "4. Firebase Web App Configuration"
echo "========================================="
echo ""
echo "To get your Firebase web app configuration:"
echo ""
echo "1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/settings/general"
echo "2. Scroll down to 'Your apps' section"
echo "3. Click on your web app (or create one if it doesn't exist)"
echo "4. Copy the configuration values"
echo ""
echo "You need these secrets:"
echo "  - FIREBASE_API_KEY"
echo "  - FIREBASE_AUTH_DOMAIN (usually: $PROJECT_ID.firebaseapp.com)"
echo "  - FIREBASE_STORAGE_BUCKET (usually: $PROJECT_ID.firebasestorage.app)"
echo "  - FIREBASE_MESSAGING_SENDER_ID"
echo "  - FIREBASE_APP_ID"
echo ""
read -p "Press Enter after you've copied these values..."
echo ""

# Stripe Configuration
echo "========================================="
echo "5. VITE_STRIPE_PUBLISHABLE_KEY"
echo "========================================="
echo ""
echo "To get your Stripe publishable key:"
echo ""
echo "1. Go to: https://dashboard.stripe.com/apikeys"
echo "2. Copy the 'Publishable key' (starts with pk_test_ or pk_live_)"
echo "3. Add it as a GitHub Secret named 'VITE_STRIPE_PUBLISHABLE_KEY'"
echo ""
echo "Note: Use test key (pk_test_) for development, live key (pk_live_) for production"
echo ""
read -p "Press Enter after you've copied the Stripe key..."
echo ""

# Summary
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Summary of required GitHub Secrets:"
echo ""
echo "  1. FIREBASE_TOKEN"
echo "  2. FIREBASE_SERVICE_ACCOUNT"
echo "  3. FIREBASE_PROJECT_ID = $PROJECT_ID"
echo "  4. FIREBASE_API_KEY"
echo "  5. FIREBASE_AUTH_DOMAIN"
echo "  6. FIREBASE_STORAGE_BUCKET"
echo "  7. FIREBASE_MESSAGING_SENDER_ID"
echo "  8. FIREBASE_APP_ID"
echo "  9. VITE_STRIPE_PUBLISHABLE_KEY"
echo ""
echo "Add these at:"
echo "https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo ""
echo "Once added, your GitHub Actions workflows will automatically:"
echo "  - Deploy preview channels when you open a PR"
echo "  - Deploy to production when you push to main"
echo ""
echo "========================================="
echo ""
echo "Test your setup by creating a pull request!"
echo ""
