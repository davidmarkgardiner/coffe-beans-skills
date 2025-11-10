#!/usr/bin/env tsx
/**
 * Send Newsletter via Gmail API
 *
 * Sends the latest blog post to all newsletter subscribers
 *
 * Usage:
 *   npm run send:newsletter
 *   npm run send:newsletter -- --post-id=abc123
 *   npm run send:newsletter -- --dry-run
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, Timestamp, query, where, orderBy, limit } from 'firebase/firestore'
import * as dotenv from 'dotenv'
import * as fs from 'fs/promises'
import { google } from 'googleapis'
import * as nodemailer from 'nodemailer'

dotenv.config({ path: '.env.local' })

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface Subscriber {
  email: string
  subscribedAt: any
  source?: string
  preferences?: any
}

interface BlogPost {
  id: string
  title: string
  slug: string
  introduction: string
  articles: Array<{
    title: string
    url: string
    source: string
    summary: string
    keyTakeaways: string[]
    relevanceScore: number
  }>
  conclusion: string
  tags: string[]
  category: string
  publishedAt: any
  readTime: string
  excerpt: string
}

/**
 * Set up Gmail OAuth2 client
 */
async function setupGmailAuth() {
  const CLIENT_ID = process.env.GMAIL_CLIENT_ID
  const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET
  const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN
  const GMAIL_USER = process.env.GMAIL_USER

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !GMAIL_USER) {
    throw new Error('Missing Gmail OAuth credentials. Please run: npm run gmail:auth')
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'http://localhost:3000/oauth2callback'
  )

  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  })

  return { oauth2Client, userEmail: GMAIL_USER }
}

/**
 * Create Nodemailer transporter with Gmail OAuth2
 */
async function createGmailTransporter() {
  const { oauth2Client, userEmail } = await setupGmailAuth()

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: userEmail,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  })

  return { transporter, userEmail }
}

/**
 * Fetch all newsletter subscribers
 */
async function getSubscribers(): Promise<Subscriber[]> {
  console.log('📧 Fetching newsletter subscribers...')

  try {
    const subscribersSnapshot = await getDocs(collection(db, 'newsletter'))
    const subscribers: Subscriber[] = []

    subscribersSnapshot.forEach((doc) => {
      const data = doc.data()
      subscribers.push({
        email: doc.id,
        subscribedAt: data.subscribedAt,
        source: data.source,
        preferences: data.preferences,
      })
    })

    console.log(`✅ Found ${subscribers.length} subscribers`)
    return subscribers
  } catch (error) {
    console.error('❌ Error fetching subscribers:', error)
    throw error
  }
}

/**
 * Fetch blog post by ID or get the latest
 */
async function getBlogPost(postId?: string): Promise<BlogPost | null> {
  console.log(postId ? `📝 Fetching blog post: ${postId}` : '📝 Fetching latest blog post...')

  try {
    if (postId) {
      const docRef = doc(db, 'blog-posts', postId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        console.error(`❌ Blog post not found: ${postId}`)
        return null
      }

      return { id: docSnap.id, ...docSnap.data() } as BlogPost
    } else {
      // Get the latest published post
      const q = query(
        collection(db, 'blog-posts'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(1)
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        console.error('❌ No published blog posts found')
        return null
      }

      const docSnap = snapshot.docs[0]
      return { id: docSnap.id, ...docSnap.data() } as BlogPost
    }
  } catch (error) {
    console.error('❌ Error fetching blog post:', error)
    throw error
  }
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(blogPost: BlogPost, websiteUrl: string = 'https://stockbridgecoffee.com'): string {
  const blogUrl = `${websiteUrl}/blog/${blogPost.slug}`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blogPost.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #F5F1E8;
      color: #2D2D2D;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
    }
    .header {
      background: linear-gradient(135deg, #2D2D2D 0%, #0A8A8A 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #FFFFFF;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px 30px;
    }
    .intro {
      font-size: 16px;
      line-height: 1.6;
      color: #2D2D2D;
      margin-bottom: 30px;
    }
    .article {
      margin-bottom: 30px;
      padding: 20px;
      background-color: #F5F1E8;
      border-radius: 8px;
    }
    .article h3 {
      margin: 0 0 10px 0;
      font-size: 20px;
      color: #0A8A8A;
    }
    .article .source {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .article .summary {
      font-size: 14px;
      line-height: 1.6;
      color: #2D2D2D;
      margin-bottom: 15px;
    }
    .article .takeaways {
      margin: 15px 0 0 0;
      padding: 0 0 0 20px;
    }
    .article .takeaways li {
      font-size: 14px;
      line-height: 1.5;
      color: #2D2D2D;
      margin-bottom: 8px;
    }
    .article a {
      display: inline-block;
      margin-top: 10px;
      padding: 10px 20px;
      background-color: #0A8A8A;
      color: #FFFFFF !important;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
    }
    .conclusion {
      font-size: 16px;
      line-height: 1.6;
      color: #2D2D2D;
      margin: 30px 0;
      padding: 20px;
      background-color: #F5F1E8;
      border-left: 4px solid #B89968;
    }
    .cta {
      text-align: center;
      margin: 40px 0;
    }
    .cta a {
      display: inline-block;
      padding: 15px 40px;
      background-color: #0A8A8A;
      color: #FFFFFF !important;
      text-decoration: none;
      border-radius: 50px;
      font-size: 16px;
      font-weight: bold;
    }
    .footer {
      background-color: #2D2D2D;
      color: #FFFFFF;
      padding: 30px;
      text-align: center;
      font-size: 12px;
    }
    .footer a {
      color: #B89968 !important;
      text-decoration: none;
    }
    .unsubscribe {
      margin-top: 20px;
      font-size: 11px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>☕ ${blogPost.title}</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="intro">${blogPost.introduction}</p>

      <!-- Curated Articles -->
      ${blogPost.articles.map((article, index) => `
      <div class="article">
        <div class="source">${article.source}</div>
        <h3>${index + 1}. ${article.title}</h3>
        <p class="summary">${article.summary}</p>
        <ul class="takeaways">
          ${article.keyTakeaways.map(takeaway => `<li>${takeaway}</li>`).join('')}
        </ul>
        <a href="${article.url}" target="_blank">Read Full Article →</a>
      </div>
      `).join('')}

      <!-- Conclusion -->
      <div class="conclusion">
        ${blogPost.conclusion}
      </div>

      <!-- CTA -->
      <div class="cta">
        <a href="${blogUrl}" target="_blank">Read More on Our Blog</a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Stockbridge Coffee</strong></p>
      <p>Premium Coffee Roasters • Edinburgh, Scotland</p>
      <p>
        <a href="${websiteUrl}">Visit Our Website</a> •
        <a href="${websiteUrl}/products">Shop Coffee</a>
      </p>
      <p class="unsubscribe">
        You're receiving this because you subscribed to our newsletter.<br>
        <a href="${websiteUrl}/unsubscribe?email={{EMAIL}}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Send email to a single subscriber
 */
async function sendEmail(
  transporter: any,
  fromEmail: string,
  toEmail: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const personalizedHTML = html.replace(/{{EMAIL}}/g, encodeURIComponent(toEmail))

    await transporter.sendMail({
      from: `Stockbridge Coffee <${fromEmail}>`,
      to: toEmail,
      subject: subject,
      html: personalizedHTML,
    })

    return true
  } catch (error) {
    console.error(`   ❌ Failed to send to ${toEmail}:`, error)
    return false
  }
}

/**
 * Record newsletter send in Firestore
 */
async function recordNewsletterSend(blogPostId: string, subscriberCount: number, successCount: number) {
  try {
    await addDoc(collection(db, 'newsletter-history'), {
      blogPostId,
      subscriberCount,
      successCount,
      failureCount: subscriberCount - successCount,
      sentAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('⚠️  Warning: Failed to record newsletter send:', error)
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2)
  const postIdArg = args.find(arg => arg.startsWith('--post-id='))
  const postId = postIdArg ? postIdArg.split('=')[1] : undefined
  const dryRun = args.includes('--dry-run')

  console.log('📬 Stockbridge Coffee - Newsletter Sender')
  console.log('='.repeat(50))
  console.log(`Mode: ${dryRun ? 'DRY RUN (no emails sent)' : 'LIVE'}`)
  console.log('')

  try {
    // Fetch blog post
    const blogPost = await getBlogPost(postId)
    if (!blogPost) {
      console.error('❌ No blog post available to send')
      process.exit(1)
    }

    console.log(`✅ Blog post: "${blogPost.title}"`)
    console.log(`   Published: ${blogPost.publishedAt.toDate().toLocaleDateString()}`)
    console.log(`   Articles: ${blogPost.articles.length}`)
    console.log('')

    // Fetch subscribers
    const subscribers = await getSubscribers()
    if (subscribers.length === 0) {
      console.log('⚠️  No subscribers found')
      process.exit(0)
    }

    // Generate email HTML
    const emailHTML = generateEmailHTML(blogPost)
    const subject = `☕ ${blogPost.title}`

    if (dryRun) {
      console.log('📝 DRY RUN - Email Preview:')
      console.log('='.repeat(50))
      console.log(`Subject: ${subject}`)
      console.log(`Recipients: ${subscribers.length}`)
      console.log('')
      console.log('First few lines of HTML:')
      console.log(emailHTML.substring(0, 500) + '...')
      console.log('')
      console.log('✅ Dry run complete. Add --live to send emails.')
      return
    }

    // Set up Gmail transporter
    console.log('🔐 Authenticating with Gmail...')
    const { transporter, userEmail } = await createGmailTransporter()
    console.log(`✅ Authenticated as: ${userEmail}`)
    console.log('')

    // Send emails
    console.log(`📧 Sending newsletter to ${subscribers.length} subscribers...`)
    let successCount = 0

    for (const subscriber of subscribers) {
      const success = await sendEmail(transporter, userEmail, subscriber.email, subject, emailHTML)
      if (success) {
        successCount++
        console.log(`   ✅ Sent to ${subscriber.email}`)
      }

      // Rate limiting: wait 1 second between emails
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('')
    console.log('✅ Newsletter sent successfully!')
    console.log(`   Total subscribers: ${subscribers.length}`)
    console.log(`   Successful: ${successCount}`)
    console.log(`   Failed: ${subscribers.length - successCount}`)

    // Record the send
    await recordNewsletterSend(blogPost.id, subscribers.length, successCount)

  } catch (error) {
    console.error('❌ Error sending newsletter:', error)
    process.exit(1)
  }
}

main()
