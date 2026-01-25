#!/bin/bash

# Cloudflare DNS Setup for Firebase Hosting
# This script automates DNS record configuration for connecting a Cloudflare domain to Firebase Hosting

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check required environment variables
check_env_vars() {
    local missing_vars=()

    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        missing_vars+=("CLOUDFLARE_API_TOKEN")
    fi

    if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
        missing_vars+=("CLOUDFLARE_ZONE_ID")
    fi

    if [ -z "$DOMAIN" ]; then
        missing_vars+=("DOMAIN")
    fi

    if [ -z "$FIREBASE_IP_1" ]; then
        missing_vars+=("FIREBASE_IP_1")
    fi

    if [ -z "$FIREBASE_TXT_VALUE" ]; then
        missing_vars+=("FIREBASE_TXT_VALUE")
    fi

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "Please set the following variables:"
        echo "  export CLOUDFLARE_API_TOKEN=\"your-token\""
        echo "  export CLOUDFLARE_ZONE_ID=\"your-zone-id\""
        echo "  export DOMAIN=\"your-domain.com\""
        echo "  export FIREBASE_IP_1=\"199.36.158.100\"  # First Firebase IP"
        echo "  export FIREBASE_TXT_VALUE=\"hosting-site=your-site-id\""
        echo ""
        echo "Optional:"
        echo "  export FIREBASE_IP_2=\"151.101.65.195\"  # Second IP (if Firebase provided one)"
        echo "  export FIREBASE_ACME_CHALLENGE=\"long-string\"  # ACME challenge for SSL"
        echo "  export SETUP_WWW=\"true\"  # Also setup www subdomain"
        exit 1
    fi

    # Warn if FIREBASE_IP_2 is not set
    if [ -z "$FIREBASE_IP_2" ]; then
        log_warning "FIREBASE_IP_2 not set - will create single A record (this is normal for some Firebase projects)"
    fi
}

# Verify API token has correct permissions
verify_api_token() {
    log_info "Verifying Cloudflare API token..."

    local response=$(curl -s -X GET \
        "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")

    local success=$(echo "$response" | jq -r '.success')

    if [ "$success" != "true" ]; then
        log_error "API token verification failed"
        echo "$response" | jq '.'
        exit 1
    fi

    local zone_name=$(echo "$response" | jq -r '.result.name')
    log_success "API token verified for zone: $zone_name"
}

# List existing DNS records
list_dns_records() {
    local record_type=$1
    local record_name=$2

    curl -s -X GET \
        "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?type=$record_type&name=$record_name" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json"
}

# Delete DNS record
delete_dns_record() {
    local record_id=$1
    local record_type=$2
    local record_name=$3

    log_info "Deleting $record_type record: $record_name (ID: $record_id)"

    local response=$(curl -s -X DELETE \
        "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$record_id" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")

    local success=$(echo "$response" | jq -r '.success')

    if [ "$success" = "true" ]; then
        log_success "Deleted $record_type record: $record_name"
    else
        log_error "Failed to delete $record_type record: $record_name"
        echo "$response" | jq '.'
    fi
}

# Delete conflicting A and AAAA records for root domain
delete_conflicting_records() {
    log_info "Checking for conflicting DNS records..."

    # Get full domain name (Cloudflare uses FQDN in API)
    local full_domain="$DOMAIN"

    # Check A records
    local a_records=$(list_dns_records "A" "$full_domain")
    local a_count=$(echo "$a_records" | jq -r '.result | length')

    if [ "$a_count" -gt 0 ]; then
        log_warning "Found $a_count existing A record(s) for $DOMAIN"
        echo "$a_records" | jq -r '.result[] | "  - \(.content) (ID: \(.id))"'

        # Delete each A record
        echo "$a_records" | jq -r '.result[] | .id' | while read -r record_id; do
            delete_dns_record "$record_id" "A" "$full_domain"
        done
    else
        log_info "No existing A records found for $DOMAIN"
    fi

    # Check AAAA records
    local aaaa_records=$(list_dns_records "AAAA" "$full_domain")
    local aaaa_count=$(echo "$aaaa_records" | jq -r '.result | length')

    if [ "$aaaa_count" -gt 0 ]; then
        log_warning "Found $aaaa_count existing AAAA record(s) for $DOMAIN"
        echo "$aaaa_records" | jq -r '.result[] | "  - \(.content) (ID: \(.id))"'

        # Delete each AAAA record
        echo "$aaaa_records" | jq -r '.result[] | .id' | while read -r record_id; do
            delete_dns_record "$record_id" "AAAA" "$full_domain"
        done
    else
        log_info "No existing AAAA records found for $DOMAIN"
    fi

    # If SETUP_WWW is true, also check www subdomain
    if [ "$SETUP_WWW" = "true" ]; then
        local www_domain="www.$DOMAIN"

        # Check www A records
        local www_a_records=$(list_dns_records "A" "$www_domain")
        local www_a_count=$(echo "$www_a_records" | jq -r '.result | length')

        if [ "$www_a_count" -gt 0 ]; then
            log_warning "Found $www_a_count existing A record(s) for www.$DOMAIN"
            echo "$www_a_records" | jq -r '.result[] | "  - \(.content) (ID: \(.id))"'

            echo "$www_a_records" | jq -r '.result[] | .id' | while read -r record_id; do
                delete_dns_record "$record_id" "A" "$www_domain"
            done
        fi

        # Check www AAAA records
        local www_aaaa_records=$(list_dns_records "AAAA" "$www_domain")
        local www_aaaa_count=$(echo "$www_aaaa_records" | jq -r '.result | length')

        if [ "$www_aaaa_count" -gt 0 ]; then
            log_warning "Found $www_aaaa_count existing AAAA record(s) for www.$DOMAIN"
            echo "$www_aaaa_records" | jq -r '.result[] | "  - \(.content) (ID: \(.id))"'

            echo "$www_aaaa_records" | jq -r '.result[] | .id' | while read -r record_id; do
                delete_dns_record "$record_id" "AAAA" "$www_domain"
            done
        fi
    fi
}

# Create DNS record
create_dns_record() {
    local record_type=$1
    local record_name=$2
    local record_content=$3
    local proxied=${4:-false}

    log_info "Creating $record_type record: $record_name -> $record_content (proxied: $proxied)"

    local response=$(curl -s -X POST \
        "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"type\": \"$record_type\",
            \"name\": \"$record_name\",
            \"content\": \"$record_content\",
            \"ttl\": 1,
            \"proxied\": $proxied
        }")

    local success=$(echo "$response" | jq -r '.success')

    if [ "$success" = "true" ]; then
        local record_id=$(echo "$response" | jq -r '.result.id')
        log_success "Created $record_type record: $record_name (ID: $record_id)"
    else
        log_error "Failed to create $record_type record: $record_name"
        echo "$response" | jq '.'
        exit 1
    fi
}

# Create TXT record for Firebase verification
create_txt_record() {
    log_info "Creating TXT record for Firebase domain verification..."

    # Check if TXT record already exists
    local full_domain="$DOMAIN"
    local txt_records=$(list_dns_records "TXT" "$full_domain")
    local existing_txt=$(echo "$txt_records" | jq -r ".result[] | select(.content == \"$FIREBASE_TXT_VALUE\") | .id")

    if [ -n "$existing_txt" ]; then
        log_warning "TXT record already exists (ID: $existing_txt)"
        log_info "Skipping TXT record creation"
    else
        create_dns_record "TXT" "$DOMAIN" "$FIREBASE_TXT_VALUE" "false"
    fi
}

# Create A records for Firebase Hosting
create_a_records() {
    log_info "Creating A records for Firebase Hosting..."

    # Create first A record
    create_dns_record "A" "$DOMAIN" "$FIREBASE_IP_1" "false"

    # Create second A record if provided
    if [ -n "$FIREBASE_IP_2" ]; then
        create_dns_record "A" "$DOMAIN" "$FIREBASE_IP_2" "false"
        log_success "Created 2 A records for $DOMAIN"
    else
        log_success "Created 1 A record for $DOMAIN"
        log_info "Note: Some Firebase projects only receive one IP address - this is normal"
    fi
}

# Create www subdomain records
create_www_records() {
    if [ "$SETUP_WWW" != "true" ]; then
        return
    fi

    log_info "Creating www subdomain records..."

    # Create first A record for www
    create_dns_record "A" "www.$DOMAIN" "$FIREBASE_IP_1" "false"

    # Create second A record for www if provided
    if [ -n "$FIREBASE_IP_2" ]; then
        create_dns_record "A" "www.$DOMAIN" "$FIREBASE_IP_2" "false"
        log_success "Created 2 A records for www.$DOMAIN"
    else
        log_success "Created 1 A record for www.$DOMAIN"
    fi
}

# Verify DNS records were created
verify_dns_records() {
    log_info "Verifying DNS records..."

    sleep 2  # Wait for Cloudflare to propagate internally

    local full_domain="$DOMAIN"

    # Verify TXT record
    local txt_records=$(list_dns_records "TXT" "$full_domain")
    local txt_count=$(echo "$txt_records" | jq -r '.result | length')

    if [ "$txt_count" -eq 0 ]; then
        log_error "TXT record verification failed - no records found"
    else
        log_success "TXT record verified ($txt_count record(s))"
    fi

    # Verify A records
    local a_records=$(list_dns_records "A" "$full_domain")
    local a_count=$(echo "$a_records" | jq -r '.result | length')

    if [ "$a_count" -lt 2 ]; then
        log_warning "Expected 2 A records, found $a_count"
    else
        log_success "A records verified ($a_count record(s))"
    fi

    # Verify www if configured
    if [ "$SETUP_WWW" = "true" ]; then
        local www_domain="www.$DOMAIN"
        local www_a_records=$(list_dns_records "A" "$www_domain")
        local www_a_count=$(echo "$www_a_records" | jq -r '.result | length')

        if [ "$www_a_count" -lt 2 ]; then
            log_warning "Expected 2 A records for www, found $www_a_count"
        else
            log_success "www subdomain A records verified ($www_a_count record(s))"
        fi
    fi
}

# Display summary
display_summary() {
    echo ""
    echo "=========================================="
    echo "DNS Configuration Complete"
    echo "=========================================="
    echo ""
    echo "Domain: $DOMAIN"
    echo ""
    echo "DNS Records Created:"
    echo "  - TXT record: $DOMAIN"
    echo "    Value: $FIREBASE_TXT_VALUE"
    echo "  - A record: $DOMAIN -> $FIREBASE_IP_1"
    echo "  - A record: $DOMAIN -> $FIREBASE_IP_2"

    if [ "$SETUP_WWW" = "true" ]; then
        echo "  - A record: www.$DOMAIN -> $FIREBASE_IP_1"
        echo "  - A record: www.$DOMAIN -> $FIREBASE_IP_2"
    fi

    echo ""
    echo "Proxy Status: DNS only (grey cloud)"
    echo ""
    echo "Next Steps:"
    echo "  1. Go to Firebase Console and click 'Verify' for your domain"
    echo "  2. Wait for SSL certificate provisioning (up to 24 hours)"
    echo "  3. Once status shows 'Connected', optionally enable Cloudflare proxy"
    echo ""
    echo "Verification Commands:"
    echo "  dig A $DOMAIN +short"
    echo "  dig TXT $DOMAIN +short"

    if [ "$SETUP_WWW" = "true" ]; then
        echo "  dig A www.$DOMAIN +short"
    fi

    echo ""
    echo "Firebase Console:"
    echo "  https://console.firebase.google.com/project/YOUR-PROJECT/hosting/sites"
    echo ""
}

# Main execution
main() {
    log_info "Starting Cloudflare DNS setup for Firebase Hosting"
    echo ""

    # Check dependencies
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed. Please install jq first."
        echo "  - macOS: brew install jq"
        echo "  - Ubuntu/Debian: sudo apt-get install jq"
        echo "  - CentOS/RHEL: sudo yum install jq"
        exit 1
    fi

    # Check environment variables
    check_env_vars

    # Verify API token
    verify_api_token
    echo ""

    # Delete conflicting records
    delete_conflicting_records
    echo ""

    # Create TXT record
    create_txt_record
    echo ""

    # Create A records
    create_a_records
    echo ""

    # Create www records if requested
    create_www_records
    echo ""

    # Verify records
    verify_dns_records
    echo ""

    # Display summary
    display_summary

    log_success "Setup complete!"
}

# Run main function
main
