import https from 'https';

function searchUnsplash(query) {
  return new Promise((resolve, reject) => {
    const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=5`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results || []);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

async function test() {
  const queries = [
    'women oversize denim jacket fashion',
    'men bomber jacket fashion model',
    'men cargo pants fashion streetwear',
    'men quilted puffer vest fashion',
    'white leather minimal sneakers fashion',
    'leather laptop bag briefcase',
    'kids fashion clothes set',
    'toddler sneakers shoes',
    'kids summer straw hat'
  ];

  for (const q of queries) {
    console.log(`\n=== Query: "${q}" ===`);
    try {
      const results = await searchUnsplash(q);
      for (const r of results.slice(0, 3)) {
        console.log(`- ID: ${r.id} | Alt: ${r.alt_description || r.description || 'No desc'} | URL: ${r.urls.regular}`);
      }
    } catch (err) {
      console.error('Error querying:', err.message);
    }
  }
}

test();
