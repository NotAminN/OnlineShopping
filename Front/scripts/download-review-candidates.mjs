import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.resolve('public/images/review_candidates');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadUrl(res.headers.location, dest));
      }
      if (res.statusCode !== 200) return reject(new Error('Status ' + res.statusCode));
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => f.close(resolve));
    }).on('error', reject);
  });
}

const list = [
  // Kids summer hat
  { name: 'hat_girl_sunhat.jpg', id: 'photo-1590480598135-3be152c87913' },
  { name: 'hat_child_strawhat.jpg', id: 'photo-1661611352571-f3067030dc00' },
  { name: 'hat_toddler_beach.jpg', id: 'photo-1663076114560-3a8b98c43322' },

  // Kids denim overall
  { name: 'overall_girl_yellow.jpg', id: 'photo-1611890293555-2cb0075ecd3e' },
  { name: 'overall_boy_rock.jpg', id: 'photo-1541015492536-31d513c59861' },
  { name: 'overall_toddler_fence.jpg', id: 'photo-1698939096910-5b9a8fec3425' },
  { name: 'overall_dark_denim.jpg', id: 'photo-1755534537628-537671d3edb5' },

  // Kids hoodie
  { name: 'hoodie_playground.jpg', id: 'photo-1786920631011-8ca8217fd0f3' },
  { name: 'hoodie_red_boy.jpg', id: 'photo-1615863712239-becde744591a' },

  // Leather wallet
  { name: 'wallet_brown_table.jpg', id: 'photo-1624538000860-24716b9050f2' },
  { name: 'wallet_brown_blacktextile.jpg', id: 'photo-1620109176813-e91290f6c795' },
  { name: 'wallet_hand_holding.jpg', id: 'photo-1606503825008-909a67e63c3d' },

  // Leather card holder
  { name: 'card_hand_creditcard.jpg', id: 'photo-1678554832890-2ea5d37278af' },
  { name: 'card_person_creditcard.jpg', id: 'photo-1623295291838-5c8fb02c1b2b' },
  { name: 'card_keys_creditcard.jpg', id: 'photo-1689844833510-10939e60e8dc' },

  // Knit mock neck men
  { name: 'knit_man_beard.jpg', id: 'photo-1671135590215-ded219822a44' },
  { name: 'knit_man_standing.jpg', id: 'photo-1506634572416-48cdfe530110' },
  { name: 'knit_hanger.jpg', id: 'photo-1611312449297-a69dc9c3987b' }
];

async function main() {
  for (const item of list) {
    const url = `https://images.unsplash.com/${item.id}?q=85&w=1200&auto=format&fit=crop`;
    const dest = path.join(outDir, item.name);
    try {
      await downloadUrl(url, dest);
      console.log(`Saved ${item.name} (${(fs.statSync(dest).size / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.log(`Failed ${item.name}: ${e.message}`);
    }
  }
}

main();
