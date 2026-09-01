import https from 'https';

function ddgSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:unsplash.com/photos/ ' + query)}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const regex = /unsplash\.com\/photos\/([a-zA-Z0-9_-]+)/g;
        const matches = new Set();
        let match;
        while ((match = regex.exec(data)) !== null) {
          matches.add(match[1]);
        }
        resolve(Array.from(matches));
      });
    }).on('error', reject);
  });
}

async function test() {
  const queries = [
    'woman oversized denim jacket',
    'man wearing bomber jacket street fashion',
    'man wearing cargo pants street fashion',
    'men quilted puffer vest',
    'white leather sneakers aesthetic',
    'mens leather laptop bag briefcase',
    'leather bifold wallet open cards',
    'kids clothes summer set outfit',
    'kids sneakers shoes toddler',
    'kid summer straw sun hat'
  ];

  for (const q of queries) {
    try {
      const results = await ddgSearch(q);
      console.log(`\nDDG Query "${q}":`, results.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  }
}

test();
