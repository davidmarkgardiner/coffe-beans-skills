# Gmail API Setup Guide

This guide walks you through setting up Gmail API access with OAuth for sending newsletters.

## Prerequisites

- Google Gmail account
- Google Cloud Project (or create new one)
- Node.js installed

## Step 1: Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure consent screen (if not already done):
   - User Type: "External" (for testing) or "Internal" (for organization)
   - Fill in app name: "Stockbridge Coffee Newsletter"
   - Add your email as developer contact
   - Add scopes: `gmail.send`
4. Create OAuth client ID:
   - Application type: "Desktop app"
   - Name: "Stockbridge Newsletter Sender"
   - Click "Create"
5. Download the credentials JSON file
6. Save it as `gmail-credentials.json` in the project root

## Step 3: Add to .gitignore

Ensure these files are in `.gitignore`:

```
gmail-credentials.json
gmail-token.json
```

## Step 4: Install Dependencies

```bash
npm install googleapis nodemailer
```

## Step 5: Set Up Environment Variables

Add to `.env.local`:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=http://localhost:3000/oauth2callback
```

## Step 6: Authenticate

Run the authentication script:

```bash
npm run gmail:auth
```

This will:
1. Open a browser window
2. Ask you to grant Gmail sending permissions
3. Save the refresh token to `gmail-token.json`

## Step 7: Test Email Sending

```bash
npm run test:email
```

## Security Best Practices

1. **Never commit credentials**: Both `gmail-credentials.json` and `gmail-token.json` contain sensitive data
2. **Use App Passwords for simpler setup**: Alternative to OAuth for less complex scenarios
3. **Rotate tokens regularly**: Refresh tokens should be rotated periodically
4. **Monitor API usage**: Check Google Cloud Console for unusual activity
5. **Add test users**: During development, add test email addresses to the OAuth consent screen

## GitHub Actions Setup

For automated newsletter sending in GitHub Actions:

### Option 1: Service Account (Recommended for production)

1. Create a service account in Google Cloud Console
2. Grant Gmail API access
3. Add service account credentials as GitHub secret: `GMAIL_SERVICE_ACCOUNT_KEY`

### Option 2: OAuth Refresh Token

1. Run `npm run gmail:auth` locally
2. Copy the refresh token from `gmail-token.json`
3. Add as GitHub secrets:
   - `GMAIL_CLIENT_ID`
   - `GMAIL_CLIENT_SECRET`
   - `GMAIL_REFRESH_TOKEN`
   - `GMAIL_USER`

## Troubleshooting

### "Access blocked: This app's request is invalid"

- Ensure OAuth consent screen is properly configured
- Add your email as a test user in consent screen settings

### "Invalid grant" error

- Refresh token may have expired
- Re-run `npm run gmail:auth`



### "Insufficient permissions"

- Ensure `gmail.send` scope is added in OAuth consent screen
- Re-authenticate to get updated permissions

### Rate Limits

- Gmail API: 250 messages/day for free accounts, 2,000/day for Google Workspace
- Batch requests: Max 100 recipients per batch
- Consider using dedicated email service (SendGrid, Mailgun) for larger volumes

## Alternative: App Password Method (Simpler)

If OAuth seems too complex, you can use Gmail App Passwords:

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account > Security > 2-Step Verification > App passwords
3. Generate an app password for "Mail"
4. Use with Nodemailer SMTP:

```typescript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password', // 16-character app password
  },
})
```

Add to `.env.local`:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

**Note**: App passwords are simpler but less secure than OAuth. Use OAuth for production.
