# Quick Setup Checklist

Follow these steps to get your blog automation system running.

## Step 1: Get Gemini API Key

1. Visit https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select your Google Cloud project (or create new one)
4. Copy the API key

## Step 2: Add to .env.local

Open `coffee-website-react/.env.local` and add this line:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Your `.env.local` should now have:
```env
# Firebase (already configured)
VITE_FIREBASE_API_KEY=AIzaSyCLTqIKSCnO_PALJjB9dnA0Ms-cLPnqGhY
VITE_FIREBASE_AUTH_DOMAIN=coffee-65c46.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=coffee-65c46
VITE_FIREBASE_STORAGE_BUCKET=coffee-65c46.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=607433247301
VITE_FIREBASE_APP_ID=1:607433247301:web:abc123...

# Gemini AI (add this)
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
```

## Step 3: Test Blog Curation

```bash
npm run curate:blog
```

Expected output:
```
🔍 Searching for 4 coffee articles...
✅ Found 4 articles
✍️  Generating blog post from curated articles...
✅ Generated blog post: "..."
✅ Blog post saved to: ./scripts/generated-blog-post.json
```

## Step 4: Set Up Gmail (for newsletter)

Follow the detailed guide in `scripts/gmail-setup.md`, then:

```bash
npm run gmail:auth
```

This will:
1. Open your browser for OAuth consent
2. Ask you to grant Gmail sending permissions
3. Save credentials to `gmail-token.json`
4. Display environment variables to add to `.env.local`

Add these to `.env.local`:
```env
# Gmail API
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

## Step 5: Test Full Workflow

```bash
# Test blog upload
npm run upload:blog

# Test newsletter (dry run - doesn't send emails)
npm run send:newsletter -- --dry-run

# Test full workflow (dry run)
npm run curate:blog
npm run upload:blog
npm run send:newsletter -- --dry-run
```

## Step 6: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Step 7: Set Up GitHub Actions (Optional)

For weekly automation, add secrets to your GitHub repository:

```bash
# Required secrets
gh secret set GEMINI_API_KEY --body "your_gemini_api_key"
gh secret set VITE_FIREBASE_API_KEY --body "AIzaSyCLTqIKSCnO_PALJjB9dnA0Ms-cLPnqGhY"
gh secret set VITE_FIREBASE_AUTH_DOMAIN --body "coffee-65c46.firebaseapp.com"
gh secret set VITE_FIREBASE_PROJECT_ID --body "coffee-65c46"
gh secret set VITE_FIREBASE_STORAGE_BUCKET --body "coffee-65c46.firebasestorage.app"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "607433247301"
gh secret set VITE_FIREBASE_APP_ID --body "your-firebase-app-id"
gh secret set GMAIL_USER --body "your-email@gmail.com"
gh secret set GMAIL_CLIENT_ID --body "your-client-id"
gh secret set GMAIL_CLIENT_SECRET --body "your-client-secret"
gh secret set GMAIL_REFRESH_TOKEN --body "your-refresh-token"
```

## Troubleshooting

### "GEMINI_API_KEY not found"
- Make sure you added `VITE_GEMINI_API_KEY` to `.env.local`
- Check there are no typos
- Restart your terminal/IDE after adding the key

### "Firebase configuration missing"
- Check all `VITE_FIREBASE_*` variables are in `.env.local`
- Get values from Firebase Console > Project Settings

### "Gmail authentication failed"
- Re-run: `npm run gmail:auth`
- Follow the browser prompts carefully
- Make sure you grant "Send email" permission

## Next Steps

Once everything is working:

1. Review the first generated blog post quality
2. Adjust prompts in `scripts/curate-blog-content.ts` if needed
3. Test sending a real newsletter to yourself
4. Set up GitHub Actions for weekly automation
5. Monitor the first few automated runs

---

For detailed instructions, see:
- **Complete Setup:** `docs/BLOG-AUTOMATION-SETUP.md`
- **Gmail Setup:** `scripts/gmail-setup.md`
- **Quick Summary:** `docs/BLOG-SYSTEM-SUMMARY.md`
