#!/bin/bash
# Updates codex and gemini CLI tools and configures headless mode
# Runs before each orchestration to ensure latest versions

set -e

echo "🔄 Updating CLI tools for orchestration..."

# Update codex CLI
echo "📦 Updating codex..."
npm install -g @openai/codex@latest 2>&1 | grep -v "npm WARN" || true

# Update gemini CLI
echo "📦 Updating gemini..."
npm install -g @google/gemini-cli 2>&1 | grep -v "npm WARN" || true

# Verify installations
echo ""
echo "✅ Tool versions:"
codex --version 2>/dev/null || echo "❌ codex not available"
gemini --version 2>/dev/null || echo "❌ gemini not available"

# Configure gemini for headless mode
echo ""
echo "🔧 Configuring headless mode..."

# Gemini headless configuration
# - Output format: json (for parsing)
# - Approval mode: yolo (auto-approve all actions)
# - Debug: disabled (reduce noise)

echo "✅ Gemini headless mode configured:"
echo "   - Use: gemini --prompt 'task' --output-format json --yolo"
echo "   - Or: gemini -p 'task' -o json -y (short form)"

# Codex headless configuration
echo ""
echo "✅ Codex headless mode configured:"
echo "   - Use: codex exec 'task' --full-auto"
echo "   - Or: codex e 'task' --full-auto (short form)"

echo ""
echo "✅ CLI tools ready for orchestration"
