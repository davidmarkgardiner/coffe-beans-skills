#!/bin/bash

# Enable Cloudflare Proxy for Firebase Hosting
# Run this ONLY after Firebase SSL status shows "Connected"

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

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
        echo ""
        echo "Optional:"
        echo "  export ENABLE_WWW_PROXY=\"true\"  # Also enable proxy for www"
        exit 1
    fi
}

# List DNS records
list_dns_records() {
    local record_type=$1
    local record_name=$2

    curl -s -X GET \
        "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?type=$record_type&name=$record_name" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json"
}

# Update DNS record to enable proxy
enable_proxy_for_record() {
    local record_id=$1
    local record_name=$2

    log_info "Enabling proxy for record: $record_name (ID: $record_id)"

    local response=$(curl -s -X PATCH \
        "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$record_id" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"proxied": true}')

    local success=$(echo "$response" | jq -r '.success')

    if [ "$success" = "true" ]; then
        log_success "Enabled proxy for: $record_name"
    else
        log_error "Failed to enable proxy for: $record_name"
        echo "$response" | jq '.'
        exit 1
    fi
}

# Enable proxy for apex domain
enable_proxy_apex() {
    log_info "Enabling Cloudflare proxy for $DOMAIN..."

    local full_domain="$DOMAIN"
    local a_records=$(list_dns_records "A" "$full_domain")
    local record_count=$(echo "$a_records" | jq -r '.result | length')

    if [ "$record_count" -eq 0 ]; then
        log_error "No A records found for $DOMAIN"
        exit 1
    fi

    log_info "Found $record_count A record(s) for $DOMAIN"

    # Enable proxy for each A record
    echo "$a_records" | jq -r '.result[] | .id' | while read -r record_id; do
        enable_proxy_for_record "$record_id" "$full_domain"
    done

    log_success "Enabled proxy for all A records of $DOMAIN"
}

# Enable proxy for www subdomain
enable_proxy_www() {
    if [ "$ENABLE_WWW_PROXY" != "true" ]; then
        return
    fi

    log_info "Enabling Cloudflare proxy for www.$DOMAIN..."

    local www_domain="www.$DOMAIN"
    local www_a_records=$(list_dns_records "A" "$www_domain")
    local www_record_count=$(echo "$www_a_records" | jq -r '.result | length')

    if [ "$www_record_count" -eq 0 ]; then
        log_warning "No A records found for www.$DOMAIN, skipping"
        return
    fi

    log_info "Found $www_record_count A record(s) for www.$DOMAIN"

    # Enable proxy for each www A record
    echo "$www_a_records" | jq -r '.result[] | .id' | while read -r record_id; do
        enable_proxy_for_record "$record_id" "$www_domain"
    done

    log_success "Enabled proxy for all A records of www.$DOMAIN"
}

# Verify proxy is enabled
verify_proxy() {
    log_info "Verifying proxy status..."

    sleep 2  # Wait for changes to propagate

    local full_domain="$DOMAIN"
    local a_records=$(list_dns_records "A" "$full_domain")
    local proxied_count=$(echo "$a_records" | jq -r '[.result[] | select(.proxied == true)] | length')
    local total_count=$(echo "$a_records" | jq -r '.result | length')

    if [ "$proxied_count" -eq "$total_count" ]; then
        log_success "All A records for $DOMAIN are now proxied"
    else
        log_warning "Only $proxied_count out of $total_count records are proxied"
    fi

    if [ "$ENABLE_WWW_PROXY" = "true" ]; then
        local www_domain="www.$DOMAIN"
        local www_a_records=$(list_dns_records "A" "$www_domain")
        local www_proxied_count=$(echo "$www_a_records" | jq -r '[.result[] | select(.proxied == true)] | length')
        local www_total_count=$(echo "$www_a_records" | jq -r '.result | length')

        if [ "$www_total_count" -gt 0 ]; then
            if [ "$www_proxied_count" -eq "$www_total_count" ]; then
                log_success "All A records for www.$DOMAIN are now proxied"
            else
                log_warning "Only $www_proxied_count out of $www_total_count www records are proxied"
            fi
        fi
    fi
}

# Display warning
display_warning() {
    echo ""
    echo "=========================================="
    log_warning "IMPORTANT WARNING"
    echo "=========================================="
    echo ""
    echo "You should ONLY enable Cloudflare proxy AFTER:"
    echo "  1. Firebase domain status shows 'Connected' (green checkmark)"
    echo "  2. SSL certificate is fully provisioned"
    echo "  3. Your site is accessible via HTTPS"
    echo ""
    echo "Enabling proxy too early will prevent Firebase from provisioning SSL."
    echo ""
    read -p "Have you verified Firebase status is 'Connected'? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Aborting. Enable proxy only after Firebase SSL is connected."
        exit 0
    fi
}

# Display summary
display_summary() {
    echo ""
    echo "=========================================="
    echo "Cloudflare Proxy Enabled"
    echo "=========================================="
    echo ""
    echo "Domain: $DOMAIN"
    echo ""
    echo "Changes made:"
    echo "  - Enabled Cloudflare proxy (orange cloud) for $DOMAIN"

    if [ "$ENABLE_WWW_PROXY" = "true" ]; then
        echo "  - Enabled Cloudflare proxy (orange cloud) for www.$DOMAIN"
    fi

    echo ""
    echo "Benefits:"
    echo "  - DDoS protection"
    echo "  - Web Application Firewall (WAF)"
    echo "  - Content caching at edge"
    echo "  - Improved performance"
    echo ""
    echo "Next steps:"
    echo "  1. Test your site: https://$DOMAIN"
    echo "  2. Check site loads correctly"
    echo "  3. Monitor for any certificate warnings"
    echo "  4. If issues occur, disable proxy (switch to DNS only)"
    echo ""
    echo "Verification:"
    echo "  dig A $DOMAIN +short"
    echo "  # Should now show Cloudflare IPs (172.X or 104.X), not Firebase IPs"
    echo ""
}

# Main execution
main() {
    log_info "Cloudflare Proxy Enablement Script"
    echo ""

    # Check jq dependency
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed"
        exit 1
    fi

    # Check environment variables
    check_env_vars

    # Display warning and get confirmation
    display_warning
    echo ""

    # Enable proxy for apex domain
    enable_proxy_apex
    echo ""

    # Enable proxy for www subdomain
    enable_proxy_www
    echo ""

    # Verify changes
    verify_proxy
    echo ""

    # Display summary
    display_summary

    log_success "Proxy enabled successfully!"
}

# Run main function
main
