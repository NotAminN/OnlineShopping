import { ChromeController } from './cdp-client.mjs';

async function run() {
  const c = new ChromeController();
  await c.connect();

  const data = await c.eval(`
    (() => {
      const allImgs = Array.from(document.querySelectorAll('img')).map(i => ({
        src: i.src,
        srcset: i.srcset ? i.srcset.slice(0, 100) : '',
        alt: i.alt
      }));
      const figures = Array.from(document.querySelectorAll('figure a[href*="/photos/"]')).map(a => a.href);
      return { imgCount: allImgs.length, allImgs: allImgs.slice(0, 10), figures: figures.slice(0, 10) };
    })()
  `);

  console.log('DOM data:', JSON.stringify(data, null, 2));
  await c.close();
}

run().catch(console.error);
