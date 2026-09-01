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

async function run() {
  const poloUrls = [
    'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=85&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=85&w=1200&auto=format&fit=crop'
  ];

  for (const url of poloUrls) {
    try {
      const dest = path.join(targetDir, 'pique-polo.jpg');
      await downloadUrl(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`✓ pique-polo.jpg downloaded from ${url} (${(size / 1024).toFixed(1)} KB)`);
      break;
    } catch (e) {
      console.log(`Failed ${url}: ${e.message}`);
    }
  }
}

run();
