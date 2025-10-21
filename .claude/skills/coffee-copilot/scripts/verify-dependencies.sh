#!/bin/bash

# Verify all required dependencies for Coffee Copilot are installed
# Run this script before starting development

set -e

echo "🔍 Verifying Coffee Copilot dependencies..."
echo

ERRORS=0

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo "✅ Node.js: $NODE_VERSION"
else
  echo "❌ Node.js is not installed"
  echo "   Install from: https://nodejs.org/"
  ERRORS=$((ERRORS + 1))
fi

# Check npm or yarn
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  echo "✅ npm: v$NPM_VERSION"
elif command -v yarn &> /dev/null; then
  YARN_VERSION=$(yarn -v)
  echo "✅ yarn: v$YARN_VERSION"
else
  echo "❌ Package manager (npm/yarn) is not installed"
  ERRORS=$((ERRORS + 1))
fi

# Check for .env file
if [ -f ".env" ]; then
  echo "✅ .env file found"

  # Check for required environment variables
  REQUIRED_VARS=("OPENAI_API_KEY")
  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^$var=.\+" .env; then
      echo "   ✅ $var is set"
    else
      echo "   ⚠️  $var is not configured in .env"
      ERRORS=$((ERRORS + 1))
    fi
  done
else
  echo "⚠️  .env file not found"
  echo "   Run: ./scripts/setup-env.sh"
  ERRORS=$((ERRORS + 1))
fi

# Check for package.json
if [ -f "package.json" ]; then
  echo "✅ package.json found"

  # Check if node_modules exists
  if [ -d "node_modules" ]; then
    echo "✅ node_modules installed"
  else
    echo "⚠️  node_modules not found"
    echo "   Run: npm install"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "⚠️  package.json not found"
  echo "   Initialize project first: npm init"
  ERRORS=$((ERRORS + 1))
fi

echo
if [ $ERRORS -eq 0 ]; then
  echo "🎉 All dependencies verified! Ready to start development."
  exit 0
else
  echo "❌ Found $ERRORS issue(s). Please fix them before continuing."
  exit 1
fi
