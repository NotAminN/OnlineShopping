// Slow sequential downloader for rate-limited Wikimedia Commons URLs
import fs from 'fs';
import path from 'path';
import https from 'https';

const files = {
  'aviator-sunglasses.jpg': '/2/20/Aviator_sunglasses_2.jpg',
  'cat-eye-sunglasses.jpg': '/2/27/Cat_eyes_2007-1.jpg',
  'cat-eye-sunglasses-2.jpg': '/e/eb/Cat-eyes-titane2.jpg',
  'chain-bracelet.jpg': '/d/df/Silver_bracelet_and_cherries_by_ASQ.jpg',
  'chunky-sole-sneakers.jpg': '/2/25/High-Top_sneakers.jpg',
  'classic-leather-belt.jpg': '/c/c1/Leather_belt.jpg',
  'tote-bag-canvas.jpg': '/3/34/Bag%2C_shopping_%28AM_2015.37.2-6%29.jpg',
  'wool-fedora-hat-2.jpg': '/9/93/A_fedora_hat%2C_made_by_Borsalino.jpg',
  'running-sneakers.jpg': '/8/8b/Asics_Gel-Cumulus_22.jpg',
  'running-sneakers-2.jpg': '/e/e1/Brooks_Ghost_14_GTX.jpg',
  'minimal-white-sneakers.jpg': '/1/17/White_sneakers.jpg',
  'bomber-jacket.jpg': '/2/2e/BHC-Fliegerjacke.jpg',
  'cargo-pants-men.jpg': '/c/cd/Cargo_pants_001.jpg',
  'cargo-pants-men-2.jpg': '/3/3c/Cargo_pants_002.jpg',
  'knit-mock-neck-men.jpg': '/4/4d/Cable_knit_cricket_pullover_jersey_at_Epping_Foresters_Cricket_Club.jpg',
  'knit-mock-neck-men-2.jpg': '/5/53/Epping_Foresters_Cricket_Club_Jersey_cable_knit_cricket_pullover.jpg',
};
const baseDir = path.resolve('public/images/products');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function get(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    opts.headers = { 'User-Agent': 'alpha-shop-asset-pipeline/1.0 (asset sync; contact: dev@example.com)' };
    https.get(opts, (res) => {
      if (res.statusCode !== 200) return reject(new Error('Status ' + res.statusCode));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

console.log('cooldown 60s for rate limit...');
await sleep(60000);
for (const [name, p] of Object.entries(files)) {
  const url = `https://upload.wikimedia.org/wikipedia/commons${p}`;
  let ok = false;
  for (let a = 1; a <= 4 && !ok; a++) {
    try {
      const buf = await get(url);
      if (buf.length < 8000) throw new Error('too small: ' + buf.length);
      fs.writeFileSync(path.join(baseDir, name), buf);
      console.log(`OK ${name} (${(buf.length / 1024).toFixed(0)} KB)`);
      ok = true;
    } catch (e) {
      console.log(`attempt ${a} ${name}: ${e.message}`);
      await sleep(20000 * a);
    }
  }
  await sleep(5000);
}
console.log('done');
