# Secrets Manager Scripts

This directory contains scripts for managing secrets with Teller and Google Cloud Secret Manager.

## Scripts Overview

### init_teller.sh
**Purpose:** Initialize Teller and authenticate with Google Cloud Platform

**Usage:**
```bash
bash scripts/init_teller.sh
```

**What it does:**
- Checks if Teller is installed, installs via Homebrew if missing
- Authenticates with Google Cloud using `gcloud auth application-default login`
- Enables Google Secret Manager API
- Verifies GCP project configuration

**When to use:**
- First-time setup on a new machine
- After installing a fresh OS
- When setting up a new team member

---

### sync_secrets.sh
**Purpose:** Fetch all secrets from Google Secret Manager and write to .env file

**Usage:**
```bash
bash scripts/sync_secrets.sh [env-file]

# Examples:
bash scripts/sync_secrets.sh           # Uses .env
bash scripts/sync_secrets.sh .env.dev  # Uses .env.dev
```

**What it does:**
- Validates Teller is installed
- Checks for .teller configuration file
- Runs `teller env` to fetch all secrets from GSM
- Writes secrets to specified .env file
- Ensures .env is added to .gitignore

**When to use:**
- Fresh checkout of a repository
- After updating secrets in GSM
- When .env file is missing or corrupted
- Initial setup after creating .teller configuration

**⚠️ Warning:** This overwrites the target .env file. Use `merge_env.sh` if you have local variables to preserve.

---

### upload_secrets.py
**Purpose:** Upload secrets from .env file to Google Secret Manager

**Usage:**
```bash
python3 scripts/upload_secrets.py <path-to-env-file>

# Examples:
python3 scripts/upload_secrets.py .env
python3 scripts/upload_secrets.py coffee-website-react/.env.local
```

**What it does:**
- Reads environment variables from the specified .env file
- Converts variable names from UPPER_SNAKE_CASE to lower-kebab-case for GSM
- Creates new secrets or adds new versions to existing secrets in GSM
- Outputs a .teller configuration snippet for easy copy-paste

**When to use:**
- Migrating from local .env to GSM
- Adding new secrets to an existing GSM setup
- Bulk uploading secrets from a backup
- Initial population of GSM with project secrets

**Output example:**
```
📤 Uploading secrets to Google Secret Manager
==================================================
📋 Project: 240676728422

📦 Found 33 secrets in .env

   Creating: stripe-secret-key
   Updating: openai-api-key
   ...

✅ Successfully uploaded 33/33 secrets

📝 Add these mappings to your .teller configuration:
[configuration snippet]
```

---

### merge_env.sh
**Purpose:** Merge existing .env variables with secrets from GSM, preserving local variables

**Usage:**
```bash
bash scripts/merge_env.sh [env-file]

# Examples:
bash scripts/merge_env.sh           # Uses .env
bash scripts/merge_env.sh .env.dev  # Uses .env.dev
```

**What it does:**
- Creates a timestamped backup of existing .env file
- Fetches secrets from GSM using Teller
- Merges GSM secrets (taking precedence) with local variables
- Preserves local variables that don't exist in GSM
- Shows which local variables were kept

**When to use:**
- Working with existing projects that have local variables
- After adding new secrets to GSM but wanting to keep local config
- When syncing would lose important local variables
- Updating from GSM while preserving developer-specific settings

**Example output:**
```
🔄 Merging existing .env with GSM secrets
==========================================
💾 Backed up existing .env to: .env.backup.20250123_143022
📥 Fetching secrets from Google Secret Manager...
🔀 Merging secrets from GSM with local variables...
   ➕ Keeping local variable: ENGINEER_NAME
   ➕ Keeping local variable: LOCAL_DEV_PORT

✅ Successfully merged secrets to .env
```

---

### clean_duplicates.py
**Purpose:** Detect and remove duplicate variable definitions from .env files

**Usage:**
```bash
# Dry run (check for duplicates without making changes)
python3 scripts/clean_duplicates.py --dry-run <path-to-env-file>

# Clean duplicates
python3 scripts/clean_duplicates.py <path-to-env-file>

# Examples:
python3 scripts/clean_duplicates.py --dry-run .env
python3 scripts/clean_duplicates.py .env
```

**What it does:**
- Parses .env file to find duplicate variable definitions
- Reports all duplicates with line numbers
- Keeps the first occurrence of each variable
- Removes subsequent duplicates
- Creates a backup before making changes (.env.backup)
- Preserves comments and empty lines

**When to use:**
- After manual edits to .env files
- After merging or resolving conflicts
- When troubleshooting unexpected variable values
- Regular maintenance/cleanup
- Before committing changes to ensure clean .env

**Example output:**
```
🧹 Cleaning duplicate environment variables
==================================================
🔍 Found duplicates in .env:
   OPENAI_API_KEY: found on lines [1, 24]
   ELEVENLABS_API_KEY: found on lines [4, 21]

💾 Backup created: .env.backup

   🗑️  Removing duplicate OPENAI_API_KEY (line 24)
   🗑️  Removing duplicate ELEVENLABS_API_KEY (line 21)

✅ Cleaned 2 duplicate(s)
   Original file: .env.backup
   Cleaned file: .env
```

---

## Common Workflows

### 1. Fresh Setup (New Machine or Repository)
```bash
# Initialize Teller and authenticate
bash scripts/init_teller.sh

# Ensure .teller configuration exists
# (Copy from assets if needed)
cp assets/.teller.template .teller
# Edit .teller with your GCP project ID

# Sync all secrets
bash scripts/sync_secrets.sh
```

### 2. Migrate Existing Project to GSM
```bash
# Initialize Teller
bash scripts/init_teller.sh

# Upload existing secrets to GSM
python3 scripts/upload_secrets.py .env

# Copy the output configuration snippet to .teller file
# Edit .teller with the mappings

# Test the configuration
teller --config .teller show

# Verify secrets sync correctly
bash scripts/merge_env.sh
```

### 3. Add New Secret to Existing Setup
```bash
# Add to .env locally first
echo "NEW_API_KEY=value" >> .env

# Upload to GSM
python3 scripts/upload_secrets.py .env

# Add mapping to .teller configuration
# keys:
#   new-api-key: NEW_API_KEY

# Verify it works
teller --config .teller show | grep NEW_API_KEY
```

### 4. Clean Up .env File
```bash
# Check for duplicates
python3 scripts/clean_duplicates.py --dry-run .env

# Clean if needed
python3 scripts/clean_duplicates.py .env

# Verify result
cat .env
```

### 5. Update Existing Secrets
```bash
# Update in GSM
echo -n "new-value" | gcloud secrets versions add secret-name --data-file=-

# Sync to local .env
bash scripts/sync_secrets.sh

# Or use merge to preserve local variables
bash scripts/merge_env.sh
```

---

## Script Dependencies

### Required Tools
- **Teller** - Install via `init_teller.sh` or manually with `brew install teller`
- **gcloud CLI** - Install from https://cloud.google.com/sdk/docs/install
- **Python 3** - Pre-installed on most systems
- **bash** - Pre-installed on macOS/Linux

### Required Permissions
- GCP Project access
- `roles/secretmanager.secretAccessor` - To read secrets
- `roles/secretmanager.admin` - To create/update secrets (for upload_secrets.py)

---

## Troubleshooting

### "Teller not found"
Run `bash scripts/init_teller.sh` to install Teller

### "Permission denied" when accessing secrets
Check IAM permissions in GCP Console:
```bash
gcloud secrets get-iam-policy SECRET_NAME
```

### "Error: cannot find configuration"
Ensure you're running from the directory containing `.teller` or use:
```bash
teller --config .teller show
```

### Duplicates not detected
Ensure the file has actual duplicate definitions (same variable name with `=` on multiple lines)

### Upload fails with authentication error
Re-authenticate with GCP:
```bash
gcloud auth application-default login
```

---

## Best Practices

1. **Always backup before making changes**
   - Scripts create backups automatically
   - Keep backups until changes are verified

2. **Use dry-run modes when available**
   - `--dry-run` flag shows what will happen without making changes

3. **Run from repository root**
   - Scripts expect to be run from the directory containing `.teller`

4. **Keep .teller in version control**
   - Helps team members sync secrets easily
   - Documents which secrets are needed

5. **Never commit .env files**
   - Use `.gitignore` to prevent accidents
   - Scripts help ensure .env is protected

6. **Test in development first**
   - Try scripts on dev environment before production
   - Verify configurations with `teller show`

---

## Further Reading

- **Main Skill Documentation:** `../skill.md`
- **Lessons Learned:** `../references/lessons_learned.md`
- **Teller Setup Guide:** `../references/teller_setup.md`
- **GSM Commands Reference:** `../references/gsm_commands.md`
