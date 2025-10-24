#!/bin/bash

# Verify DNS Records for Firebase Hosting Setup
# This script checks if DNS records are properly configured and propagated

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

# Check if domain is provided
if [ -z "$1" ]; then
    log_error "Usage: $0 <domain> [firebase_ip_1] [firebase_ip_2]"
    echo ""
    echo "Example:"
    echo "  $0 stockbridgecoffee.co.uk 151.101.1.195 151.101.65.195"
    exit 1
fi

DOMAIN=$1
EXPECTED_IP_1=${2:-"151.101.1.195"}
EXPECTED_IP_2=${3:-"151.101.65.195"}

echo "=========================================="
echo "DNS Verification for Firebase Hosting"
echo "=========================================="
echo ""
echo "Domain: $DOMAIN"
echo "Expected IPs: $EXPECTED_IP_1, $EXPECTED_IP_2"
echo ""

# Check nameservers
log_info "Checking nameservers..."
NS_RECORDS=$(dig NS "$DOMAIN" +short 2>/dev/null || echo "")

if [ -z "$NS_RECORDS" ]; then
    log_error "Could not resolve nameservers"
else
    echo "$NS_RECORDS" | while read -r ns; do
        if echo "$ns" | grep -qi "cloudflare"; then
            log_success "Nameserver: $ns (Cloudflare)"
        else
            log_warning "Nameserver: $ns (Not Cloudflare)"
        fi
    done
fi
echo ""

# Check A records for apex domain
log_info "Checking A records for $DOMAIN..."
A_RECORDS=$(dig A "$DOMAIN" +short 2>/dev/null || echo "")

if [ -z "$A_RECORDS" ]; then
    log_error "No A records found for $DOMAIN"
else
    RECORD_COUNT=$(echo "$A_RECORDS" | wc -l | tr -d ' ')

    if [ "$RECORD_COUNT" -lt 2 ]; then
        log_warning "Found only $RECORD_COUNT A record(s), expected 2"
    else
        log_success "Found $RECORD_COUNT A record(s)"
    fi

    echo "$A_RECORDS" | while read -r ip; do
        if [ "$ip" = "$EXPECTED_IP_1" ] || [ "$ip" = "$EXPECTED_IP_2" ]; then
            log_success "A record: $ip (Firebase IP)"
        elif echo "$ip" | grep -qE '^(172\.6[0-9]|104\.1[0-9]|131\.0)'; then
            log_warning "A record: $ip (Cloudflare proxy IP - disable proxy for initial setup)"
        else
            log_warning "A record: $ip (Unknown IP)"
        fi
    done
fi
echo ""

# Check TXT records for verification
log_info "Checking TXT records for $DOMAIN..."
TXT_RECORDS=$(dig TXT "$DOMAIN" +short 2>/dev/null || echo "")

if [ -z "$TXT_RECORDS" ]; then
    log_warning "No TXT records found"
else
    FIREBASE_TXT=$(echo "$TXT_RECORDS" | grep -i "firebase" || echo "")

    if [ -n "$FIREBASE_TXT" ]; then
        log_success "Firebase verification TXT record found:"
        echo "  $FIREBASE_TXT"
    else
        log_warning "TXT records found, but no Firebase verification record"
        echo "$TXT_RECORDS" | while read -r txt; do
            echo "  $txt"
        done
    fi
fi
echo ""

# Check www subdomain
log_info "Checking www subdomain..."
WWW_A_RECORDS=$(dig A "www.$DOMAIN" +short 2>/dev/null || echo "")

if [ -z "$WWW_A_RECORDS" ]; then
    log_info "No www subdomain configured"
else
    WWW_RECORD_COUNT=$(echo "$WWW_A_RECORDS" | wc -l | tr -d ' ')

    if [ "$WWW_RECORD_COUNT" -lt 2 ]; then
        log_warning "Found only $WWW_RECORD_COUNT A record(s) for www, expected 2"
    else
        log_success "Found $WWW_RECORD_COUNT A record(s) for www"
    fi

    echo "$WWW_A_RECORDS" | while read -r ip; do
        if [ "$ip" = "$EXPECTED_IP_1" ] || [ "$ip" = "$EXPECTED_IP_2" ]; then
            log_success "www A record: $ip (Firebase IP)"
        elif echo "$ip" | grep -qE '^(172\.6[0-9]|104\.1[0-9]|131\.0)'; then
            log_warning "www A record: $ip (Cloudflare proxy IP)"
        else
            log_warning "www A record: $ip (Unknown IP)"
        fi
    done
fi
echo ""

# Check HTTPS availability
log_info "Checking HTTPS availability..."
if command -v curl &> /dev/null; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://$DOMAIN" 2>/dev/null || echo "000")

    if [ "$HTTP_STATUS" = "000" ]; then
        log_error "Cannot connect to https://$DOMAIN (connection timeout)"
    elif [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
        log_success "HTTPS is working (HTTP $HTTP_STATUS)"
    elif [ "$HTTP_STATUS" -ge 300 ] && [ "$HTTP_STATUS" -lt 400 ]; then
        log_success "HTTPS redirect configured (HTTP $HTTP_STATUS)"
    else
        log_warning "HTTPS returned HTTP $HTTP_STATUS"
    fi
else
    log_info "curl not available, skipping HTTPS check"
fi
echo ""

# Check SSL certificate
log_info "Checking SSL certificate..."
if command -v openssl &> /dev/null; then
    CERT_INFO=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -issuer -subject -dates 2>/dev/null || echo "")

    if [ -z "$CERT_INFO" ]; then
        log_error "Could not retrieve SSL certificate"
    else
        ISSUER=$(echo "$CERT_INFO" | grep "issuer" || echo "Unknown issuer")
        SUBJECT=$(echo "$CERT_INFO" | grep "subject" || echo "Unknown subject")
        NOT_AFTER=$(echo "$CERT_INFO" | grep "notAfter" || echo "Unknown expiry")

        if echo "$ISSUER" | grep -qi "let's encrypt\|google"; then
            log_success "SSL certificate found:"
            echo "  $ISSUER"
            echo "  $SUBJECT"
            echo "  $NOT_AFTER"
        else
            log_warning "SSL certificate found (non-Firebase issuer):"
            echo "  $ISSUER"
        fi
    fi
else
    log_info "openssl not available, skipping SSL check"
fi
echo ""

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo ""

# Count issues
ISSUES=0

if [ -z "$A_RECORDS" ]; then
    ISSUES=$((ISSUES + 1))
fi

if [ -z "$TXT_RECORDS" ] || [ -z "$FIREBASE_TXT" ]; then
    ISSUES=$((ISSUES + 1))
fi

if [ "$HTTP_STATUS" != "200" ] && [ "$HTTP_STATUS" != "301" ] && [ "$HTTP_STATUS" != "302" ]; then
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    log_success "All checks passed!"
    echo ""
    echo "Your domain appears to be correctly configured."
    echo "If Firebase still shows 'Pending', wait up to 24 hours for SSL provisioning."
else
    log_warning "Found $ISSUES issue(s) that may need attention"
    echo ""
    echo "Next steps:"
    echo "  1. Verify DNS records in Cloudflare dashboard"
    echo "  2. Ensure Cloudflare proxy is disabled (DNS only/grey cloud)"
    echo "  3. Wait 5-10 minutes for DNS propagation"
    echo "  4. Check Firebase Console for verification status"
fi

echo ""
echo "Firebase Console:"
echo "  https://console.firebase.google.com/project/YOUR-PROJECT/hosting/sites"
echo ""
