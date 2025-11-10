---
name: ai-content-manager
description: Expert AI-powered content management and generation for coffee e-commerce websites. Automates weekly creation of seasonal videos and images using Google Gemini/Veo, blog content curation, and newsletter distribution. Manages content rotation via Firebase and integrates dynamic backgrounds into React components. Use when implementing AI content generation, automated blog systems, newsletter automation, seasonal theming, or dynamic media rotation systems.
---

# AI Content Manager

Automate creation, storage, and rotation of AI-generated content for premium coffee websites. This skill covers two main systems:

1. **Visual Content Generation** - Seasonal videos and images using Google Gemini/Veo
2. **Blog & Newsletter Automation** - AI-curated blog posts with automated newsletter distribution

## When to Use This Skill

Use this skill when:
- Setting up AI-powered content generation for website backgrounds
- Implementing blog content curation and automated publishing
- Building newsletter systems with Gmail API integration
- Implementing seasonal/holiday content automation
- Building dynamic content rotation systems (videos, images, blog posts)
- Integrating Google Gemini/Veo APIs for media and text generation
- Creating automated workflows for weekly content creation
- Managing content libraries in Firebase Storage and Firestore
- Updating Hero components with AI-generated backgrounds
- Implementing GitHub Actions for content generation automation
- Setting up OAuth-based email sending systems

## Prerequisites

Before using this skill, ensure:
- Firebase project is set up (see `firebase-coffee-integration` skill)
- Google Gemini API key with access to Imagen and Veo models
- React + Vite project with Tailwind CSS
- GitHub repository with Actions enabled
- Node.js 18+ and npm installed
- Basic understanding of Firebase Storage and Firestore

## Quick Start

### 1. Set Up Google Gemini API Access

**Get API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new API key or select existing one
3. Ensure billing is enabled for Veo video generation

**Add to Environment Variables:**

```bash
# .env.local
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# For GitHub Actions (add as repository secret)
# Settings > Secrets and variables > Actions > New repository secret
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Configure Firebase Storage and Firestore

Run the Firebase setup script:

```bash
bash .claude/skills/ai-content-manager/scripts/setup_firebase_content.sh
```

This creates:
- Firebase Storage buckets (`/content/videos/`, `/content/photos/`)
- Firestore collections (`/content/videos`, `/content/photos`, `/content-rotation-config`)
- Security rules for public read access
- Sample content rotation config

**Manual Setup (Alternative):**

See `references/firebase_schema.md` for complete Firestore structure and security rules.

### 3. Set Up Creative Studio Components

Update the existing creative studio components to match your website theme:

```bash
# Copy styled components from assets to your project
cp .claude/skills/ai-content-manager/assets/StyledImageGenerator.tsx coffee-website-react/src/components/admin/
cp .claude/skills/ai-content-manager/assets/StyledVideoGenerator.tsx coffee-website-react/src/components/admin/
cp .claude/skills/ai-content-manager/assets/ContentUploader.tsx coffee-website-react/src/components/admin/
```

### 4. Install Content Rotation System

Add the content rotation hooks and provider:

```bash
# Copy content rotation system
cp .claude/skills/ai-content-manager/assets/ContentRotationProvider.tsx coffee-website-react/src/providers/
cp .claude/skills/ai-content-manager/assets/useContentRotation.ts coffee-website-react/src/hooks/
cp .claude/skills/ai-content-manager/assets/contentService.ts coffee-website-react/src/services/
```

Wrap your app with the provider in `src/App.tsx`:

```tsx
import { ContentRotationProvider } from './providers/ContentRotationProvider'

function App() {
  return (
    <ContentRotationProvider>
      {/* Your existing app content */}
    </ContentRotationProvider>
  )
}
```

### 5. Update Hero Component for Dynamic Content

Replace the static Unsplash image in Hero component:

```tsx
import { useContentRotation } from '../hooks/useContentRotation'

export function Hero() {
  const { currentContent, isLoading } = useContentRotation({
    collectionType: 'videos',
    rotationInterval: 30000, // 30 seconds
  })

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden mt-20 pb-24">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        {currentContent?.type === 'video' ? (
          <video
            src={currentContent.url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px]"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px]"
            style={{ backgroundImage: `url(${currentContent?.url})` }}
          />
        )}
        {/* Existing overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-grey-900/60 via-grey-900/70 to-grey-900/80" />
      </div>

      {/* Existing content */}
    </section>
  )
}
```

### 6. Set Up Automated Weekly Content Generation

The GitHub Actions workflow is already set up at `.github/workflows/generate-weekly-content.yml`.

This workflow runs every **Sunday at 3:00 AM UTC** and generates:
- 1 hero video (landscape, 16:9)
- 2 hero photos (landscape, high-resolution)

**Configure GitHub Secrets:**

Before the workflow can run, you need to add secrets to your GitHub repository. See the complete setup guide:

📘 **[GitHub Secrets Setup Guide](references/github-secrets-setup.md)**

Required secrets:
- `GEMINI_API_KEY` - Google Gemini API key
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

**Manual Generation:**

Trigger the workflow manually via GitHub CLI:
```bash
gh workflow run generate-weekly-content.yml
```

Or run the script locally:
```bash
# Generate 1 video + 2 photos for current season
npm run generate:weekly

# Override season and counts
npm run generate:weekly -- --season=autumn --videos=2 --photos=3
```

**Local Testing:**

Test individual components before running the full workflow:
```bash
# Test photo generation (~30 seconds)
npm run test:content

# Test video generation (~10-15 minutes)
npm run test:video

# Test upload to Firebase
npm run upload:content
```

## Seasonal Prompt Library

The skill includes a comprehensive prompt library for all seasons and holidays. See `references/seasonal_prompts.md` for the complete collection.

**Current Seasons:**
- **Winter** (Dec 21 - Mar 20): Cozy, warm, steaming drinks, frost, fireplaces
- **Spring** (Mar 21 - Jun 20): Fresh, bright, floral, outdoor cafes
- **Summer** (Jun 21 - Sep 20): Iced coffee, sunshine, Edinburgh festivals
- **Autumn** (Sep 21 - Dec 20): Leaves, harvest, golden hour, cozy layers

**Supported Holidays:**
- Christmas, New Year, Valentine's Day, Easter, Mother's Day, Father's Day, Halloween, Edinburgh Festival (August)

**Example Prompts:**

```javascript
// Winter Coffee Prompt
const winterPrompt = `Cinematic 4K shot of a steaming cappuccino with beautiful latte art
on a rustic wooden table in a cozy Edinburgh cafe. Warm golden lighting, soft bokeh effect,
frost patterns visible on the window in the background. Professional food photography style,
shallow depth of field, inviting and warm atmosphere.`

// Summer Iced Coffee Prompt
const summerPrompt = `Bright, airy shot of a tall glass of iced coffee with condensed milk
swirls on a sunlit Stockbridge cafe table. Fresh flowers in the background, Edinburgh
cobblestones visible through the window, natural daylight, vibrant colors, refreshing
summer vibe, professional photography, 16:9 aspect ratio.`
```

## Architecture Overview

### Content Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Weekly Automation                         │
│  (GitHub Actions - Sundays 3:00 AM UTC)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Generate Content       │
         │ - 1 Video (Gemini Veo) │
         │ - 2 Photos (Imagen)    │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Upload to Firebase     │
         │ - Storage (media)      │
         │ - Firestore (metadata) │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Auto-Publish           │
         │ - Status: "active"     │
         │ - Add to rotation pool │
         └───────────┬───────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│                  Website Frontend                           │
│                                                             │
│  Hero Component                                             │
│  ↓                                                          │
│  useContentRotation Hook                                    │
│  ↓                                                          │
│  Fetch active content from Firestore                        │
│  ↓                                                          │
│  Rotate every 30 seconds                                    │
│  ↓                                                          │
│  Display with smooth transitions                            │
└────────────────────────────────────────────────────────────┘
```

### Firebase Structure

**Firestore Collections:**

```
/content
  /videos
    /{contentId}
      - url: string
      - season: "winter" | "spring" | "summer" | "autumn"
      - holiday: string | null
      - createdAt: timestamp
      - status: "active" | "archived"
      - prompt: string
      - metadata: {
          width: number
          height: number
          aspectRatio: string
          fileSize: number
        }

  /photos
    /{contentId}
      - url: string
      - season: string
      - holiday: string | null
      - createdAt: timestamp
      - status: "active"
      - prompt: string
      - metadata: {...}

/content-rotation-config
  /hero
    - currentContentId: string
    - rotationInterval: number (default: 30000)
    - activeContentPool: string[]
    - lastRotated: timestamp
    - currentSeason: string
    - currentHoliday: string | null
```

**Firebase Storage:**

```
/content
  /videos
    /winter
      /{contentId}.mp4
    /spring
      /{contentId}.mp4
    /summer
      /{contentId}.mp4
    /autumn
      /{contentId}.mp4
  /photos
    /winter
      /{contentId}.jpg
    /spring
      /{contentId}.jpg
    /summer
      /{contentId}.jpg
    /autumn
      /{contentId}.jpg
```

## Component Templates

### ContentRotationProvider

The provider manages content fetching, caching, and rotation state across the app.

**Location:** `assets/ContentRotationProvider.tsx`

**Features:**
- Fetches active content pool on mount
- Caches content for performance
- Provides rotation state to all children
- Handles season/holiday detection
- Preloads next content for smooth transitions

### useContentRotation Hook

Custom hook for consuming rotation functionality in components.

**Location:** `assets/useContentRotation.ts`

**Usage:**

```tsx
const {
  currentContent,
  nextContent,
  isLoading,
  error,
  rotateNow,
} = useContentRotation({
  collectionType: 'videos', // or 'photos'
  rotationInterval: 30000, // milliseconds
  season: 'auto', // or specific: 'winter', 'spring', etc.
  holiday: null, // or specific: 'christmas', 'easter', etc.
})
```

### Content Generation Script

Node.js script for generating content programmatically.

**Location:** `scripts/generate_content.js`

**Usage:**

```bash
# Generate content for current season
node scripts/generate_content.js

# Generate content for specific season
node scripts/generate_content.js --season=winter

# Generate content for specific holiday
node scripts/generate_content.js --season=winter --holiday=christmas

# Generate specific content types
node scripts/generate_content.js --videos=2 --photos=5
```

## GitHub Actions Workflow

**Location:** `assets/generate-weekly-content.yml`

**Schedule:** Every Sunday at 3:00 AM UTC

**Workflow Steps:**
1. Checkout repository
2. Set up Node.js 18
3. Install dependencies
4. Detect current season and upcoming holidays
5. Generate content using Gemini API
6. Upload to Firebase Storage
7. Create Firestore documents
8. Send notification (optional)

**Manual Trigger:**

```bash
# Via GitHub CLI
gh workflow run generate-weekly-content.yml

# Via GitHub web interface
# Actions > Generate Weekly Content > Run workflow
```

## Styling Creative Studio Components

The creative studio components need to match your Stockbridge Coffee brand:

**Brand Colors:**
- Cream: `#F5F1E8`
- Grey: `#2D2D2D`
- Teal: `#0A8A8A`
- Golden Teal: `#B89968`

**Component Structure:**

All styled components follow the pattern in `assets/`:
- Use Tailwind classes matching main website
- Include "Save to Firebase" functionality
- Add season/holiday tagging UI
- Show live preview of generated content
- Display upload progress and status

**Integration Example:**

```tsx
import StyledImageGenerator from './components/admin/StyledImageGenerator'
import StyledVideoGenerator from './components/admin/StyledVideoGenerator'

function AdminContentStudio() {
  return (
    <div className="p-8 bg-grey-50 min-h-screen">
      <h1 className="text-4xl font-bold text-grey-900 mb-8">
        Content Studio
      </h1>

      <div className="space-y-12">
        <StyledVideoGenerator />
        <StyledImageGenerator />
      </div>
    </div>
  )
}
```

## Content Generation Best Practices

### Prompt Engineering

**DO:**
- Be specific about coffee type (cappuccino, latte, espresso)
- Specify lighting (warm golden, natural daylight, soft amber)
- Include Edinburgh/Stockbridge location context
- Mention desired mood (cozy, fresh, vibrant, inviting)
- Specify aspect ratio and quality (4K, professional photography)
- Use seasonal descriptors (frost, blossoms, autumn leaves)

**DON'T:**
- Use generic prompts ("coffee on table")
- Forget to specify quality level
- Omit brand aesthetic descriptors
- Include brand name in visual (can cause rendering issues)
- Use trademarked elements or specific people

### Quality Guidelines

**Videos (Veo):**
- Aspect ratio: 16:9 (landscape)
- Duration: 5-8 seconds (loops well)
- Resolution: 1080p minimum
- Focus: Single subject (coffee cup, brewing process)
- Motion: Subtle (steam rising, slow pour, gentle movement)

**Photos (Imagen):**
- Aspect ratio: 16:9 for hero, 4:3 for sections
- Resolution: 1920x1080 or higher
- Style: Professional food/product photography
- Composition: Rule of thirds, balanced, visually appealing

### Seasonal Transitions

Content should gradually transition between seasons:

```javascript
// Transition period: 1 week before season change
// Mix 70% current season + 30% upcoming season

const isTransitionPeriod = daysUntilSeasonChange <= 7

if (isTransitionPeriod) {
  generateMixedContent({
    currentSeasonWeight: 0.7,
    upcomingSeasonWeight: 0.3
  })
}
```

## Troubleshooting

### Content Not Rotating

**Check:**
1. ContentRotationProvider is wrapping the App component
2. Firebase Firestore has active content (status: "active")
3. Browser console for errors
4. Network tab for Firestore queries

**Debug:**
```tsx
const { currentContent, isLoading, error } = useContentRotation({ ... })

console.log('Current Content:', currentContent)
console.log('Loading:', isLoading)
console.log('Error:', error)
```

### GitHub Actions Workflow Failing

**Common Issues:**
1. Missing `GEMINI_API_KEY` secret
2. Missing Firebase credentials
3. API quota exceeded
4. Invalid prompts or parameters

**Debug Steps:**
```bash
# View workflow run logs
gh run list --workflow=generate-weekly-content.yml
gh run view [run-id] --log

# Test script locally
node scripts/generate_content.js
```

### Generation Quality Issues

**If content looks off-brand:**
1. Review prompts in `references/seasonal_prompts.md`
2. Add more specific brand descriptors
3. Reference successful past generations
4. Adjust lighting/mood descriptors

**If generation fails:**
1. Check API quota limits
2. Simplify complex prompts
3. Reduce generation parameters (resolution, duration)
4. Check Gemini API status

### Firebase Upload Errors

**Permission Issues:**
```bash
# Check Firebase Storage rules
firebase deploy --only storage

# Verify Firestore security rules
firebase deploy --only firestore:rules
```

**Storage Quota:**
- Free tier: 5GB storage, 1GB/day download
- Monitor usage in Firebase Console > Storage

## Advanced Features (Future Enhancements)

### Phase 2: Analytics & Optimization

Track content performance:
- View count per content piece
- Average view duration (videos)
- User engagement metrics
- A/B testing different styles

**Implementation:**
```tsx
const { trackView, trackEngagement } = useContentAnalytics()

useEffect(() => {
  if (currentContent) {
    trackView(currentContent.id)
  }
}, [currentContent])
```

### Phase 3: Smart Rotation

Prioritize better-performing content:
- Weighted rotation based on engagement
- Time-of-day optimization
- Geographic personalization
- Device-specific content (mobile vs desktop)

### Phase 4: Admin Dashboard

Full content management UI:
- View all generated content
- Approve/archive content
- Manual regeneration
- Edit prompts and tags
- Schedule seasonal transitions
- View analytics dashboard

**UI Mockup:** See `references/admin_dashboard_mockup.md`

## Related Skills

**Prerequisites:**
- `firebase-coffee-integration` - Firebase setup and configuration
- `premium-coffee-website` - React/Tailwind design patterns
- `secrets-manager` - Managing API keys securely

**Complementary:**
- `logo-manager` - Asset management strategies
- `stripe-integration` - For monetizing premium content features

## References

**Files in this skill:**
- `references/firebase_schema.md` - Complete Firestore and Storage structure
- `references/seasonal_prompts.md` - Full prompt library with examples
- `references/api_integration.md` - Gemini API integration guide
- `assets/` - All React components and templates
- `scripts/` - Automation scripts and utilities

**External Documentation:**
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Veo Video Generation](https://ai.google.dev/veo/docs)
- [Imagen Image Generation](https://ai.google.dev/imagen/docs)
- [Firebase Storage Guide](https://firebase.google.com/docs/storage)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

## Changelog

Track major updates and lessons learned in `LESSONS_LEARNED.md`.

**Initial Version (2025-01-XX):**
- Created skill structure
- Defined seasonal prompt library
- Set up Firebase schema
- Created GitHub Actions workflow
- Built content rotation system

---

## Quick Command Reference

```bash
# Set up Firebase structure
bash scripts/setup_firebase_content.sh

# Generate content manually
node scripts/generate_content.js

# Generate for specific season
node scripts/generate_content.js --season=winter --holiday=christmas

# Trigger GitHub Actions workflow
gh workflow run generate-weekly-content.yml

# View workflow status
gh run list --workflow=generate-weekly-content.yml

# Deploy Firebase rules
firebase deploy --only firestore:rules,storage
```

---

**Next Steps After Setup:**

1. ✅ Run `setup_firebase_content.sh` to initialize Firebase
2. ✅ Copy component templates to your project
3. ✅ Update Hero component with `useContentRotation` hook
4. ✅ Test content rotation locally
5. ✅ Set up GitHub Actions workflow
6. ✅ Generate first batch of content
7. ✅ Monitor and update prompts based on quality

---

## Part 2: Blog & Newsletter Automation System

### Overview

The blog automation system uses Gemini AI to curate coffee-related articles weekly, generate blog posts, publish them to Firestore, and send newsletters to subscribers via Gmail API.

### System Architecture

```
Weekly Automation (Sundays, 2:00 AM UTC)
    ↓
Gemini AI: Search & curate 4 coffee articles
    ↓
Gemini AI: Generate blog post with summaries
    ↓
Firestore: Publish blog post (/blog-posts)
    ↓
Gmail API: Send newsletter to subscribers
    ↓
Firestore: Record send in /newsletter-history
```

### Quick Setup

#### 1. Install Dependencies

```bash
npm install googleapis nodemailer @types/nodemailer
```

#### 2. Set Up Gmail OAuth

**Enable Gmail API:**
1. Go to Google Cloud Console
2. Enable Gmail API
3. Configure OAuth consent screen
4. Create OAuth Desktop credentials
5. Download `gmail-credentials.json`

**Authenticate:**
```bash
npm run gmail:auth
```

Follow prompts to authorize and get refresh token.

**Add to .env.local:**
```env
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

**Detailed Guide:** See `scripts/gmail-setup.md` for complete instructions.

#### 3. Update Firestore Rules

Add blog collections to `firestore.rules`:

```javascript
// Blog posts - Public read, admin write
match /blog-posts/{postId} {
  allow read: if true;
  allow write: if isAdmin();
}

// Newsletter sent history - Admin only
match /newsletter-history/{historyId} {
  allow read, write: if isAdmin();
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

#### 4. Test Locally

```bash
# Curate blog content (generates JSON)
npm run curate:blog

# Upload to Firestore
npm run upload:blog

# Send newsletter (dry run)
npm run send:newsletter -- --dry-run

# Full workflow
npm run blog:auto
```

### Blog Curation Script

**Location:** `scripts/curate-blog-content.ts`

**What it does:**
1. Uses Gemini 2.0 Flash to search for recent coffee articles
2. Focuses on: brewing techniques, recipes, coffee culture
3. Analyzes and summarizes each article
4. Extracts 3-4 key takeaways per article
5. Generates cohesive blog post introduction and conclusion
6. Saves to `scripts/generated-blog-post.json`

**Usage:**
```bash
# Default: 4 articles
npm run curate:blog

# Custom article count
npm run curate:blog -- --articles=5
```

**Gemini Prompt Strategy:**
- Requests specific, reputable sources (Perfect Daily Grind, Barista Magazine, James Hoffmann)
- Focuses on practical, actionable content for home brewers
- Avoids commercial reviews and business advice
- Emphasizes brewing techniques and coffee science

### Blog Upload Script

**Location:** `scripts/upload-blog-post.ts`

**What it does:**
1. Reads `generated-blog-post.json`
2. Generates URL-friendly slug
3. Calculates estimated read time
4. Creates excerpt from introduction
5. Uploads to Firestore with metadata

**Firestore Schema:**
```typescript
{
  title: string
  slug: string  // URL-friendly, e.g., "brewing-perfect-espresso"
  introduction: string
  articles: CuratedArticle[]  // Array of curated articles with summaries
  conclusion: string
  tags: string[]
  category: "brewing-techniques" | "coffee-recipes" | "coffee-culture" | "coffee-science"
  status: "published" | "draft"
  publishedAt: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
  author: "Stockbridge Coffee Team"
  readTime: "5 min read"
  excerpt: string  // First 160 chars of introduction
}
```

### Newsletter Email System

**Location:** `scripts/send-newsletter.ts`

**Gmail OAuth Integration:**
- Uses OAuth 2.0 for secure authentication
- Refresh token stored in environment variables
- No password storage required
- Better deliverability than SMTP

**Email Template:**
- Responsive HTML design
- Matches Stockbridge Coffee brand (Teal, Golden, Cream, Grey)
- Includes all curated articles with summaries and key takeaways
- Read More buttons linking to original sources
- Subscribe CTA linking back to website
- Unsubscribe link with email parameter

**Rate Limiting:**
- 1 second delay between emails (prevents rate limiting)
- Batch tracking for success/failure counts
- Records sends in `/newsletter-history` collection

**Subscriber Management:**
- Fetches from existing `/newsletter` collection
- Compatible with existing Newsletter component
- No migration required

### GitHub Actions Workflow

**Location:** `.github/workflows/weekly-blog-newsletter.yml`

**Schedule:** Every Sunday at 2:00 AM UTC (3:00 AM BST, 2:00 AM GMT)

**Required Secrets:**
```bash
# Set all secrets:
gh secret set GEMINI_API_KEY --body "..."
gh secret set VITE_FIREBASE_API_KEY --body "..."
gh secret set VITE_FIREBASE_AUTH_DOMAIN --body "..."
gh secret set VITE_FIREBASE_PROJECT_ID --body "..."
gh secret set VITE_FIREBASE_STORAGE_BUCKET --body "..."
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "..."
gh secret set VITE_FIREBASE_APP_ID --body "..."
gh secret set GMAIL_USER --body "your-email@gmail.com"
gh secret set GMAIL_CLIENT_ID --body "..."
gh secret set GMAIL_CLIENT_SECRET --body "..."
gh secret set GMAIL_REFRESH_TOKEN --body "..."
```

**Workflow Steps:**
1. Checkout repository
2. Set up Node.js 18
3. Install dependencies
4. Set environment variables
5. Curate blog content with Gemini
6. Upload to Firestore
7. Send newsletter to subscribers
8. Archive generated content as artifact

**Manual Trigger:**
```bash
# Via CLI
gh workflow run weekly-blog-newsletter.yml

# Via Web UI: Actions > Weekly Blog & Newsletter > Run workflow
```

**Input Parameters:**
- `article_count`: Number of articles (default: 4)
- `skip_newsletter`: Set to `true` for dry run (default: false)

### Website Integration

#### BlogHighlights Component

**Updated:** `src/components/BlogHighlights.tsx`

**Changes:**
- Now fetches from Firestore instead of hardcoded data
- Uses `useCollection` hook with query filters
- Shows latest 3 published posts
- Loading and error states
- Formats Firestore timestamps
- Links to blog detail pages using slug

#### BlogPost Detail Page

**Created:** `src/pages/BlogPost.tsx`

**Features:**
- Fetches blog post by slug parameter
- Displays full blog post with all articles
- Shows article summaries and key takeaways
- External links to original sources
- Relevance score visualization
- Newsletter subscription CTA
- Back button navigation
- Responsive design matching brand

**Routing:**
Add to your router:
```typescript
<Route path="/blog/:slug" element={<BlogPost />} />
```

### NPM Scripts Reference

```json
{
  "curate:blog": "Generate blog post from AI-curated articles",
  "upload:blog": "Upload generated blog post to Firestore",
  "gmail:auth": "Authenticate Gmail API with OAuth",
  "send:newsletter": "Send newsletter to all subscribers",
  "blog:auto": "Full workflow: curate, upload, send"
}
```

### Cost Analysis

**Gemini AI (Blog Curation):**
- Model: Gemini 2.0 Flash
- Cost per blog: $0.10-$0.30
- Weekly: ~$1.20/month
- Annual: ~$15/year

**Gmail API:**
- Free tier: 250 emails/day
- Sufficient for <250 subscribers
- Cost: $0/month
- Upgrade: Google Workspace ($6/user/month for 2,000 emails/day)

**Firebase Firestore:**
- Blog posts read: ~1,000 reads/month (existing free tier)
- Blog posts write: ~4 writes/month (negligible)
- Cost: $0/month

**GitHub Actions:**
- Workflow runtime: ~3-5 minutes/week
- Free tier: 2,000 minutes/month
- Cost: $0/month

**Total Operating Cost:** ~$1.50/month

### Scaling Considerations

#### 100+ Subscribers

**Option 1: Upgrade to SendGrid**
- Free tier: 100 emails/day
- Paid: $19.95/month for 50,000 emails
- Better deliverability and analytics

**Option 2: Gmail with Google Workspace**
- $6/user/month
- 2,000 emails/day limit
- Professional sender reputation

#### 500+ Subscribers

**Recommended: SendGrid or Mailgun**
- Mailgun: $0.80/1,000 emails (pay-as-you-go)
- SendGrid: $19.95/month for 50,000 emails
- Built-in bounce handling and unsubscribe management
- Detailed analytics and reporting

### Troubleshooting

#### Issue: "Invalid grant" error

**Cause:** Gmail refresh token expired

**Solution:**
```bash
npm run gmail:auth  # Re-authenticate
# Update .env.local with new GMAIL_REFRESH_TOKEN
```

#### Issue: Blog curation produces low-quality articles

**Solution:**
Edit `scripts/curate-blog-content.ts`:
- Adjust search prompt to be more specific
- Add more reputable source examples
- Increase `relevanceScore` threshold
- Filter by publication date more strictly

#### Issue: Newsletter emails going to spam

**Solutions:**
1. Add SPF/DKIM records to domain
2. Warm up sender reputation (start with small batches)
3. Avoid spam trigger words in subject/content
4. Ensure unsubscribe link is prominent
5. Consider migrating to SendGrid/Mailgun

#### Issue: Rate limit exceeded

**Gmail API Limits:**
- Free: 250 emails/day
- Google Workspace: 2,000 emails/day

**Solutions:**
1. Batch emails across multiple days
2. Upgrade to Google Workspace
3. Migrate to dedicated email service

### Security Best Practices

**Gmail Credentials:**
- ✅ Never commit `gmail-credentials.json` or `gmail-token.json`
- ✅ Use GitHub Secrets for CI/CD
- ✅ Rotate refresh tokens quarterly
- ✅ Use OAuth (not app passwords) for better security
- ✅ Add `.gitignore` entries for credential files

**API Keys:**
- ✅ Store in `.env.local` (git-ignored)
- ✅ Use GitHub Secrets for automation
- ✅ Never hardcode in source files
- ✅ Rotate regularly (every 90 days)

**Subscriber Data:**
- ✅ Store only email addresses (minimal data)
- ✅ Provide unsubscribe links in all emails
- ✅ Use Firestore security rules to protect admin access
- ✅ Log newsletter sends for audit trail

### Complete Documentation

For detailed setup instructions, see:
- **`docs/BLOG-AUTOMATION-SETUP.md`** - Complete setup guide
- **`scripts/gmail-setup.md`** - Gmail OAuth detailed instructions
- **`.github/workflows/weekly-blog-newsletter.yml`** - Automation workflow

### Next Steps After Blog Setup

1. ✅ Install dependencies: `npm install googleapis nodemailer @types/nodemailer`
2. ✅ Set up Gmail OAuth: `npm run gmail:auth`
3. ✅ Update environment variables in `.env.local`
4. ✅ Test blog curation: `npm run curate:blog`
5. ✅ Test upload: `npm run upload:blog`
6. ✅ Test newsletter (dry run): `npm run send:newsletter -- --dry-run`
7. ✅ Deploy Firestore rules: `firebase deploy --only firestore:rules`
8. ✅ Add GitHub secrets for automation
9. ✅ Run manual workflow test
10. ✅ Monitor first automated run

---

For questions or issues, refer to the troubleshooting sections or update `LESSONS_LEARNED.md` with new discoveries.
