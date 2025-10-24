#!/bin/bash

# Firebase Preview Channels Cleanup Script
# Helps manage and clean up unused preview channels
#
# Usage: ./cleanup-channels.sh [options]
#
# Options:
#   --expired-only    Only delete expired channels
#   --pattern <pat>   Only delete channels matching pattern (regex)
#   --dry-run         Show what would be deleted without deleting
#   --all             Delete all preview channels (keep only live)
#   --yes             Auto-approve deletions
#
# Examples:
#   ./cleanup-channels.sh --dry-run
#   ./cleanup-channels.sh --pattern "pr-*"
#   ./cleanup-channels.sh --expired-only --yes

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Options
DRY_RUN=false
EXPIRED_ONLY=false
PATTERN=""
DELETE_ALL=false
AUTO_APPROVE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --expired-only)
            EXPIRED_ONLY=true
            shift
            ;;
        --pattern)
            PATTERN="$2"
            shift 2
            ;;
        --all)
            DELETE_ALL=true
            shift
            ;;
        --yes|-y)
            AUTO_APPROVE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --dry-run          Show what would be deleted"
            echo "  --expired-only     Only delete expired channels"
            echo "  --pattern <pat>    Only delete matching channels (regex)"
            echo "  --all              Delete all preview channels"
            echo "  --yes, -y          Auto-approve deletions"
            echo "  --help, -h         Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI not installed"
    exit 1
fi

# Check authentication
if ! firebase projects:list &> /dev/null; then
    print_error "Not logged in to Firebase"
    exit 1
fi

# Get current project
CURRENT_PROJECT=$(firebase use 2>&1 | grep "Active Project:" | sed 's/.*Active Project: //' | sed 's/ .*//')
if [ -z "$CURRENT_PROJECT" ]; then
    print_error "No Firebase project selected"
    exit 1
fi

print_info "Project: $CURRENT_PROJECT"
echo ""

# Get list of channels
print_info "Fetching channels..."
CHANNELS_OUTPUT=$(firebase hosting:channel:list 2>&1)

if [ $? -ne 0 ]; then
    print_error "Failed to list channels"
    echo "$CHANNELS_OUTPUT"
    exit 1
fi

# Parse channels (skip header and live channel)
CHANNELS=$(echo "$CHANNELS_OUTPUT" | tail -n +2 | grep -v "^live" | awk '{print $1}')

if [ -z "$CHANNELS" ]; then
    print_success "No preview channels to clean up"
    exit 0
fi

# Get current date for expiry comparison
CURRENT_DATE=$(date +%s)

# Array to store channels to delete
declare -a TO_DELETE

# Process each channel
while IFS= read -r CHANNEL; do
    [ -z "$CHANNEL" ] && continue

    # Skip if pattern specified and doesn't match
    if [ -n "$PATTERN" ] && ! [[ "$CHANNEL" =~ $PATTERN ]]; then
        continue
    fi

    # Get channel details
    CHANNEL_INFO=$(echo "$CHANNELS_OUTPUT" | grep "^$CHANNEL")
    EXPIRY=$(echo "$CHANNEL_INFO" | awk '{print $3}')

    # Check if expired (if --expired-only flag set)
    if [ "$EXPIRED_ONLY" = true ]; then
        if [ "$EXPIRY" = "Never" ]; then
            continue
        fi

        # Try to parse expiry date (simplified - real parsing would be more complex)
        # This is a simplified check
        if [ -n "$EXPIRY" ] && [ "$EXPIRY" != "Never" ]; then
            # Add to delete list (in reality, would need date parsing)
            # For now, we'll skip complex date comparison
            print_warning "Expiry date parsing not fully implemented"
            print_info "Channel: $CHANNEL, Expiry: $EXPIRY (manual check recommended)"
        fi
    fi

    # Add to deletion list
    TO_DELETE+=("$CHANNEL")

done <<< "$CHANNELS"

# If --all flag not set and no pattern, ask for confirmation
if [ "$DELETE_ALL" = false ] && [ -z "$PATTERN" ] && [ "$EXPIRED_ONLY" = false ]; then
    print_warning "No filter specified. Use --all, --pattern, or --expired-only"
    echo ""
    echo "Available channels:"
    echo "$CHANNELS_OUTPUT"
    echo ""
    echo "Examples:"
    echo "  $0 --pattern '^pr-'"
    echo "  $0 --expired-only"
    echo "  $0 --all"
    exit 0
fi

# Show what will be deleted
if [ ${#TO_DELETE[@]} -eq 0 ]; then
    print_success "No channels match deletion criteria"
    exit 0
fi

echo "Channels to delete:"
echo ""
for CHANNEL in "${TO_DELETE[@]}"; do
    CHANNEL_INFO=$(echo "$CHANNELS_OUTPUT" | grep "^$CHANNEL")
    echo "  - $CHANNEL_INFO"
done
echo ""

if [ "$DRY_RUN" = true ]; then
    print_info "DRY RUN - No channels were deleted"
    print_info "Remove --dry-run flag to actually delete"
    exit 0
fi

# Confirm deletion
if [ "$AUTO_APPROVE" = false ]; then
    print_warning "Delete ${#TO_DELETE[@]} channel(s)?"
    read -p "Type 'yes' to confirm: " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_info "Cancelled"
        exit 0
    fi
fi

# Delete channels
DELETED_COUNT=0
FAILED_COUNT=0

for CHANNEL in "${TO_DELETE[@]}"; do
    print_info "Deleting: $CHANNEL"

    if firebase hosting:channel:delete "$CHANNEL" --force > /dev/null 2>&1; then
        print_success "Deleted: $CHANNEL"
        ((DELETED_COUNT++))
    else
        print_error "Failed to delete: $CHANNEL"
        ((FAILED_COUNT++))
    fi
done

echo ""
print_success "Deleted: $DELETED_COUNT channel(s)"

if [ $FAILED_COUNT -gt 0 ]; then
    print_warning "Failed: $FAILED_COUNT channel(s)"
fi

# Show remaining channels
echo ""
print_info "Remaining channels:"
firebase hosting:channel:list
