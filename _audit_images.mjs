import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PRODUCTS } from './Front/src/js/data/products.js';

const DIR = 'Front/public/images/products';
const hashes = new Map(); // sha -> [files]
const report = { missing: [], zero: [], tiny: [], dupWithin: [], dupCross: [], ok: 0 };

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);

for (const p of PRODUCTS) {
  const files = p.images.map((im) => path.join(DIR, im.replace('/images/products/', '')));
  const h = [];
  for (const f of files) {
    if (!fs.existsSync(f)) { report.missing.push(`${p.slug}: ${path.basename(f)}`); continue; }
    const buf = fs.readFileSync(f);
    if (buf.length === 0) { report.zero.push(path.basename(f)); continue; }
    const hh = sha(buf);
    h.push(hh);
    if (!hashes.has(hh)) hashes.set(hh, []);
    hashes.get(hh).push(path.basename(f));
    if (buf.length < 8000) report.tiny.push(`${path.basename(f)} (${buf.length}B)`);
  }
  if (h.length === 2 && h[0] === h[1]) report.dupWithin.push(p.slug);
  report.ok++;
}

for (const [hh, files] of hashes) {
  if (files.length > 1) report.dupCross.push(files.join(' == '));
}

console.log('Products checked:', report.ok);
console.log('Missing:', report.missing.length ? report.missing : 'none');
console.log('Zero-byte:', report.zero.length ? report.zero : 'none');
console.log('Tiny(<8KB):', report.tiny.length ? report.tiny : 'none');
console.log('Dup within product:', report.dupWithin.length ? report.dupWithin : 'none');
console.log('Cross-file identical:', report.dupCross.length ? report.dupCross : 'none');
