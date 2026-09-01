import fs from 'fs';
import path from 'path';
import https from 'https';

const tempDir = path.resolve('public/images/temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

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

const list = [
  { id: 'scarf1', url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=85&w=1200&auto=format&fit=crop' },
  { id: 'skirt1', url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=85&w=1200&auto=format&fit=crop' },
  { id: 'kid_hat1', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=85&w=1200&auto=format&fit=crop' },
  { id: 'kid_hat2', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=85&w=1200&auto=format&fit=crop' }
];

async function run() {
  for (const item of list) {
    const dest = path.join(tempDir, `${item.id}.jpg`);
    try {
      await downloadUrl(item.url, dest);
      console.log(`✓ ${item.id} downloaded`);
    } catch (e) {
      console.error(`✗ ${item.id}:`, e.message);
    }
  }
}

run();
