# Blog Automation & Newsletter System - Setup Guide

Complete guide for setting up the automated blog curation and newsletter distribution system for Stockbridge Coffee.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Setup](#detailed-setup)
5. [Testing](#testing)
6. [GitHub Actions Setup](#github-actions-setup)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## Overview

This system automatically:
1. **Curates coffee articles** using Google Gemini AI every Sunday
2. **Generates blog posts** with summaries and key takeaways
3. **Publishes to website** via Firebase Firestore
4. **Sends newsletters** to all subscribers via Gmail API

### Architecture

```
┌─────────────────────────────────────┐
│   GitHub Actions (Weekly Trigger)   │
│        Every Sunday, 2:00 AM         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│    Gemini AI: Curate Articles       │
│  - Search for coffee content        │
│  - Analyze & summarize articles     │
│  - Generate blog post structure     │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Firestore: Store Blog Post        │
│  - /blog-posts/{id}                 │
│  - Status: published                │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Gmail API: Send Newsletter        │
│  - Fetch subscribers from Firestore │
│  - Generate HTML email              │
│  - Send to all subscribers          │
└─────────────────────────────────────┘
```

---

## Prerequisites

### Required Accounts & Services

1. **Google Cloud Project** (for Gemini AI & Gmail API)
2. **Gmail Account** (for sending newsletters)
3. **Firebase Project** (already configured)
4. **GitHub Account** (for automation)

### Required Tools

- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- GitHub CLI (`brew install gh` or equivalent)

---

## Quick Start

### 1. Install Dependencies

```bash
cd coffee-website-react
npm install
```

Installs: `googleapis`, `nodemailer`, `@google/genai`, and types.

### 2. Set Up Environment Variables

Create or update `.env.local`:

```env
# Gemini AI (for blog curation)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase (already configured)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Gmail API (for newsletter)
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

### 3. Set Up Gmail OAuth

Follow the detailed guide in `scripts/gmail-setup.md`, then:

```bash
# Authenticate with Gmail
npm run gmail:auth
```

This will:
1. Open a browser for OAuth consent
2. Save credentials to `gmail-token.json`
3. Display environment variables to add to `.env.local`

### 4. Test the System

```bash
# Test blog curation (dry run, no publish)
npm run curate:blog

# Test blog upload to Firestore
npm run upload:blog

# Test newsletter sending (dry run)
npm run send:newsletter -- --dry-run

# Test full workflow
npm run blog:auto
```

### 5. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

---

## Detailed Setup

### Step 1: Google Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create or select a project
3. Click "Get API Key"
4. Copy the API key
5. Add to `.env.local` as `VITE_GEMINI_API_KEY`

**Cost Estimate:**
- Gemini 2.0 Flash: $0.10-$0.30 per blog post
- ~$1.50/month for weekly posts

### Step 2: Gmail API Setup (OAuth Method)

#### 2.1 Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one)
3. Navigate to "APIs & Services" > "Library"
4. Search for "Gmail API"
5. Click "Enable"

#### 2.2 Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in application information:
   - App name: "Stockbridge Coffee Newsletter"
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
4. Add scopes:
   - Click "Add or Remove Scopes"
   - Select `https://www.googleapis.com/auth/gmail.send`
   - Save
5. Add test users (your Gmail account)
6. Save and continue

#### 2.3 Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Desktop app"
4. Name: "Stockbridge Newsletter Sender"
5. Click "Create"
6. Download the JSON file
7. Save as `gmail-credentials.json` in project root

**Important:** Do NOT commit `gmail-credentials.json` to git!

#### 2.4 Authenticate

```bash
npm run gmail:auth
```

Follow the prompts:
1. Visit the authorization URL in your browser
2. Grant permissions
3. Copy the authorization code
4. Paste it into the terminal
5. Copy the environment variables displayed
6. Add them to `.env.local`

#### 2.5 Test Email Sending

```bash
npm run send:newsletter -- --dry-run
```

### Step 3: Firestore Setup

The Firestore rules have already been updated. Deploy them:

```bash
firebase deploy --only firestore:rules
```

This adds two new collections:
- `blog-posts` - Stores published blog posts
- `newsletter-history` - Tracks newsletter sends

### Step 4: Update Website Routes

The `BlogPost` component needs to be added to your routing configuration.

**For React Router (if using):**

```typescript
// src/App.tsx or your router file
import { BlogPost } from './pages/BlogPost'

// Add route:
<Route path="/blog/:slug" element={<BlogPost />} />
```

**For file-based routing:**

Create: `src/pages/blog/[slug].tsx` and export the `BlogPost` component.

---

## Testing

### Manual Testing Workflow

#### 1. Test Blog Curation

```bash
npm run curate:blog
```

Expected output:
- ✅ Found 4 articles
- ✅ Generated blog post
- ✅ Saved to `scripts/generated-blog-post.json`

**Review the output:**
```bash
cat scripts/generated-blog-post.json | jq .
```

#### 2. Test Blog Upload

```bash
npm run upload:blog
```

Expected output:
- ✅ Blog post uploaded with ID: abc123
- ✅ Slug: brewing-techniques-for-perfect-espresso
- ✅ URL: /blog/brewing-techniques-for-perfect-espresso

**Verify in Firestore:**
- Open Firebase Console
- Navigate to Firestore Database
- Check `blog-posts` collection
- Verify new document exists with correct data

#### 3. Test Newsletter (Dry Run)

```bash
npm run send:newsletter -- --dry-run
```

Expected output:
- ✅ Blog post: "..."
- ✅ Found X subscribers
- 📝 DRY RUN - Email Preview
- Subject: ☕ [Blog Title]
- Recipients: X

#### 4. Test Newsletter (Live Send)

**Warning:** This sends real emails!

```bash
npm run send:newsletter
```

**Test with yourself first:**
1. Add only your email to `newsletter` collection
2. Run the command
3. Check your inbox
4. Verify email formatting, links, and content

#### 5. Test Full Automation

```bash
npm run blog:auto
```

This runs the complete workflow:
1. Curate blog content
2. Upload to Firestore
3. Send newsletter to subscribers

**Estimated time:** 2-3 minutes

---

## GitHub Actions Setup

### Required GitHub Secrets

Add these secrets in your GitHub repository:

**Settings > Secrets and variables > Actions > New repository secret**

```bash
# Gemini AI
gh secret set GEMINI_API_KEY --body "your-gemini-api-key"

# Firebase
gh secret set VITE_FIREBASE_API_KEY --body "your-firebase-api-key"
gh secret set VITE_FIREBASE_AUTH_DOMAIN --body "your-project.firebaseapp.com"
gh secret set VITE_FIREBASE_PROJECT_ID --body "your-project-id"
gh secret set VITE_FIREBASE_STORAGE_BUCKET --body "your-project.appspot.com"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "123456789"
gh secret set VITE_FIREBASE_APP_ID --body "1:123:web:abc"

# Gmail API
gh secret set GMAIL_USER --body "your-email@gmail.com"
gh secret set GMAIL_CLIENT_ID --body "your-client-id.apps.googleusercontent.com"
gh secret set GMAIL_CLIENT_SECRET --body "your-client-secret"
gh secret set GMAIL_REFRESH_TOKEN --body "your-refresh-token"
```

**Get values from:**
- Gemini API: Google AI Studio
- Firebase: Firebase Console > Project Settings
- Gmail: Run `npm run gmail:auth` and copy from output

### Manual Trigger

Trigger the workflow manually via GitHub:

```bash
# Via GitHub CLI
gh workflow run weekly-blog-newsletter.yml

# Via GitHub Web UI
# Actions > Weekly Blog & Newsletter > Run workflow
```

**Input options:**
- `article_count`: Number of articles to curate (default: 4)
- `skip_newsletter`: Set to `true` for dry run (default: false)

### Scheduled Execution

The workflow runs automatically:
- **Schedule:** Every Sunday at 2:00 AM UTC
- **Cron:** `0 2 * * 0`

**Timezone conversions:**
- 2:00 AM UTC = 3:00 AM BST (summer) = 2:00 AM GMT (winter)

### Monitoring Workflow Runs

```bash
# List recent runs
gh run list --workflow=weekly-blog-newsletter.yml

# View specific run
gh run view [run-id] --log

# Watch run in real-time
gh run watch [run-id]
```

---

## Troubleshooting

### Issue: Blog Curation Fails

**Symptoms:**
```
❌ Error searching for articles
```

**Solutions:**
1. Check Gemini API key is valid
2. Verify API quota hasn't been exceeded
3. Check internet connectivity
4. Try with fewer articles: `npm run curate:blog -- --articles=2`

### Issue: Newsletter Sending Fails

**Symptoms:**
```
❌ Error: Missing Gmail OAuth credentials
```

**Solutions:**
1. Re-run authentication: `npm run gmail:auth`
2. Verify `.env.local` has all Gmail variables
3. Check refresh token hasn't expired
4. Ensure Gmail API is enabled in Google Cloud Console

### Issue: "Invalid grant" Error

**Cause:** Refresh token expired or revoked

**Solution:**
```bash
# Re-authenticate
npm run gmail:auth

# Update .env.local with new refresh token
```

### Issue: Rate Limit Exceeded

**Symptoms:**
```
❌ Failed to send to user@example.com: Rate limit exceeded
```

**Solutions:**
1. Gmail API free tier: 250 emails/day
2. Upgrade to Google Workspace for 2,000 emails/day
3. Consider dedicated email service (SendGrid, Mailgun) for >100 subscribers

### Issue: Blog Post Not Appearing on Website

**Checks:**
1. Verify Firestore document exists:
   - Firebase Console > Firestore > `blog-posts`
2. Check document has `status: "published"`
3. Verify `BlogHighlights` component is mounted
4. Check browser console for errors
5. Ensure Firestore rules allow public read

### Issue: GitHub Actions Workflow Fails

**Check:**
1. All GitHub secrets are set correctly
2. Workflow file is in `.github/workflows/`
3. Branch permissions allow workflow execution
4. View detailed logs: `gh run view [run-id] --log`

---

## Maintenance

### Weekly Tasks

- **Monitor workflow runs** (automated, no action needed)
- **Review blog content quality** once per month
- **Check subscriber growth** in Firestore

### Monthly Tasks

- **Review Gemini API usage and costs**
  - Google AI Studio > Usage Dashboard
- **Check Gmail API quota**
  - Google Cloud Console > APIs & Services > Gmail API > Quotas
- **Archive old blog posts** (optional)
  - Update status to `archived` to hide from website

### Quarterly Tasks

- **Update blog prompts** based on seasonal trends
  - Edit `scripts/curate-blog-content.ts`
  - Adjust focus areas and search keywords
- **Review and improve email template**
  - Edit `scripts/send-newsletter.ts`
  - Test on different email clients
- **Rotate OAuth tokens** (security best practice)
  - Re-run `npm run gmail:auth`
  - Update GitHub secrets

### Upgrading to Dedicated Email Service

If subscriber count exceeds 100, consider migrating to:

**SendGrid:**
- Free tier: 100 emails/day
- Paid: $19.95/month for 50,000 emails
- Better deliverability and analytics

**Mailgun:**
- Pay-as-you-go: $0.80/1,000 emails
- No monthly fees
- Good for variable volume

**Mailchimp:**
- Free tier: 500 contacts, 1,000 emails/month
- Marketing automation features
- Pre-built templates

---

## Cost Breakdown

### Current Setup (Free Tier)

| Service | Usage | Cost |
|---------|-------|------|
| Gemini AI | ~4 articles/week | ~$1.50/month |
| Gmail API | <250 emails/week | Free |
| Firebase Firestore | Read/write operations | Free tier (~$0) |
| Firebase Hosting | Static hosting | Free tier (~$0) |
| GitHub Actions | 1 workflow/week (~5 min) | Free tier (~$0) |

**Total:** ~$1.50/month

### Scaling Costs (100+ Subscribers)

| Service | Usage | Cost |
|---------|-------|------|
| Gemini AI | Same | $1.50/month |
| SendGrid | 400 emails/month | Free tier |
| Firebase | Same | $0 |
| GitHub Actions | Same | $0 |

**Total:** $1.50/month (still minimal!)

### Enterprise Scale (1,000+ Subscribers)

| Service | Usage | Cost |
|---------|-------|------|
| Gemini AI | Same | $1.50/month |
| SendGrid | 4,000 emails/month | $19.95/month |
| Firebase | Increased reads | ~$5/month |
| GitHub Actions | Same | $0 |

**Total:** ~$26.50/month

---

## Next Steps

1. ✅ **Test locally** - Run through all test commands
2. ✅ **Set up Gmail OAuth** - Complete authentication
3. ✅ **Deploy Firestore rules** - Enable public read for blog posts
4. ✅ **Add GitHub secrets** - Configure automation
5. ✅ **Manual trigger** - Test GitHub Actions workflow
6. ✅ **Review first blog post** - Ensure quality meets standards
7. ✅ **Send first newsletter** - Verify email delivery and formatting

---

## Support & Resources

- **Gmail API Docs:** https://developers.google.com/gmail/api
- **Gemini AI Docs:** https://ai.google.dev/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **GitHub Actions Docs:** https://docs.github.com/en/actions

For issues or questions, check:
- `scripts/gmail-setup.md` - Detailed Gmail setup
- Troubleshooting section above
- GitHub Issues in this repository
