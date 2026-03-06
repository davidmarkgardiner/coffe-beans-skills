#!/usr/bin/env node
// add-roast.js — Log a new roast batch
// Usage: node add-roast.js <beanType> <weightKg> [roastDate]
// Example: node add-roast.js "Yirgacheffe" 10 "2026-03-06"

import { db, admin } from './firebase.js';

const [,, beanType, weightStr, roastDateStr] = process.argv;

if (!beanType || !weightStr) {
  console.error('Usage: node add-roast.js <beanType> <weightKg> [roastDate]');
  console.error('Example: node add-roast.js "Yirgacheffe" 10 "2026-03-06"');
  process.exit(1);
}

const weightKg = parseFloat(weightStr);
if (isNaN(weightKg) || weightKg <= 0) {
  console.error('Error: weightKg must be a positive number');
  process.exit(1);
}

const roastDate = roastDateStr ? new Date(roastDateStr) : new Date();

async function addRoast() {
  const batch = db.batch();
  const beanId = beanType.toLowerCase().replace(/\s+/g, '-');

  // 1. Create batch record in inventory collection
  const batchRef = db.collection('inventory').doc();
  batch.set(batchRef, {
    beanType,
    beanId,
    batchNumber: batchRef.id,
    weightKg,
    remainingKg: weightKg,
    roastDate: admin.firestore.Timestamp.fromDate(roastDate),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active', // active | depleted
  });

  // 2. Update aggregate stock level
  const stockRef = db.collection('stock_levels').doc(beanId);
  batch.set(stockRef, {
    beanType,
    beanId,
    totalKg: admin.firestore.FieldValue.increment(weightKg),
    lastRoastDate: admin.firestore.Timestamp.fromDate(roastDate),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  // 3. Log the change
  const logRef = db.collection('inventory_log').doc();
  batch.set(logRef, {
    action: 'roast_added',
    beanType,
    beanId,
    weightKg,
    batchId: batchRef.id,
    roastDate: admin.firestore.Timestamp.fromDate(roastDate),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  console.log(`✅ Roast logged: ${weightKg}kg of ${beanType}`);
  console.log(`   Batch: ${batchRef.id}`);
  console.log(`   Roast date: ${roastDate.toISOString().split('T')[0]}`);
}

addRoast().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
