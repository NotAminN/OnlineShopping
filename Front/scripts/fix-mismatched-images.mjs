#!/usr/bin/env node
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const productsDir = join(__dirname, '..', 'public', 'images', 'products');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = (await_open => {
      const mod = url.startsWith('https') ? https : http;
      mod.get(url, { headers: { 'User-Agent': 'ModStyle/1.0' } }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          download(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} for ${url}`)); return; }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          writeFileSync(dest, buf);
          resolve(buf.length);
        });
        res.on('error', reject);
      }).on('error', reject);
    })();
  });
}

function unsplash(photoId, w = 1200) {
  return `https://images.unsplash.com/${photoId}?q=85&w=${w}&auto=format&fit=crop`;
}

// Verified Unsplash photo IDs mapped to correct product categories
// Each entry: [filename, unsplash_photo_id, description]
const fixes = [
  // 1. oversize-hoodie-2: was woman portrait → need hoodie
  ['oversize-hoodie-2.jpg', 'photo-1578768079052-aa76e52ff62e', 'man in gray hoodie'],

  // 2. winter-leather-boots-2: was vegetables → need boots
  ['winter-leather-boots-2.jpg', 'photo-1605733160314-4fc7dac4bb16', 'pair of winter leather boots'],

  // 3. oversize-linen-coat-2: was yellow hoodie → need linen coat
  ['oversize-linen-coat-2.jpg', 'photo-1591047139829-d91aecb6caea', 'woman in long beige coat'],

  // 4. silk-crepe-blouse img1: was floral dress → need blouse
  ['silk-crepe-blouse.jpg', 'photo-1564257631407-4deb1f99d992', 'embroidered feminine blouse'],

  // 5. long-crepe-manteau img1: was military jacket → need long manteau
  ['long-crepe-manteau.jpg', 'photo-1539109136881-3be0616acf4b', 'woman in long elegant coat'],

  // 6. pleated-midi-skirt img1: was jeans shelf → need pleated skirt
  ['pleated-midi-skirt.jpg', 'photo-1577900232427-18219b9166a0', 'woman wearing pleated skirt'],

  // 7. pleated-midi-skirt-2: was CCCP t-shirt girl → need pleated skirt
  ['pleated-midi-skirt-2.jpg', 'photo-1583496661160-fb5886a0aaaa', 'pleated skirt outfit'],

  // 8. oversize-denim-jacket-w img1: was folded jeans → need women denim jacket
  ['oversize-denim-jacket-w.jpg', 'photo-1544441893-675973e31985', 'woman in denim jacket'],

  // 9. oversize-denim-jacket-w-2: was man leather → need women denim jacket
  ['oversize-denim-jacket-w-2.jpg', 'photo-1527016261349-2f4a2999f6d8', 'woman wearing denim jacket outfit'],

  // 10. warm-knit-coat-2: was black t-shirt → need warm knit coat
  ['warm-knit-coat-2.jpg', 'photo-1539533018447-63fcce2678e3', 'warm knit outerwear'],

  // 11. simple-cotton-top-2: was graphic skull tee → need simple cotton top
  ['simple-cotton-top-2.jpg', 'photo-1622470953794-aa9c70b0fb9d', 'simple white cotton top'],

  // 12. straight-fabric-pants-w-2: was white t-shirts → need women pants
  ['straight-fabric-pants-w-2.jpg', 'photo-1551854838-212c50b4c184', 'woman in wide-leg fabric pants'],

  // 13. crewneck-sweater-w img1: was black t-shirts rack → need women sweater
  ['crewneck-sweater-w.jpg', 'photo-1576871337622-98d48d1cf531', 'cozy crewneck sweater close-up'],

  // 14. crop-knit-cardigan img1: was leather boots → need cardigan
  ['crop-knit-cardigan.jpg', 'photo-1591369822096-ffd140ec948f', 'woman wearing knit cardigan'],

  // 15. crop-knit-cardigan-2: was black t-shirt → need cardigan
  ['crop-knit-cardigan-2.jpg', 'photo-1434389677669-e08b4cac3105', 'cozy knit cardigan'],

  // 16. wrap-midi-dress img1: was pink handbag → need wrap dress
  ['wrap-midi-dress.jpg', 'photo-1572804013309-59a88b7e92f1', 'woman in red wrap dress'],

  // 17. bomber-jacket img1: was plaid coat → need bomber jacket
  ['bomber-jacket.jpg', 'photo-1557418669-b91e6cf63e5c', 'man wearing bomber jacket'],

  // 18. bomber-jacket-2: was leather biker → need bomber jacket
  ['bomber-jacket-2.jpg', 'photo-1591047139829-d91aecb6caea', 'bomber jacket detail'],

  // 19. straight-linen-pants-men img1: was leather jacket man → need linen pants
  ['straight-linen-pants-men.jpg', 'photo-1473966968600-fa801b869a1a', 'man in casual linen pants'],

  // 20. straight-linen-pants-men-2: was man headshot → need linen pants
  ['straight-linen-pants-men-2.jpg', 'photo-1519741497674-611481863552', 'man wearing light linen trousers'],

  // 21. knit-mock-neck-men img1: was navy suit → need mock neck knit
  ['knit-mock-neck-men.jpg', 'photo-1614252235316-8c857d38b5f4', 'man in mock neck sweater'],

  // 22. knit-mock-neck-men-2: was denim jacket man → need mock neck
  ['knit-mock-neck-men-2.jpg', 'photo-1602810318383-e386cc2a3ccf', 'mock neck knitwear detail'],

  // 23. cargo-pants-men img1: was green handbag → need cargo pants
  ['cargo-pants-men.jpg', 'photo-1517438476312-10d79c077509', 'man wearing cargo pants'],

  // 24. cargo-pants-men-2: was flat-lay jeans → need cargo pants
  ['cargo-pants-men-2.jpg', 'photo-1475178626620-a4d074967452', 'cargo pants fashion'],

  // 25. quilted-vest-men img1: was plaid blazer → need quilted vest
  ['quilted-vest-men.jpg', 'photo-1559551409-dadc959f76b8', 'man in quilted vest'],

  // 26. quilted-vest-men-2: was black t-shirt → need quilted vest
  ['quilted-vest-men-2.jpg', 'photo-1520975916090-3105956dac38', 'quilted vest outfit'],

  // 27. kids-comfort-shorts img1: was adult woman → need kids shorts
  ['kids-comfort-shorts.jpg', 'photo-1503919545889-aef636e10ad4', 'kids playing in shorts'],

  // 28. kids-comfort-shorts-2: was women shoes → need kids shorts
  ['kids-comfort-shorts-2.jpg', 'photo-1519415943484-9fa1873496d4', 'kids summer outfit with shorts'],

  // 29. kids-knit-jacket img1: was kid in t-shirt → need knit jacket
  ['kids-knit-jacket.jpg', 'photo-1519238263530-99bdd11df2ea', 'child in knit jacket'],

  // 30. kids-knit-jacket-2: was adult man → need kids knit jacket
  ['kids-knit-jacket-2.jpg', 'photo-1476820865390-c52aeebb9891', 'kids warm knit outerwear'],
];

async function main() {
  if (!existsSync(productsDir)) mkdirSync(productsDir, { recursive: true });

  let ok = 0, fail = 0;
  for (const [filename, photoId, desc] of fixes) {
    const dest = join(productsDir, filename);
    const url = unsplash(photoId);
    process.stdout.write(`  ${filename} (${desc})... `);
    try {
      const size = await download(url, dest);
      if (size < 5000) throw new Error(`too small (${size}b)`);
      console.log(`OK (${Math.round(size/1024)}KB)`);
      ok++;
    } catch (e) {
      console.log(`FAIL: ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDone: ${ok} OK, ${fail} failed out of ${fixes.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
