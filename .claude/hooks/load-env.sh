#!/bin/bash
# Load environment variables from .env file
# Usage: source .claude/hooks/load-env.sh

# Find .env file (check current dir, then parent, then repo root)
find_env_file() {
    local current_dir="$PWD"

    # Check current directory
    if [ -f "$current_dir/.env" ]; then
        echo "$current_dir/.env"
        return 0
    fi

    # Check parent directory
    if [ -f "$current_dir/../.env" ]; then
        echo "$current_dir/../.env"
        return 0
    fi

    # Check git root
    local git_root=$(git rev-parse --show-toplevel 2>/dev/null)
    if [ -n "$git_root" ] && [ -f "$git_root/.env" ]; then
        echo "$git_root/.env"
        return 0
    fi

    return 1
}

# Load .env file
load_env() {
    local env_file=$(find_env_file)

    if [ -z "$env_file" ]; then
        echo "⚠️  No .env file found" >&2
        echo "   Create one from .env.example:" >&2
        echo "   cp .env.example .env" >&2
        return 1
    fi

    echo "📝 Loading environment from: $env_file" >&2

    # Export variables from .env
    # Handles:
    # - Comments (lines starting with #)
    # - Empty lines
    # - KEY=value format
    # - KEY="value" format
    # - KEY='value' format

    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        [[ -z "$line" ]] && continue
        [[ "$line" =~ ^[[:space:]]*# ]] && continue

        # Remove leading/trailing whitespace
        line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

        # Skip if still empty
        [[ -z "$line" ]] && continue

        # Extract KEY=VALUE
        if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"

            # Remove quotes if present
            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

            # Export the variable
            export "$key=$value"
        fi
    done < "$env_file"

    echo "✅ Environment loaded" >&2
    return 0
}

# Verify required API keys
verify_api_keys() {
    local missing=()

    # Check required keys
    [ -z "$OPENAI_API_KEY" ] && missing+=("OPENAI_API_KEY")
    [ -z "$ANTHROPIC_API_KEY" ] && missing+=("ANTHROPIC_API_KEY")
    [ -z "$GEMINI_API_KEY" ] && missing+=("GEMINI_API_KEY")

    if [ ${#missing[@]} -gt 0 ]; then
        echo "❌ Missing required API keys:" >&2
        for key in "${missing[@]}"; do
            echo "   - $key" >&2
        done
        echo "" >&2
        echo "   Please set these in your .env file" >&2
        return 1
    fi

    echo "✅ All required API keys present" >&2
    return 0
}

# Main execution
load_env

# If verification requested
if [ "$1" = "--verify" ]; then
    verify_api_keys
fi
