#!/bin/bash

# Firebase Production Deployment Script
# Deploys to production with safety checks and optional staging verification
#
# Usage: ./deploy-production.sh [options]
#
# Options:
#   --skip-build        Skip the build step
#   --skip-staging      Skip staging deployment verification
#   --yes              Auto-approve deployment (use with caution)
#   --build-cmd <cmd>   Custom build command (default: npm run build)
#
# Examples:
#   ./deploy-production.sh
#   ./deploy-production.sh --skip-staging
#   ./deploy-production.sh --build-cmd "npm run build:prod"

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Default options
SKIP_BUILD=false
SKIP_STAGING=false
AUTO_APPROVE=false
BUILD_COMMAND="npm run build"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-staging)
            SKIP_STAGING=true
            shift
            ;;
        --yes|-y)
            AUTO_APPROVE=true
            shift
            ;;
        --build-cmd)
            BUILD_COMMAND="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --skip-build        Skip the build step"
            echo "  --skip-staging      Skip staging deployment verification"
            echo "  --yes, -y           Auto-approve deployment"
            echo "  --build-cmd <cmd>   Custom build command"
            echo "  --help, -h          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

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

print_header() {
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}  ${1}${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Check prerequisites
print_header "Pre-deployment Checks"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed"
    echo "Install with: npm install -g firebase-tools"
    exit 1
fi
print_success "Firebase CLI installed"

# Check if logged in
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
print_info "Firebase project: $CURRENT_PROJECT"

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    print_error "firebase.json not found"
    exit 1
fi
print_success "firebase.json found"

# Check git status
if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
    if [[ -n $(git status -s) ]]; then
        print_warning "Git working directory has uncommitted changes"
        git status -s
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "Git working directory is clean"
    fi

    CURRENT_BRANCH=$(git branch --show-current)
    print_info "Current branch: $CURRENT_BRANCH"

    if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
        print_warning "Not on main/master branch"
        read -p "Deploy from branch '$CURRENT_BRANCH'? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

echo ""

# Stage to staging first (unless skipped)
if [ "$SKIP_STAGING" = false ]; then
    print_header "Staging Deployment"

    print_info "First deploying to staging for verification..."

    if [ "$SKIP_BUILD" = false ]; then
        print_info "Building application..."
        echo "Running: $BUILD_COMMAND"

        if eval "$BUILD_COMMAND"; then
            print_success "Build completed"
        else
            print_error "Build failed"
            exit 1
        fi
    fi

    # Deploy to staging
    print_info "Deploying to staging channel..."
    if firebase hosting:channel:deploy staging --expires 1d > /dev/null 2>&1; then
        STAGING_URL=$(firebase hosting:channel:list | grep staging | awk '{print $2}')
        print_success "Deployed to staging"
        echo ""
        print_info "Staging URL: $STAGING_URL"
        echo ""

        # Prompt to verify staging
        print_warning "Please verify the staging deployment before continuing"
        read -p "Open staging URL in browser? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v open &> /dev/null; then
                open "$STAGING_URL"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "$STAGING_URL"
            fi
        fi

        echo ""
        read -p "Has staging been verified and approved for production? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "Production deployment cancelled"
            exit 0
        fi
    else
        print_error "Staging deployment failed"
        exit 1
    fi
else
    # Build if not skipped
    if [ "$SKIP_BUILD" = false ]; then
        print_header "Building Application"

        print_info "Running: $BUILD_COMMAND"

        if eval "$BUILD_COMMAND"; then
            print_success "Build completed"
        else
            print_error "Build failed"
            exit 1
        fi
    fi
fi

echo ""

# Verify build output
PUBLIC_DIR=$(node -p "require('./firebase.json').hosting.public || 'public'" 2>/dev/null || echo "dist")
if [ ! -d "$PUBLIC_DIR" ]; then
    print_error "Build output directory '$PUBLIC_DIR' not found"
    exit 1
fi

if [ ! -f "$PUBLIC_DIR/index.html" ]; then
    print_warning "index.html not found in $PUBLIC_DIR"
fi

print_success "Build output verified: $PUBLIC_DIR"

echo ""
print_header "Production Deployment"

# Final confirmation
print_warning "You are about to deploy to PRODUCTION"
echo ""
print_info "Project: $CURRENT_PROJECT"
print_info "Build directory: $PUBLIC_DIR"
echo ""

if [ "$AUTO_APPROVE" = false ]; then
    read -p "Are you absolutely sure you want to deploy to production? (yes/no) " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_warning "Production deployment cancelled"
        exit 0
    fi
fi

# Deploy to production
print_info "Deploying to production..."

DEPLOY_START=$(date +%s)

if firebase deploy --only hosting; then
    DEPLOY_END=$(date +%s)
    DEPLOY_DURATION=$((DEPLOY_END - DEPLOY_START))

    echo ""
    print_success "Production deployment successful!"
    print_info "Deployment took ${DEPLOY_DURATION} seconds"

    # Get production URL
    PROD_URL=$(firebase hosting:site:get 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
    if [ -z "$PROD_URL" ]; then
        PROD_URL="https://${CURRENT_PROJECT}.web.app"
    fi

    echo ""
    print_success "Production URL: $PROD_URL"
    echo ""

    # Post-deployment checklist
    print_header "Post-Deployment Checklist"
    echo "Please verify the following:"
    echo "  [ ] Site loads correctly"
    echo "  [ ] Authentication works"
    echo "  [ ] API endpoints respond"
    echo "  [ ] No console errors"
    echo "  [ ] Mobile responsive"
    echo "  [ ] Check monitoring/analytics"
    echo ""

    # Offer to open production URL
    read -p "Open production URL in browser? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v open &> /dev/null; then
            open "$PROD_URL"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$PROD_URL"
        fi
    fi

    # Log deployment
    if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
        COMMIT_HASH=$(git rev-parse --short HEAD)
        echo ""
        print_info "Deployed commit: $COMMIT_HASH"

        # Create deployment tag (optional)
        read -p "Create git tag for this deployment? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            TAG_NAME="deploy-$(date +%Y%m%d-%H%M%S)"
            git tag -a "$TAG_NAME" -m "Production deployment"
            print_success "Created tag: $TAG_NAME"

            read -p "Push tag to remote? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git push origin "$TAG_NAME"
                print_success "Tag pushed to remote"
            fi
        fi
    fi

else
    echo ""
    print_error "Production deployment failed"
    exit 1
fi
