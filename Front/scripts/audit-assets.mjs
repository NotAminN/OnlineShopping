import fs from 'fs';
import path from 'path';

const { PRODUCTS } = await import('../src/js/data/products.js');
const { HERO_SLIDES, EDITORIAL_SECTIONS } = await import('../src/js/data/home-content.js');
const { DEFAULT_CATEGORIES } = await import('../src/js/data/categories.js');
const { COLLECTIONS } = await import('../src/js/data/collections.js');

const base = path.resolve('public');
let checked = 0;
let errors = 0;

function verify(rel) {
  if (!rel || rel.startsWith('http')) return;
  const clean = rel.startsWith('/') ? rel.slice(1) : rel;
  const full = path.join(base, clean);
  checked++;
  if (!fs.existsSync(full)) {
    console.error('MISSING:', clean);
    errors++;
  } else {
    const sz = fs.statSync(full).size;
    if (sz < 1000) {
      console.error('CORRUPT/TOO SMALL:', clean, sz);
      errors++;
    }
  }
}

// Products (124 images)
PRODUCTS.forEach(p => p.images.forEach(img => verify(img)));
// Hero (5 images)
HERO_SLIDES.forEach(s => verify(s.image));
// Editorial (3 images)
verify(EDITORIAL_SECTIONS.main.image);
verify(EDITORIAL_SECTIONS.main.secondary);
verify(EDITORIAL_SECTIONS.story.image);
// Categories (6 images)
DEFAULT_CATEGORIES.forEach(c => verify(c.image));
// Collections (5 images)
COLLECTIONS.forEach(c => verify(c.image));
// Fallback (1 image)
verify('/images/fallback.svg');

console.log(`AUDIT COMPLETE: Checked ${checked} local assets. Errors: ${errors}`);
