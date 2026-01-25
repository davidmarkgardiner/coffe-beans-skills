---
name: cloudflare-firebase-domain
description: Expert guidance for connecting Cloudflare-managed domains to Firebase Hosting, including manual setup steps, DNS configuration, SSL/TLS provisioning, and automated Cloudflare API scripts for DNS record management. Use when configuring custom domains for Firebase-hosted applications with Cloudflare DNS.
---

# Cloudflare-Firebase Domain Connection Skill

## Overview

This skill provides comprehensive guidance and automation tools for connecting domains managed by Cloudflare to Firebase Hosting. It covers the complete workflow from initial Firebase setup through DNS configuration, domain verification, and SSL certificate provisioning.

**Key Features:**
- **Step-by-step manual setup** via Firebase Console and Cloudflare dashboard
- **Automated DNS management** using Cloudflare API scripts
- **SSL/TLS provisioning guidance** for Firebase-managed certificates
- **Troubleshooting and verification** procedures
- **Proxy configuration** recommendations for Cloudflare CDN

## When to Use This Skill

Use this skill when:
- Connecting a Cloudflare-managed domain to Firebase Hosting
- Configuring custom domains for web applications deployed on Firebase
- Troubleshooting domain connection or SSL certificate issues
- Automating DNS record creation/updates via Cloudflare API
- Migrating from Firebase default domains to custom domains
- Setting up both apex domains and www subdomains
- Understanding the interaction between Cloudflare's proxy and Firebase's SSL provisioning

## Architecture Overview

### Two-Part Process

**Part 1: Firebase Console (Manual - Required)**
- Add custom domain in Firebase Hosting
- Obtain domain verification TXT record
- Receive Firebase A record IP addresses
- Monitor SSL certificate provisioning status

**Part 2: Cloudflare DNS (Manual or Automated)**
- Add TXT record for domain ownership verification
- Create A records pointing to Firebase IPs
- Configure proxy settings (DNS-only initially, then proxied optionally)
- Manage www and apex domain redirects

### Why Manual Setup is Required in Firebase

**Important Limitation**: The Firebase CLI does **not** provide commands to add custom domains. You must use the Firebase Console web UI to:
1. Initiate the custom domain setup
2. Retrieve your unique verification TXT record
3. Get the specific A record IP addresses for your project

This is a Firebase platform limitation, not a workflow choice.

### Why Cloudflare API Automation is Valuable

While Firebase setup must be manual, Cloudflare DNS management **can** be automated because:
- DNS record creation/deletion is repetitive and error-prone
- API automation ensures correct record formatting
- Bulk operations are faster (especially for www + apex)
- Configuration can be version-controlled
- Reduces typos in IP addresses and record values

## Quick Start Guide

### Prerequisites

Before starting, ensure you have:
- [ ] Firebase project with Hosting enabled
- [ ] Domain registered and managed by Cloudflare
- [ ] Cloudflare account access with DNS edit permissions
- [ ] (For automation) Cloudflare API token with Zone:DNS:Edit scope

### Step 1: Start Firebase Domain Setup

1. **Open Firebase Console**: Navigate to your Firebase Hosting page:
   ```
   https://console.firebase.google.com/u/0/project/YOUR-PROJECT-ID/hosting/sites/YOUR-SITE-ID
   ```

2. **Add Custom Domain**:
   - Click **Add custom domain**
   - Enter your domain (e.g., `stockbridgecoffee.co.uk`)
   - Choose redirect preference (apex → www or www → apex)
   - Click **Continue**

3. **Save Verification Record**:
   - Firebase will display a **TXT record**:
     - **Host/Name**: Usually `@` or your domain
     - **Value**: A unique verification string
     - **Format variations**: `firebase=YOUR-CODE` or `hosting-site=YOUR-SITE-ID`
   - **Keep this tab open** - you'll need these values for Cloudflare

4. **Note the A Records**:
   - Firebase will provide **one or two A record IP addresses**
   - **Important**: You may receive only ONE IP instead of two (both scenarios are valid)
   - Example IPs:
     - `199.36.158.100`
     - `151.101.1.195`
     - `151.101.65.195`
   - These are the IPs you'll point your domain to

5. **Note the ACME Challenge Record** (appears after initial verification):
   - Firebase will also display an **ACME challenge TXT record** for SSL provisioning:
     - **Host/Name**: `_acme-challenge.yourdomain.com` or `_acme-challenge`
     - **Value**: A long alphanumeric string (e.g., `Sgpa42kGjPkbaQH2WiE6u22fp0Ev8dVXe1X1CTeA7mI`)
   - **Purpose**: Let's Encrypt uses this to verify domain ownership for SSL certificate issuance
   - **Critical**: This record MUST be added for SSL provisioning to complete

### Step 2: Configure Cloudflare DNS

#### Option A: Manual Configuration (Beginner-Friendly)

1. **Go to Cloudflare Dashboard**: Navigate to DNS settings:
   ```
   https://dash.cloudflare.com/YOUR-ACCOUNT-ID/YOUR-DOMAIN/dns
   ```

2. **Add TXT Record for Verification**:
   - Click **Add record**
   - **Type**: TXT
   - **Name**: `@` (or value from Firebase)
   - **Content**: Paste the verification string from Firebase
   - **TTL**: Auto
   - Click **Save**

3. **Verify Domain in Firebase**:
   - Return to Firebase Console
   - Click **Verify**
   - Wait for verification (may take 1-5 minutes for DNS propagation)
   - Once verified, Firebase will show the A records

4. **Delete Conflicting Records** (if any):
   - In Cloudflare, delete any existing A or AAAA records for `@` (root domain)
   - Keep TXT, MX, CNAME records for other services (email, etc.)

5. **Add Firebase A Records**:
   - Click **Add record** for each IP from Firebase
   - **Type**: A
   - **Name**: `@`
   - **IPv4 address**: First Firebase IP (e.g., `199.36.158.100` or `151.101.1.195`)
   - **Proxy status**: **DNS only** (grey cloud) ← **Critical for initial setup**
   - Click **Save**
   - **If Firebase provided a second IP**, repeat for that IP
   - **Note**: Some Firebase projects only receive one IP address - this is normal

5a. **Add ACME Challenge TXT Record** (Critical for SSL):
   - After domain verification, Firebase will show an ACME challenge record
   - Click **Add record** in Cloudflare
   - **Type**: TXT
   - **Name**: `_acme-challenge` (or `_acme-challenge.yourdomain.com`)
   - **Content**: Paste the ACME challenge string from Firebase (long alphanumeric value)
   - **TTL**: Auto
   - Click **Save**
   - **Why needed**: Let's Encrypt requires this to provision your SSL certificate
   - **Multiple values OK**: If you see multiple ACME challenge values in DNS from previous attempts, this is fine - Let's Encrypt will find the correct one

6. **(Optional) Add www Subdomain**:
   - Click **Add record**
   - **Type**: A
   - **Name**: `www`
   - **IPv4 address**: First Firebase IP
   - **Proxy status**: **DNS only** (grey cloud)
   - Click **Save**
   - Repeat for second IP

7. **Verify in Firebase**:
   - Firebase will automatically detect the A records
   - SSL certificate provisioning will begin (up to 24 hours)
   - Status will show: Pending → Connected

#### Option B: Automated via Cloudflare API (Advanced)

See `scripts/cloudflare-dns-setup.sh` for a complete automation script.

**Quick usage**:
```bash
# Set environment variables
export CLOUDFLARE_API_TOKEN="your-token-here"
export CLOUDFLARE_ZONE_ID="your-zone-id"
export DOMAIN="stockbridgecoffee.co.uk"
export FIREBASE_IP_1="151.101.1.195"
export FIREBASE_IP_2="151.101.65.195"
export FIREBASE_TXT_VALUE="firebase=your-verification-code"

# Run setup script
bash scripts/cloudflare-dns-setup.sh
```

The script will:
1. Verify API token and zone access
2. Delete conflicting A/AAAA records
3. Add TXT record for verification
4. Add both A records with DNS-only mode
5. Optionally add www subdomain records
6. Verify records were created successfully

### Step 3: SSL Certificate Provisioning

After DNS configuration:

1. **Wait for Firebase**: SSL certificate provisioning can take **up to 24 hours**
   - Typical time: 15 minutes to 4 hours
   - Status in Firebase Console will update automatically

2. **Monitor Progress**:
   - Check Firebase Console regularly
   - Status progression: Pending → Provisioning → Connected

3. **Verify Certificate**:
   ```bash
   # Check SSL certificate
   curl -I https://stockbridgecoffee.co.uk

   # Verify Firebase hosting
   curl https://stockbridgecoffee.co.uk
   ```

4. **(Optional) Enable Cloudflare Proxy**:
   - Once SSL is **Connected** in Firebase
   - Return to Cloudflare DNS settings
   - Change Proxy status from **DNS only** (grey) to **Proxied** (orange)
   - This enables Cloudflare CDN and security features
   - **Warning**: Do not enable proxy before Firebase SSL is provisioned

### Step 4: Verification and Testing

1. **DNS Propagation Check**:
   ```bash
   # Check A records
   dig A stockbridgecoffee.co.uk +short

   # Check TXT record
   dig TXT stockbridgecoffee.co.uk +short

   # Check www subdomain
   dig A www.stockbridgecoffee.co.uk +short
   ```

2. **Firebase Connection Status**:
   - Open Firebase Console
   - Navigate to Hosting → Custom domains
   - Verify status shows **Connected** (green checkmark)

3. **SSL/TLS Certificate**:
   ```bash
   # Check certificate details
   openssl s_client -connect stockbridgecoffee.co.uk:443 -servername stockbridgecoffee.co.uk < /dev/null 2>/dev/null | openssl x509 -noout -text

   # Should show:
   # - Issuer: Let's Encrypt or Google Trust Services
   # - Subject: your domain
   # - Valid dates
   ```

4. **HTTP to HTTPS Redirect**:
   ```bash
   # Test redirect
   curl -I http://stockbridgecoffee.co.uk

   # Should show:
   # HTTP/1.1 301 Moved Permanently
   # Location: https://stockbridgecoffee.co.uk/
   ```

5. **WWW Redirect** (if configured):
   ```bash
   # Test www redirect
   curl -I https://www.stockbridgecoffee.co.uk

   # Should redirect to apex or vice versa
   ```

## Detailed Implementation Guide

### Understanding Firebase Hosting Requirements

Firebase Hosting requires:
1. **Domain ownership verification** via TXT record (permanent)
2. **A records** pointing to Firebase IPs (permanent)
3. **Direct IP access** for initial SSL provisioning (no proxy initially)
4. **Valid SSL certificate** before enabling Cloudflare proxy

### Cloudflare Proxy Settings Explained

**DNS only (grey cloud)**:
- DNS resolves directly to Firebase IPs
- No Cloudflare CDN or WAF
- Required for initial Firebase SSL provisioning
- Firebase needs direct IP access to provision certificates

**Proxied (orange cloud)**:
- DNS resolves to Cloudflare IPs
- Traffic routed through Cloudflare CDN
- Adds DDoS protection, caching, WAF
- Can be enabled **after** Firebase SSL is connected
- May cause issues if enabled too early

**Recommended workflow**:
1. Start with DNS only (grey cloud)
2. Wait for Firebase SSL: Connected
3. Optionally switch to Proxied (orange cloud)
4. Monitor for any issues (certificate warnings, connection errors)

### Firebase A Record IPs

Firebase provides **two A record IPs** for redundancy. These are typically:
- `151.101.1.195`
- `151.101.65.195`

**Important notes**:
- IPs may vary by region or Firebase project
- Always use the specific IPs from your Firebase Console
- Both IPs should be added (high availability)
- Do not guess or reuse IPs from other projects

### TXT Record for Verification

Firebase generates a unique TXT record like:
```
Host: @
Value: firebase=0a1b2c3d4e5f6g7h8i9j
```

**Key points**:
- TXT record must remain **permanently**
- Do not delete after verification
- Firebase periodically re-checks domain ownership
- Deleting TXT record may cause domain disconnection

### Common DNS Configurations

**Apex domain only** (e.g., `example.com`):
```
Type  Name  Value              Proxy
TXT   @     firebase=...       N/A
A     @     151.101.1.195      DNS only
A     @     151.101.65.195     DNS only
```

**Apex + www redirect to apex**:
```
Type  Name  Value              Proxy
TXT   @     firebase=...       N/A
A     @     151.101.1.195      DNS only
A     @     151.101.65.195     DNS only
A     www   151.101.1.195      DNS only
A     www   151.101.65.195     DNS only
```

In Firebase: Configure "Redirect www.example.com to example.com"

**www + apex redirect to www**:
```
Type  Name  Value              Proxy
TXT   @     firebase=...       N/A
A     @     151.101.1.195      DNS only
A     @     151.101.65.195     DNS only
A     www   151.101.1.195      DNS only
A     www   151.101.65.195     DNS only
```

In Firebase: Configure "Redirect example.com to www.example.com"

## Automation with Cloudflare API

### Prerequisites for Automation

1. **Create Cloudflare API Token**:
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click **Create Token**
   - Use template: **Edit zone DNS**
   - Permissions: `Zone:DNS:Edit`
   - Zone Resources: Include your specific zone
   - Copy token (shown only once)

2. **Get Zone ID**:
   - Go to domain overview in Cloudflare
   - Scroll to **API** section on right sidebar
   - Copy **Zone ID**

3. **Set Environment Variables**:
   ```bash
   export CLOUDFLARE_API_TOKEN="your-token-here"
   export CLOUDFLARE_ZONE_ID="your-zone-id"
   export DOMAIN="your-domain.com"
   ```

### Using the Automation Script

See `scripts/cloudflare-dns-setup.sh` for the complete script.

**Features**:
- Validates API token before making changes
- Safely deletes only conflicting records
- Creates all required DNS records
- Configures DNS-only mode automatically
- Verifies records after creation
- Provides detailed logging
- Handles errors gracefully

**Usage**:
```bash
# 1. Configure environment
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ZONE_ID="your-zone-id"
export DOMAIN="stockbridgecoffee.co.uk"
export FIREBASE_IP_1="151.101.1.195"
export FIREBASE_IP_2="151.101.65.195"
export FIREBASE_TXT_VALUE="firebase=your-code"

# 2. Run script
bash scripts/cloudflare-dns-setup.sh

# 3. Verify records
bash scripts/verify-dns-records.sh
```

### Manual API Calls (for reference)

**List DNS records**:
```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json"
```

**Create A record**:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "A",
    "name": "@",
    "content": "151.101.1.195",
    "ttl": 1,
    "proxied": false
  }'
```

**Create TXT record**:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "TXT",
    "name": "@",
    "content": "firebase=your-verification-code",
    "ttl": 1
  }'
```

**Delete record**:
```bash
curl -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $API_TOKEN"
```

## Troubleshooting Guide

### Domain Verification Fails

**Symptom**: Firebase shows "Verification failed" or "Could not verify domain"

**Causes and solutions**:
1. **TXT record not propagated yet**
   - Wait 5-10 minutes
   - Check propagation: `dig TXT your-domain.com +short`
   - Try verification again

2. **Incorrect TXT record value**
   - Verify exact string from Firebase Console
   - Check for extra spaces or quotes
   - Re-enter in Cloudflare

3. **TXT record not at root domain**
   - Ensure Name is `@`, not blank or domain name
   - Some providers use different conventions

4. **Multiple TXT records conflicting**
   - Check for duplicate TXT records
   - Keep only the Firebase verification record (and any others for email, etc.)

### SSL Certificate Not Provisioning

**Symptom**: Domain status stuck on "Pending" or "Provisioning" for > 24 hours

**Causes and solutions**:
1. **Cloudflare proxy enabled too early**
   - Disable proxy (switch to DNS only / grey cloud)
   - Wait 15-30 minutes
   - Check Firebase status

2. **A records not pointing to Firebase IPs**
   - Verify A records: `dig A your-domain.com +short`
   - Should show Firebase IPs, not Cloudflare IPs
   - If Cloudflare IPs shown, proxy is enabled (disable it)

3. **CAA records blocking Let's Encrypt**
   - Check for CAA records: `dig CAA your-domain.com +short`
   - If present, ensure they allow `letsencrypt.org`
   - Add CAA record: `0 issue "letsencrypt.org"`

4. **Firewall or security rules blocking Firebase**
   - Temporarily disable Cloudflare firewall rules
   - Check WAF logs for blocks
   - Whitelist Firebase IPs if needed

### DNS Records Not Resolving

**Symptom**: `dig` shows NXDOMAIN or no records

**Causes and solutions**:
1. **Records not saved in Cloudflare**
   - Verify records exist in Cloudflare dashboard
   - Check correct zone is selected

2. **DNS propagation delay**
   - Wait 1-5 minutes for Cloudflare (usually instant)
   - Use `dig @1.1.1.1` to query Cloudflare directly

3. **Wrong record name**
   - Verify Name is `@` for apex domain
   - Verify Name is `www` for www subdomain
   - Check for typos

### Site Not Loading After Setup

**Symptom**: Domain connects but site shows errors or doesn't load

**Causes and solutions**:
1. **No content deployed to Firebase Hosting**
   - Deploy your site: `firebase deploy --only hosting`
   - Verify deployment: `firebase hosting:channel:list`

2. **Wrong Firebase site connected to domain**
   - Check Firebase Console → Hosting
   - Verify domain is under correct site ID
   - May need to delete and re-add domain

3. **Cache issues**
   - Clear browser cache
   - Try incognito mode
   - Test from different device

4. **Redirect loop**
   - Check Firebase hosting configuration
   - Verify rewrites and redirects in `firebase.json`
   - Disable Cloudflare proxy if recently enabled

### Cloudflare API Errors

**401 Unauthorized**:
- API token is invalid or expired
- Generate new token with correct permissions
- Verify token has `Zone:DNS:Edit` scope

**403 Forbidden**:
- API token doesn't have access to this zone
- Verify Zone Resources in token settings
- Check account permissions

**404 Not Found**:
- Zone ID is incorrect
- Verify Zone ID from Cloudflare dashboard
- Check API endpoint URL

**429 Rate Limited**:
- Too many API requests
- Wait and retry
- Implement exponential backoff

## Security Best Practices

### API Token Security

1. **Use API tokens, not Global API Key**:
   - Tokens can be scoped to specific permissions
   - Tokens can be revoked individually
   - Global API Key has full account access

2. **Minimum permissions**:
   - Grant only `Zone:DNS:Edit` scope
   - Limit to specific zones
   - Set expiration date if possible

3. **Store tokens securely**:
   - Never commit tokens to git
   - Use environment variables
   - Use secret management tools (e.g., Google Secret Manager)

4. **Rotate tokens regularly**:
   - Generate new tokens every 90 days
   - Revoke old tokens after rotation
   - Audit token usage logs

### DNS Security

1. **DNSSEC** (optional but recommended):
   - Enable in Cloudflare dashboard
   - Prevents DNS spoofing
   - Requires registrar support

2. **CAA Records** (recommended):
   - Specify which CAs can issue certificates
   - Add record: `0 issue "letsencrypt.org"`
   - Prevents unauthorized certificate issuance

3. **Monitor DNS changes**:
   - Enable Cloudflare audit logs
   - Set up alerts for DNS record changes
   - Review regularly for unauthorized changes

### Firebase Security

1. **Never expose Firebase config publicly** (for backend operations):
   - Use environment variables
   - Restrict API keys to specific domains

2. **Configure Firebase Hosting security headers**:
   ```json
   {
     "headers": [{
       "source": "**",
       "headers": [{
         "key": "X-Frame-Options",
         "value": "DENY"
       }, {
         "key": "X-Content-Type-Options",
         "value": "nosniff"
       }, {
         "key": "Strict-Transport-Security",
         "value": "max-age=31536000; includeSubDomains"
       }]
     }]
   }
   ```

3. **Use Firebase Hosting rewrites for SPAs**:
   - Prevents 404s on client-side routes
   - Improves SEO
   ```json
   {
     "rewrites": [{
       "source": "**",
       "destination": "/index.html"
     }]
   }
   ```

## Cost Considerations

### Cloudflare

- **Free Plan**:
  - Unlimited DNS queries
  - Basic DDoS protection
  - Shared SSL certificate
  - CDN with limited features
  - Sufficient for most small-medium sites

- **Pro Plan** ($20/month):
  - Advanced DDoS protection
  - Web Application Firewall (WAF)
  - Custom SSL certificates
  - Faster support

- **API Usage**:
  - No cost for API calls
  - Rate limited to prevent abuse

### Firebase Hosting

- **Free Tier (Spark Plan)**:
  - 10 GB storage
  - 360 MB/day bandwidth
  - Custom domain included
  - SSL certificate included (Let's Encrypt)

- **Blaze Plan** (Pay-as-you-go):
  - $0.026/GB storage after free tier
  - $0.15/GB bandwidth after free tier
  - No minimum charges
  - SSL certificates remain free

### Total Cost Estimate

**Small site** (< 1000 visitors/month):
- Cloudflare: $0 (Free plan)
- Firebase: $0 (within free tier)
- **Total: $0/month**

**Medium site** (10,000 visitors/month, 2 GB bandwidth):
- Cloudflare: $0 (Free plan)
- Firebase: ~$0 (likely within free tier: 360 MB/day = ~11 GB/month)
- **Total: $0-$2/month**

**Large site** (100,000 visitors/month, 20 GB bandwidth):
- Cloudflare: $0-$20 (Free or Pro)
- Firebase: ~$3 (20 GB - 11 GB free = 9 GB × $0.15 = ~$1.35, plus storage)
- **Total: $3-$23/month**

## Advanced Topics

### Multiple Domains for One Firebase Site

To connect multiple domains to the same Firebase Hosting site:

1. **Add each domain in Firebase Console**:
   - Each gets its own verification TXT record
   - Each gets the same A record IPs
   - Each gets its own SSL certificate

2. **Configure DNS in Cloudflare for each domain**:
   - Follow the same setup process
   - Use different TXT record values per domain

3. **Configure redirects** (optional):
   ```json
   {
     "hosting": {
       "redirects": [{
         "source": "https://old-domain.com/**",
         "destination": "https://new-domain.com/:splat",
         "type": 301
       }]
     }
   }
   ```

### Multiple Firebase Sites (Multisite Hosting)

For different sites in one Firebase project:

1. **Create sites in Firebase Console**:
   ```bash
   firebase hosting:sites:create site-name
   ```

2. **Configure in `firebase.json`**:
   ```json
   {
     "hosting": [{
       "site": "site1",
       "public": "site1/dist",
       "target": "site1"
     }, {
       "site": "site2",
       "public": "site2/dist",
       "target": "site2"
     }]
   }
   ```

3. **Connect different domains**:
   - Each site can have its own custom domain
   - Follow standard setup process per site

### Using Cloudflare Workers with Firebase Hosting

For advanced routing or edge logic:

1. **Create Cloudflare Worker**:
   ```javascript
   addEventListener('fetch', event => {
     event.respondWith(handleRequest(event.request))
   })

   async function handleRequest(request) {
     // Custom logic here
     const response = await fetch(request)
     return response
   }
   ```

2. **Route Worker**:
   - Set route pattern in Cloudflare dashboard
   - Worker runs before Firebase
   - Can modify requests/responses

3. **Considerations**:
   - Firebase still handles SSL termination
   - Workers add latency
   - May interfere with Firebase features

### Migrating from Other DNS Providers

To migrate from another DNS provider to Cloudflare:

1. **Export DNS records from current provider**:
   - Most providers offer DNS export (zone file)
   - Save all records (A, AAAA, MX, TXT, CNAME, etc.)

2. **Import to Cloudflare**:
   - Cloudflare can scan existing DNS
   - Manually verify all records imported correctly
   - Pay attention to MX records (email) and TXT records (verification)

3. **Update nameservers at registrar**:
   - Cloudflare provides two nameservers
   - Update at domain registrar (not DNS provider)
   - Example: `kai.ns.cloudflare.com`, `sally.ns.cloudflare.com`

4. **Wait for propagation**:
   - Nameserver changes take 24-48 hours
   - Monitor with `dig NS your-domain.com`

5. **Add Firebase custom domain**:
   - Only after nameservers point to Cloudflare
   - Follow standard setup process

## Resources

### Official Documentation

- **Firebase Hosting Custom Domain**: https://firebase.google.com/docs/hosting/custom-domain
- **Cloudflare API Documentation**: https://developers.cloudflare.com/api/
- **Cloudflare DNS Documentation**: https://developers.cloudflare.com/dns/

### Video Tutorials

- **Firebase Custom Domain Setup**: https://www.youtube.com/watch?v=IBMNvoJcy-k
  - Step-by-step walkthrough
  - Shows Firebase Console workflow
  - Demonstrates DNS configuration

### Tools

- **DNS Propagation Checker**: https://www.whatsmydns.net/
- **SSL Certificate Checker**: https://www.ssllabs.com/ssltest/
- **Cloudflare DNS Checker**: https://1.1.1.1/dns/ (dig equivalent)

### Scripts in This Skill

- `scripts/cloudflare-dns-setup.sh` - Complete DNS automation
- `scripts/verify-dns-records.sh` - Verify DNS configuration
- `scripts/enable-cloudflare-proxy.sh` - Switch to proxied mode after SSL provisioning
- `assets/cloudflare-config-template.env` - Environment variable template

### Reference Files

- `references/api-examples.md` - Complete Cloudflare API reference with examples
- `references/troubleshooting-flowchart.md` - Visual troubleshooting guide
- `references/security-checklist.md` - Security configuration checklist
- `references/migration-guide.md` - Step-by-step migration from other DNS providers

## Quick Reference

### Essential Commands

```bash
# Check DNS A records
dig A your-domain.com +short

# Check TXT record (verification)
dig TXT your-domain.com +short

# Check nameservers
dig NS your-domain.com +short

# Test SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check HTTP to HTTPS redirect
curl -I http://your-domain.com

# Test site loading
curl https://your-domain.com
```

### Firebase Console URLs

```
# Hosting overview
https://console.firebase.google.com/u/0/project/PROJECT-ID/hosting/sites

# Custom domains
https://console.firebase.google.com/u/0/project/PROJECT-ID/hosting/sites/SITE-ID

# Deployment history
https://console.firebase.google.com/u/0/project/PROJECT-ID/hosting/sites/SITE-ID/history
```

### Cloudflare Dashboard URLs

```
# DNS management
https://dash.cloudflare.com/ACCOUNT-ID/DOMAIN/dns

# SSL/TLS settings
https://dash.cloudflare.com/ACCOUNT-ID/DOMAIN/ssl-tls

# API tokens
https://dash.cloudflare.com/profile/api-tokens
```

### Typical Timeline

- **DNS propagation**: 1-5 minutes (Cloudflare is very fast)
- **Domain verification**: Immediate after propagation
- **SSL provisioning**: 15 minutes to 24 hours (typically 1-4 hours)
- **Total setup time**: Manual: 10-15 minutes + SSL wait | Automated: 5 minutes + SSL wait

### Checklist

Setup checklist for quick reference:

**Firebase (Manual)**:
- [ ] Add custom domain in Firebase Console
- [ ] Note down TXT verification record value
- [ ] Note down A record IP(s) - may be one or two IPs
- [ ] Note down ACME challenge TXT record (appears after initial verification)

**Cloudflare (Manual or Automated)**:
- [ ] Add TXT record for domain verification
- [ ] Delete conflicting A/AAAA records
- [ ] Add A record(s) with DNS only mode (one or two IPs)
- [ ] Add ACME challenge TXT record (_acme-challenge subdomain)
- [ ] (Optional) Add www A records

**Verification**:
- [ ] Verify domain in Firebase Console
- [ ] Wait for SSL: Connected status (typically 15min-4hrs, can be instant)
- [ ] Test HTTPS access
- [ ] Test HTTP → HTTPS redirect
- [ ] (Optional) Enable Cloudflare proxy

---

## Lessons Learned from Production Deployments

Based on real-world deployment experience with stockbridgecoffee.co.uk (October 2025):

### 1. ACME Challenge Record is Critical

**Discovery**: Firebase requires an `_acme-challenge` TXT record for SSL provisioning that is NOT mentioned in basic setup guides.

**Details:**
- Record name: `_acme-challenge.yourdomain.com`
- Value: Long alphanumeric string from Firebase Console
- Purpose: Let's Encrypt domain verification for SSL certificate
- Timing: Appears in Firebase Console after initial domain verification
- **Impact**: SSL provisioning will fail/stall without this record

**Best Practice**: Always check Firebase Console for the ACME challenge record after domain verification completes.

### 2. Single IP Address is Valid

**Discovery**: Not all Firebase projects receive two A record IP addresses.

**Details:**
- Traditional documentation shows two IPs (151.101.1.195, 151.101.65.195)
- Some projects receive only one IP (e.g., 199.36.158.100)
- Both scenarios are completely valid
- Single IP does NOT indicate a problem

**Best Practice**: Accept whatever Firebase provides - don't wait for a second IP if only one is shown.

### 3. TXT Record Format Variations

**Discovery**: Firebase verification TXT records have multiple format patterns.

**Formats observed:**
- `firebase=abcd1234efgh5678` (traditional format)
- `hosting-site=site-id` (newer format)

**Best Practice**: Copy the exact value from Firebase Console - format doesn't matter as long as it matches.

### 4. Multiple ACME Challenge Values are Normal

**Discovery**: DNS may show multiple `_acme-challenge` TXT values from previous setup attempts.

**Details:**
- Previous failed attempts leave old ACME challenge records
- Let's Encrypt checks all values and finds the correct one
- Having 2-3 values in DNS is normal and doesn't cause issues
- No need to delete old values

**Best Practice**: Don't worry about cleaning up old ACME challenge records - they don't interfere with new provisioning.

### 5. SSL Provisioning Can Be Very Fast

**Discovery**: SSL provisioning is often much faster than documented "up to 24 hours."

**Observations:**
- Documentation: 15 minutes to 24 hours
- Typical: 1-4 hours
- Observed: Can be nearly instant (< 5 minutes) with correct ACME challenge record
- Cloudflare DNS propagation: 1-3 minutes (extremely fast)

**Factors for fast provisioning:**
- ACME challenge record added immediately
- DNS-only mode (no proxy) during initial setup
- Clean DNS (no conflicting records)

### 6. Cloudflare Proxy Enablement is Seamless

**Discovery**: Enabling Cloudflare proxy after SSL is connected works perfectly without disruption.

**Process observed:**
- SSL status: "Connected" in Firebase
- Enabled proxy via API (one PATCH request)
- DNS propagated to Cloudflare IPs in < 3 minutes
- Site remained accessible throughout
- No certificate warnings or errors

**Best Practice**: Wait for "Connected" status, then enable proxy with confidence.

### 7. API Token Security is Critical

**Discovery**: Scoped API tokens with minimum permissions are essential.

**Security notes:**
- Zone:DNS:Edit permission is sufficient
- Token worked immediately after creation
- No need for Global API Key (avoid using it)
- Zone-specific scoping adds security

**Best Practice**: Create new token for each project, scope to specific zone, revoke after setup if not needed long-term.

### 8. Complete Deployment Timeline (Real-World)

**Actual timeline for stockbridgecoffee.co.uk:**

| Step | Time | Notes |
|------|------|-------|
| Firebase domain setup | 2 min | Manual in console |
| Create Cloudflare API token | 1 min | One-time setup |
| Add TXT verification record | 30 sec | Via API |
| Domain verification | 2 min | DNS propagation |
| Add A record | 30 sec | Via API |
| Add ACME challenge record | 30 sec | Via API (critical!) |
| SSL provisioning | ~10 min | Much faster than typical |
| Enable Cloudflare proxy | 1 min | Via API |
| **Total deployment time** | **< 20 minutes** | Including SSL provisioning |

**Note**: This is significantly faster than the documented "several hours" when all records are configured correctly from the start.

### 9. Documentation Gaps Identified

**Common issues in existing guides:**
1. ACME challenge record not mentioned or buried in footnotes
2. Assumption of two IP addresses (not always true)
3. No mention of TXT record format variations
4. Overly conservative SSL provisioning time estimates
5. Limited guidance on single-IP scenarios

**This skill addresses these gaps** with production-tested procedures.

### 10. Automation Value

**Discovery**: Manual setup is straightforward, but automation prevents errors.

**Benefits of automation observed:**
- Zero typos in IP addresses or TXT values
- Consistent DNS record configuration
- Built-in verification steps
- Faster for multiple domains
- Reproducible deployments

**Trade-off**: Manual setup provides better learning experience for first time.

---

## Production Deployment Checklist (Updated)

Complete checklist based on production experience:

**Before Starting:**
- [ ] Have Cloudflare account with DNS management access
- [ ] Have Firebase project with Hosting enabled
- [ ] Create Cloudflare API token (Zone:DNS:Edit scope)
- [ ] Note Cloudflare Zone ID

**Firebase Console:**
- [ ] Add custom domain
- [ ] Copy TXT verification record (exact format)
- [ ] Note number of A record IPs (1 or 2)
- [ ] Copy all A record IP addresses
- [ ] **Wait for ACME challenge record to appear**
- [ ] Copy ACME challenge TXT record

**Cloudflare DNS:**
- [ ] Delete conflicting A/AAAA records
- [ ] Add TXT verification record
- [ ] Verify domain in Firebase
- [ ] Add all A records (DNS only mode)
- [ ] **Add ACME challenge TXT record** (_acme-challenge subdomain)
- [ ] Verify DNS with `dig` commands

**SSL Provisioning:**
- [ ] Wait for Firebase status: "Connected"
- [ ] Typical wait: 15min-2hrs (can be faster)
- [ ] Test: `curl -I https://yourdomain.com`

**Proxy Configuration (Optional):**
- [ ] Confirm Firebase shows "Connected"
- [ ] Enable Cloudflare proxy
- [ ] Verify site loads with Cloudflare IPs
- [ ] Test performance and caching

**Final Verification:**
- [ ] HTTPS working
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid
- [ ] No browser warnings
- [ ] Correct content displays

---

**Setup Time**: 10-15 minutes manual | 5 minutes automated (+ SSL provisioning wait)
**Complexity**: Low (manual) | Medium (automated with API)
**Status**: Production-ready guidance with automation scripts
