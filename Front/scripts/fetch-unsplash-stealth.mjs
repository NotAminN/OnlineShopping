import { ChromeController } from './cdp-client.mjs';
import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.resolve('public/images/unsplash_curated');
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
  { slug: 'kids-summer-hat', url: 'https://unsplash.com/s/photos/kids-sun-hat' },
  { slug: 'kids-denim-overall', url: 'https://unsplash.com/s/photos/toddler-overalls' },
  { slug: 'kids-hoodie-set', url: 'https://unsplash.com/s/photos/kids-sweatshirt' },
  { slug: 'leather-wallet-unisex', url: 'https://unsplash.com/s/photos/leather-bifold-wallet' },
  { slug: 'leather-card-holder', url: 'https://unsplash.com/s/photos/leather-card-holder' },
  { slug: 'knit-mock-neck-men', url: 'https://unsplash.com/s/photos/men-knit-sweater' }
];

async function run() {
  const c = new ChromeController();
  await c.connect();

  await c.send('Network.enable');
  await c.send('Network.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    acceptLanguage: 'en-US,en;q=0.9',
    platform: 'Win32'
  });

  await c.send('Page.enable');
  await c.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    `
  });

  const results = {};

  for (const t of targets) {
    console.log(`\nFetching Unsplash for [${t.slug}]: ${t.url}`);
    await c.navigate(t.url);
    await new Promise(r => setTimeout(r, 4000));

    // Scroll slightly to trigger image loading
    await c.eval('window.scrollBy(0, 600)');
    await new Promise(r => setTimeout(r, 2000));

    const photos = await c.eval(`
      (() => {
        const list = [];
        const seen = new Set();
        for (const img of document.querySelectorAll('img')) {
          const m = img.src.match(/photo-([0-9a-zA-Z_-]+)/);
          if (m && !seen.has(m[1]) && !img.src.includes('crop=faces') && !img.src.includes('w=32')) {
            seen.add(m[1]);
            list.push({
              id: m[1],
              alt: img.alt || '',
              url: 'https://images.unsplash.com/photo-' + m[1] + '?q=85&w=1200&auto=format&fit=crop'
            });
          }
        }
        return list;
      })()
    `);

    console.log(`Found ${photos.length} photos for ${t.slug}`);
    results[t.slug] = photos;

    // Download top 3 for review
    for (let i = 0; i < Math.min(3, photos.length); i++) {
      const p = photos[i];
      const filename = `${t.slug}-opt${i + 1}-${p.id}.jpg`;
      const dest = path.join(outDir, filename);
      try {
        await downloadUrl(p.url, dest);
        console.log(` ✓ Downloaded ${filename} (${(fs.statSync(dest).size / 1024).toFixed(0)} KB): ${p.alt.slice(0, 50)}`);
      } catch (e) {
        console.log(` ✗ Failed ${filename}: ${e.message}`);
      }
    }
  }

  await c.close();
  fs.writeFileSync('public/images/unsplash_curated/candidates.json', JSON.stringify(results, null, 2));
  console.log('\nAll done! Saved metadata to candidates.json');
}

run().catch(console.error);
