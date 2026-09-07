import fs from 'fs';

const id = '1502086223501-7ea6ecd79368'; // kids-summer-hat tree
try {
  const res = await fetch(`https://unsplash.com/photos/${id}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  console.log('Status:', res.status);
  const html = await res.text();
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  console.log('Title:', titleMatch ? titleMatch[1] : 'none');
  const descMatch = html.match(/"description":"([^"]+)"/);
  console.log('Desc:', descMatch ? descMatch[1] : 'none');
  const altMatch = html.match(/"alt_description":"([^"]+)"/);
  console.log('Alt:', altMatch ? altMatch[1] : 'none');
} catch (e) {
  console.error(e);
}
