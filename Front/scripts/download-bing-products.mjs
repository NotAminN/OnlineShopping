import { ChromeController } from './cdp-client.mjs';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const reviewDir = path.resolve('public/images/review');
if (!fs.existsSync(reviewDir)) fs.mkdirSync(reviewDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(download(res.headers.location, dest));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => stream.close(() => resolve()));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function searchAndDownload(c, key, query) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qft=+filterui:imagesize-large`;
  console.log(`\nSearching for [${key}]: ${query}`);
  await c.navigate(url);
  await new Promise(r => setTimeout(r, 3000));

  const items = await c.eval(`
    (() => {
      const results = [];
      const links = document.querySelectorAll('a.iusc');
      for (const a of links) {
        try {
          const m = JSON.parse(a.getAttribute('m'));
          if (m && m.murl && !m.murl.includes('freepik') && !m.murl.includes('vectorstock')) {
            results.push({
              title: m.t || '',
              murl: m.murl,
              cdnurl: m.cdnurl
            });
          }
        } catch (e) {}
      }
      return results;
    })()
  `);

  console.log(`Found ${items.length} candidates for ${key}`);
  let downloaded = 0;
  for (let i = 0; i < items.length && downloaded < 3; i++) {
    const item = items[i];
    const filename = `${key}-candidate-${downloaded + 1}.jpg`;
    const dest = path.join(reviewDir, filename);
    try {
      // Try murl first, then fallback to cdnurl
      try {
        await download(item.murl, dest);
      } catch (e) {
        if (item.cdnurl) await download(item.cdnurl, dest);
        else throw e;
      }
      const size = fs.statSync(dest).size;
      if (size > 10000) {
        console.log(` ✓ Downloaded ${filename} (${(size / 1024).toFixed(0)} KB): ${item.title.slice(0, 50)}`);
        downloaded++;
      } else {
        fs.unlinkSync(dest);
      }
    } catch (e) {
      // skip
    }
  }
}

async function run() {
  const c = new ChromeController();
  await c.connect();

  const targets = [
    {
      key: 'kids-summer-hat',
      query: 'toddler kids straw sun hat summer wide brim product photography'
    },
    {
      key: 'kids-denim-overall',
      query: 'kids denim bib overalls dungarees toddler clothing product photography'
    },
    {
      key: 'kids-hoodie-set',
      query: 'toddler kids hoodie sweatpants 2 piece set tracksuit product photography'
    },
    {
      key: 'leather-wallet-unisex',
      query: 'genuine brown leather bifold wallet open money slots product photography'
    },
    {
      key: 'leather-card-holder',
      query: 'minimalist slim leather card holder wallet sleeve product photography'
    },
    {
      key: 'knit-mock-neck-men',
      query: 'men ribbed knit mock neck turtleneck sweater fashion product photography'
    }
  ];

  for (const t of targets) {
    await searchAndDownload(c, t.key, t.query);
  }

  await c.close();
  console.log('\nAll candidate downloads finished!');
}

run().catch(console.error);
