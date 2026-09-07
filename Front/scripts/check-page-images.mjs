import { ChromeController } from './cdp-client.mjs';

async function check() {
  const c = new ChromeController();
  await c.connect();
  const info = await c.eval(`
    ({
      title: document.title,
      url: window.location.href,
      body: document.body ? document.body.innerText.slice(0, 300) : ''
    })
  `);
  console.log(JSON.stringify(info, null, 2));
  await c.close();
}
check().catch(console.error);
