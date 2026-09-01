import fs from 'fs';
import path from 'path';
import https from 'https';

const P = path.resolve('public/images/products');
const C = path.resolve('public/images/categories');

// Same-garment pairs: same photo id, different crop → both images show the SAME garment
const P_ = (id, extra = '') => `https://images.unsplash.com/photo-${id}?q=85&w=1200&auto=format&fit=crop${extra}`;

const downloads = {
  // ---- oversize-linen-coat: both images = same beige/cream linen coat ----
  'oversize-linen-coat.jpg':   P_('1539533018447-63fcce2678e3'),
  'oversize-linen-coat-2.jpg': P_('1539533018447-63fcce2678e3', '&crop=entropy&flip=h'),
  // ---- crop-knit-cardigan: both images = same cream knit garment ----
  'crop-knit-cardigan.jpg':    P_('1434389677669-e08b4cac3105'),
  'crop-knit-cardigan-2.jpg':  P_('1434389677669-e08b4cac3105', '&crop=entropy&flip=h'),
  // ---- mega menu: kids, white & natural theme ----
  '../categories/mega-kids.jpg': P_('1519238263530-99bdd11df2ea'),
};

function downloadUrl(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadUrl(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) return reject(new Error(`Status ${res.statusCode} for ${url}`));
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    }).on('error', reject);
  });
}

async function run() {
  for (const [rel, url] of Object.entries(downloads)) {
    const dest = path.resolve(P, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    try {
      await downloadUrl(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`OK ${rel} (${(size / 1024).toFixed(0)} KB)`);
      if (size < 5000) console.log(`WARN: ${rel} suspiciously small`);
    } catch (e) {
      console.error(`FAIL ${rel}: ${e.message}`);
      process.exitCode = 1;
    }
  }
}
run();