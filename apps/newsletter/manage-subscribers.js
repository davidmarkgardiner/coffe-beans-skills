#!/usr/bin/env node
/**
 * Stockbridge Coffee — Newsletter Subscriber Management
 * 
 * Usage:
 *   node manage-subscribers.js list              — List all active subscribers
 *   node manage-subscribers.js add <email>       — Add a subscriber
 *   node manage-subscribers.js remove <email>    — Deactivate a subscriber
 *   node manage-subscribers.js count             — Count active subscribers
 *   node manage-subscribers.js export            — Export as CSV
 */

const admin = require('firebase-admin');

const SERVICE_ACCOUNT = process.env.COFFEE_FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.COFFEE_FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!SERVICE_ACCOUNT) {
  console.error('Missing COFFEE_FIREBASE_SERVICE_ACCOUNT');
  console.error('Run: export COFFEE_FIREBASE_SERVICE_ACCOUNT=$(gcloud secrets versions access latest --secret=coffee-firebase-service-account)');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(SERVICE_ACCOUNT) });
}
const db = admin.firestore();
const COLLECTION = 'newsletter';

async function listSubscribers() {
  const snapshot = await db.collection(COLLECTION).where('active', '==', true).get();
  if (snapshot.empty) {
    console.log('No active subscribers.');
    return;
  }
  console.log(`\n📧 Active Subscribers (${snapshot.size}):\n`);
  snapshot.docs.forEach((doc, i) => {
    const d = doc.data();
    const date = d.subscribed_at ? new Date(d.subscribed_at._seconds * 1000).toLocaleDateString() : 'unknown';
    console.log(`  ${i + 1}. ${d.email}${d.name ? ` (${d.name})` : ''} — since ${date}`);
  });
}

async function addSubscriber(email) {
  if (!email || !email.includes('@')) {
    console.error('Invalid email address');
    process.exit(1);
  }

  // Check if exists
  const existing = await db.collection(COLLECTION).where('email', '==', email).get();
  if (!existing.empty) {
    const doc = existing.docs[0];
    if (doc.data().active) {
      console.log(`Already subscribed: ${email}`);
      return;
    }
    // Reactivate
    await doc.ref.update({ active: true, reactivated_at: admin.firestore.FieldValue.serverTimestamp() });
    console.log(`✅ Reactivated: ${email}`);
    return;
  }

  await db.collection(COLLECTION).add({
    email,
    active: true,
    subscribed_at: admin.firestore.FieldValue.serverTimestamp(),
    source: 'manual',
  });
  console.log(`✅ Added: ${email}`);
}

async function removeSubscriber(email) {
  const snapshot = await db.collection(COLLECTION).where('email', '==', email).get();
  if (snapshot.empty) {
    console.log(`Not found: ${email}`);
    return;
  }
  await snapshot.docs[0].ref.update({
    active: false,
    unsubscribed_at: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`✅ Unsubscribed: ${email}`);
}

async function countSubscribers() {
  const active = await db.collection(COLLECTION).where('active', '==', true).get();
  const inactive = await db.collection(COLLECTION).where('active', '==', false).get();
  console.log(`\n📊 Subscribers: ${active.size} active, ${inactive.size} inactive, ${active.size + inactive.size} total`);
}

async function exportCSV() {
  const snapshot = await db.collection(COLLECTION).where('active', '==', true).get();
  console.log('email,name,subscribed_date');
  snapshot.docs.forEach(doc => {
    const d = doc.data();
    const date = d.subscribed_at ? new Date(d.subscribed_at._seconds * 1000).toISOString().split('T')[0] : '';
    console.log(`${d.email},${d.name || ''},${date}`);
  });
}

// --- CLI ---
const [action, ...args] = process.argv.slice(2);

const actions = {
  list: listSubscribers,
  add: () => addSubscriber(args[0]),
  remove: () => removeSubscriber(args[0]),
  count: countSubscribers,
  export: exportCSV,
};

if (!action || !actions[action]) {
  console.log('Usage: node manage-subscribers.js <list|add|remove|count|export> [email]');
  process.exit(1);
}

actions[action]().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
