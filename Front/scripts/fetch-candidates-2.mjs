import { ChromeController } from './cdp-client.mjs';
import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.resolve('public/images/review_candidates_2');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadUrl(res.headers.location, dest));
      }
      if (res.statusCode !== 200) return reject(new Error('Status ' + res.statusCode));
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => f.close(resolve));
    }).on('error', reject);
  });
}

const targets = [
  { slug: 'hoodie', url: 'https://unsplash.com/s/photos/kids-hoodie' },
  { slug: 'strawhat', url: 'https://unsplash.com/s/photos/straw-hat' },
  { slug: 'turtleneck', url: 'https://unsplash.com/s/photos/men-turtleneck' },
  { slug: 'cardholder', url: 'https://unsplash.com/s/photos/card-holder-wallet' }
];

async function run() {
  const c = new ChromeController();
  await c.connect();

  for (const t of targets) {
    console.log(`\nNavigating to ${t.url}...`);
    await c.navigate(t.url);
    await new Promise(r => setTimeout(r, 4000));
    await c.eval('window.scrollBy(0, 800)');
    await new Promise(r => setTimeout(r, 2000));

    const photos = await c.eval(`
      (() => {
        const list = [];
        const seen = new Set();
        for (const img of document.querySelectorAll('img')) {
          // Skip premium_photo
          if (img.src.includes('premium_photo')) continue;
          const m = img.src.match(/images\\.unsplash\\.com\\/photo-([0-9a-zA-Z_-]+)/);
          if (m && !seen.has(m[1]) && !img.src.includes('crop=faces') && !img.src.includes('w=32')) {
            seen.add(m[1]);
            list.push({ id: m[1], alt: img.alt || '' });
          }
        }
        return list;
      })()
    `);

    console.log(`Found ${photos.length} regular photos for ${t.slug}`);
    let downloaded = 0;
    for (const p of photos) {
      if (downloaded >= 4) break;
      const filename = `${t.slug}_${downloaded + 1}_${p.id}.jpg`;
      const dest = path.join(outDir, filename);
      const url = `https://images.unsplash.com/photo-${p.id}?q=85&w=1200&auto=format&fit=crop`;
      try {
        await downloadUrl(url, dest);
        console.log(` ✓ Downloaded ${filename} (${(fs.statSync(dest).size / 1024).toFixed(0)} KB): ${p.alt.slice(0, 50)}`);
        downloaded++;
      } catch (e) {
        // skip 404 or other errors
      }
    }
  }

  await c.close();
}

run().catch(console.error);
