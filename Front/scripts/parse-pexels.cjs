const fs = require('fs');
const html = fs.readFileSync('Front/scripts/pexels-test.html', 'utf-8');
console.log('HTML length:', html.length);
const photos = [];
const regex = /https:\/\/images\.pexels\.com\/photos\/([0-9]+)\/[^"'\s?]+/g;
let m;
while ((m = regex.exec(html)) !== null) {
  photos.push(m[0]);
}
console.log('Found Pexels photos count:', photos.length);
const unique = Array.from(new Set(photos));
console.log('Unique photos count:', unique.length);
unique.slice(0, 10).forEach(u => console.log(' -', u));
