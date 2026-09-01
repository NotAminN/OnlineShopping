import fs from 'fs';
import path from 'path';
import https from 'https';

const U = (id, w = 1200) => `https://images.unsplash.com/${id}?q=85&w=${w}&auto=format&fit=crop`;

const baseDir = path.resolve('public/images');
const dirs = ['hero', 'categories', 'collections', 'editorial', 'products'];
for (const d of dirs) {
  fs.mkdirSync(path.join(baseDir, d), { recursive: true });
}

// 1. Hero, Categories, Collections, Editorial
const staticImages = {
  // Hero (5 slides)
  'hero/hero-1.jpg': U('photo-1490481651871-ab68de25d43d', 2000),
  'hero/hero-2.jpg': U('photo-1445205170230-053b83016050', 2000),
  'hero/hero-3.jpg': U('photo-1469334031218-e382a71b716b', 2000),
  'hero/hero-4.jpg': U('photo-1483985988355-763728e1935b', 2000),
  'hero/hero-5.jpg': U('photo-1485968579580-b6d095142e6e', 2000),

  // Categories (6)
  'categories/cat-women.jpg': U('photo-1509631179647-0177331693ae', 1100),
  'categories/cat-men.jpg': U('photo-1520975954732-35dd22299614', 1100),
  'categories/cat-kids.jpg': U('photo-1503919545889-aef636e10ad4', 1100),
  'categories/cat-shoes.jpg': U('photo-1543163521-1bf539c55dd2', 1100),
  'categories/cat-bags.jpg': U('photo-1548036328-c9fa89d128fa', 1100),
  'categories/cat-accessories.jpg': U('photo-1511499767150-a48a237f0083', 1100),

  // Collections (5)
  'collections/col-minimal.jpg': U('photo-1490481651871-ab68de25d43d', 1300),
  'collections/col-urban.jpg': U('photo-1551028719-00167b16eac5', 1300),
  'collections/col-classic.jpg': U('photo-1594938298603-c8148c4dae35', 1300),
  'collections/col-weekend.jpg': U('photo-1469334031218-e382a71b716b', 1300),
  'collections/col-season.jpg': U('photo-1539533018447-63fcce2678e3', 1300),

  // Editorial (4)
  'editorial/ed-1.jpg': U('photo-1558769132-cb1aea458c5e', 1400),
  'editorial/ed-2.jpg': U('photo-1551232864-3f0890e580d9', 1400),
  'editorial/ed-3.jpg': U('photo-1517841905240-472988babdf9', 1400),
  'editorial/ed-4.jpg': U('photo-1528459801416-a9e53bbf4e17', 1400),
};

// 2. Product images from map
const mapPath = path.resolve('scripts/product-images.map.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const allDownloads = { ...staticImages };
for (const [slug, urls] of Object.entries(map)) {
  allDownloads[`products/${slug}.jpg`] = urls[0];
  allDownloads[`products/${slug}-2.jpg`] = urls[1];
}

console.log(`Total images to download/verify: ${Object.keys(allDownloads).length}`);

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const sz = fs.statSync(dest).size;
          if (sz < 5000) {
            reject(new Error(`File too small: ${sz} bytes`));
          } else {
            resolve(sz);
          }
        });
      });
    }).on('error', reject);
  });
}

const entries = Object.entries(allDownloads);
let done = 0;
let failed = [];

async function processQueue() {
  const concurrency = 6;
  let idx = 0;

  async function worker() {
    while (idx < entries.length) {
      const [relPath, url] = entries[idx++];
      const dest = path.join(baseDir, relPath);

      // Check if file already exists with good size (>= 20KB)
      if (fs.existsSync(dest) && fs.statSync(dest).size > 20000 && !process.argv.includes('--force')) {
        done++;
        continue;
      }

      let success = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await downloadImage(url, dest);
          done++;
          success = true;
          break;
        } catch (e) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
      if (!success) {
        failed.push({ relPath, url });
        console.error(`Failed to download ${relPath}`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  console.log(`\nCOMPLETED: ${done}/${entries.length} images.`);
  if (failed.length > 0) {
    console.log(`FAILED (${failed.length}):`, failed);
  } else {
    console.log('ALL IMAGES OK!');
  }
}

processQueue();
