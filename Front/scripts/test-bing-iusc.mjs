import { ChromeController } from './cdp-client.mjs';
import fs from 'fs';

async function run() {
  const c = new ChromeController();
  await c.connect();

  const query = 'kids straw sun hat summer child fashion';
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qft=+filterui:imagesize-large`;
  console.log('Navigating to:', url);
  await c.navigate(url);

  // Wait 3 seconds
  await new Promise(r => setTimeout(r, 3000));

  // Extract results
  const items = await c.eval(`
    (() => {
      const results = [];
      const links = document.querySelectorAll('a.iusc');
      for (const a of links) {
        try {
          const m = JSON.parse(a.getAttribute('m'));
          if (m && m.murl) {
            results.push({
              title: m.t || '',
              murl: m.murl,
              purl: m.purl,
              desc: m.desc
            });
          }
        } catch (e) {}
      }
      return results;
    })()
  `);

  console.log('Items found:', items.length);
  items.slice(0, 5).forEach((item, idx) => {
    console.log(`[${idx + 1}] Title: ${item.title}`);
    console.log(`    URL:   ${item.murl}`);
  });

  await c.close();
}

run().catch(console.error);
