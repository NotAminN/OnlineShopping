// Round 2: Commons/verified URLs for slots that failed round-1 audit
import fs from 'fs';
import path from 'path';

const mapPath = path.resolve('scripts/product-images.map.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const C = (p) => `https://upload.wikimedia.org/wikipedia/commons${p}`;
const U = (id) => `https://images.unsplash.com/${id}?q=85&w=1200&auto=format&fit=crop`;

const swaps = {
  'aviator-sunglasses': [C('/2/20/Aviator_sunglasses_2.jpg'), null],
  'cat-eye-sunglasses': [C('/2/27/Cat_eyes_2007-1.jpg'), C('/e/eb/Cat-eyes-titane2.jpg')],
  'chain-bracelet': [C('/d/df/Silver_bracelet_and_cherries_by_ASQ.jpg'), null],
  'chunky-sole-sneakers': [C('/2/25/High-Top_sneakers.jpg'), null],
  'classic-leather-belt': [C('/c/c1/Leather_belt.jpg'), null],
  'tote-bag-canvas': [C('/3/34/Bag%2C_shopping_%28AM_2015.37.2-6%29.jpg'), null],
  'wool-fedora-hat': [null, C('/9/93/A_fedora_hat%2C_made_by_Borsalino.jpg')],
  'running-sneakers': [C('/8/8b/Asics_Gel-Cumulus_22.jpg'), C('/e/e1/Brooks_Ghost_14_GTX.jpg')],
  'minimal-white-sneakers': [C('/1/17/White_sneakers.jpg'), C('/a/a6/Converse_Jack_Purcell_sneakers_on_white_canvas.jpg')],
  'bomber-jacket': [C('/2/2e/BHC-Fliegerjacke.jpg'), null],
  'cargo-pants-men': [C('/c/cd/Cargo_pants_001.jpg'), C('/3/3c/Cargo_pants_002.jpg')],
  'cotton-tee-men': [null, U('photo-1581655353564-df123a1eb8fa')],
  'knit-mock-neck-men': [C('/4/4d/Cable_knit_cricket_pullover_jersey_at_Epping_Foresters_Cricket_Club.jpg'), C('/5/53/Epping_Foresters_Cricket_Club_Jersey_cable_knit_cricket_pullover.jpg')],
};

for (const [slug, [p, s]] of Object.entries(swaps)) {
  if (!map[slug]) { console.error('MISSING SLUG:', slug); continue; }
  if (p) map[slug][0] = p;
  if (s) map[slug][1] = s;
}
fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n');
console.log('Map patched (round 2):', Object.keys(swaps).length, 'slugs');

const prodsDir = path.resolve('public/images/products');
const replaceFiles = [
  'aviator-sunglasses.jpg', 'cat-eye-sunglasses.jpg', 'cat-eye-sunglasses-2.jpg',
  'chain-bracelet.jpg', 'chunky-sole-sneakers.jpg', 'classic-leather-belt.jpg',
  'tote-bag-canvas.jpg', 'wool-fedora-hat-2.jpg', 'running-sneakers.jpg', 'running-sneakers-2.jpg',
  'minimal-white-sneakers.jpg', 'bomber-jacket.jpg', 'cargo-pants-men.jpg', 'cargo-pants-men-2.jpg',
  'cotton-tee-men-2.jpg', 'knit-mock-neck-men.jpg', 'knit-mock-neck-men-2.jpg',
];
let removed = 0;
for (const f of replaceFiles) {
  const p = path.join(prodsDir, f);
  if (fs.existsSync(p)) { fs.unlinkSync(p); removed++; }
}
console.log('Deleted:', removed, 'files — run download-all-images.mjs next');
