const fs = require('fs');
const f = 'scripts/product-images.map.json';
const m = JSON.parse(fs.readFileSync(f, 'utf8'));
const swap = {
  'pleated-midi-skirt-2': ['pleated-midi-skirt', 1, 'photo-1529139574466-a303027c1d8b'],
  'satin-slip-skirt': ['satin-slip-skirt', 0, 'photo-1509631179647-0177331693ae'],
  'warm-knit-coat': ['warm-knit-coat', 0, 'photo-1539533018447-63fcce2678e3'],
  'cotton-tee-men-2': ['cotton-tee-men', 1, 'photo-1503341504253-dff4815485f1'],
  'pique-polo-2': ['pique-polo', 1, 'photo-1521572163474-6864f9cf17ab'],
  'minimal-steel-watch-2': ['minimal-steel-watch', 1, 'photo-1547996160-81dfa63595aa'],
};
const U = (id) => `https://images.unsplash.com/${id}?q=80&w=1000&auto=format&fit=crop`;
let n = 0;
for (const [file, [slug, idx, id]] of Object.entries(swap)) {
  if (!m[slug]) { console.log('no slug', slug); continue; }
  m[slug][idx] = U(id);
  n++;
  fs.rmSync('public/images/products/' + file + '.jpg', { force: true });
}
fs.writeFileSync(f, JSON.stringify(m, null, 2));
console.log('swapped:', n);