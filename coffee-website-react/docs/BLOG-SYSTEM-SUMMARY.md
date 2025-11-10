# Blog Automation System - Quick Summary

## What Was Built

A fully automated blog and newsletter system that runs weekly on Sundays at 2:00 AM UTC.

### System Flow

```
1. AI searches for 4 coffee articles (brewing techniques, recipes, culture)
2. AI summarizes articles and generates blog post
3. Blog post published to Firestore
4. Newsletter sent to all subscribers via Gmail
5. System records send history
```

## Key Files Created

### Scripts
- `scripts/curate-blog-content.ts` - AI curation using Gemini
- `scripts/upload-blog-post.ts` - Publish to Firestore
- `scripts/send-newsletter.ts` - Email via Gmail API
- `scripts/gmail-auth.ts` - OAuth authentication helper
- `scripts/gmail-setup.md` - Gmail setup guide

### Components
- `src/components/BlogHighlights.tsx` - Updated to fetch from Firestore
- `src/pages/BlogPost.tsx` - New blog detail page

### Configuration
- `.github/workflows/weekly-blog-newsletter.yml` - Weekly automation
- `firestore.rules` - Added blog-posts and newsletter-history collections
- `.gitignore` - Added Gmail credentials exclusions
- `package.json` - Added 5 new npm scripts

### Documentation
- `docs/BLOG-AUTOMATION-SETUP.md` - Complete setup guide (200+ lines)
- `docs/BLOG-SYSTEM-SUMMARY.md` - This file
- Updated `.claude/skills/ai-content-manager/skill.md` - Added blog automation section

## NPM Scripts

```bash
# Blog content curation
npm run curate:blog              # Generate blog from AI-curated articles
npm run curate:blog -- --articles=5  # Custom article count

# Blog publishing
npm run upload:blog              # Upload to Firestore

# Newsletter
npm run gmail:auth               # One-time Gmail OAuth setup
npm run send:newsletter          # Send to all subscribers
npm run send:newsletter -- --dry-run  # Preview without sending

# Full workflow
npm run blog:auto                # Curate → Upload → Send
```

## Quick Start

### 1. Install Dependencies
```bash
cd coffee-website-react
npm install
```

### 2. Set Up Gmail OAuth
```bash
# Follow guide in scripts/gmail-setup.md
npm run gmail:auth
```

### 3. Configure Environment Variables
Add to `.env.local`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

### 4. Test Locally
```bash
# Test blog generation
npm run curate:blog

# Test upload
npm run upload:blog

# Test email (dry run)
npm run send:newsletter -- --dry-run
```

### 5. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 6. Set Up GitHub Actions
```bash
# Add all secrets
gh secret set GEMINI_API_KEY --body "..."
gh secret set GMAIL_USER --body "your-email@gmail.com"
gh secret set GMAIL_CLIENT_ID --body "..."
gh secret set GMAIL_CLIENT_SECRET --body "..."
gh secret set GMAIL_REFRESH_TOKEN --body "..."
# (+ all Firebase secrets)

# Test workflow
gh workflow run weekly-blog-newsletter.yml
```

## Features

### AI Content Curation
- ✅ Searches for recent coffee articles (last 3 months)
- ✅ Focuses on brewing techniques, recipes, coffee culture
- ✅ Generates summaries and key takeaways
- ✅ Creates cohesive introduction and conclusion
- ✅ Uses Gemini 2.0 Flash ($0.10-$0.30 per blog)

### Blog Publishing
- ✅ Stores in Firestore `/blog-posts` collection
- ✅ Generates URL-friendly slugs
- ✅ Calculates read time
- ✅ Public read access, admin write
- ✅ Automatically published (status: "published")

### Newsletter System
- ✅ Gmail API with OAuth (secure, no password storage)
- ✅ Responsive HTML email template
- ✅ Matches Stockbridge Coffee brand colors
- ✅ Includes all curated articles with summaries
- ✅ Rate limited (1 second between emails)
- ✅ Tracks sends in `/newsletter-history`

### Website Integration
- ✅ BlogHighlights component fetches from Firestore
- ✅ Blog detail page with full article display
- ✅ Loading and error states
- ✅ Newsletter subscription CTA
- ✅ Responsive design

### Automation
- ✅ GitHub Actions workflow
- ✅ Runs every Sunday at 2:00 AM UTC
- ✅ Manual trigger available
- ✅ Dry run mode for testing
- ✅ Artifact archiving
- ✅ Detailed logging

## Cost Estimate

| Service | Usage | Cost |
|---------|-------|------|
| Gemini AI | 4 blogs/month | $1.20/month |
| Gmail API | <250 subscribers | Free |
| Firebase Firestore | Minimal reads/writes | Free tier |
| GitHub Actions | ~5 min/week | Free tier |
| **Total** | | **~$1.50/month** |

## Scaling Path

### 100+ Subscribers
- Option 1: Gmail with Google Workspace ($6/month for 2,000 emails/day)
- Option 2: SendGrid free tier (100 emails/day)

### 500+ Subscribers
- Recommended: SendGrid ($19.95/month for 50,000 emails)
- Alternative: Mailgun ($0.80/1,000 emails, pay-as-you-go)

## Security

- ✅ Gmail credentials in `.gitignore` (never committed)
- ✅ OAuth refresh tokens (no password storage)
- ✅ GitHub Secrets for CI/CD
- ✅ Firestore security rules (public read, admin write)
- ✅ Rate limiting to prevent abuse
- ✅ Unsubscribe links in all emails

## Maintenance

### Weekly (Automated)
- System runs automatically on Sundays
- No manual intervention required

### Monthly
- Review blog content quality
- Check Gemini API usage/costs
- Monitor subscriber growth

### Quarterly
- Rotate Gmail OAuth tokens
- Update blog prompts if needed
- Review email deliverability

## Troubleshooting

### "Invalid grant" error
```bash
npm run gmail:auth  # Re-authenticate
# Update .env.local with new GMAIL_REFRESH_TOKEN
```

### Newsletter emails going to spam
1. Add SPF/DKIM records to domain
2. Warm up sender reputation
3. Consider migrating to SendGrid

### Blog curation quality issues
Edit `scripts/curate-blog-content.ts`:
- Adjust search prompts
- Add more reputable sources
- Increase relevance score threshold

## Documentation

- **Complete Setup:** `docs/BLOG-AUTOMATION-SETUP.md`
- **Gmail Setup:** `scripts/gmail-setup.md`
- **Skill Reference:** `.claude/skills/ai-content-manager/skill.md`
- **Workflow:** `.github/workflows/weekly-blog-newsletter.yml`

## What's Next

1. **Test locally** - Run all test commands
2. **Set up Gmail OAuth** - `npm run gmail:auth`
3. **Deploy Firestore rules** - `firebase deploy --only firestore:rules`
4. **Add GitHub secrets** - Use `gh secret set` commands
5. **Manual test** - Trigger workflow: `gh workflow run weekly-blog-newsletter.yml`
6. **Review first blog** - Check quality and formatting
7. **Monitor automation** - Verify Sunday runs complete successfully

## Support

For detailed instructions, see:
- `docs/BLOG-AUTOMATION-SETUP.md` (comprehensive guide)
- `scripts/gmail-setup.md` (Gmail OAuth setup)
- `.claude/skills/ai-content-manager/skill.md` (skill documentation)

---

**Built:** $(date +"%Y-%m-%d")
**Status:** Ready for testing and deployment
**Estimated Setup Time:** 30-45 minutes
