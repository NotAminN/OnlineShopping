import { ChromeController } from './cdp-client.mjs';
import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.resolve('public/images/review_candidates');

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

async function run() {
  const c = new ChromeController();
  await c.connect();

  const url = 'https://unsplash.com/s/photos/child-hoodie';
  console.log('Navigating to', url);
  await c.navigate(url);
  await new Promise(r => setTimeout(r, 4000));
  await c.eval('window.scrollBy(0, 1000)');
  await new Promise(r => setTimeout(r, 2000));

  const photos = await c.eval(`
    (() => {
      const list = [];
      const seen = new Set();
      for (const img of document.querySelectorAll('img')) {
        if (img.src.includes('premium_photo')) continue;
        const m = img.src.match(/\\/photo-([0-9a-zA-Z_-]+)/);
        if (m && !seen.has(m[1]) && !img.src.includes('crop=faces') && !img.src.includes('w=32')) {
          seen.add(m[1]);
          list.push({ id: m[1], alt: img.alt || '' });
        }
      }
      return list;
    })()
  `);

  console.log('Found', photos.length, 'photos for child-hoodie');
  let count = 0;
  for (const p of photos) {
    if (count >= 5) break;
    const dest = path.join(outDir, `child_hoodie_${count + 1}_${p.id}.jpg`);
    const imgUrl = `https://images.unsplash.com/photo-${p.id}?q=85&w=1200&auto=format&fit=crop`;
    try {
      await downloadUrl(imgUrl, dest);
      console.log(`Saved child_hoodie_${count + 1}: ${p.alt}`);
      count++;
    } catch (e) {}
  }

  await c.close();
}

run().catch(console.error);
