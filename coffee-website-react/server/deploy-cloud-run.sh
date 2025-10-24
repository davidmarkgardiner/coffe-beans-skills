#!/bin/bash
# Deploy Coffee Copilot Backend to Google Cloud Run

set -e  # Exit on error

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-coffee-65c46}"
SERVICE_NAME="coffee-copilot-backend"
REGION="${GCP_REGION:-us-central1}"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
MIN_INSTANCES="${MIN_INSTANCES:-0}"
MAX_INSTANCES="${MAX_INSTANCES:-10}"
MEMORY="${MEMORY:-512Mi}"
CPU="${CPU:-1}"
TIMEOUT="${TIMEOUT:-300}"

echo "================================================"
echo "Deploying Coffee Copilot Backend to Cloud Run"
echo "================================================"
echo "Project ID: ${PROJECT_ID}"
echo "Service Name: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "Image: ${IMAGE_NAME}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "Error: Not authenticated with gcloud"
    echo "Run: gcloud auth login"
    exit 1
fi

# Set the project
echo "Setting project to ${PROJECT_ID}..."
gcloud config set project "${PROJECT_ID}"

# Enable required APIs
echo ""
echo "Enabling required Google Cloud APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com

# Build the Docker image
echo ""
echo "Building Docker image..."
gcloud builds submit --tag "${IMAGE_NAME}" .

# Deploy to Cloud Run
echo ""
echo "Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
    --image "${IMAGE_NAME}" \
    --region "${REGION}" \
    --platform managed \
    --allow-unauthenticated \
    --min-instances "${MIN_INSTANCES}" \
    --max-instances "${MAX_INSTANCES}" \
    --memory "${MEMORY}" \
    --cpu "${CPU}" \
    --timeout "${TIMEOUT}" \
    --set-env-vars "NODE_ENV=production,PORT=8080" \
    --set-secrets "OPENAI_API_KEY=OPENAI_API_KEY:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest" \
    --port 8080

# Get the service URL
echo ""
echo "Deployment complete!"
echo ""
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --format "value(status.url)")
echo "Service URL: ${SERVICE_URL}"
echo ""
echo "================================================"
echo "Next Steps:"
echo "================================================"
echo "1. Test the health endpoint:"
echo "   curl ${SERVICE_URL}/api/health"
echo ""
echo "2. Add the following GitHub secret for your frontend:"
echo "   echo -n \"${SERVICE_URL}/api/chat\" | gh secret set VITE_COPILOT_API_URL"
echo ""
echo "3. Redeploy your frontend to use the new backend URL"
echo ""
echo "================================================"
