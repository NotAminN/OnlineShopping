import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PRODUCTS, IMG } from '../src/js/data/products.js';

const dir = path.resolve('Front/public/images/products');

const fileHashes = {};
const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
for (const f of allFiles) {
  const buf = fs.readFileSync(path.join(dir, f));
  fileHashes[f] = crypto.createHash('md5').update(buf).digest('hex');
}

console.log('=== FULL 62 PRODUCTS AUDIT ===\n');

for (const p of PRODUCTS) {
  const f1 = `${p.slug}.jpg`;
  const f2 = `${p.slug}-2.jpg`;
  const h1 = fileHashes[f1];
  const h2 = fileHashes[f2];
  
  const dup1 = allFiles.filter(f => f !== f1 && fileHashes[f] === h1);
  const dup2 = allFiles.filter(f => f !== f2 && fileHashes[f] === h2);
  const samePair = h1 === h2;

  const notes = [];
  if (samePair) notes.push('BOTH_IMAGES_IDENTICAL');
  if (dup1.length > 0) notes.push(`IMG1_DUPLICATES(${dup1.join(',')})`);
  if (dup2.length > 0) notes.push(`IMG2_DUPLICATES(${dup2.join(',')})`);

  console.log(`[${p.id}] ${p.slug} | "${p.name}" (${p.category})`);
  if (notes.length > 0) {
    console.log(`   ⚠️ ISSUES: ${notes.join(' | ')}`);
  } else {
    console.log(`   ✓ Unique pair`);
  }
}
