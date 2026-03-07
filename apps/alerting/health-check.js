#!/usr/bin/env node
/**
 * Stockbridge Coffee — Production Health Check & Alerting System
 *
 * Checks:
 *   1. Website uptime (HTTP GET → stockbridgecoffee.co.uk)
 *   2. Stripe webhook endpoint reachability
 *   3. Firebase / Firestore connectivity
 *   4. Low stock alert (Firestore stock_levels collection)
 *   5. Stripe recent failed charges (optional, if key available)
 *
 * Output:
 *   - Console summary with ✅/🚨 per check
 *   - If any alerts: prints "TELEGRAM: <message>" to stdout
 *   - Exit 0 = all OK, Exit 1 = one or more alerts
 *
 * Usage:
 *   node health-check.js
 *   DEBUG=true node health-check.js          # verbose output
 *   LOW_STOCK_THRESHOLD=5 node health-check.js
 */

import { execSync } from 'child_process';
import { createRequire } from 'module';

// ─── Config ────────────────────────────────────────────────────────────────

const CONFIG = {
  siteUrl: process.env.SITE_URL || 'https://stockbridgecoffee.co.uk',
  webhookPath: '/api/stripe-webhook',
  firestoreHealthDoc: process.env.FIRESTORE_HEALTH_DOC || '_health/ping',
  stockCollection: process.env.STOCK_COLLECTION || 'stock_levels',
  lowStockThresholdKg: parseFloat(process.env.LOW_STOCK_THRESHOLD || '2'),
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '10000'),
  stripeSecretEnv: process.env.STRIPE_SECRET_KEY,
  debug: process.env.DEBUG === 'true',
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const log = (msg) => console.error(`[${new Date().toISOString().slice(11, 16)} UTC] ${msg}`);
const dbg = (msg) => CONFIG.debug && log(`  🔍 ${msg}`);

function getSecret(secretName) {
  try {
    const val = execSync(
      `/opt/google-cloud-sdk/bin/gcloud secrets versions access latest --secret=${secretName}`,
      { encoding: 'utf8', timeout: 15000 }
    ).trim();
    return val;
  } catch (e) {
    dbg(`Secret fetch failed for ${secretName}: ${e.message}`);
    return null;
  }
}

// Lazy-load fetch (works with node-fetch or native Node 18+)
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);
  try {
    // Try native fetch first (Node 18+), fall back to node-fetch
    const fetchFn = globalThis.fetch ?? (await import('node-fetch')).default;
    const response = await fetchFn(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Check Functions ───────────────────────────────────────────────────────

/**
 * 1. Website uptime — expects HTTP 200
 */
async function checkWebsiteUptime() {
  const label = 'Website uptime';
  log(`Checking ${label}…`);
  try {
    const res = await fetchWithTimeout(CONFIG.siteUrl, { method: 'GET' });
    if (res.status === 200) {
      log(`✅ ${label} — HTTP ${res.status}`);
      return { ok: true, label };
    } else {
      const msg = `Website returned HTTP ${res.status} (expected 200)`;
      log(`🚨 ${label} — ${msg}`);
      return { ok: false, label, message: msg };
    }
  } catch (err) {
    const msg = err.name === 'AbortError'
      ? `Request timed out after ${CONFIG.requestTimeoutMs}ms`
      : `Unreachable — ${err.message}`;
    log(`🚨 ${label} — ${msg}`);
    return { ok: false, label, message: msg };
  }
}

/**
 * 2. Stripe webhook endpoint — POST, any non-network-error response is OK
 *    (400/401/422 are expected without a valid Stripe signature)
 */
async function checkStripeWebhook() {
  const label = 'Stripe webhook endpoint';
  const url = `${CONFIG.siteUrl}${CONFIG.webhookPath}`;
  log(`Checking ${label}…`);
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    // Any HTTP response means the endpoint is live
    log(`✅ ${label} — HTTP ${res.status} (endpoint reachable)`);
    return { ok: true, label };
  } catch (err) {
    const msg = err.name === 'AbortError'
      ? `Request timed out after ${CONFIG.requestTimeoutMs}ms`
      : `Unreachable — ${err.message}`;
    log(`🚨 ${label} — ${msg}`);
    return { ok: false, label, message: msg };
  }
}

/**
 * 3. Firebase / Firestore connectivity
 */
async function checkFirebaseConnectivity() {
  const label = 'Firebase connectivity';
  log(`Checking ${label}…`);

  let serviceAccount = null;

  // Priority: env var → GCloud Secret Manager
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      dbg('Using FIREBASE_SERVICE_ACCOUNT_JSON env var');
    } catch {
      dbg('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON');
    }
  }

  if (!serviceAccount) {
    const raw = getSecret('COFFEE_FIREBASE_SERVICE_ACCOUNT');
    if (raw) {
      try {
        serviceAccount = JSON.parse(raw);
        dbg('Loaded Firebase credentials from GCloud Secret Manager');
      } catch {
        log(`🚨 ${label} — Invalid JSON in COFFEE_FIREBASE_SERVICE_ACCOUNT secret`);
        return { ok: false, label, message: 'Firebase credentials JSON is malformed' };
      }
    }
  }

  if (!serviceAccount) {
    log(`⚠️  ${label} — Credentials unavailable (skipping)`);
    return { ok: null, label, message: 'Credentials not found — check COFFEE_FIREBASE_SERVICE_ACCOUNT secret' };
  }

  try {
    const { default: admin } = await import('firebase-admin');

    // Initialise only once (in case this script is ever imported)
    let app;
    if (!admin.apps.length) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      app = admin.app();
    }

    const db = admin.firestore();

    // Attempt a lightweight read — document may or may not exist, we just need no error
    const [collection, docId] = CONFIG.firestoreHealthDoc.split('/');
    const ref = db.collection(collection).doc(docId);

    dbg(`Reading ${CONFIG.firestoreHealthDoc} from Firestore…`);
    await ref.get(); // throws on connectivity failure

    log(`✅ ${label} — Firestore responding`);
    return { ok: true, label, db };
  } catch (err) {
    const msg = `Firestore error — ${err.message}`;
    log(`🚨 ${label} — ${msg}`);
    return { ok: false, label, message: msg };
  }
}

/**
 * 4. Low stock alert — reads stock_levels collection from Firestore
 *    Returns alerts for any bean with totalKg < LOW_STOCK_THRESHOLD
 */
async function checkLowStock(firebaseResult) {
  const label = 'Low stock levels';
  log(`Checking ${label}…`);

  if (firebaseResult.ok === null) {
    log(`⚠️  ${label} — Skipped (Firebase unavailable)`);
    return { ok: null, label, message: 'Skipped — Firebase unavailable' };
  }
  if (!firebaseResult.ok) {
    log(`⚠️  ${label} — Skipped (Firebase check failed)`);
    return { ok: null, label, message: 'Skipped — Firebase check failed' };
  }

  try {
    const { default: admin } = await import('firebase-admin');
    const db = admin.firestore();

    dbg(`Querying ${CONFIG.stockCollection} collection…`);
    const snapshot = await db.collection(CONFIG.stockCollection).get();

    if (snapshot.empty) {
      log(`✅ ${label} — No stock records found (collection empty)`);
      return { ok: true, label };
    }

    const lowStock = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const kg = parseFloat(data.totalKg ?? data.total_kg ?? data.stock_kg ?? 0);
      const name = data.name || data.beanName || data.bean_name || doc.id;
      dbg(`  ${name}: ${kg}kg`);
      if (kg < CONFIG.lowStockThresholdKg) {
        lowStock.push({ id: doc.id, name, kg });
      }
    });

    if (lowStock.length === 0) {
      log(`✅ ${label} — All beans above ${CONFIG.lowStockThresholdKg}kg threshold`);
      return { ok: true, label };
    } else {
      const lines = lowStock.map((b) => `${b.name}: ${b.kg.toFixed(1)}kg`).join(', ');
      const msg = `${lowStock.length} bean(s) low (< ${CONFIG.lowStockThresholdKg}kg): ${lines}`;
      log(`🚨 ${label} — ${msg}`);
      return { ok: false, label, message: msg, lowStock };
    }
  } catch (err) {
    const msg = `Stock query error — ${err.message}`;
    log(`🚨 ${label} — ${msg}`);
    return { ok: false, label, message: msg };
  }
}

/**
 * 5. Stripe recent failed charges (optional)
 */
async function checkStripeFailedCharges() {
  const label = 'Stripe failed charges';

  // Try env first, then Secret Manager
  let stripeKey = CONFIG.stripeSecretEnv;
  if (!stripeKey) {
    stripeKey = getSecret('COFFEE_STRIPE_SECRET_KEY') || getSecret('STRIPE_SECRET_KEY');
  }

  if (!stripeKey) {
    log(`⚠️  ${label} — No Stripe key found (skipping)`);
    return { ok: null, label, message: 'Skipped — STRIPE_SECRET_KEY not available' };
  }

  log(`Checking ${label}…`);
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
    const charges = await stripe.charges.list({
      limit: 100,
      created: { gte: oneHourAgo },
    });

    const failed = charges.data.filter((c) => c.status === 'failed');
    dbg(`Found ${charges.data.length} charges in last hour, ${failed.length} failed`);

    if (failed.length === 0) {
      log(`✅ ${label} — No failed charges in last hour`);
      return { ok: true, label };
    } else {
      const total = failed.reduce((sum, c) => sum + c.amount, 0) / 100;
      const msg = `${failed.length} failed charge(s) in last hour (£${total.toFixed(2)} total)`;
      log(`🚨 ${label} — ${msg}`);
      return { ok: false, label, message: msg };
    }
  } catch (err) {
    const msg = `Stripe API error — ${err.message}`;
    log(`🚨 ${label} — ${msg}`);
    return { ok: false, label, message: msg };
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  log(`\n☕ Stockbridge Coffee Health Check — ${timestamp}`);
  log('─'.repeat(50));

  // Run independent checks in parallel, Firebase-dependent ones after
  const [websiteResult, webhookResult, firebaseResult] = await Promise.all([
    checkWebsiteUptime(),
    checkStripeWebhook(),
    checkFirebaseConnectivity(),
  ]);

  // These depend on Firebase being available
  const [stockResult, stripeResult] = await Promise.all([
    checkLowStock(firebaseResult),
    checkStripeFailedCharges(),
  ]);

  const results = [websiteResult, webhookResult, firebaseResult, stockResult, stripeResult];

  // ─── Summary ─────────────────────────────────────────────────────────────

  log('\n' + '─'.repeat(50));
  log('📋 Summary:');

  const alerts = [];
  const warnings = [];

  for (const r of results) {
    if (r.ok === true) {
      console.error(`  ✅ ${r.label}`);
    } else if (r.ok === false) {
      console.error(`  🚨 ${r.label}: ${r.message}`);
      alerts.push(r);
    } else {
      // null = skipped/warning
      console.error(`  ⚠️  ${r.label}: ${r.message}`);
      warnings.push(r);
    }
  }

  log('─'.repeat(50));

  if (alerts.length === 0) {
    log('✅ All checks passed — Stockbridge Coffee is running smoothly\n');

    if (warnings.length > 0) {
      log(`⚠️  ${warnings.length} check(s) skipped (non-critical)\n`);
    }

    process.exit(0);
  }

  // ─── Telegram Alert ───────────────────────────────────────────────────────

  const alertLines = alerts.map((a) => `• 🚨 *${a.label}*\n  ${a.message}`).join('\n');
  const warningLines = warnings.length > 0
    ? `\n\n⚠️ _Skipped checks: ${warnings.map((w) => w.label).join(', ')}_`
    : '';

  const telegramMsg =
    `🚨 *Stockbridge Coffee Alert*\n\n` +
    `${alertLines}${warningLines}\n\n` +
    `🕐 ${timestamp}`;

  // Print to stdout for the caller (cron script / OpenClaw) to forward
  console.log(`TELEGRAM: ${telegramMsg}`);

  log(`\n🚨 ${alerts.length} alert(s) found — action required\n`);
  process.exit(1);
}

main().catch((err) => {
  console.error(`\n💥 Unexpected error in health check: ${err.message}`);
  console.error(err.stack);
  process.exit(2);
});
