import https from 'https';
import http from 'http';
import { URL } from 'url';

function fetchPage(urlStr) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const client = parsed.protocol === 'https:' ? https : http;
    client.get(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, urlStr).toString();
        return resolve(fetchPage(nextUrl));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function getPhotosForQuery(slug) {
  const url = `https://unsplash.com/s/photos/${slug}`;
  const html = await fetchPage(url);
  const regex = /https:\/\/images\.unsplash\.com\/(photo-[a-zA-Z0-9-]+)\?/g;
  const matches = new Set();
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.add(match[1]);
  }
  return Array.from(matches);
}

async function test() {
  const queries = [
    'womens-oversized-denim-jacket',
    'mens-bomber-jacket',
    'mens-cargo-pants',
    'mens-puffer-vest',
    'white-sneakers-shoes',
    'leather-laptop-bag-briefcase',
    'leather-wallet',
    'kids-clothing-set',
    'toddler-sneakers',
    'kids-summer-straw-hat'
  ];

  for (const q of queries) {
    try {
      const photos = await getPhotosForQuery(q);
      console.log(`\nQuery: ${q} (${photos.length} found):`);
      console.log(photos.slice(0, 5).map(id => `  https://images.unsplash.com/${id}?q=85&w=1200&auto=format&fit=crop`).join('\n'));
    } catch (e) {
      console.error(`Error on ${q}:`, e.message);
    }
  }
}

test();
