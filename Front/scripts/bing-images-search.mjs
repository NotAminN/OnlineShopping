import { ChromeController } from './cdp-client.mjs';

async function searchBingImages(query) {
  const c = new ChromeController();
  await c.connect();

  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2`;
  await c.navigate(url);

  // Scroll down slightly to trigger loading more items
  await c.eval('window.scrollBy(0, 500)');
  await new Promise(r => setTimeout(r, 2000));

  const results = await c.eval(`
    Array.from(document.querySelectorAll('img'))
      .filter(i => i.src && i.src.includes('th.bing.com'))
      .map(i => {
        let p = i.parentElement;
        while (p && p.tagName !== 'A') p = p.parentElement;
        if (!p) return null;
        try {
          const m = JSON.parse(p.getAttribute('m'));
          return {
            title: m.t || '',
            desc: m.desc || '',
            purl: m.purl || '',
            murl: m.murl || '',
            cdnurl: m.cdnurl || '',
            thumb: i.src
          };
        } catch (e) { return null; }
      })
      .filter(Boolean)
  `);

  await c.close();
  return results;
}

async function run() {
  const queries = [
    { key: 'kids-summer-hat', q: 'toddler straw sun hat summer child fashion product photography' },
    { key: 'kids-denim-overall', q: 'kids denim overalls dungarees toddler clothing product photography' },
    { key: 'kids-hoodie-set', q: 'kids hoodie sweatpants set toddler sportswear product photography' },
    { key: 'leather-wallet', q: 'genuine brown leather bifold wallet product photography white background' },
    { key: 'leather-card-holder', q: 'leather card holder slim minimalist wallet product photography' }
  ];

  for (const item of queries) {
    console.log(`\n========================================`);
    console.log(`Searching for [${item.key}]: "${item.q}"`);
    const results = await searchBingImages(item.q);
    console.log(`Found ${results.length} images:`);
    for (const r of results.slice(0, 3)) {
      console.log(` - Title: ${r.title.slice(0, 70)}`);
      console.log(`   Purl:  ${r.purl.slice(0, 70)}`);
      console.log(`   Murl:  ${r.murl}`);
    }
  }
}

run().catch(console.error);
