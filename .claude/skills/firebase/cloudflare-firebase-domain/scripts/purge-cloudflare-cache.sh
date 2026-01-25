#!/bin/bash

###############################################################################
# Cloudflare Cache Purge Script
#
# Purges Cloudflare cache to show latest Firebase Hosting deployment
#
# Usage:
#   bash purge-cloudflare-cache.sh
#
# Environment Variables Required:
#   CLOUDFLARE_API_TOKEN - API token with Cache Purge permission
#   CLOUDFLARE_ZONE_ID   - Zone ID for the domain
#
# Optional:
#   PURGE_TYPE - "all" (default) or "files" for specific file purging
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}Error: CLOUDFLARE_API_TOKEN environment variable is not set${NC}"
    echo "Get your API token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "Required permissions: Zone:Cache Purge:Purge"
    exit 1
fi

if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    echo -e "${RED}Error: CLOUDFLARE_ZONE_ID environment variable is not set${NC}"
    echo "Get your Zone ID from: Cloudflare Dashboard → Domain Overview → API section"
    exit 1
fi

# Default to purge all
PURGE_TYPE="${PURGE_TYPE:-all}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Cloudflare Cache Purge${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Zone ID:${NC} $CLOUDFLARE_ZONE_ID"
echo -e "${YELLOW}Purge Type:${NC} $PURGE_TYPE"
echo ""

# Purge cache
echo -e "${BLUE}Purging Cloudflare cache...${NC}"

if [ "$PURGE_TYPE" = "all" ]; then
    # Purge everything
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"purge_everything":true}')
else
    # Purge specific files (customize as needed)
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"files":["https://stockbridgecoffee.co.uk/"]}')
fi

# Check response
success=$(echo "$response" | grep -o '"success":[^,]*' | cut -d':' -f2)

if [ "$success" = "true" ]; then
    echo -e "${GREEN}✅ Cache purged successfully!${NC}"
    echo ""
    echo -e "${GREEN}Your website should now show the latest content.${NC}"
    echo -e "${YELLOW}Note: Changes may take 1-2 minutes to propagate globally.${NC}"
    echo ""
    echo -e "${BLUE}Verify by visiting:${NC}"
    echo "  https://stockbridgecoffee.co.uk/"
    echo "  (Use Ctrl+Shift+R or Cmd+Shift+R to hard refresh)"
else
    echo -e "${RED}❌ Cache purge failed!${NC}"
    echo ""
    echo -e "${YELLOW}Response:${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""

    # Check for common errors
    if echo "$response" | grep -q "authentication"; then
        echo -e "${RED}Authentication error:${NC} Check your CLOUDFLARE_API_TOKEN"
        echo "Make sure the token has 'Zone:Cache Purge:Purge' permission"
    elif echo "$response" | grep -q "zone"; then
        echo -e "${RED}Zone error:${NC} Check your CLOUDFLARE_ZONE_ID"
    fi

    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
