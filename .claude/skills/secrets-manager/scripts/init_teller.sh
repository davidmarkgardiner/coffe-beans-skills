#!/bin/bash
# Initialize Teller for secret management
# This script sets up Teller with Google Cloud Secret Manager

set -e

echo "🔐 Initializing Teller Secret Management"
echo "========================================"

# Check if Teller is installed
if ! command -v teller &> /dev/null; then
    echo "❌ Teller is not installed"
    echo "📦 Installing Teller via Homebrew..."
    brew install teller
fi

echo "✅ Teller is installed"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed"
    echo "📦 Please install gcloud CLI from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gcloud CLI is installed"

# Authenticate with Google Cloud
echo ""
echo "🔑 Authenticating with Google Cloud..."
echo "This will open a browser window for authentication."
gcloud auth application-default login

# Get the current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo ""
    echo "⚠️  No default GCP project set"
    echo "Please set your project ID:"
    read -p "Enter GCP Project ID: " PROJECT_ID
    gcloud config set project "$PROJECT_ID"
fi

echo ""
echo "📋 Using GCP Project: $PROJECT_ID"

# Enable Secret Manager API
echo ""
echo "🔧 Enabling Google Cloud Secret Manager API..."
gcloud services enable secretmanager.googleapis.com

echo ""
echo "✅ Teller initialization complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Create or edit your .teller configuration file"
echo "   2. Add your secrets to Google Secret Manager"
echo "   3. Run 'teller env > .env' to fetch secrets"
echo ""
echo "📚 For more information, see the references in this skill"
