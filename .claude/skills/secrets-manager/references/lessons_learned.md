# Lessons Learned - Secrets Manager

This document captures real-world experiences, edge cases, and solutions discovered while using the secrets-manager skill.

## Common Issues and Solutions

### 1. Duplicate Variables in .env Files

**Problem:**
When syncing secrets from GSM or manually editing .env files, duplicate variable definitions can occur. This causes confusion about which value is actually being used and can lead to bugs.

**Example:**
```env
OPENAI_API_KEY=sk-old-key
# ... other vars ...
OPENAI_API_KEY=sk-new-key
```

**Solution:**
- Use the `clean_duplicates.py` script to detect and remove duplicates
- The script keeps the first occurrence and removes subsequent duplicates
- Always run `--dry-run` first to review what will be changed

**Prevention:**
- Use the `merge_env.sh` script instead of directly overwriting .env files
- Organize .env files with clear sections and comments
- Regular audits: `python3 scripts/clean_duplicates.py --dry-run .env`

---

### 2. Teller Configuration Path Issues

**Problem:**
Teller looks for `.teller` or `.teller.yml` in the current directory and parent directories. If it can't find the config, it fails with:
```
Error: cannot find configuration from current folder and up to root
```

**Solution:**
- Always run teller from the directory containing your `.teller` file
- Use explicit config path: `teller --config .teller show`
- Check file exists and has correct permissions: `ls -la .teller`

**Best Practice:**
- Keep `.teller` at the repository root
- Document the expected working directory in your README
- Use absolute paths in scripts when calling teller

---

### 3. Missing Variables After Sync

**Problem:**
After syncing with `teller env > .env`, some variables that were previously in .env are missing. This happens when:
- Variables exist locally but not in GSM
- Variables were added to .env but not uploaded to GSM
- .teller configuration is incomplete

**Solution:**
1. Use `merge_env.sh` instead of directly overwriting .env:
   ```bash
   bash scripts/merge_env.sh
   ```
2. Review which variables are missing
3. Upload missing variables to GSM:
   ```bash
   python3 scripts/upload_secrets.py .env
   ```
4. Update .teller configuration with new mappings

**Best Practice:**
- Always backup .env before syncing: `cp .env .env.backup`
- Use merge_env.sh for existing projects with local variables
- Keep .teller configuration synchronized with GSM secrets

---

### 4. Variable Naming Conventions

**Problem:**
Inconsistent naming between GSM secrets (kebab-case) and environment variables (UPPER_SNAKE_CASE) can cause confusion.

**Examples:**
```
GSM: stripe-secret-key
ENV: STRIPE_SECRET_KEY

GSM: openai-api-key
ENV: OPENAI_API_KEY
```

**Solution:**
- Use the `upload_secrets.py` script which automatically converts UPPER_SNAKE → lower-kebab
- Follow consistent naming patterns:
  - GSM: lowercase-with-hyphens
  - .env: UPPERCASE_WITH_UNDERSCORES
  - .teller: maps GSM names (left) to ENV names (right)

**Best Practice:**
```yaml
# .teller configuration
keys:
  stripe-secret-key: STRIPE_SECRET_KEY
  openai-api-key: OPENAI_API_KEY
```

---

### 5. Comments and Formatting Lost During Sync

**Problem:**
When using `teller env > .env`, all comments and formatting from the original .env file are lost because Teller outputs raw KEY=VALUE pairs.

**Example:**
Before sync:
```env
# AI API Keys
OPENAI_API_KEY=sk-xxx

# Database
DATABASE_URL=postgres://...
```

After sync:
```env
OPENAI_API_KEY=sk-xxx
DATABASE_URL=postgres://...
```

**Solution:**
- Accept that Teller output is unformatted
- Use a template .env with comments as documentation
- For formatted .env, manually organize after sync
- Consider using .env.example with comments for documentation

**Best Practice:**
- Keep a separate `.env.example` with comments and structure
- Use section comments in .teller configuration
- Document variable purposes in README or separate docs

---

### 6. Incremental Updates vs. Full Sync

**Problem:**
When adding new secrets, deciding between:
1. Syncing everything (overwrites .env)
2. Adding individual secrets manually (error-prone)

**Solution:**
Use this workflow for adding new secrets:

1. Add secret to GSM:
   ```bash
   echo -n "value" | gcloud secrets create secret-name --data-file=-
   ```

2. Update .teller configuration:
   ```yaml
   keys:
     secret-name: SECRET_NAME
   ```

3. Use merge script to preserve local vars:
   ```bash
   bash scripts/merge_env.sh
   ```

4. Verify the new secret:
   ```bash
   grep SECRET_NAME .env
   ```

**Best Practice:**
- Use merge_env.sh for projects with local variables
- Use sync_secrets.sh for fresh setups or when all secrets are in GSM
- Always backup before syncing: `.env.backup.$(date +%Y%m%d_%H%M%S)`

---

### 7. Empty or Placeholder Values

**Problem:**
Some environment variables are configuration (not secrets) and may be empty or have placeholder values:
```env
ENGINEER_NAME=Dan
AGENT_WORKING_DIRECTORY=
```

When uploading to GSM, empty values create secrets with empty content.

**Solution:**
1. Decide which variables should be in GSM vs. local config
2. For local config that varies by developer:
   - Keep in .env but not GSM
   - Document in .env.example
   - Add to .gitignore

3. For empty secrets that are placeholders:
   - Either don't upload to GSM
   - Or document that they can be empty

**Best Practice:**
- GSM: Store actual secrets (API keys, credentials, tokens)
- Local .env: Store developer-specific config (engineer name, local paths)
- .env.example: Document all variables with descriptions

---

## Workflows That Work Well

### Initial Project Setup
```bash
# 1. Initialize tools
bash scripts/init_teller.sh

# 2. Create config from template
cp assets/.teller.template .teller
# Edit .teller with your GCP project ID

# 3. Sync secrets
bash scripts/sync_secrets.sh
```

### Adding to Existing Project
```bash
# 1. Backup existing .env
cp .env .env.backup

# 2. Upload existing secrets
python3 scripts/upload_secrets.py .env

# 3. Update .teller config with output from upload script

# 4. Test sync (dry run with backup in place)
teller --config .teller show

# 5. Merge with existing variables
bash scripts/merge_env.sh
```

### Regular Maintenance
```bash
# Check for duplicates
python3 scripts/clean_duplicates.py --dry-run .env

# Clean if needed
python3 scripts/clean_duplicates.py .env

# Verify all secrets are in GSM
teller --config .teller show

# Sync latest from GSM
bash scripts/sync_secrets.sh
```

---

## Anti-Patterns to Avoid

### ❌ Don't: Directly overwrite .env without backup
```bash
# BAD: Loses local variables
teller env > .env
```

### ✅ Do: Use merge script or backup first
```bash
# GOOD: Preserves local variables
bash scripts/merge_env.sh

# OR: Backup first
cp .env .env.backup
teller env > .env
```

---

### ❌ Don't: Manually edit GSM secrets then forget to sync
```bash
# BAD: Local .env is now out of sync
gcloud secrets versions add my-secret --data-file=<(echo "new-value")
# ... continues working with old value in .env
```

### ✅ Do: Sync immediately after GSM changes
```bash
# GOOD: Update GSM then sync
gcloud secrets versions add my-secret --data-file=<(echo "new-value")
bash scripts/sync_secrets.sh
```

---

### ❌ Don't: Mix different naming conventions
```yaml
# BAD: Inconsistent naming
keys:
  stripeSecretKey: STRIPE_SECRET_KEY
  OpenAI-API-Key: OPENAI_API_KEY
```

### ✅ Do: Follow consistent conventions
```yaml
# GOOD: Consistent kebab-case in GSM, UPPER_SNAKE in ENV
keys:
  stripe-secret-key: STRIPE_SECRET_KEY
  openai-api-key: OPENAI_API_KEY
```

---

## Performance Tips

1. **Batch uploads**: When uploading many secrets, use the upload_secrets.py script once rather than individual gcloud commands

2. **Cache locally**: Once synced, .env can be used without hitting GSM until next sync

3. **Use teller show**: To verify configuration without syncing files

4. **Parallel team onboarding**: Store .teller in git, new team members just run:
   ```bash
   bash scripts/init_teller.sh
   bash scripts/sync_secrets.sh
   ```

---

## Security Insights

1. **Never commit .env to git**
   - Use .gitignore
   - Run: `git log --all --full-history -- "**/.env"` to check history
   - If secrets leaked, rotate immediately

2. **Audit GSM access**
   - Review who has `secretmanager.secretAccessor` role
   - Set up Cloud Audit Logs alerts
   - Monitor for unexpected secret access

3. **Rotate secrets regularly**
   - Use GSM versioning to keep history
   - Test rotation process before emergencies
   - Document rotation procedures

4. **Environment separation**
   - Use different GCP projects for dev/staging/prod
   - Or use naming prefixes: `dev-stripe-key`, `prod-stripe-key`
   - Never share secrets across environments

---

## Summary

The key lessons learned:
1. **Always backup before sync operations**
2. **Use merge_env.sh for existing projects with local variables**
3. **Use clean_duplicates.py to maintain .env hygiene**
4. **Follow consistent naming conventions (kebab-case in GSM, UPPER_SNAKE in ENV)**
5. **Keep .teller configuration synchronized with GSM secrets**
6. **Distinguish between secrets (in GSM) and local config (in .env only)**
7. **Test workflows in a safe environment before running on production secrets**

These scripts and workflows were developed from real-world usage and edge cases. They make secrets management more reliable and less error-prone.
