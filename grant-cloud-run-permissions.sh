#!/bin/bash

# Grant Cloud Run Viewer permission to Firebase service account
# This allows Firebase Hosting deployments to verify Cloud Run services

PROJECT_ID="coffee-65c46"

# Extract service account email from the GitHub secret
# You'll need to get this from your FIREBASE_SERVICE_ACCOUNT secret
echo "Getting service account email from Firebase..."

# The service account is usually named like:
# github-actions@PROJECT_ID.iam.gserviceaccount.com
SERVICE_ACCOUNT="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Granting Cloud Run Viewer role to: $SERVICE_ACCOUNT"

# Grant Cloud Run Viewer role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/run.viewer" \
  --condition=None

echo "✅ Permissions granted!"
echo ""
echo "You can verify with:"
echo "gcloud projects get-iam-policy $PROJECT_ID --flatten=\"bindings[].members\" --filter=\"bindings.members:$SERVICE_ACCOUNT\""
