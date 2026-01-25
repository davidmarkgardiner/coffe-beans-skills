#!/bin/bash
# Sync secrets from Google Secret Manager to local .env files
# Uses Teller to fetch and populate environment variables

set -e

echo "🔄 Syncing secrets from Google Secret Manager"
echo "=============================================="

# Check if Teller is installed
if ! command -v teller &> /dev/null; then
    echo "❌ Teller is not installed. Run init_teller.sh first."
    exit 1
fi

# Check if .teller or .teller.yml exists
if [ ! -f ".teller" ] && [ ! -f ".teller.yml" ]; then
    echo "❌ No .teller or .teller.yml configuration found"
    echo "Please create a Teller configuration file first"
    exit 1
fi

# Get the target .env file (default to .env)
ENV_FILE="${1:-.env}"

echo "📥 Fetching secrets from Google Secret Manager..."
teller env > "$ENV_FILE"

echo "✅ Secrets synced to $ENV_FILE"

# Verify .env is in .gitignore
GITIGNORE_FILE=".gitignore"

if [ ! -f "$GITIGNORE_FILE" ]; then
    echo "⚠️  No .gitignore file found"
    echo "$ENV_FILE" > .gitignore
    echo "✅ Created .gitignore with $ENV_FILE"
else
    if ! grep -qxF "$ENV_FILE" "$GITIGNORE_FILE"; then
        echo "$ENV_FILE" >> "$GITIGNORE_FILE"
        echo "✅ Added $ENV_FILE to .gitignore"
    else
        echo "✅ $ENV_FILE already in .gitignore"
    fi
fi

echo ""
echo "🎉 Secret sync complete!"
echo "   Secrets file: $ENV_FILE"
echo "   Protected by: .gitignore"
