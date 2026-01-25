# Google Secret Manager CLI Commands Reference

Quick reference for common Google Cloud Secret Manager operations.

## Prerequisites

```bash
# Authenticate with Google Cloud
gcloud auth application-default login

# Set your project
gcloud config set project PROJECT_ID

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com
```

## Creating Secrets

```bash
# Create a secret from stdin
echo -n "my-secret-value" | gcloud secrets create SECRET_NAME --data-file=-

# Create a secret from a file
gcloud secrets create SECRET_NAME --data-file=/path/to/file

# Create a secret with replication
gcloud secrets create SECRET_NAME --replication-policy="automatic"
```

## Accessing Secrets

```bash
# Get the latest version of a secret
gcloud secrets versions access latest --secret=SECRET_NAME

# Get a specific version
gcloud secrets versions access 1 --secret=SECRET_NAME

# List all secrets
gcloud secrets list

# Describe a secret
gcloud secrets describe SECRET_NAME
```

## Updating Secrets

```bash
# Add a new version (update)
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Update from file
gcloud secrets versions add SECRET_NAME --data-file=/path/to/file
```

## Deleting Secrets

```bash
# Delete a specific version
gcloud secrets versions destroy VERSION_NUMBER --secret=SECRET_NAME

# Delete entire secret
gcloud secrets delete SECRET_NAME
```

## IAM and Permissions

```bash
# Grant access to a secret
gcloud secrets add-iam-policy-binding SECRET_NAME \
    --member="user:email@example.com" \
    --role="roles/secretmanager.secretAccessor"

# Grant access to a service account
gcloud secrets add-iam-policy-binding SECRET_NAME \
    --member="serviceAccount:SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# View IAM policy
gcloud secrets get-iam-policy SECRET_NAME
```

## Bulk Operations

```bash
# List all secret names
gcloud secrets list --format="value(name)"

# Export all secrets to files
for secret in $(gcloud secrets list --format="value(name)"); do
    gcloud secrets versions access latest --secret="$secret" > "${secret}.txt"
done
```

## Naming Conventions

- Secret names in GSM: lowercase with hyphens (e.g., `my-api-key`)
- Environment variables: uppercase with underscores (e.g., `MY_API_KEY`)
- Teller handles the mapping between these conventions

## Common Patterns

### Create secret from environment variable
```bash
echo -n "$MY_SECRET" | gcloud secrets create my-secret --data-file=-
```

### Rotate a secret
```bash
# Add new version (old versions remain)
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Optionally destroy old version
gcloud secrets versions destroy 1 --secret=SECRET_NAME
```

### Copy secret to another project
```bash
# Get secret from source project
VALUE=$(gcloud secrets versions access latest --secret=SECRET_NAME --project=SOURCE_PROJECT)

# Create in destination project
echo -n "$VALUE" | gcloud secrets create SECRET_NAME --data-file=- --project=DEST_PROJECT
```

## Troubleshooting

### Permission denied errors
```bash
# Check if API is enabled
gcloud services list --enabled | grep secretmanager

# Check IAM permissions
gcloud projects get-iam-policy PROJECT_ID \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:YOUR_EMAIL"
```

### Secret not found
```bash
# Verify secret exists
gcloud secrets list --filter="name:SECRET_NAME"

# Check in all projects
gcloud projects list --format="value(projectId)" | while read project; do
    echo "Project: $project"
    gcloud secrets list --project="$project" --filter="name:SECRET_NAME"
done
```
