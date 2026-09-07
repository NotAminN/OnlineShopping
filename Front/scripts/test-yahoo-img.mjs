import { ChromeController } from './cdp-client.mjs';

async function run() {
  const c = new ChromeController();
  await c.connect();

  const url = 'https://images.search.yahoo.com/search/images?p=kids+straw+sun+hat';
  console.log('Navigating to Yahoo Images...');
  await c.navigate(url);

  const title = await c.eval('document.title');
  console.log('Yahoo title:', title);

  const results = await c.eval(`
    Array.from(document.querySelectorAll('li.ld a, a[data-rurl], a[href*="imgurl="]'))
      .map(el => {
        try {
          return {
            title: el.getAttribute('title') || el.innerText,
            rurl: el.getAttribute('data-rurl'),
            src: el.querySelector('img')?.src
          };
        } catch (e) { return null; }
      })
      .filter(Boolean)
  `);

  console.log('Yahoo images count:', results.length);
  results.slice(0, 5).forEach(r => console.log(' -', r));
  await c.close();
}

run().catch(console.error);
