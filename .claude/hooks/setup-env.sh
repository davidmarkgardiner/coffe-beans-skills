#!/bin/bash
# Setup script for orchestration environment
# Run this once to initialize your .env file

set -e

echo "🚀 Multi-AI Orchestration System - Environment Setup"
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists"
    read -p "   Overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 0
    fi
fi

# Copy .env.example to .env
if [ ! -f ".env.example" ]; then
    echo "❌ .env.example not found"
    echo "   Are you in the repository root?"
    exit 1
fi

cp .env.example .env
echo "✅ Created .env from .env.example"
echo ""

# Prompt for API keys
echo "📝 Let's configure your API keys..."
echo "   (Press Enter to skip any optional keys)"
echo ""

# OpenAI API Key
read -p "🔑 OpenAI API Key (required): " openai_key
if [ -n "$openai_key" ]; then
    sed -i.bak "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$openai_key|" .env
    echo "   ✅ OpenAI API key set"
else
    echo "   ⚠️  OpenAI API key not set (required for orchestration)"
fi
echo ""

# Anthropic API Key
read -p "🔑 Anthropic API Key (required): " anthropic_key
if [ -n "$anthropic_key" ]; then
    sed -i.bak "s|ANTHROPIC_API_KEY=.*|ANTHROPIC_API_KEY=$anthropic_key|" .env
    echo "   ✅ Anthropic API key set"
else
    echo "   ⚠️  Anthropic API key not set (required for Claude)"
fi
echo ""

# Gemini API Key
read -p "🔑 Gemini API Key (required): " gemini_key
if [ -n "$gemini_key" ]; then
    sed -i.bak "s|GEMINI_API_KEY=.*|GEMINI_API_KEY=$gemini_key|" .env
    echo "   ✅ Gemini API key set"
else
    echo "   ⚠️  Gemini API key not set (required for Google integrations)"
fi
echo ""

# Optional: Firebase
read -p "🔑 Firebase Project ID (optional): " firebase_project
if [ -n "$firebase_project" ]; then
    sed -i.bak "s|FIREBASE_PROJECT_ID=.*|FIREBASE_PROJECT_ID=$firebase_project|" .env
    echo "   ✅ Firebase project ID set"
fi
echo ""

# Clean up backup files
rm -f .env.bak

# Verify setup
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Verifying setup..."
echo ""

source .claude/hooks/load-env.sh --verify

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Review your .env file: cat .env"
    echo "  2. Run orchestration: /orchestrate build specs/your-feature.md"
    echo "  3. Read the docs: cat .claude/skills/orchestration-system/skill.md"
    echo ""
    echo "🔐 Security reminder:"
    echo "  - .env is git-ignored (never commit it)"
    echo "  - Pre-commit hook will block secrets"
    echo "  - Keep your API keys private"
    echo ""
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  Setup incomplete"
    echo ""
    echo "Please edit .env manually and add missing API keys:"
    echo "  nano .env"
    echo ""
fi
