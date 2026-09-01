import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const pageInputs = {};
try {
  for (const file of readdirSync(resolve(root, 'pages'))) {
    if (file.endsWith('.html')) {
      pageInputs[file.replace(/\.html$/, '')] = resolve(root, 'pages', file);
    }
  }
} catch {
  /* pages directory is populated in later phases */
}

export default defineConfig({
  plugins: [tailwindcss()],
  server: { port: 5173, host: true },
  build: {
    rollupOptions: {
      input: { main: resolve(root, 'index.html'), ...pageInputs },
    },
  },
});
