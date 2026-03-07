#!/usr/bin/env node
/**
 * Stockbridge Coffee — Weekly Newsletter Draft Generator
 * 
 * Generates a newsletter from template + Firestore data,
 * saves as Gmail draft for David to review.
 * 
 * Usage: node draft-newsletter.js [--send] [--preview]
 * 
 * Requires env vars:
 *   GMAIL_COFFEE_CLIENT_ID
 *   GMAIL_COFFEE_CLIENT_SECRET
 *   GMAIL_COFFEE_REFRESH_TOKEN
 *   COFFEE_FIREBASE_SERVICE_ACCOUNT (JSON string)
 */

const admin = require('firebase-admin');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const fs = require('fs');
const path = require('path');

// --- Config ---
const CLIENT_ID = process.env.GMAIL_COFFEE_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_COFFEE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_COFFEE_REFRESH_TOKEN;
const SERVICE_ACCOUNT = process.env.COFFEE_FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.COFFEE_FIREBASE_SERVICE_ACCOUNT) 
  : null;

const FROM_EMAIL = 'Stockbridge Coffee <stockbridgecoffee@gmail.com>';
const SUBJECT_PREFIX = '☕ Stockbridge Coffee';

// --- Validate ---
function checkEnv() {
  const missing = [];
  if (!CLIENT_ID) missing.push('GMAIL_COFFEE_CLIENT_ID');
  if (!CLIENT_SECRET) missing.push('GMAIL_COFFEE_CLIENT_SECRET');
  if (!REFRESH_TOKEN) missing.push('GMAIL_COFFEE_REFRESH_TOKEN');
  if (!SERVICE_ACCOUNT) missing.push('COFFEE_FIREBASE_SERVICE_ACCOUNT');
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
    console.error('Fetch from: gcloud secrets versions access latest --secret=<name>');
    process.exit(1);
  }
}

// --- Firebase ---
function initFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(SERVICE_ACCOUNT) });
  }
  return admin.firestore();
}

// --- Gmail ---
function initGmail() {
  const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET);
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  return google.gmail({ version: 'v1', auth: oAuth2Client });
}

// --- Get newsletter content from Firestore ---
async function getNewsletterContent(db) {
  const content = {
    featured_product: 'Honduras SHG Monte Cristo Mountain',
    featured_description: 'Our signature medium roast with notes of milk chocolate, nuts, and tropical fruit.',
    brewing_tip: '',
    fox_update: '',
    discount_code: '',
  };

  // Try to get latest product
  try {
    const products = await db.collection('products')
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();
    
    if (!products.empty) {
      const product = products.docs[0].data();
      content.featured_product = product.name || content.featured_product;
      content.featured_description = product.description || content.featured_description;
    }
  } catch (e) {
    console.log('No products collection, using defaults');
  }

  // Brewing tips rotation
  const tips = [
    "💧 Water temperature matters! For pour-over, aim for 92-96°C. Too hot burns the coffee, too cold under-extracts.",
    "⏱️ The perfect French Press: coarse grind, 4 minutes steep, gentle plunge. Don't rush it!",
    "🏔️ Store your beans in an airtight container at room temperature. Never in the fridge — moisture is the enemy.",
    "☕ Pre-wet your paper filter before brewing. It removes papery taste and preheats your brewer.",
    "⚖️ Use 60g of coffee per litre of water as your starting ratio. Adjust to taste from there.",
    "🔄 Grind fresh, brew immediately. Pre-ground coffee loses flavour within 30 minutes of grinding.",
  ];
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  content.brewing_tip = tips[weekNum % tips.length];

  // Fox updates rotation
  const foxUpdates = [
    "🦊 Spotted this week: Our resident fox was seen trotting past the shop at dusk, clearly on a caffeine mission.",
    "🦊 Fox fact: Edinburgh's urban foxes have been here since the 1990s. They love Stockbridge as much as we do.",
    "🦊 The Stockbridge Fox has been quiet this week — probably sleeping off last Sunday's market excitement.",
    "🦊 Fun fact: Foxes can hear a watch ticking from 36 metres away. No wonder ours always knows when the roaster's done.",
  ];
  content.fox_update = foxUpdates[weekNum % foxUpdates.length];

  return content;
}

// --- Build email HTML ---
function buildNewsletter(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; color: #2d3436; margin: 0; padding: 0; background: #faf8f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #d4a574; }
    .header h1 { font-size: 28px; color: #2d3436; margin: 0; letter-spacing: 2px; }
    .header p { color: #636e72; font-size: 14px; margin-top: 8px; }
    .section { padding: 30px 0; border-bottom: 1px solid #e8e0d8; }
    .section h2 { font-size: 20px; color: #d4a574; margin: 0 0 15px; }
    .section p { line-height: 1.7; color: #4a4a4a; }
    .featured { background: #f5f0eb; padding: 25px; border-radius: 8px; margin: 15px 0; }
    .featured h3 { margin: 0 0 10px; color: #2d3436; }
    .cta { text-align: center; padding: 30px 0; }
    .cta a { display: inline-block; padding: 14px 32px; background: #2d3436; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; letter-spacing: 1px; }
    .fox-corner { background: #faf3ed; padding: 20px; border-radius: 8px; border-left: 4px solid #d4a574; margin: 15px 0; }
    .footer { text-align: center; padding: 30px 0; color: #999; font-size: 12px; }
    .footer a { color: #d4a574; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>STOCKBRIDGE COFFEE</h1>
      <p>Roasted in Edinburgh · Delivered to your door</p>
    </div>

    <div class="section">
      <h2>☕ This Week's Featured Roast</h2>
      <div class="featured">
        <h3>${content.featured_product}</h3>
        <p>${content.featured_description}</p>
      </div>
    </div>

    <div class="section">
      <h2>🔥 Brewing Tip of the Week</h2>
      <p>${content.brewing_tip}</p>
    </div>

    <div class="section">
      <div class="fox-corner">
        <h2 style="margin-top:0;">Fox Corner</h2>
        <p style="margin-bottom:0;">${content.fox_update}</p>
      </div>
    </div>

    ${content.discount_code ? `
    <div class="section">
      <h2>🎁 Exclusive Offer</h2>
      <p>Use code <strong>${content.discount_code}</strong> at checkout for a special discount!</p>
    </div>
    ` : ''}

    <div class="cta">
      <a href="https://stockbridgecoffee.co.uk">Shop Now</a>
    </div>

    <div class="footer">
      <p>Stockbridge Coffee · Roasted in Edinburgh, Scotland</p>
      <p>
        <a href="https://stockbridgecoffee.co.uk">Website</a> · 
        <a href="mailto:hello@stockbridgecoffee.co.uk">Contact</a>
      </p>
      <p style="margin-top: 15px;">
        <a href="{{unsubscribe_url}}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// --- Get subscribers ---
async function getSubscribers(db) {
  const snapshot = await db.collection('newsletter')
    .where('active', '==', true)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    email: doc.data().email,
    name: doc.data().name || '',
  }));
}

// --- Create Gmail draft ---
async function createDraft(gmail, to, subject, htmlBody) {
  const messageParts = [
    `From: ${FROM_EMAIL}`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    htmlBody,
  ];
  
  const raw = Buffer.from(messageParts.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: { message: { raw } },
  });

  return res.data;
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2);
  const preview = args.includes('--preview');
  
  checkEnv();
  
  console.log('📧 Stockbridge Coffee Newsletter Generator');
  console.log('==========================================\n');

  const db = initFirebase();
  const gmail = initGmail();

  // Get content
  console.log('📋 Fetching newsletter content...');
  const content = await getNewsletterContent(db);
  
  // Build HTML
  const html = buildNewsletter(content);

  if (preview) {
    // Save preview locally
    const previewPath = path.join(__dirname, 'preview.html');
    fs.writeFileSync(previewPath, html);
    console.log(`\n👀 Preview saved to: ${previewPath}`);
    console.log('Open in browser to review before sending.');
    return;
  }

  // Get subscribers
  console.log('👥 Fetching subscribers...');
  const subscribers = await getSubscribers(db);
  console.log(`   Found ${subscribers.length} active subscribers`);

  if (subscribers.length === 0) {
    console.log('\n⚠️ No subscribers found. Creating draft for review anyway...');
  }

  // Create draft
  const date = new Date();
  const weekStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const subject = `${SUBJECT_PREFIX} — ${weekStr}`;
  
  // BCC all subscribers in one draft
  const bccList = subscribers.map(s => s.email).join(', ');
  
  console.log(`\n✉️ Creating draft: "${subject}"`);
  const draft = await createDraft(gmail, bccList || 'hello@stockbridgecoffee.co.uk', subject, html);
  console.log(`✅ Draft created (ID: ${draft.id})`);
  console.log(`\n📬 Review in Gmail → stockbridgecoffee@gmail.com → Drafts`);
  console.log('   Approve and send when ready!');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
