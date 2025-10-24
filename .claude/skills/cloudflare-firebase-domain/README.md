# Cloudflare-Firebase Domain Connection Skill

Expert guidance and automation for connecting Cloudflare-managed domains to Firebase Hosting.

## Overview

This skill provides comprehensive documentation, automation scripts, and troubleshooting guidance for setting up custom domains with Firebase Hosting when DNS is managed by Cloudflare.

## Key Features

- **Complete manual setup guide** with step-by-step instructions
- **Automated DNS configuration** via Cloudflare API scripts
- **Verification tools** to check DNS and SSL status
- **Comprehensive troubleshooting** flowchart and decision tree
- **API reference documentation** with examples
- **Production-ready scripts** with error handling

## Quick Start

### 1. Manual Setup (Recommended for first-time users)

Follow the complete guide in [`SKILL.md`](./SKILL.md) which covers:
1. Adding custom domain in Firebase Console
2. Configuring DNS records in Cloudflare Dashboard
3. Domain verification
4. SSL certificate provisioning
5. Testing and verification

**Estimated time:** 10-15 minutes + SSL provisioning wait

### 2. Automated Setup (For experienced users)

Use the automation scripts for faster deployment:

```bash
# 1. Configure environment variables
cp assets/.env.example .env
# Edit .env with your values

# 2. Load environment
source .env

# 3. Run automated setup
bash scripts/cloudflare-dns-setup.sh

# 4. Verify configuration
bash scripts/verify-dns-records.sh $DOMAIN

# 5. After SSL is connected, optionally enable proxy
bash scripts/enable-cloudflare-proxy.sh
```

**Estimated time:** 5 minutes + SSL provisioning wait

## File Structure

```
cloudflare-firebase-domain/
├── SKILL.md                           # Main skill documentation
├── README.md                          # This file
├── scripts/
│   ├── cloudflare-dns-setup.sh        # Automated DNS configuration
│   ├── verify-dns-records.sh          # DNS verification tool
│   └── enable-cloudflare-proxy.sh     # Enable proxy after SSL
├── references/
│   ├── api-examples.md                # Cloudflare API reference
│   └── troubleshooting-flowchart.md   # Troubleshooting guide
└── assets/
    ├── .env.example                   # Environment template
    └── setup-config.json              # Configuration template
```

## Requirements

### Prerequisites
- Firebase project with Hosting enabled
- Domain registered and managed by Cloudflare
- Cloudflare account with DNS edit permissions

### For Automation Scripts
- `bash` (Unix shell)
- `curl` (HTTP client)
- `jq` (JSON processor)
- Cloudflare API token with `Zone:DNS:Edit` permission

Install dependencies:
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq curl

# CentOS/RHEL
sudo yum install jq curl
```

## Common Use Cases

### First-time Domain Setup
1. Read [`SKILL.md`](./SKILL.md) for complete understanding
2. Follow manual setup steps
3. Use verification script to check status
4. Troubleshoot any issues using references

### Automated Deployment
1. Copy and configure `.env` file
2. Run `cloudflare-dns-setup.sh`
3. Monitor Firebase Console for SSL provisioning
4. Enable proxy when ready

### Troubleshooting
1. Run `verify-dns-records.sh` to diagnose issues
2. Consult [`references/troubleshooting-flowchart.md`](./references/troubleshooting-flowchart.md)
3. Follow decision tree to identify and fix problems

### Multiple Domains
1. Create separate `.env` files per domain
2. Run setup script for each domain
3. Each domain gets its own verification and SSL

## Important Notes

### Firebase Limitation
⚠️ **The Firebase CLI does NOT support adding custom domains.** You MUST use the Firebase Console web UI to:
- Initiate custom domain setup
- Get verification TXT record
- Get A record IP addresses

This is a Firebase platform limitation, not a workflow choice.

### Cloudflare Proxy Settings
⚠️ **Do NOT enable Cloudflare proxy (orange cloud) until Firebase SSL status shows "Connected".**

**Correct workflow:**
1. Create A records with proxy disabled (grey cloud / DNS only)
2. Wait for Firebase SSL provisioning (up to 24 hours)
3. Once status is "Connected", optionally enable proxy

Enabling proxy too early will prevent Firebase from provisioning SSL certificates.

### DNS Propagation
- Cloudflare DNS typically propagates in 1-5 minutes
- Global DNS propagation can take up to 24-48 hours
- Most changes are visible within 5-10 minutes

## Scripts Usage

### cloudflare-dns-setup.sh

Complete DNS configuration automation.

**Required environment variables:**
```bash
CLOUDFLARE_API_TOKEN    # API token with DNS edit permission
CLOUDFLARE_ZONE_ID      # Zone ID for your domain
DOMAIN                  # Your domain (e.g., example.com)
FIREBASE_IP_1           # First Firebase IP
FIREBASE_IP_2           # Second Firebase IP
FIREBASE_TXT_VALUE      # Verification TXT value
```

**Optional:**
```bash
SETUP_WWW=true         # Also create www subdomain records
```

**Usage:**
```bash
source .env
bash scripts/cloudflare-dns-setup.sh
```

### verify-dns-records.sh

Verify DNS configuration and diagnose issues.

**Usage:**
```bash
bash scripts/verify-dns-records.sh example.com [firebase_ip_1] [firebase_ip_2]
```

**Output:**
- Checks nameservers
- Verifies A records
- Checks TXT record
- Tests HTTPS availability
- Validates SSL certificate
- Provides troubleshooting suggestions

### enable-cloudflare-proxy.sh

Enable Cloudflare proxy (orange cloud) after SSL provisioning.

**Usage:**
```bash
source .env
bash scripts/enable-cloudflare-proxy.sh
```

**Important:** Only run after Firebase status shows "Connected".

## Troubleshooting

### Quick Diagnostics

```bash
# Check DNS records
dig A your-domain.com +short
dig TXT your-domain.com +short

# Run verification script
bash scripts/verify-dns-records.sh your-domain.com

# Check Firebase Console
# Go to: Firebase Console → Hosting → Custom domains
```

### Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Verification Failed | Check TXT record with `dig TXT domain.com +short` |
| SSL Stuck on Pending | Disable Cloudflare proxy (grey cloud) |
| Site Not Loading | Deploy content with `firebase deploy --only hosting` |
| Wrong Certificate | Check if proxy is enabled, wait for DNS propagation |

### Detailed Troubleshooting

See [`references/troubleshooting-flowchart.md`](./references/troubleshooting-flowchart.md) for:
- Complete decision tree
- Diagnosis commands
- Step-by-step solutions
- Recovery procedures

## Resources

### Documentation
- [Firebase Custom Domain Setup](https://firebase.google.com/docs/hosting/custom-domain)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)

### Video Tutorials
- [Firebase Custom Domain Setup](https://www.youtube.com/watch?v=IBMNvoJcy-k) - Step-by-step walkthrough

### Tools
- [DNS Propagation Checker](https://www.whatsmydns.net/)
- [SSL Certificate Checker](https://www.ssllabs.com/ssltest/)
- [Cloudflare DNS Checker](https://1.1.1.1/dns/)

## Security Best Practices

1. **API Token Security**
   - Use scoped API tokens (not Global API Key)
   - Minimum permissions: `Zone:DNS:Edit`
   - Store in environment variables
   - Never commit to git

2. **DNS Security**
   - Enable DNSSEC in Cloudflare
   - Add CAA records for certificate control
   - Monitor DNS changes with audit logs

3. **SSL/TLS**
   - Use Firebase-managed certificates (free Let's Encrypt)
   - Enable HSTS headers in firebase.json
   - Force HTTPS redirects

## Cost Considerations

**Cloudflare:**
- Free plan includes unlimited DNS queries
- API usage is free (rate limited)
- Proxy/CDN features available on free plan

**Firebase Hosting:**
- Free tier: 10 GB storage, 360 MB/day bandwidth
- Custom domains included
- SSL certificates free (Let's Encrypt)
- Pay-as-you-go after free tier

**Estimated Monthly Cost:**
- Small site (<1000 visitors): $0
- Medium site (10,000 visitors): $0-2
- Large site (100,000 visitors): $3-23

## Support

### Getting Help
1. Check [`SKILL.md`](./SKILL.md) for comprehensive guidance
2. Review [`references/troubleshooting-flowchart.md`](./references/troubleshooting-flowchart.md)
3. Consult [`references/api-examples.md`](./references/api-examples.md) for API usage
4. Contact Firebase Support or Cloudflare Support if issues persist

### Contributing
This skill is part of the coffee-beans-skills repository. Contributions welcome:
- Bug fixes in scripts
- Additional troubleshooting scenarios
- Documentation improvements
- API examples

## License

Part of the coffee-beans-skills project. See repository LICENSE for details.

---

**Status:** Production-ready
**Setup Time:** 10-15 minutes manual | 5 minutes automated
**Skill Type:** Domain expert for Cloudflare + Firebase integration
