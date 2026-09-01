import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/** Mirrors esbuild's `text` loader so unit tests see the same module shapes. */
const assetsAsText: Plugin = {
  name: 'assets-as-text',
  enforce: 'pre',
  load(id) {
    const path = id.split('?')[0];
    if (!path || !/\.(svg|css)$/.test(path)) return null;
    return `export default ${JSON.stringify(readFileSync(path, 'utf8'))};`;
  },
};

export default defineConfig({
  plugins: [assetsAsText],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
  },
  define: {
    __UCFHB_VERSION__: '"4.0.0-test"',
    __UCFHB_ROOT_URL__: '"universityheader.test"',
    __UCFHB_GTM__: '""',
    __UCFHB_SEARCH_URL__: '"https://search.ucf.edu/"',
    __UCFHB_SESSION__: 'false',
  },
});
