import fs from 'fs';
import path from 'path';

const artifactsDir = 'C:\\Users\\Office\\.gemini\\antigravity-ide\\brain\\783d0396-3dae-490a-b407-4f43ffa17457';
const productsDir = path.resolve('public/images/products');

const mapping = {
  'oversize-denim-jacket-w.jpg': 'oversize_denim_jacket_1_1788060435978.jpg',
  'oversize-denim-jacket-w-2.jpg': 'oversize_denim_jacket_2_1788060465778.jpg',
  'bomber-jacket.jpg': 'bomber_jacket_1_1788060498172.jpg',
  'bomber-jacket-2.jpg': 'bomber_jacket_2_1788060529222.jpg',
  'cargo-pants-men.jpg': 'cargo_pants_men_1_1788060562602.jpg',
  'cargo-pants-men-2.jpg': 'cargo_pants_men_2_1788060597747.jpg',
  'quilted-vest-men.jpg': 'quilted_vest_men_1_1788060626718.jpg',
  'quilted-vest-men-2.jpg': 'quilted_vest_men_2_1788060662091.jpg',
  'pique-polo-2.jpg': 'pique_polo_2_1788060729080.jpg',
  'minimal-white-sneakers.jpg': 'minimal_white_sneakers_1_1788060809547.jpg',
  'minimal-white-sneakers-2.jpg': 'minimal_white_sneakers_2_1788060870226.jpg',
  'slide-sandals.jpg': 'slide_sandals_1_1788060948436.jpg',
  'office-laptop-bag.jpg': 'office_laptop_bag_1_1788061037154.jpg',
  'office-laptop-bag-2.jpg': 'office_laptop_bag_2_1788061099530.jpg'
};

for (const [targetName, sourceFile] of Object.entries(mapping)) {
  const src = path.join(artifactsDir, sourceFile);
  const dest = path.join(productsDir, targetName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${sourceFile} -> ${targetName}`);
  } else {
    console.warn(`File not found: ${src}`);
  }
}
