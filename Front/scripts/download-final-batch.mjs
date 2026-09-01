import fs from 'fs';
import path from 'path';
import https from 'https';

const targetDir = path.resolve('public/images/products');

function downloadUrl(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadUrl(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

const items = {
  'oversize-denim-jacket-w.jpg': [
    'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=85&w=1200&auto=format&fit=crop'
  ],
  'oversize-denim-jacket-w-2.jpg': [
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544441893-675973e31985?q=85&w=1200&auto=format&fit=crop'
  ],
  'bomber-jacket.jpg': [
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=85&w=1200&auto=format&fit=crop'
  ],
  'cargo-pants-men.jpg': [
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584865288642-42078afe6942?q=85&w=1200&auto=format&fit=crop'
  ],
  'cargo-pants-men-2.jpg': [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=85&w=1200&auto=format&fit=crop'
  ],
  'quilted-vest-men.jpg': [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=85&w=1200&auto=format&fit=crop'
  ],
  'quilted-vest-men-2.jpg': [
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618354691438-25bc04584c23?q=85&w=1200&auto=format&fit=crop'
  ],
  'pique-polo-2.jpg': [
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=85&w=1200&auto=format&fit=crop'
  ],
  'minimal-white-sneakers.jpg': [
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=85&w=1200&auto=format&fit=crop'
  ],
  'minimal-white-sneakers-2.jpg': [
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=85&w=1200&auto=format&fit=crop'
  ],
  'slide-sandals.jpg': [
    'https://images.unsplash.com/photo-1603487742131-4160ec999306?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=85&w=1200&auto=format&fit=crop'
  ],
  'chunky-sole-sneakers-2.jpg': [
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=85&w=1200&auto=format&fit=crop'
  ],
  'office-laptop-bag.jpg': [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=85&w=1200&auto=format&fit=crop'
  ],
  'office-laptop-bag-2.jpg': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=85&w=1200&auto=format&fit=crop'
  ],
  'leather-wallet-unisex-2.jpg': [
    'https://images.unsplash.com/photo-1627123424574-724758594e93?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=85&w=1200&auto=format&fit=crop'
  ],
  'leather-card-holder.jpg': [
    'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?q=85&w=1200&auto=format&fit=crop'
  ],
  'aviator-sunglasses.jpg': [
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=85&w=1200&auto=format&fit=crop'
  ],
  'patterned-cotton-scarf.jpg': [
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=85&w=1200&auto=format&fit=crop'
  ],
  'satin-slip-skirt.jpg': [
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-striped-set.jpg': [
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-striped-set-2.jpg': [
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-sneakers.jpg': [
    'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-sneakers-2.jpg': [
    'https://images.unsplash.com/photo-1562183241-b937e95585b6?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-denim-overall.jpg': [
    'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-denim-overall-2.jpg': [
    'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-summer-hat.jpg': [
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-summer-hat-2.jpg': [
    'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-hoodie-set-2.jpg': [
    'https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?q=85&w=1200&auto=format&fit=crop'
  ]
};

async function run() {
  console.log(`Processing ${Object.keys(items).length} target images...`);
  let success = 0;
  let failed = 0;

  for (const [filename, urls] of Object.entries(items)) {
    const dest = path.join(targetDir, filename);
    let downloaded = false;
    for (const url of urls) {
      try {
        await downloadUrl(url, dest);
        const size = fs.statSync(dest).size;
        console.log(`✓ ${filename} (${(size / 1024).toFixed(1)} KB) from ${url}`);
        downloaded = true;
        success++;
        break;
      } catch (err) {
        // try next
      }
    }
    if (!downloaded) {
      console.error(`✗ ${filename}: all candidate URLs failed`);
      failed++;
    }
  }

  console.log(`\nFinished: ${success} succeeded, ${failed} failed.`);
}

run();
