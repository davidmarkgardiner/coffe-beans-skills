#!/bin/bash
# Quick setup script for AI Video Automation

echo "🚀 Setting up AI Video Automation Pipeline"
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check for FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg not found"
    echo ""
    echo "Install FFmpeg:"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "  brew install ffmpeg"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "  sudo apt install ffmpeg"
    fi
    echo ""
    read -p "Continue without FFmpeg? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ FFmpeg found: $(ffmpeg -version | head -n1)"
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip3 install -r "$SKILL_DIR/requirements.txt"

# Create directories
echo ""
echo "📁 Creating output directories..."
mkdir -p "$SKILL_DIR/output"

# Setup environment file
if [ ! -f "$SKILL_DIR/.env" ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cp "$SKILL_DIR/.env.example" "$SKILL_DIR/.env"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your API keys!"
    echo "   nano $SKILL_DIR/.env"
    echo ""
else
    echo "✅ .env file already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit $SKILL_DIR/.env and add your API keys"
echo "  2. Run: python3 $SCRIPT_DIR/quick_example.py voices"
echo "  3. Run: python3 $SCRIPT_DIR/quick_example.py voiceover"
echo ""
echo "Full documentation: See SKILL.md in the video-automation skill"
