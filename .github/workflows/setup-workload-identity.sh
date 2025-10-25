#!/bin/bash
set -e

# Workload Identity Federation Setup Script for GitHub Actions
# This script automates the setup of Workload Identity Federation

echo "🔐 Setting up Workload Identity Federation for GitHub Actions"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: gh CLI is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Prompt for project ID if not set
if [ -z "$PROJECT_ID" ]; then
    read -p "Enter your GCP Project ID: " PROJECT_ID
fi

echo "Using Project ID: $PROJECT_ID"
echo ""

# Set variables
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
export POOL_NAME="github-actions-pool"
export PROVIDER_NAME="github-provider"
export SERVICE_ACCOUNT_NAME="github-actions-sa"
export REPO_OWNER="davidmarkgardiner"
export REPO_NAME="coffe-beans-skills"

echo "📋 Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Project Number: $PROJECT_NUMBER"
echo "  Pool Name: $POOL_NAME"
echo "  Provider Name: $PROVIDER_NAME"
echo "  Service Account: $SERVICE_ACCOUNT_NAME"
echo "  Repository: $REPO_OWNER/$REPO_NAME"
echo ""

read -p "Continue with setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "Step 1/7: Enabling required APIs..."
gcloud services enable iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  sts.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  --project="${PROJECT_ID}"

echo ""
echo "Step 2/7: Creating Workload Identity Pool..."
if gcloud iam workload-identity-pools describe "${POOL_NAME}" \
    --project="${PROJECT_ID}" \
    --location="global" &> /dev/null; then
    echo "  ℹ️  Pool already exists, skipping..."
else
    gcloud iam workload-identity-pools create "${POOL_NAME}" \
      --project="${PROJECT_ID}" \
      --location="global" \
      --display-name="GitHub Actions Pool"
    echo "  ✅ Pool created"
fi

echo ""
echo "Step 3/7: Creating Workload Identity Provider..."
if gcloud iam workload-identity-pools providers describe "${PROVIDER_NAME}" \
    --project="${PROJECT_ID}" \
    --location="global" \
    --workload-identity-pool="${POOL_NAME}" &> /dev/null; then
    echo "  ℹ️  Provider already exists, skipping..."
else
    gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_NAME}" \
      --project="${PROJECT_ID}" \
      --location="global" \
      --workload-identity-pool="${POOL_NAME}" \
      --display-name="GitHub Provider" \
      --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
      --attribute-condition="assertion.repository_owner == '${REPO_OWNER}'" \
      --issuer-uri="https://token.actions.githubusercontent.com"
    echo "  ✅ Provider created"
fi

echo ""
echo "Step 4/7: Creating Service Account..."
export SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

if gcloud iam service-accounts describe "${SERVICE_ACCOUNT_EMAIL}" \
    --project="${PROJECT_ID}" &> /dev/null; then
    echo "  ℹ️  Service account already exists, skipping..."
else
    gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
      --project="${PROJECT_ID}" \
      --display-name="GitHub Actions Service Account"
    echo "  ✅ Service account created"
fi

echo ""
echo "Step 5/7: Granting permissions to Service Account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.admin" \
  --condition=None > /dev/null

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None > /dev/null

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/storage.admin" \
  --condition=None > /dev/null

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None > /dev/null

echo "  ✅ Permissions granted"

echo ""
echo "Step 6/7: Allowing GitHub to impersonate Service Account..."
gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT_EMAIL}" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${REPO_OWNER}/${REPO_NAME}" \
  > /dev/null

echo "  ✅ Workload Identity binding created"

echo ""
echo "Step 7/7: Setting GitHub Secrets..."
export WORKLOAD_IDENTITY_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"

echo "  Setting GCP_PROJECT_ID..."
echo -n "${PROJECT_ID}" | gh secret set GCP_PROJECT_ID

echo "  Setting GCP_WORKLOAD_IDENTITY_PROVIDER..."
echo -n "${WORKLOAD_IDENTITY_PROVIDER}" | gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER

echo "  Setting GCP_SERVICE_ACCOUNT..."
echo -n "${SERVICE_ACCOUNT_EMAIL}" | gh secret set GCP_SERVICE_ACCOUNT

echo "  ✅ GitHub secrets configured"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Summary:"
echo "  Workload Identity Provider: ${WORKLOAD_IDENTITY_PROVIDER}"
echo "  Service Account: ${SERVICE_ACCOUNT_EMAIL}"
echo ""
echo "🧪 To test the setup, run:"
echo "  gh workflow run deploy-backend.yml"
echo ""
echo "Or push a change to trigger deployment automatically."
