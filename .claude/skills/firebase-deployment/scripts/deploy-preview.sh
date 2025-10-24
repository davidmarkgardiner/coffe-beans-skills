#!/bin/bash

# Firebase Preview Channel Deployment Script
# Usage: ./deploy-preview.sh <channel-id> [expiration] [build-command]
#
# Examples:
#   ./deploy-preview.sh staging
#   ./deploy-preview.sh feature-auth 14d
#   ./deploy-preview.sh pr-123 7d "npm run build:staging"

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Check if channel ID is provided
if [ -z "$1" ]; then
    print_error "Channel ID is required"
    echo "Usage: $0 <channel-id> [expiration] [build-command]"
    echo ""
    echo "Examples:"
    echo "  $0 staging"
    echo "  $0 feature-auth 14d"
    echo "  $0 pr-123 7d \"npm run build:staging\""
    exit 1
fi

CHANNEL_ID=$1
EXPIRATION=${2:-7d}
BUILD_COMMAND=${3:-"npm run build"}

# Validate channel ID format
if ! [[ "$CHANNEL_ID" =~ ^[a-z0-9-]+$ ]]; then
    print_error "Invalid channel ID: $CHANNEL_ID"
    echo "Channel ID must contain only lowercase letters, numbers, and hyphens"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed"
    echo "Install with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
print_info "Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    print_error "Not logged in to Firebase"
    echo "Run: firebase login"
    exit 1
fi

print_success "Authenticated with Firebase"

# Get current project
CURRENT_PROJECT=$(firebase use 2>&1 | grep "Active Project:" | sed 's/.*Active Project: //' | sed 's/ .*//')
if [ -z "$CURRENT_PROJECT" ]; then
    print_error "No Firebase project selected"
    echo "Run: firebase use <project-id>"
    exit 1
fi

print_info "Using Firebase project: $CURRENT_PROJECT"

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    print_error "firebase.json not found in current directory"
    echo "Run: firebase init"
    exit 1
fi

print_success "Found firebase.json"

# Build the application
print_info "Building application..."
echo "Running: $BUILD_COMMAND"

if eval "$BUILD_COMMAND"; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Check if build output directory exists
PUBLIC_DIR=$(node -p "require('./firebase.json').hosting.public || 'public'" 2>/dev/null || echo "dist")
if [ ! -d "$PUBLIC_DIR" ]; then
    print_error "Build output directory '$PUBLIC_DIR' not found"
    echo "Check the 'public' field in firebase.json"
    exit 1
fi

# Check if build output has content
if [ ! -f "$PUBLIC_DIR/index.html" ]; then
    print_warning "index.html not found in $PUBLIC_DIR"
    echo "The build may not have completed successfully"
fi

print_success "Build output directory: $PUBLIC_DIR"

# Deploy to preview channel
print_info "Deploying to preview channel: $CHANNEL_ID"
echo "Expiration: $EXPIRATION"

DEPLOY_OUTPUT=$(firebase hosting:channel:deploy "$CHANNEL_ID" --expires "$EXPIRATION" 2>&1)

if [ $? -eq 0 ]; then
    print_success "Deployment successful!"

    # Extract and display the preview URL
    PREVIEW_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^[:space:]]*' | head -1)

    if [ -n "$PREVIEW_URL" ]; then
        echo ""
        print_success "Preview URL: $PREVIEW_URL"
        echo ""

        # Copy URL to clipboard if available
        if command -v pbcopy &> /dev/null; then
            echo "$PREVIEW_URL" | pbcopy
            print_info "URL copied to clipboard (macOS)"
        elif command -v xclip &> /dev/null; then
            echo "$PREVIEW_URL" | xclip -selection clipboard
            print_info "URL copied to clipboard (Linux)"
        elif command -v clip.exe &> /dev/null; then
            echo "$PREVIEW_URL" | clip.exe
            print_info "URL copied to clipboard (Windows/WSL)"
        fi

        # Ask if user wants to open in browser
        read -p "Open preview URL in browser? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v open &> /dev/null; then
                open "$PREVIEW_URL"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "$PREVIEW_URL"
            elif command -v start &> /dev/null; then
                start "$PREVIEW_URL"
            else
                print_warning "Could not detect browser launcher"
            fi
        fi
    fi

    # Display channel info
    echo ""
    print_info "Channel Information:"
    firebase hosting:channel:list | grep -E "(Channel ID|$CHANNEL_ID)"

else
    print_error "Deployment failed"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi
