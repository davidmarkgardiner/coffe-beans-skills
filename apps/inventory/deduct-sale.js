#!/usr/bin/env node
// deduct-sale.js — Deduct stock when an order is placed
// Usage: node deduct-sale.js <beanType> <weightKg> [orderId]
// Webhook-ready: also accepts JSON on stdin
// Example: node deduct-sale.js "Yirgacheffe" 0.25 "order_abc123"
// Example: echo '{"beanType":"Yirgacheffe","weightKg":0.25,"orderId":"order_abc"}' | node deduct-sale.js

import { db, admin } from './firebase.js';

const SAFETY_STOCK_KG = 5;

async function getInputFromStdin() {
  // Check if stdin has data (piped)
  if (process.stdin.isTTY) return null;
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  try { return JSON.parse(data); } catch { return null; }
}

async function deductSale(beanType, weightKg, orderId = 'manual') {
  const beanId = beanType.toLowerCase().replace(/\s+/g, '-');
  const stockRef = db.collection('stock_levels').doc(beanId);

  return db.runTransaction(async (tx) => {
    const stockDoc = await tx.get(stockRef);

    if (!stockDoc.exists) {
      throw new Error(`No stock record for "${beanType}"`);
    }

    const currentKg = stockDoc.data().totalKg || 0;
    if (currentKg < weightKg) {
      throw new Error(`Insufficient stock: ${currentKg.toFixed(1)}kg available, ${weightKg}kg requested`);
    }

    const newTotal = currentKg - weightKg;

    // Update stock level
    tx.update(stockRef, {
      totalKg: admin.firestore.FieldValue.increment(-weightKg),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log the deduction
    const logRef = db.collection('inventory_log').doc();
    tx.set(logRef, {
      action: 'sale_deducted',
      beanType,
      beanId,
      weightKg,
      orderId,
      previousKg: currentKg,
      newKg: newTotal,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { previousKg: currentKg, newKg: newTotal };
  }).then(result => {
    console.log(`✅ Deducted ${weightKg}kg of ${beanType} (order: ${orderId})`);
    console.log(`   Stock: ${result.previousKg.toFixed(1)}kg → ${result.newKg.toFixed(1)}kg`);

    if (result.newKg < SAFETY_STOCK_KG) {
      console.log(`🚨 LOW STOCK ALERT: ${beanType} is at ${result.newKg.toFixed(1)}kg (safety: ${SAFETY_STOCK_KG}kg)`);
    }

    return result;
  });
}

// Parse input from CLI args or stdin
async function main() {
  const stdinData = await getInputFromStdin();

  const beanType = stdinData?.beanType || process.argv[2];
  const weightKg = parseFloat(stdinData?.weightKg || process.argv[3]);
  const orderId = stdinData?.orderId || process.argv[4] || 'manual';

  if (!beanType || isNaN(weightKg) || weightKg <= 0) {
    console.error('Usage: node deduct-sale.js <beanType> <weightKg> [orderId]');
    console.error('  Or pipe JSON: echo \'{"beanType":"...","weightKg":0.25}\' | node deduct-sale.js');
    process.exit(1);
  }

  await deductSale(beanType, weightKg, orderId);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

export { deductSale };
