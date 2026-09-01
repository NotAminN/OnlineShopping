import fs from 'fs';
import path from 'path';
import https from 'https';

const targetDir = path.resolve('public/images/products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Map of replacement images to download
const downloads = {
  'oversize-denim-jacket-w.jpg': 'https://images.unsplash.com/photo-1544441893-675973e31985?q=85&w=1200&auto=format&fit=crop',
  'oversize-denim-jacket-w-2.jpg': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=85&w=1200&auto=format&fit=crop',
  'bomber-jacket.jpg': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=85&w=1200&auto=format&fit=crop',
  'cargo-pants-men.jpg': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=85&w=1200&auto=format&fit=crop',
  'cargo-pants-men-2.jpg': 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=85&w=1200&auto=format&fit=crop',
  'quilted-vest-men.jpg': 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=85&w=1200&auto=format&fit=crop',
  'quilted-vest-men-2.jpg': 'https://images.unsplash.com/photo-1618354691438-25bc04584c23?q=85&w=1200&auto=format&fit=crop',
  'straight-jeans-men.jpg': 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=85&w=1200&auto=format&fit=crop',
  'straight-jeans-men-2.jpg': 'https://images.unsplash.com/photo-1604176354204-9268737828e4?q=85&w=1200&auto=format&fit=crop',
  'pique-polo.jpg': 'https://images.unsplash.com/photo-1625910513413-5b8782bb0ee8?q=85&w=1200&auto=format&fit=crop',
  'pique-polo-2.jpg': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=85&w=1200&auto=format&fit=crop',
  'oxford-shirt-men.jpg': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=85&w=1200&auto=format&fit=crop',
  'satin-slip-skirt.jpg': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=85&w=1200&auto=format&fit=crop',
  'satin-slip-skirt-2.jpg': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=85&w=1200&auto=format&fit=crop',
  'minimal-white-sneakers.jpg': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=85&w=1200&auto=format&fit=crop',
  'minimal-white-sneakers-2.jpg': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=85&w=1200&auto=format&fit=crop',
  'leather-summer-sandals-2.jpg': 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?q=85&w=1200&auto=format&fit=crop',
  'leather-college-shoes.jpg': 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=85&w=1200&auto=format&fit=crop',
  'leather-college-shoes-2.jpg': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=85&w=1200&auto=format&fit=crop',
  'slide-sandals.jpg': 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=85&w=1200&auto=format&fit=crop',
  'slide-sandals-2.jpg': 'https://images.unsplash.com/photo-1603487742131-4160ec999306?q=85&w=1200&auto=format&fit=crop',
  'chunky-sole-sneakers-2.jpg': 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=85&w=1200&auto=format&fit=crop',
  'suede-derby-shoes-2.jpg': 'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=85&w=1200&auto=format&fit=crop',
  'office-laptop-bag.jpg': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=85&w=1200&auto=format&fit=crop',
  'office-laptop-bag-2.jpg': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=85&w=1200&auto=format&fit=crop',
  'party-clutch.jpg': 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=85&w=1200&auto=format&fit=crop',
  'party-clutch-2.jpg': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=85&w=1200&auto=format&fit=crop',
  'tote-bag-canvas.jpg': 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=85&w=1200&auto=format&fit=crop',
  'leather-wallet-unisex-2.jpg': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=85&w=1200&auto=format&fit=crop',
  'leather-card-holder-2.jpg': 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=85&w=1200&auto=format&fit=crop',
  'aviator-sunglasses.jpg': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=85&w=1200&auto=format&fit=crop',
  'aviator-sunglasses-2.jpg': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=85&w=1200&auto=format&fit=crop',
  'cat-eye-sunglasses-2.jpg': 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=85&w=1200&auto=format&fit=crop',
  'classic-leather-belt-2.jpg': 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=85&w=1200&auto=format&fit=crop',
  'patterned-cotton-scarf.jpg': 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=85&w=1200&auto=format&fit=crop',
  'patterned-cotton-scarf-2.jpg': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=85&w=1200&auto=format&fit=crop',
  'minimal-steel-necklace-2.jpg': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=85&w=1200&auto=format&fit=crop',
  'kids-striped-set.jpg': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=85&w=1200&auto=format&fit=crop',
  'kids-striped-set-2.jpg': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=85&w=1200&auto=format&fit=crop',
  'kids-sneakers.jpg': 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=85&w=1200&auto=format&fit=crop',
  'kids-sneakers-2.jpg': 'https://images.unsplash.com/photo-1562183241-b937e95585b6?q=85&w=1200&auto=format&fit=crop',
  'kids-hoodie-set-2.jpg': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=85&w=1200&auto=format&fit=crop',
  'kids-denim-overall.jpg': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=85&w=1200&auto=format&fit=crop',
  'kids-denim-overall-2.jpg': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=85&w=1200&auto=format&fit=crop',
  'kids-summer-hat.jpg': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=85&w=1200&auto=format&fit=crop',
  'kids-summer-hat-2.jpg': 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?q=85&w=1200&auto=format&fit=crop'
};

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

async function run() {
  console.log(`Starting download of ${Object.keys(downloads).length} images...`);
  let success = 0;
  let failed = 0;

  for (const [filename, url] of Object.entries(downloads)) {
    const dest = path.join(targetDir, filename);
    try {
      await downloadUrl(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`✓ ${filename} (${(size / 1024).toFixed(1)} KB)`);
      success++;
    } catch (err) {
      console.error(`✗ ${filename}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nFinished: ${success} succeeded, ${failed} failed.`);
}

run();
