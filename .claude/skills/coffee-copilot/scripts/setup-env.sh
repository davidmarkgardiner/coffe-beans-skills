#!/bin/bash

# Setup environment variables for Coffee Copilot
# This script helps create a .env file with all required configuration

set -e

ENV_FILE="${1:-.env}"

echo "🔧 Setting up Coffee Copilot environment variables"
echo "Environment file: $ENV_FILE"
echo

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
  read -p "⚠️  $ENV_FILE already exists. Overwrite? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
  fi
fi

# Create .env file
cat > "$ENV_FILE" << 'EOF'
# OpenAI Configuration
OPENAI_API_KEY=

# GitHub Integration (for issue filing)
GITHUB_TOKEN=
GITHUB_REPO=

# Vector Database Configuration (choose one)
# For pgvector (PostgreSQL)
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# For Pinecone
# PINECONE_API_KEY=
# PINECONE_ENVIRONMENT=
# PINECONE_INDEX=

# For Qdrant
# QDRANT_URL=
# QDRANT_API_KEY=

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Optional: Authentication
# JWT_SECRET=
# SESSION_SECRET=

# Optional: Payment Integration
# STRIPE_SECRET_KEY=
# STRIPE_PUBLISHABLE_KEY=
EOF

echo "✅ Created $ENV_FILE template"
echo
echo "📝 Next steps:"
echo "1. Edit $ENV_FILE and fill in your API keys and configuration"
echo "2. Get an OpenAI API key from https://platform.openai.com/api-keys"
echo "3. (Optional) Create a GitHub token from https://github.com/settings/tokens"
echo "4. Choose and configure your vector database (pgvector, Pinecone, or Qdrant)"
echo
echo "⚠️  Remember: Never commit $ENV_FILE to version control!"
echo "   Add it to your .gitignore file"
