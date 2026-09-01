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

const list = {
  'patterned-cotton-scarf.jpg': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=85&w=1200&auto=format&fit=crop',
  'satin-slip-skirt-2.jpg': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=85&w=1200&auto=format&fit=crop',
  'kids-knit-jacket-2.jpg': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=85&w=1200&auto=format&fit=crop',
  'kids-comfort-shorts-2.jpg': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=85&w=1200&auto=format&fit=crop',
  'kids-hoodie-set.jpg': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=85&w=1200&auto=format&fit=crop',
  'kids-hoodie-set-2.jpg': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=85&w=1200&auto=format&fit=crop',
  'kids-sneakers.jpg': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=85&w=1200&auto=format&fit=crop',
  'kids-sneakers-2.jpg': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=85&w=1200&auto=format&fit=crop',
  'kids-summer-hat.jpg': 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?q=85&w=1200&auto=format&fit=crop',
  'kids-summer-hat-2.jpg': 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=85&w=1200&auto=format&fit=crop'
};

async function run() {
  for (const [name, url] of Object.entries(list)) {
    const dest = path.join(targetDir, name);
    try {
      await downloadUrl(url, dest);
      console.log(`✓ ${name} (${(fs.statSync(dest).size / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`✗ ${name}:`, e.message);
    }
  }
  console.log('Complete.');
}

run();
