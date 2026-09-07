import { ChromeController } from './cdp-client.mjs';

async function run() {
  const c = new ChromeController();
  await c.connect();

  const res = await c.eval(`
    Array.from(document.querySelectorAll('a'))
      .map(a => ({ text: a.innerText, href: a.href }))
      .filter(a => a.href && a.href.startsWith('http') && !a.href.includes('duckduckgo'))
  `);

  console.log('DDG external links count:', res.length);
  res.slice(0, 10).forEach(r => console.log(' -', r.text.trim(), '=>', r.href));
  await c.close();
}

run().catch(console.error);
