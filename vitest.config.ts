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

const defines = {
  __UCFHB_VERSION__: '"4.0.0-test"',
  __UCFHB_ROOT_URL__: '"universityheader.test"',
  __UCFHB_GTM__: '""',
  __UCFHB_SEARCH_URL__: '"https://search.ucf.edu/"',
};

/**
 * Two projects, because `__UCFHB_SESSION__` is a build-time constant that
 * esbuild folds away — there is no runtime switch to flip, so the signed-in
 * branch is unreachable in a build where the flag is false. Testing both
 * shipping configurations means compiling the sources twice.
 *
 * `signed-out` is the 4.0.0 build and owns the bulk of the suite.
 */
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [assetsAsText],
        define: { ...defines, __UCFHB_SESSION__: 'false' },
        test: {
          name: 'signed-out',
          environment: 'jsdom',
          include: ['tests/unit/**/*.test.ts'],
          exclude: ['tests/unit/signed-in/**'],
        },
      },
      {
        plugins: [assetsAsText],
        define: { ...defines, __UCFHB_SESSION__: 'true' },
        test: {
          name: 'signed-in',
          environment: 'jsdom',
          include: ['tests/unit/signed-in/**/*.test.ts'],
        },
      },
    ],
  },
});
