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

const fixes = {
  'satin-slip-skirt-2.jpg': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=85&w=1200&auto=format&fit=crop',
  'patterned-cotton-scarf.jpg': 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=85&w=1200&auto=format&fit=crop',
  'patterned-cotton-scarf-2.jpg': 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=85&w=1200&auto=format&fit=crop',
  'kids-striped-set.jpg': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=85&w=1200&auto=format&fit=crop',
  'kids-striped-set-2.jpg': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=85&w=1200&auto=format&fit=crop',
  'kids-denim-overall-2.jpg': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=85&w=1200&auto=format&fit=crop',
  'kids-hoodie-set-2.jpg': 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=85&w=1200&auto=format&fit=crop',
  'kids-summer-hat.jpg': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=85&w=1200&auto=format&fit=crop',
  'kids-summer-hat-2.jpg': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=85&w=1200&auto=format&fit=crop'
};

async function run() {
  for (const [filename, url] of Object.entries(fixes)) {
    const dest = path.join(targetDir, filename);
    try {
      await downloadUrl(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`✓ ${filename} (${(size / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`✗ ${filename}:`, e.message);
    }
  }
  console.log('All outlier fixes finished.');
}

run();
