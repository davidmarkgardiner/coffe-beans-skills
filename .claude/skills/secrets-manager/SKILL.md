---
name: secrets-manager
description: Secure secrets management using Teller and Google Cloud Secret Manager for any repository or device. Use this skill when setting up secret management, initializing .env files from cloud secrets, migrating secrets to Google Secret Manager, or ensuring secrets are properly git-ignored. Handles authentication, configuration, syncing, and uploading of secrets across development environments. (project)
---

# Secrets Manager

## Overview

This skill provides a complete workflow for managing application secrets using **Teller** and **Google Cloud Secret Manager (GSM)**. It enables secure, automated secret injection into `.env` files, ensuring secrets are never committed to version control while remaining easily accessible across any repository or device.

The skill handles the entire lifecycle: installing tools, authenticating with Google Cloud, creating Teller configurations, syncing secrets from GSM to local `.env` files, uploading existing secrets to GSM, and ensuring proper git protection.

## When to Use This Skill

Use this skill when:

- Setting up secret management for a new repository
- Initializing development environment on a new device
- Migrating secrets from `.env` files to Google Secret Manager
- Adding new secrets to an existing Teller configuration
- Ensuring `.env` files are properly protected from git commits
- Automating secret injection for team onboarding
- Rotating API keys and updating secrets in GSM

## Core Workflows

### Workflow 1: Initial Setup (New Repository or Device)

Use when setting up secret management from scratch or on a new machine.

**Steps:**

1. **Initialize Teller and authenticate with GCP**
   ```bash
   bash scripts/init_teller.sh
   ```
   This script:
   - Installs Teller (via Homebrew) if not present
   - Authenticates with Google Cloud (`gcloud auth application-default login`)
   - Enables Secret Manager API
   - Verifies GCP project configuration

2. **Create or copy Teller configuration**

   If starting fresh, create a `.teller` or `.teller.yml` file in the repository root. Use the template from `assets/.teller.template` as a reference:

   ```bash
   cp assets/.teller.template .teller
   ```

   Edit the configuration to match the project's GCP project ID and secret mappings. The template includes common patterns like:
   - Mapping GSM secret names (lowercase-hyphen format) to environment variables (UPPERCASE_UNDERSCORE)
   - Template mappings for MCP configuration files
   - Multiple secret groups organized by purpose

   **Key configuration elements:**
   ```yaml
   project: YOUR_GCP_PROJECT_ID

   providers:
     google_secretmanager:
       kind: google_secretmanager
       maps:
         - id: secrets
           path: projects/YOUR_GCP_PROJECT_ID
           keys:
             secret-name-in-gsm: ENV_VAR_NAME
   ```

3. **Sync secrets to local .env file**
   ```bash
   bash scripts/sync_secrets.sh
   ```
   This fetches all secrets from GSM and creates a `.env` file, automatically adding it to `.gitignore`.

4. **Verify git protection**

   The sync script automatically ensures `.env` is in `.gitignore`. To manually verify or add additional patterns, reference `assets/.gitignore.snippet` for comprehensive secret protection patterns.

### Workflow 2: Upload Existing Secrets to GSM

Use when migrating from local `.env` files to Google Secret Manager.

**Steps:**

1. **Ensure authentication** (if not already done)
   ```bash
   gcloud auth application-default login
   ```

2. **Upload secrets from .env to GSM**
   ```bash
   python3 scripts/upload_secrets.py .env
   ```

   This script:
   - Parses the `.env` file
   - Converts environment variable names to GSM format (UPPER_SNAKE → lower-kebab)
   - Creates new secrets or adds new versions to existing secrets
   - Outputs Teller configuration snippet for easy copy-paste

3. **Update .teller configuration**

   Copy the configuration snippet from the script output and add it to the `.teller` file. The script provides the exact `keys:` mapping needed.

4. **Test the configuration**
   ```bash
   teller show
   ```
   This displays all secrets that Teller will inject (without revealing values).

### Workflow 3: Adding a New Secret

Use when adding a new API key or credential to the project.

**Steps:**

1. **Create the secret in GSM**
   ```bash
   echo -n "your-secret-value" | gcloud secrets create secret-name --data-file=-
   ```

   Follow GSM naming conventions: lowercase with hyphens (e.g., `openai-api-key`)

2. **Add mapping to .teller configuration**

   Edit `.teller` or `.teller.yml` and add the mapping under the appropriate provider:
   ```yaml
   keys:
     secret-name: ENV_VAR_NAME
   ```

3. **Re-sync secrets**
   ```bash
   bash scripts/sync_secrets.sh
   ```

4. **Verify the secret**
   ```bash
   grep ENV_VAR_NAME .env
   ```

### Workflow 4: Rotating/Updating a Secret

Use when rotating API keys or updating secret values.

**Steps:**

1. **Add new version to GSM**
   ```bash
   echo -n "new-secret-value" | gcloud secrets versions add secret-name --data-file=-
   ```

2. **Re-sync to update local .env**
   ```bash
   bash scripts/sync_secrets.sh
   ```

3. **Verify the update**
   ```bash
   grep SECRET_NAME .env
   ```

   Note: GSM retains old versions for rollback. To destroy old versions:
   ```bash
   gcloud secrets versions destroy VERSION_NUMBER --secret=secret-name
   ```

### Workflow 5: Merging Existing .env with GSM Secrets

Use when you have an existing .env file with local variables that aren't in GSM yet, and you want to preserve them while syncing secrets from GSM.

**Steps:**

1. **Use the merge script**
   ```bash
   bash scripts/merge_env.sh
   ```

   This script:
   - Creates a backup of your existing .env file
   - Fetches secrets from GSM
   - Merges GSM secrets (taking precedence) with local variables
   - Preserves local variables that aren't in GSM

2. **Review merged .env**
   ```bash
   cat .env
   ```

3. **Upload any new local variables to GSM**
   ```bash
   python3 scripts/upload_secrets.py .env
   ```

4. **Update .teller configuration**

   Add the new secret mappings to your `.teller` file.

### Workflow 6: Cleaning Duplicate Variables

Use when your .env file has duplicate variable definitions (common after manual edits or merges).

**Steps:**

1. **Check for duplicates (dry run)**
   ```bash
   python3 scripts/clean_duplicates.py --dry-run .env
   ```

2. **Clean duplicates**
   ```bash
   python3 scripts/clean_duplicates.py .env
   ```

   This script:
   - Detects all duplicate variable definitions
   - Keeps the first occurrence of each variable
   - Removes subsequent duplicates
   - Creates a backup before making changes
   - Preserves comments and formatting

3. **Verify cleaned file**
   ```bash
   cat .env
   ```

## Automation and Integration

### Package.json Integration

For Node.js projects, add Teller sync to `postinstall` script:

```json
{
  "scripts": {
    "postinstall": "teller env > .env || true"
  }
}
```

The `|| true` prevents installation failures if Teller isn't configured yet.

### CI/CD Integration

For GitHub Actions, use Workload Identity Federation or service account keys:

```yaml
- name: Sync secrets
  run: |
    gcloud auth activate-service-account --key-file=${{ secrets.GCP_SA_KEY }}
    teller env > .env
```

### Docker Integration

Mount secrets at runtime instead of baking them into images:

```dockerfile
# Don't copy .env into images
RUN teller env > .env
```

Better: Use runtime injection:
```bash
teller run -- docker-compose up
```

## Common Commands Reference

### Teller Commands

```bash
# Show all configured secrets (without values)
teller show

# Run a command with secrets injected
teller run -- npm start

# Export secrets to .env file
teller env > .env

# Validate configuration
teller validate

# Show specific provider secrets
teller show google_secretmanager
```

### Google Secret Manager Commands

For comprehensive GSM CLI reference, see `references/gsm_commands.md`. Common operations:

```bash
# List all secrets
gcloud secrets list

# Get latest version of a secret
gcloud secrets versions access latest --secret=SECRET_NAME

# Create a secret
echo -n "value" | gcloud secrets create SECRET_NAME --data-file=-

# Update a secret (add new version)
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Delete a secret
gcloud secrets delete SECRET_NAME
```

## Naming Conventions

**Google Secret Manager:**
- Use lowercase with hyphens: `my-api-key`, `database-password`
- Must start with a letter
- Can contain letters, numbers, and hyphens

**Environment Variables:**
- Use uppercase with underscores: `MY_API_KEY`, `DATABASE_PASSWORD`
- Standard convention for .env files

**Teller Configuration:**
- Maps GSM names (left) to environment variable names (right)
- Example: `openai-api-key: OPENAI_API_KEY`

## Security Best Practices

1. **Never commit secrets to git**
   - Always verify `.env` files are in `.gitignore`
   - Use `assets/.gitignore.snippet` for comprehensive patterns
   - Check git history for accidentally committed secrets: `git log --all --full-history -- "**/.env"`

2. **Rotate secrets immediately if exposed**
   - If a secret is committed to git, assume it's compromised
   - Rotate the secret in GSM using Workflow 4
   - Consider rewriting git history if the secret was pushed

3. **Use least-privilege IAM permissions**
   - Grant `roles/secretmanager.secretAccessor` only to needed accounts
   - Use `roles/secretmanager.viewer` for read-only access
   - Avoid `roles/owner` or overly broad permissions

4. **Audit secret access**
   - Review secret access logs in GCP Console
   - Monitor for unexpected access patterns
   - Set up alerts for secret access

5. **Use environment-specific secrets**
   - Separate secrets for dev, staging, production
   - Use different GCP projects or namespacing
   - Example: `dev-openai-key`, `prod-openai-key`

## Troubleshooting

### "Teller not found"
**Solution:** Run `scripts/init_teller.sh` or manually install:
```bash
brew install teller
```

### "Permission denied" accessing secrets
**Solution:** Verify IAM permissions:
```bash
gcloud secrets get-iam-policy SECRET_NAME
```

Add accessor role if needed:
```bash
gcloud secrets add-iam-policy-binding SECRET_NAME \
    --member="user:YOUR_EMAIL" \
    --role="roles/secretmanager.secretAccessor"
```

### "Secret not found" in GSM
**Solution:** Verify the secret exists:
```bash
gcloud secrets list | grep SECRET_NAME
```

Create if missing:
```bash
echo -n "value" | gcloud secrets create SECRET_NAME --data-file=-
```

### .env file empty after sync
**Solution:** Check Teller configuration:
```bash
teller show
```

Verify secret mappings in `.teller` file match GSM secret names.

### Secrets committed to git accidentally
**Solution:**
1. Immediately rotate all exposed secrets (Workflow 4)
2. Remove from current files and commit
3. Consider rewriting git history if pushed to remote
4. Verify `.gitignore` includes `.env` patterns

### Duplicate variables in .env file
**Solution:**
1. Run the duplicate detection script:
   ```bash
   python3 scripts/clean_duplicates.py --dry-run .env
   ```
2. Review the duplicates found
3. Clean them up:
   ```bash
   python3 scripts/clean_duplicates.py .env
   ```
4. The script keeps the first occurrence and removes duplicates

### Teller can't find configuration
**Error:** `Error: cannot find configuration from current folder and up to root`

**Solution:**
- Ensure you're running teller from the directory containing `.teller` or `.teller.yml`
- Specify config explicitly: `teller --config .teller show`
- Check file permissions: `ls -la .teller`

### Some variables missing after sync
**Solution:**
1. Check if the variables are in your .teller configuration
2. Verify the secrets exist in GSM: `gcloud secrets list`
3. Use the merge script to preserve local variables:
   ```bash
   bash scripts/merge_env.sh
   ```
4. Upload missing variables to GSM:
   ```bash
   python3 scripts/upload_secrets.py .env
   ```
5. Update .teller configuration with new mappings

## Resources

### Scripts

- **`scripts/init_teller.sh`** - Initialize Teller, install dependencies, authenticate with GCP, enable APIs
- **`scripts/sync_secrets.sh`** - Fetch secrets from GSM to local `.env`, ensure git protection
- **`scripts/upload_secrets.py`** - Parse `.env` and upload secrets to GSM, generate Teller config snippet
- **`scripts/merge_env.sh`** - Merge existing .env variables with GSM secrets, preserving local variables
- **`scripts/clean_duplicates.py`** - Detect and remove duplicate variable definitions from .env files

### References

- **`references/teller_setup.md`** - Comprehensive Teller setup guide with examples and patterns
- **`references/gsm_commands.md`** - Complete Google Secret Manager CLI command reference
- **`references/lessons_learned.md`** - Real-world experiences, edge cases, and solutions from actual usage

### Assets

- **`assets/.teller.template`** - Example Teller configuration with common patterns
- **`assets/.env.example`** - Example .env file structure showing best practices
- **`assets/.gitignore.snippet`** - Git ignore patterns for secrets and credentials

## Summary Workflow Quick Reference

| Task | Command | Purpose |
|------|---------|---------|
| **Initial Setup** | `bash scripts/init_teller.sh` | Install, authenticate, configure |
| **Create Config** | `cp assets/.teller.template .teller` | Use template configuration |
| **Sync Secrets** | `bash scripts/sync_secrets.sh` | Fetch secrets to .env |
| **Merge Secrets** | `bash scripts/merge_env.sh` | Merge local vars with GSM |
| **Upload Secrets** | `python3 scripts/upload_secrets.py .env` | Push .env to GSM |
| **Clean Duplicates** | `python3 scripts/clean_duplicates.py .env` | Remove duplicate variables |
| **Add Secret** | `gcloud secrets create NAME --data-file=-` | Create new secret |
| **Update Secret** | `gcloud secrets versions add NAME --data-file=-` | Rotate secret |
| **Verify Setup** | `teller show` | List configured secrets |

## Additional Resources

- **Teller Documentation:** https://github.com/tellerops/teller
- **GCP Secret Manager:** https://cloud.google.com/secret-manager/docs
- **Teller Best Practices:** https://b-nova.com/en/home/content/secrets-management-with-teller/
