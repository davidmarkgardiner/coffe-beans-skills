# Cloudflare-Firebase Domain Connection Troubleshooting Flowchart

Systematic approach to diagnosing and resolving domain connection issues.

## Quick Diagnostic Checklist

Run these checks first to identify the problem area:

```bash
# 1. Check DNS A records
dig A your-domain.com +short

# 2. Check TXT record
dig TXT your-domain.com +short

# 3. Check nameservers
dig NS your-domain.com +short

# 4. Test HTTPS
curl -I https://your-domain.com

# 5. Check Firebase Console status
# Go to: Firebase Console → Hosting → Custom domains
```

---

## Problem Decision Tree

### Issue: Firebase shows "Verification Failed"

**Check 1: Is the TXT record visible?**

```bash
dig TXT your-domain.com +short
```

- **No TXT record found** → Go to [Section A: TXT Record Missing](#section-a-txt-record-missing)
- **Wrong TXT value** → Go to [Section B: Incorrect TXT Value](#section-b-incorrect-txt-value)
- **Correct TXT record** → Go to [Section C: Verification Timing](#section-c-verification-timing)

---

### Issue: Firebase shows "Pending" or "Provisioning SSL" for > 24 hours

**Check 1: Are A records pointing to Firebase IPs?**

```bash
dig A your-domain.com +short
```

- **Shows Cloudflare IPs (172.x, 104.x, 131.0.x)** → Go to [Section D: Proxy Enabled Too Early](#section-d-proxy-enabled-too-early)
- **Shows Firebase IPs (151.x)** → Go to [Section E: SSL Provisioning Issues](#section-e-ssl-provisioning-issues)
- **No A records or wrong IPs** → Go to [Section F: A Records Misconfigured](#section-f-a-records-misconfigured)

---

### Issue: Site not loading (404, connection refused, etc.)

**Check 1: Is Firebase status "Connected"?**

- **Not connected** → Resolve connection issues first (see above sections)
- **Connected** → Go to [Section G: Site Deployment Issues](#section-g-site-deployment-issues)

---

### Issue: SSL Certificate Warnings

**Check 1: What certificate is being served?**

```bash
openssl s_client -connect your-domain.com:443 -servername your-domain.com 2>/dev/null | openssl x509 -noout -issuer -subject
```

- **Certificate for wrong domain** → Go to [Section H: Certificate Mismatch](#section-h-certificate-mismatch)
- **Self-signed certificate** → Go to [Section I: SSL Not Provisioned](#section-i-ssl-not-provisioned)
- **Cloudflare Universal SSL** → Go to [Section J: Cloudflare Certificate Instead of Firebase](#section-j-cloudflare-certificate-instead-of-firebase)

---

## Section A: TXT Record Missing

### Symptoms
- Firebase verification fails immediately
- `dig TXT your-domain.com +short` returns nothing

### Diagnosis
```bash
# Check if TXT record exists in Cloudflare
curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=TXT&name=$DOMAIN" \
  -H "Authorization: Bearer $API_TOKEN" | jq '.result'
```

### Common Causes
1. TXT record not created in Cloudflare
2. Record created for wrong subdomain
3. Record deleted accidentally

### Solutions

**Solution 1: Create TXT record manually**
1. Go to Cloudflare Dashboard → DNS
2. Click "Add record"
3. Type: TXT
4. Name: `@`
5. Content: Paste verification string from Firebase
6. Click Save

**Solution 2: Create via API**
```bash
export FIREBASE_TXT_VALUE="firebase=your-code"

curl -X POST \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"TXT\",
    \"name\": \"@\",
    \"content\": \"$FIREBASE_TXT_VALUE\",
    \"ttl\": 1
  }"
```

**Solution 3: Use automation script**
```bash
bash scripts/cloudflare-dns-setup.sh
```

### Verification
```bash
# Wait 1-2 minutes for propagation
sleep 120

# Check TXT record
dig TXT your-domain.com +short

# Retry verification in Firebase Console
```

---

## Section B: Incorrect TXT Value

### Symptoms
- TXT record exists but Firebase verification still fails
- Wrong verification string visible in `dig` output

### Diagnosis
```bash
# Get TXT record value
ACTUAL_TXT=$(dig TXT your-domain.com +short | grep firebase)
echo "Actual: $ACTUAL_TXT"

# Compare with expected value from Firebase Console
echo "Expected: firebase=your-verification-code"
```

### Common Causes
1. Copied wrong value from Firebase Console
2. Extra spaces or quotes in value
3. Value from old/different Firebase project

### Solutions

**Solution 1: Get correct value**
1. Go to Firebase Console → Hosting → Custom domains
2. Find your domain setup
3. Copy exact TXT value shown (including "firebase=" prefix)

**Solution 2: Update TXT record**
```bash
# Get record ID
RECORD_ID=$(curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=TXT&name=$DOMAIN" \
  -H "Authorization: Bearer $API_TOKEN" | jq -r '.result[0].id')

# Update with correct value
export CORRECT_TXT="firebase=correct-code"

curl -X PUT \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"TXT\",
    \"name\": \"@\",
    \"content\": \"$CORRECT_TXT\",
    \"ttl\": 1
  }"
```

### Verification
```bash
# Check updated TXT record
dig TXT your-domain.com +short

# Retry verification in Firebase
```

---

## Section C: Verification Timing

### Symptoms
- Correct TXT record exists
- Firebase verification still fails immediately

### Diagnosis
```bash
# Check DNS propagation globally
curl "https://dns.google/resolve?name=$DOMAIN&type=TXT" | jq '.Answer'

# Check local DNS cache
dig TXT $DOMAIN @8.8.8.8 +short
dig TXT $DOMAIN @1.1.1.1 +short
```

### Common Causes
1. DNS not fully propagated
2. Local DNS cache has stale data
3. Firebase checking from different region

### Solutions

**Solution 1: Wait for propagation**
```bash
# Cloudflare DNS propagates quickly (1-5 minutes)
# Wait and retry
sleep 300  # 5 minutes

# Retry verification
```

**Solution 2: Force DNS refresh**
```bash
# Flush local DNS cache

# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches

# Windows
ipconfig /flushdns
```

**Solution 3: Verify from multiple locations**
```bash
# Check from different DNS servers
dig TXT $DOMAIN @8.8.8.8 +short    # Google DNS
dig TXT $DOMAIN @1.1.1.1 +short    # Cloudflare DNS
dig TXT $DOMAIN @208.67.222.222 +short  # OpenDNS
```

### Verification
- Wait 5-10 minutes
- Check all DNS servers show TXT record
- Retry Firebase verification

---

## Section D: Proxy Enabled Too Early

### Symptoms
- Firebase stuck on "Pending" or "Provisioning"
- `dig A` shows Cloudflare IPs (172.x, 104.x, 131.0.x)
- SSL provisioning fails

### Diagnosis
```bash
# Check if showing Cloudflare proxy IPs
dig A $DOMAIN +short

# Expected: 151.101.x.x (Firebase)
# Actual: 172.x or 104.x (Cloudflare proxy)
```

### Common Causes
1. Cloudflare proxy enabled before Firebase SSL provisioned
2. Orange cloud icon active in Cloudflare dashboard
3. Records created with `proxied: true`

### Solutions

**Solution 1: Disable proxy manually**
1. Go to Cloudflare Dashboard → DNS
2. Find A records for your domain
3. Click orange cloud to change to grey cloud (DNS only)
4. Save changes

**Solution 2: Disable via API**
```bash
# Get A record IDs
A_RECORD_IDS=$(curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $API_TOKEN" | jq -r '.result[] | .id')

# Disable proxy for each
for RECORD_ID in $A_RECORD_IDS; do
  curl -X PATCH \
    "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"proxied": false}'
done
```

### Verification
```bash
# Wait for DNS to update (1-2 minutes)
sleep 120

# Check A records now show Firebase IPs
dig A $DOMAIN +short
# Should see: 151.101.x.x

# Check Firebase Console status
# Should change from Pending → Provisioning → Connected (within hours)
```

### Important Note
**Only enable Cloudflare proxy AFTER Firebase status shows "Connected"**

---

## Section E: SSL Provisioning Issues

### Symptoms
- A records point to correct Firebase IPs
- Proxy is disabled (grey cloud)
- Still stuck on "Provisioning" > 24 hours

### Diagnosis
```bash
# Check A records are correct
dig A $DOMAIN +short

# Check for CAA records that might block Let's Encrypt
dig CAA $DOMAIN +short

# Test direct connection to Firebase
curl -I http://$DOMAIN
```

### Common Causes
1. CAA records blocking Let's Encrypt
2. Firewall/security rules blocking Firebase
3. DNS records pointing to wrong IPs
4. Firebase service issues

### Solutions

**Solution 1: Check and fix CAA records**
```bash
# Check CAA records
dig CAA $DOMAIN +short

# If CAA records exist, ensure Let's Encrypt is allowed
# Add CAA record if needed:
curl -X POST \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CAA",
    "name": "@",
    "data": {
      "flags": 0,
      "tag": "issue",
      "value": "letsencrypt.org"
    }
  }'
```

**Solution 2: Verify Firebase IPs are current**
```bash
# Firebase hosting IPs (as of 2024):
# 151.101.1.195
# 151.101.65.195

# Check these are what you're using
dig A $DOMAIN +short
```

**Solution 3: Delete and recreate domain in Firebase**
1. Go to Firebase Console → Hosting
2. Remove custom domain
3. Wait 5 minutes
4. Re-add custom domain
5. Follow setup process again

**Solution 4: Contact Firebase Support**
If issue persists > 48 hours:
1. Go to Firebase Console → Support
2. Provide:
   - Domain name
   - Firebase project ID
   - Timestamp of initial setup
   - DNS record configuration

### Verification
- Check Firebase Console every few hours
- SSL provisioning typically completes in 1-4 hours
- Maximum wait time: 24-48 hours

---

## Section F: A Records Misconfigured

### Symptoms
- Domain doesn't resolve
- `dig A` returns wrong IPs or no results
- Firebase can't detect records

### Diagnosis
```bash
# Check A records
dig A $DOMAIN +short

# Check A records via Cloudflare API
curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $API_TOKEN" | jq '.result[] | {content, proxied}'
```

### Common Causes
1. A records not created
2. Wrong IP addresses
3. Records for subdomain instead of apex
4. Only one A record (need two for redundancy)

### Solutions

**Solution 1: Delete and recreate A records**
```bash
# Delete existing A records
A_RECORD_IDS=$(curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $API_TOKEN" | jq -r '.result[] | .id')

for RECORD_ID in $A_RECORD_IDS; do
  curl -X DELETE \
    "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
    -H "Authorization: Bearer $API_TOKEN"
done

# Create correct A records
for IP in "151.101.1.195" "151.101.65.195"; do
  curl -X POST \
    "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"A\",
      \"name\": \"@\",
      \"content\": \"$IP\",
      \"ttl\": 1,
      \"proxied\": false
    }"
done
```

**Solution 2: Use automation script**
```bash
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ZONE_ID="your-zone-id"
export DOMAIN="your-domain.com"
export FIREBASE_IP_1="151.101.1.195"
export FIREBASE_IP_2="151.101.65.195"
export FIREBASE_TXT_VALUE="firebase=your-code"

bash scripts/cloudflare-dns-setup.sh
```

### Verification
```bash
# Check A records
dig A $DOMAIN +short
# Should show:
# 151.101.1.195
# 151.101.65.195

# Verify in Firebase Console
```

---

## Section G: Site Deployment Issues

### Symptoms
- Firebase status: "Connected" (green)
- Domain resolves correctly
- But site shows 404, blank page, or old content

### Diagnosis
```bash
# Check if anything is deployed
firebase hosting:channel:list

# Check deployment history
firebase hosting:sites:get

# Test Firebase hosting directly
curl https://your-project.web.app
```

### Common Causes
1. No content deployed to Firebase Hosting
2. Deployed to wrong Firebase site
3. Content deployed to preview channel, not production
4. Outdated content cached

### Solutions

**Solution 1: Deploy your site**
```bash
# Build your site
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Verify deployment
firebase hosting:channel:list
```

**Solution 2: Check correct site is targeted**
```bash
# List all hosting sites in project
firebase hosting:sites:list

# Check firebase.json targets correct site
cat firebase.json

# Deploy to specific site if needed
firebase deploy --only hosting:site-name
```

**Solution 3: Clear cache**
```bash
# Purge Cloudflare cache if proxy enabled
curl -X POST \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'
```

### Verification
```bash
# Test site loads
curl https://$DOMAIN

# Check in browser (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
```

---

## Section H: Certificate Mismatch

### Symptoms
- Browser shows "Certificate for wrong domain"
- SSL warning about domain mismatch

### Diagnosis
```bash
# Check certificate subject
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | \
  openssl x509 -noout -subject -ext subjectAltName
```

### Common Causes
1. SNI not configured correctly
2. Old certificate cached
3. Cloudflare Universal SSL active
4. Multiple sites on same Firebase project

### Solutions

**Solution 1: Clear SSL cache**
```bash
# Clear browser SSL cache
# Chrome: chrome://net-internals/#sockets → Flush socket pools
# Firefox: Settings → Privacy → Cookies and Site Data → Clear Data

# Test from different browser/device
```

**Solution 2: Verify Firebase certificate**
```bash
# Check certificate from Firebase directly
curl -I https://$DOMAIN

# Should show certificate for your domain
```

**Solution 3: Wait for certificate refresh**
- Certificates may take time to update
- Wait 1-4 hours
- Check again

---

## Section I: SSL Not Provisioned

### Symptoms
- Self-signed certificate or no certificate
- Browser shows "Not Secure"

### Common Causes
1. Firebase hasn't completed SSL provisioning yet
2. Proxy enabled too early
3. Domain verification failed

### Solutions
1. Check Firebase Console status
2. If "Pending", wait up to 24 hours
3. If still pending, go to [Section D](#section-d-proxy-enabled-too-early) or [Section E](#section-e-ssl-provisioning-issues)

---

## Section J: Cloudflare Certificate Instead of Firebase

### Symptoms
- Certificate from Cloudflare, not Firebase/Let's Encrypt
- Site works but using wrong certificate issuer

### Diagnosis
```bash
# Check certificate issuer
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | \
  openssl x509 -noout -issuer
```

### Common Causes
1. Cloudflare proxy enabled
2. Cloudflare Universal SSL active
3. Certificate served by Cloudflare, not Firebase

### Solutions

**If you want Firebase certificate only:**
1. Disable Cloudflare proxy (grey cloud)
2. Wait for DNS to propagate
3. Certificate will be Firebase/Let's Encrypt

**If you want Cloudflare proxy + certificate:**
1. This is actually correct configuration
2. Cloudflare serves its certificate to visitors
3. Cloudflare connects to Firebase via origin certificate
4. No action needed

### Note
Both configurations are valid. Choose based on requirements:
- **DNS only (Firebase cert)**: Direct Firebase connection
- **Proxied (Cloudflare cert)**: CDN, DDoS protection, WAF

---

## Emergency Recovery

If everything is broken and you need to start fresh:

### Complete Reset Procedure

1. **Remove domain from Firebase**
   ```bash
   # Go to Firebase Console → Hosting
   # Delete custom domain
   ```

2. **Delete all DNS records in Cloudflare**
   ```bash
   # Delete A records
   # Delete TXT records (Firebase verification)
   # Keep MX, CNAME for other services
   ```

3. **Wait 5 minutes**
   ```bash
   sleep 300
   ```

4. **Start fresh setup**
   ```bash
   # Re-add domain in Firebase Console
   # Get new TXT and A record values
   # Run automation script:
   bash scripts/cloudflare-dns-setup.sh
   ```

5. **Monitor Firebase Console**
   - Watch status: Pending → Provisioning → Connected
   - Wait up to 24 hours for SSL

---

## Quick Reference: Common Commands

```bash
# Verify DNS
dig A $DOMAIN +short
dig TXT $DOMAIN +short
dig NS $DOMAIN +short

# Test HTTPS
curl -I https://$DOMAIN

# Check SSL certificate
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | \
  openssl x509 -noout -issuer -subject -dates

# List Cloudflare DNS records
curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $API_TOKEN" | jq '.result[] | {type,name,content,proxied}'

# Check Firebase deployment
firebase hosting:channel:list

# Deploy to Firebase
firebase deploy --only hosting
```

---

## Support Resources

- **Firebase Support**: https://firebase.google.com/support
- **Cloudflare Support**: https://support.cloudflare.com
- **Firebase Community**: https://firebase.google.com/community
- **DNS Checker**: https://www.whatsmydns.net/
- **SSL Checker**: https://www.ssllabs.com/ssltest/
