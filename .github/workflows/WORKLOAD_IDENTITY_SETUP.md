# Workload Identity Federation Setup for GitHub Actions

This guide walks you through setting up Workload Identity Federation to allow GitHub Actions to authenticate with Google Cloud without using service account keys.

## Prerequisites

- Google Cloud project with billing enabled
- `gcloud` CLI installed and authenticated
- GitHub repository admin access

## Step 1: Set Environment Variables

```bash
export PROJECT_ID="your-gcp-project-id"
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
export POOL_NAME="github-actions-pool"
export PROVIDER_NAME="github-provider"
export SERVICE_ACCOUNT_NAME="github-actions-sa"
export REPO_OWNER="davidmarkgardiner"  # Your GitHub username/org
export REPO_NAME="coffe-beans-skills"  # Your repository name
```

## Step 2: Enable Required APIs

```bash
gcloud services enable iamcredentials.googleapis.com \
  --project="${PROJECT_ID}"

gcloud services enable cloudresourcemanager.googleapis.com \
  --project="${PROJECT_ID}"

gcloud services enable sts.googleapis.com \
  --project="${PROJECT_ID}"

gcloud services enable run.googleapis.com \
  --project="${PROJECT_ID}"

gcloud services enable secretmanager.googleapis.com \
  --project="${PROJECT_ID}"
```

## Step 3: Create Workload Identity Pool

```bash
gcloud iam workload-identity-pools create "${POOL_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

## Step 4: Create Workload Identity Provider

```bash
gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="${POOL_NAME}" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == '${REPO_OWNER}'" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

## Step 5: Create Service Account (or use existing)

```bash
# Create service account
gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
  --project="${PROJECT_ID}" \
  --display-name="GitHub Actions Service Account"

# Get the service account email
export SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
```

## Step 6: Grant Permissions to Service Account

```bash
# Cloud Run Admin (to deploy services)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.admin"

# Service Account User (to act as service account)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# Storage Admin (for Container Registry)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/storage.admin"

# Secret Manager Secret Accessor (to read secrets)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"
```

## Step 7: Allow GitHub to Impersonate Service Account

```bash
gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT_EMAIL}" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${REPO_OWNER}/${REPO_NAME}"
```

## Step 8: Get Workload Identity Provider Resource Name

```bash
export WORKLOAD_IDENTITY_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"

echo "Workload Identity Provider: ${WORKLOAD_IDENTITY_PROVIDER}"
echo "Service Account Email: ${SERVICE_ACCOUNT_EMAIL}"
```

## Step 9: Set GitHub Secrets

Set these secrets in your GitHub repository (Settings > Secrets and variables > Actions):

```bash
gh secret set GCP_PROJECT_ID --body "${PROJECT_ID}"
gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER --body "${WORKLOAD_IDENTITY_PROVIDER}"
gh secret set GCP_SERVICE_ACCOUNT --body "${SERVICE_ACCOUNT_EMAIL}"
```

## Verification

To verify the setup works, trigger the workflow:

```bash
# Manual trigger
gh workflow run deploy-backend.yml

# Or push a change to the backend
git commit --allow-empty -m "test: trigger deployment"
git push
```

## Troubleshooting

### Error: "the GitHub Action workflow must specify exactly one of..."

This means the secrets are not set correctly. Verify:
```bash
gh secret list
```

### Error: "Permission denied"

Check service account permissions:
```bash
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT_EMAIL}"
```

### Error: "Workload identity pool does not exist"

Verify the pool was created:
```bash
gcloud iam workload-identity-pools list --location=global --project=$PROJECT_ID
```

## Security Benefits

- No long-lived service account keys
- Automatic credential rotation
- Scoped to specific repository
- Can be restricted to specific branches
- Auditable via Cloud Audit Logs

## References

- [GitHub Actions + Workload Identity Federation](https://github.com/google-github-actions/auth#workload-identity-federation-through-a-service-account)
- [Workload Identity Federation Setup](https://cloud.google.com/iam/docs/workload-identity-federation-with-other-clouds)
