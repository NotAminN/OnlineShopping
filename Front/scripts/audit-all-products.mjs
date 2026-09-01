import fs from 'fs';
import path from 'path';
import { PRODUCTS } from '../src/js/data/products.js';

const productsDir = path.resolve('public/images/products');

const audit = PRODUCTS.map(p => {
  const img1 = `${p.slug}.jpg`;
  const img2 = `${p.slug}-2.jpg`;
  const p1 = path.join(productsDir, img1);
  const p2 = path.join(productsDir, img2);
  const exists1 = fs.existsSync(p1);
  const exists2 = fs.existsSync(p2);
  const size1 = exists1 ? (fs.statSync(p1).size / 1024).toFixed(1) : 0;
  const size2 = exists2 ? (fs.statSync(p2).size / 1024).toFixed(1) : 0;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    img1,
    size1: `${size1} KB`,
    img2,
    size2: `${size2} KB`,
    valid: exists1 && exists2 && size1 > 10 && size2 > 10
  };
});

console.log(`Audited ${audit.length} products:`);
const invalid = audit.filter(a => !a.valid);
console.log(`Valid: ${audit.length - invalid.length}, Invalid/Missing: ${invalid.length}`);
if (invalid.length > 0) {
  console.log('Invalid:', invalid);
}
