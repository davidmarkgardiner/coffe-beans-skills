# Cloudflare API Examples for DNS Management

Complete reference for Cloudflare API operations used in Firebase Hosting domain setup.

## Authentication

All API requests require authentication via API token in the `Authorization` header.

```bash
# Set your credentials
export CLOUDFLARE_API_TOKEN="your-token-here"
export CLOUDFLARE_ZONE_ID="your-zone-id"
```

## Verify API Token

Check if your API token is valid and has correct permissions.

```bash
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

**Expected response:**
```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "token-id",
    "status": "active"
  }
}
```

## List Zones

Get all zones (domains) associated with your account.

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

## Get Zone Details

Retrieve information about a specific zone.

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

**Response includes:**
- Zone name (domain)
- Nameservers
- Status
- Plan type

## List DNS Records

### List All DNS Records

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

### Filter by Record Type

```bash
# List only A records
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?type=A" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# List only TXT records
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?type=TXT" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

### Filter by Record Name

```bash
# Get records for specific subdomain
export DOMAIN="example.com"

curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?name=$DOMAIN" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

### Combined Filters

```bash
# Get A records for specific domain
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

## Create DNS Records

### Create A Record (DNS Only)

```bash
export FIREBASE_IP="151.101.1.195"

curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"A\",
    \"name\": \"@\",
    \"content\": \"$FIREBASE_IP\",
    \"ttl\": 1,
    \"proxied\": false,
    \"comment\": \"Firebase Hosting IP\"
  }" | jq '.'
```

**Parameters:**
- `type`: Record type (A, AAAA, CNAME, TXT, etc.)
- `name`: Record name (`@` for apex, `www` for subdomain, etc.)
- `content`: Record value (IP address for A records)
- `ttl`: Time to live (1 = automatic)
- `proxied`: false = DNS only (grey cloud), true = proxied (orange cloud)
- `comment`: Optional description

### Create A Record (Proxied)

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"A\",
    \"name\": \"@\",
    \"content\": \"$FIREBASE_IP\",
    \"ttl\": 1,
    \"proxied\": true
  }" | jq '.'
```

### Create TXT Record

```bash
export FIREBASE_TXT_VALUE="firebase=abcd1234efgh5678"

curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"TXT\",
    \"name\": \"@\",
    \"content\": \"$FIREBASE_TXT_VALUE\",
    \"ttl\": 1,
    \"comment\": \"Firebase domain verification\"
  }" | jq '.'
```

### Create CNAME Record

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "www",
    "content": "example.com",
    "ttl": 1,
    "proxied": false
  }' | jq '.'
```

### Create MX Record

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MX",
    "name": "@",
    "content": "mail.example.com",
    "priority": 10,
    "ttl": 1
  }' | jq '.'
```

## Update DNS Records

### Get Record ID

First, find the record you want to update:

```bash
# Get A records and extract IDs
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result[] | "\(.id) \(.content)"'
```

### Update Record (Full Update)

```bash
export RECORD_ID="record-id-here"
export NEW_IP="151.101.65.195"

curl -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"A\",
    \"name\": \"@\",
    \"content\": \"$NEW_IP\",
    \"ttl\": 1,
    \"proxied\": false
  }" | jq '.'
```

### Update Record (Partial Update / Patch)

Update only specific fields:

```bash
# Enable proxy
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "proxied": true
  }' | jq '.'

# Disable proxy
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "proxied": false
  }' | jq '.'

# Change TTL
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ttl": 3600
  }' | jq '.'
```

## Delete DNS Records

```bash
export RECORD_ID="record-id-to-delete"

curl -X DELETE "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

**Successful deletion response:**
```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "record-id"
  }
}
```

## Batch Operations

### Delete Multiple Records

```bash
# Get all A records for apex domain
RECORD_IDS=$(curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result[] | .id')

# Delete each record
for RECORD_ID in $RECORD_IDS; do
  echo "Deleting record: $RECORD_ID"
  curl -X DELETE \
    "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json"
done
```

### Create Multiple Records

```bash
# Create two A records for Firebase
for IP in "151.101.1.195" "151.101.65.195"; do
  echo "Creating A record: $IP"
  curl -X POST \
    "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
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

### Enable Proxy for All A Records

```bash
# Get all A records
A_RECORDS=$(curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json")

# Enable proxy for each
echo "$A_RECORDS" | jq -r '.result[] | .id' | while read -r RECORD_ID; do
  echo "Enabling proxy for: $RECORD_ID"
  curl -X PATCH \
    "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"proxied": true}'
done
```

## Export and Import DNS Records

### Export All DNS Records

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/export" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  > dns_records_export.txt
```

This exports records in BIND zone file format.

### Import DNS Records

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/import" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -F "file=@dns_records_export.txt"
```

## Rate Limiting

Cloudflare API has rate limits:
- **1200 requests per 5 minutes** per API token

Handle rate limits with exponential backoff:

```bash
make_request() {
  local max_retries=5
  local retry_count=0
  local wait_time=1

  while [ $retry_count -lt $max_retries ]; do
    response=$(curl -s -w "\n%{http_code}" -X GET \
      "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -H "Content-Type: application/json")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "429" ]; then
      echo "Rate limited, waiting ${wait_time}s..."
      sleep $wait_time
      wait_time=$((wait_time * 2))
      retry_count=$((retry_count + 1))
    elif [ "$http_code" = "200" ]; then
      echo "$body"
      return 0
    else
      echo "Error: HTTP $http_code"
      echo "$body"
      return 1
    fi
  done

  echo "Max retries exceeded"
  return 1
}
```

## Error Handling

Common error codes and their meanings:

### 400 Bad Request
```json
{
  "success": false,
  "errors": [{
    "code": 1004,
    "message": "DNS Validation Error"
  }]
}
```

**Solutions:**
- Check request body syntax
- Verify record type and content format
- Ensure required fields are present

### 401 Unauthorized
```json
{
  "success": false,
  "errors": [{
    "code": 10000,
    "message": "Authentication error"
  }]
}
```

**Solutions:**
- Verify API token is correct
- Check token is not expired
- Ensure token is passed in Authorization header

### 403 Forbidden
```json
{
  "success": false,
  "errors": [{
    "code": 10000,
    "message": "Insufficient permissions"
  }]
}
```

**Solutions:**
- Verify token has `Zone:DNS:Edit` permission
- Check token is scoped to correct zone
- Generate new token with correct permissions

### 404 Not Found
```json
{
  "success": false,
  "errors": [{
    "code": 1000,
    "message": "Record not found"
  }]
}
```

**Solutions:**
- Verify record ID is correct
- Check zone ID is correct
- Confirm record wasn't already deleted

### 429 Rate Limited
```json
{
  "success": false,
  "errors": [{
    "code": 10000,
    "message": "Rate limit exceeded"
  }]
}
```

**Solutions:**
- Wait before retrying
- Implement exponential backoff
- Reduce request frequency

## Complete Firebase Hosting Setup Script

Putting it all together:

```bash
#!/bin/bash

# Configuration
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ZONE_ID="your-zone-id"
export DOMAIN="example.com"
export FIREBASE_IP_1="151.101.1.195"
export FIREBASE_IP_2="151.101.65.195"
export FIREBASE_TXT_VALUE="firebase=your-code"

# 1. Delete existing A records
echo "Deleting existing A records..."
EXISTING_A_RECORDS=$(curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result[] | .id')

for RECORD_ID in $EXISTING_A_RECORDS; do
  curl -X DELETE \
    "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json"
done

# 2. Create TXT record
echo "Creating TXT record..."
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"TXT\",
    \"name\": \"@\",
    \"content\": \"$FIREBASE_TXT_VALUE\",
    \"ttl\": 1
  }"

# 3. Create A records
echo "Creating A records..."
for IP in "$FIREBASE_IP_1" "$FIREBASE_IP_2"; do
  curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"A\",
      \"name\": \"@\",
      \"content\": \"$IP\",
      \"ttl\": 1,
      \"proxied\": false
    }"
done

echo "Setup complete!"
```

## Testing and Verification

### Verify Records via API

```bash
# List all records
curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | \
  jq -r '.result[] | "\(.type)\t\(.name)\t\(.content)\t\(.proxied)"'
```

### Verify Records via DNS

```bash
# Check A records resolve
dig A $DOMAIN +short

# Check TXT record exists
dig TXT $DOMAIN +short

# Check if proxied (Cloudflare IPs vs Firebase IPs)
dig A $DOMAIN +short | head -1 | \
  grep -qE '^(172\.|104\.|131\.0)' && \
  echo "Proxied (Cloudflare)" || \
  echo "DNS only (Direct to Firebase)"
```

## Resources

- **Cloudflare API Documentation**: https://developers.cloudflare.com/api/
- **DNS Records API**: https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records
- **Authentication**: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
- **Rate Limiting**: https://developers.cloudflare.com/fundamentals/api/reference/limits/
