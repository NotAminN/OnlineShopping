import { ChromeController } from './cdp-client.mjs';

async function run() {
  const c = new ChromeController();
  await c.connect();

  const url = 'https://github.com/search?q=%22images.unsplash.com%2Fphoto-%22+wallet&type=code';
  console.log('Navigating to GitHub search...');
  await c.navigate(url);

  const title = await c.eval('document.title');
  console.log('GitHub Title:', title);

  const codeSnippets = await c.eval(`
    Array.from(document.querySelectorAll('div[data-testid="search-sub-header"] + div, .blob-code, pre'))
      .map(el => el.innerText)
      .filter(t => t && t.includes('unsplash.com'))
  `);

  console.log('Snippets count:', codeSnippets.length);
  codeSnippets.slice(0, 5).forEach(s => console.log(' -', s.slice(0, 150)));
  await c.close();
}

run().catch(console.error);
