import { ChromeController } from './cdp-client.mjs';

function decode(url) {
  const m = url.match(/[?&]u=a1([a-zA-Z0-9_-]+)/);
  if (!m) return null;
  let b = m[1].replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  try { return Buffer.from(b, 'base64').toString('utf-8'); } catch(e) { return null; }
}

async function run() {
  const c = new ChromeController();
  await c.connect();

  const query = 'site:unsplash.com photos straw hat kid';
  console.log('Query:', query);
  await c.navigate('https://www.bing.com/search?q=' + encodeURIComponent(query));
  await new Promise(r => setTimeout(r, 3000));

  const links = await c.eval(`
    Array.from(document.querySelectorAll('.b_algo h2 a')).map(a => ({ title: a.innerText, href: a.href }))
  `);

  console.log('Found results:', links.length);
  for (const l of links) {
    const dest = decode(l.href) || l.href;
    console.log(' ->', l.title, '=>', dest);
  }

  await c.close();
}

run().catch(console.error);
