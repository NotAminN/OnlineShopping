import fs from 'fs';
import path from 'path';
import https from 'https';

const testDir = path.resolve('public/images/test_flickr');
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error('Status ' + res.statusCode));
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => stream.close(resolve));
    }).on('error', reject);
  });
}

const list = [
  { name: 'cardholder-1.jpg', url: 'https://live.staticflickr.com/65535/55495075326_66c2b74a8d_b.jpg' },
  { name: 'cardholder-2.jpg', url: 'https://live.staticflickr.com/65535/55495468980_771e4f09c3_b.jpg' },
  { name: 'beach-hat-1.jpg', url: 'https://live.staticflickr.com/65535/48192942347_dd04cd4d10_b.jpg' },
  { name: 'beach-hat-2.jpg', url: 'https://live.staticflickr.com/65535/48192939752_2e2f6a201e_b.jpg' },
  { name: 'toddler-overalls.jpg', url: 'https://live.staticflickr.com/65535/54756593778_8316201df6_b.jpg' }
];

async function run() {
  for (const item of list) {
    const dest = path.join(testDir, item.name);
    await download(item.url, dest);
    console.log('Downloaded:', item.name, fs.statSync(dest).size, 'bytes');
  }
}

run().catch(console.error);
