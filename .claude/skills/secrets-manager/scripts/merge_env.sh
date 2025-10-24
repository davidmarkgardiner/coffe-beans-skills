#!/bin/bash
# Merge existing .env with synced secrets from Teller
# This script helps when you have local variables that aren't in GSM yet
# and want to preserve them while syncing secrets from GSM

set -e

echo "🔄 Merging existing .env with GSM secrets"
echo "=========================================="

# Check if Teller is installed
if ! command -v teller &> /dev/null; then
    echo "❌ Teller is not installed. Run init_teller.sh first."
    exit 1
fi

# Check if .teller configuration exists
if [ ! -f ".teller" ] && [ ! -f ".teller.yml" ]; then
    echo "❌ No .teller or .teller.yml configuration found"
    exit 1
fi

# Get the target .env file
ENV_FILE="${1:-.env}"

# Create backup if .env exists
if [ -f "$ENV_FILE" ]; then
    BACKUP_FILE="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo "💾 Backed up existing .env to: $BACKUP_FILE"

    # Store existing local variables
    TEMP_LOCAL_VARS=$(mktemp)
    grep -v "^#" "$ENV_FILE" | grep "=" > "$TEMP_LOCAL_VARS" || true
else
    echo "ℹ️  No existing .env file found"
    TEMP_LOCAL_VARS=""
fi

# Fetch secrets from GSM
echo "📥 Fetching secrets from Google Secret Manager..."
TEMP_GSM_SECRETS=$(mktemp)
teller env > "$TEMP_GSM_SECRETS"

# Merge: GSM secrets take precedence, then local variables
if [ -n "$TEMP_LOCAL_VARS" ] && [ -f "$TEMP_LOCAL_VARS" ]; then
    echo "🔀 Merging secrets from GSM with local variables..."

    # Create final merged file
    cat "$TEMP_GSM_SECRETS" > "$ENV_FILE"

    # Add local variables that aren't in GSM
    while IFS= read -r line; do
        VAR_NAME=$(echo "$line" | cut -d'=' -f1)
        if ! grep -q "^${VAR_NAME}=" "$TEMP_GSM_SECRETS"; then
            echo "$line" >> "$ENV_FILE"
            echo "   ➕ Keeping local variable: $VAR_NAME"
        fi
    done < "$TEMP_LOCAL_VARS"

    rm "$TEMP_LOCAL_VARS"
else
    # No local variables, just use GSM secrets
    cat "$TEMP_GSM_SECRETS" > "$ENV_FILE"
fi

rm "$TEMP_GSM_SECRETS"

echo ""
echo "✅ Successfully merged secrets to $ENV_FILE"
echo ""
echo "💡 Next steps:"
echo "   1. Review $ENV_FILE for any missing variables"
echo "   2. Upload new variables to GSM: python3 scripts/upload_secrets.py $ENV_FILE"
echo "   3. Update .teller configuration with new mappings"
