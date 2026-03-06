#!/usr/bin/env node
// check-stock.js — Display current stock levels with low-stock alerts
// Usage: node check-stock.js [--json]

import { db } from './firebase.js';

const SAFETY_STOCK_KG = 5;
const jsonOutput = process.argv.includes('--json');

async function checkStock() {
  // Get bean stock levels
  const stockSnap = await db.collection('stock_levels').get();
  const beans = [];

  stockSnap.forEach(doc => {
    const data = doc.data();
    beans.push({
      beanType: data.beanType,
      beanId: data.beanId,
      totalKg: data.totalKg || 0,
      lastRoastDate: data.lastRoastDate?.toDate?.()?.toISOString().split('T')[0] || 'N/A',
      lowStock: (data.totalKg || 0) < SAFETY_STOCK_KG,
    });
  });

  // Get packaging supplies
  const packSnap = await db.collection('packaging').get();
  const packaging = [];

  packSnap.forEach(doc => {
    const data = doc.data();
    packaging.push({
      item: data.item || doc.id,
      count: data.count || 0,
      minStock: data.minStock || 0,
      lowStock: (data.count || 0) < (data.minStock || 0),
    });
  });

  if (jsonOutput) {
    console.log(JSON.stringify({ beans, packaging }, null, 2));
    return;
  }

  // Pretty print
  console.log('\n☕ STOCKBRIDGE COFFEE — BEAN LEDGER\n');
  console.log('═══ BEAN STOCK ═══');

  if (beans.length === 0) {
    console.log('  No beans in inventory yet.');
  }

  for (const b of beans) {
    const alert = b.lowStock ? ' ⚠️  LOW STOCK!' : '';
    console.log(`  ${b.beanType}: ${b.totalKg.toFixed(1)}kg (last roast: ${b.lastRoastDate})${alert}`);
  }

  const lowBeans = beans.filter(b => b.lowStock);
  if (lowBeans.length > 0) {
    console.log(`\n🚨 ${lowBeans.length} bean(s) below safety stock (${SAFETY_STOCK_KG}kg)`);
  }

  if (packaging.length > 0) {
    console.log('\n═══ PACKAGING ═══');
    for (const p of packaging) {
      const alert = p.lowStock ? ' ⚠️  LOW!' : '';
      console.log(`  ${p.item}: ${p.count}${alert}`);
    }
  }

  console.log('');
}

checkStock().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
