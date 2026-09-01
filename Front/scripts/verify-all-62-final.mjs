import fs from 'fs';
import path from 'path';
import { PRODUCTS } from '../src/js/data/products.js';

const productsDir = path.resolve('public/images/products');

console.log('=== COMPLETE 62 PRODUCTS FINAL AUDIT ===\n');

let total = 0;
let validCount = 0;

for (const p of PRODUCTS) {
  total++;
  const img1 = `${p.slug}.jpg`;
  const img2 = `${p.slug}-2.jpg`;
  const p1 = path.join(productsDir, img1);
  const p2 = path.join(productsDir, img2);
  const s1 = fs.existsSync(p1) ? (fs.statSync(p1).size / 1024).toFixed(0) : 'MISSING';
  const s2 = fs.existsSync(p2) ? (fs.statSync(p2).size / 1024).toFixed(0) : 'MISSING';
  
  const ok = s1 !== 'MISSING' && s2 !== 'MISSING' && Number(s1) > 10 && Number(s2) > 10;
  if (ok) validCount++;

  console.log(`${total.toString().padStart(2, ' ')}. [${p.category.padEnd(11, ' ')}] ${p.name.padEnd(28, ' ')} -> ${img1} (${s1} KB) | ${img2} (${s2} KB) ${ok ? '✓' : '✗'}`);
}

console.log(`\nTOTAL: ${total} | VALID: ${validCount} | STATUS: ${validCount === total ? 'ALL 100% COMPLETE' : 'INCOMPLETE'}`);
