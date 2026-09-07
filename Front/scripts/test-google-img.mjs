import { ChromeController } from './cdp-client.mjs';

async function run() {
  const c = new ChromeController();
  await c.connect();

  const url = 'https://www.google.com/search?udm=2&q=kids+straw+sun+hat+summer';
  console.log('Navigating to Google Images...');
  await c.navigate(url);

  const title = await c.eval('document.title');
  console.log('Google title:', title);

  const results = await c.eval(`
    Array.from(document.querySelectorAll('div[data-lpage], a[href*="imgurl="]'))
      .map(el => {
        if (el.dataset.lpage) return { page: el.dataset.lpage };
        const urlParams = new URLSearchParams(el.href.slice(el.href.indexOf('?')));
        return {
          imgurl: urlParams.get('imgurl'),
          title: el.innerText
        };
      })
      .filter(r => r.imgurl || r.page)
  `);

  console.log('Google images found:', results.length);
  results.slice(0, 5).forEach(r => console.log(' -', r));
  await c.close();
}

run().catch(console.error);
