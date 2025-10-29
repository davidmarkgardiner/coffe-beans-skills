#!/bin/bash

##
# Video Optimization Script
#
# Optimizes videos for web delivery by:
# - Reducing file size (target: 1-2 MB)
# - Lowering bitrate while maintaining quality
# - Using efficient codec (H.264)
# - Generating poster images from first frame
#
# Requirements: ffmpeg installed (brew install ffmpeg)
#
# Usage:
#   ./scripts/optimize-videos.sh
#   ./scripts/optimize-videos.sh test-generated-content/test-autumn-video-*.mp4
##

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎬 Video Optimization Script${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ Error: ffmpeg is not installed${NC}"
    echo ""
    echo "Install with:"
    echo "  macOS: brew install ffmpeg"
    echo "  Linux: sudo apt-get install ffmpeg"
    echo ""
    exit 1
fi

# Default directory
INPUT_DIR="${1:-test-generated-content}"
OUTPUT_DIR="${INPUT_DIR}/optimized"
POSTERS_DIR="${INPUT_DIR}/posters"

# Create output directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$POSTERS_DIR"

echo -e "${BLUE}📁 Input directory:${NC} $INPUT_DIR"
echo -e "${BLUE}📁 Output directory:${NC} $OUTPUT_DIR"
echo -e "${BLUE}📁 Posters directory:${NC} $POSTERS_DIR"
echo ""

# Find all video files
VIDEO_FILES=$(find "$INPUT_DIR" -maxdepth 1 -type f \( -name "*.mp4" -o -name "*.webm" \) 2>/dev/null || true)

if [ -z "$VIDEO_FILES" ]; then
    echo -e "${YELLOW}⚠️  No video files found in $INPUT_DIR${NC}"
    exit 0
fi

TOTAL_FILES=$(echo "$VIDEO_FILES" | wc -l | tr -d ' ')
CURRENT=0
TOTAL_ORIGINAL_SIZE=0
TOTAL_OPTIMIZED_SIZE=0

echo -e "${GREEN}Found $TOTAL_FILES video files to optimize${NC}"
echo ""

for VIDEO in $VIDEO_FILES; do
    CURRENT=$((CURRENT + 1))
    FILENAME=$(basename "$VIDEO")
    NAME="${FILENAME%.*}"
    EXT="${FILENAME##*.}"

    OUTPUT_FILE="$OUTPUT_DIR/${NAME}-optimized.mp4"
    POSTER_FILE="$POSTERS_DIR/${NAME}-poster.jpg"

    echo -e "${BLUE}[$CURRENT/$TOTAL_FILES] Processing:${NC} $FILENAME"

    # Get original file size
    ORIGINAL_SIZE=$(stat -f%z "$VIDEO" 2>/dev/null || stat -c%s "$VIDEO" 2>/dev/null)
    ORIGINAL_SIZE_MB=$(echo "scale=2; $ORIGINAL_SIZE / 1024 / 1024" | bc)
    TOTAL_ORIGINAL_SIZE=$((TOTAL_ORIGINAL_SIZE + ORIGINAL_SIZE))

    echo "  📊 Original size: ${ORIGINAL_SIZE_MB} MB"

    # Optimize video
    # Target: 1-2 MB for 5-6 second videos = ~2 Mbps bitrate
    # Use H.264 with efficient settings for web
    echo "  🔄 Optimizing video..."
    ffmpeg -i "$VIDEO" \
        -c:v libx264 \
        -preset slow \
        -crf 28 \
        -b:v 2M \
        -maxrate 2.5M \
        -bufsize 5M \
        -vf "scale=1280:-2" \
        -movflags +faststart \
        -an \
        "$OUTPUT_FILE" \
        -y \
        -loglevel error 2>&1

    # Get optimized file size
    OPTIMIZED_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
    OPTIMIZED_SIZE_MB=$(echo "scale=2; $OPTIMIZED_SIZE / 1024 / 1024" | bc)
    TOTAL_OPTIMIZED_SIZE=$((TOTAL_OPTIMIZED_SIZE + OPTIMIZED_SIZE))

    # Calculate savings
    SAVINGS=$(echo "scale=1; 100 * (1 - $OPTIMIZED_SIZE / $ORIGINAL_SIZE)" | bc)

    echo -e "  ${GREEN}✅ Optimized size: ${OPTIMIZED_SIZE_MB} MB (${SAVINGS}% smaller)${NC}"

    # Generate poster image from first frame
    echo "  🖼️  Generating poster image..."
    ffmpeg -i "$VIDEO" \
        -ss 00:00:00 \
        -vframes 1 \
        -vf "scale=800:-2" \
        -q:v 5 \
        "$POSTER_FILE" \
        -y \
        -loglevel error 2>&1

    POSTER_SIZE=$(stat -f%z "$POSTER_FILE" 2>/dev/null || stat -c%s "$POSTER_FILE" 2>/dev/null)
    POSTER_SIZE_KB=$(echo "scale=0; $POSTER_SIZE / 1024" | bc)

    echo -e "  ${GREEN}✅ Poster created: ${POSTER_SIZE_KB} KB${NC}"
    echo ""
done

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Optimization complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_ORIGINAL_MB=$(echo "scale=2; $TOTAL_ORIGINAL_SIZE / 1024 / 1024" | bc)
TOTAL_OPTIMIZED_MB=$(echo "scale=2; $TOTAL_OPTIMIZED_SIZE / 1024 / 1024" | bc)
TOTAL_SAVINGS=$(echo "scale=1; 100 * (1 - $TOTAL_OPTIMIZED_SIZE / $TOTAL_ORIGINAL_SIZE)" | bc)

echo "📊 Summary:"
echo "  Files processed: $TOTAL_FILES"
echo "  Original total: ${TOTAL_ORIGINAL_MB} MB"
echo "  Optimized total: ${TOTAL_OPTIMIZED_MB} MB"
echo -e "  ${GREEN}Total savings: ${TOTAL_SAVINGS}%${NC}"
echo ""

echo "📁 Output locations:"
echo "  Optimized videos: $OUTPUT_DIR/"
echo "  Poster images: $POSTERS_DIR/"
echo ""

echo "🎯 Next steps:"
echo "  1. Review optimized videos for quality"
echo "  2. Upload optimized versions: npm run upload:content -- --dir=$OUTPUT_DIR"
echo "  3. Upload poster images to Firebase Storage"
echo "  4. Update video URLs in Firestore to use optimized versions"
echo ""
