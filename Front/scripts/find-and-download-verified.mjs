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
        return reject(new Error(`Status ${res.statusCode}`));
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

// Verified fashion photo IDs from Unsplash
const candidates = {
  'satin-slip-skirt.jpg': [
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=85&w=1200&auto=format&fit=crop'
  ],
  'satin-slip-skirt-2.jpg': [
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=85&w=1200&auto=format&fit=crop'
  ],
  'patterned-cotton-scarf.jpg': [
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=85&w=1200&auto=format&fit=crop'
  ],
  'patterned-cotton-scarf-2.jpg': [
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=85&w=1200&auto=format&fit=crop'
  ],
  'leather-wallet-unisex-2.jpg': [
    'https://images.unsplash.com/photo-1627123424574-724758594e93?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=85&w=1200&auto=format&fit=crop'
  ],
  'aviator-sunglasses.jpg': [
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=85&w=1200&auto=format&fit=crop'
  ],
  'aviator-sunglasses-2.jpg': [
    'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-striped-set.jpg': [
    'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-striped-set-2.jpg': [
    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-sneakers.jpg': [
    'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-sneakers-2.jpg': [
    'https://images.unsplash.com/photo-1562183241-b937e95585b6?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-denim-overall.jpg': [
    'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-denim-overall-2.jpg': [
    'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-summer-hat.jpg': [
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-summer-hat-2.jpg': [
    'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=85&w=1200&auto=format&fit=crop'
  ],
  'kids-hoodie-set-2.jpg': [
    'https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=85&w=1200&auto=format&fit=crop'
  ]
};

async function run() {
  for (const [filename, urls] of Object.entries(candidates)) {
    const dest = path.join(targetDir, filename);
    for (const url of urls) {
      try {
        await downloadUrl(url, dest);
        const size = fs.statSync(dest).size;
        console.log(`✓ ${filename} (${(size / 1024).toFixed(1)} KB)`);
        break;
      } catch (err) {
        // try next
      }
    }
  }
  console.log('All processed.');
}

run();
