/**
 * Host-page fixtures. Each one wraps the header in global CSS chosen to break
 * it — the same assertions run against all of them. If the shadow root does its
 * job, every fixture renders identically, which is directly assertable by
 * diffing screenshots across fixtures rather than only across runs.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const FIXTURES = {
  bare: { title: 'Bare host page', css: '' },

  'aggressive-reset': {
    title: 'Aggressive global reset',
    css: `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      a { color: red !important; text-decoration: underline; font-size: 22px; }
      button { all: unset; }
      input { border: 4px dashed lime; font-size: 30px; }
      svg { width: 100%; height: 200px; }
      div { display: grid; }
      span { text-transform: lowercase; letter-spacing: 1em; }
    `,
  },

  // A padded <body> insets the shadow host itself, which is the one thing a
  // shadow root cannot protect against — the host element's own containing
  // block is outside it. Kept as a fixture so the limitation stays measured
  // rather than merely known.
  'padded-body': {
    title: 'Host page with a padded body',
    css: `
      body { padding-left: 20px; padding-right: 20px; }
      a { color: #08c; }
    `,
  },

  foundation: {
    title: 'Foundation content-box reset',
    // The reason v3 shipped `box-sizing: content-box !important` on everything.
    css: `
      *, *::before, *::after { box-sizing: content-box; }
      body { font-family: Georgia, serif; line-height: 3; }
      a { color: #2199e8; }
      button { border-radius: 999px; background: hotpink; }
    `,
  },

  'host-themed': {
    title: 'Host page using the supported theming API',
    css: `
      #ucfhb {
        --ucfhb-bg: #1a1a1a;
        --ucfhb-accent: #7ab8ff;
      }
    `,
  },
};

const page = (title, css, flags) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
body { margin: 0; font-family: system-ui, sans-serif; }
.host-content { padding: 24px; }
${css}
</style>
</head>
<body>
<script id="ucfhb-script" src="/bar/js/university-header.js${flags}"></script>
<main class="host-content">
  <h1>${title}</h1>
  <p>Host page content sitting underneath the header.</p>
</main>
</body>
</html>`;

const MODES = {
  '': '',
  '-wide': '?use-1200-breakpoint=1',
  '-full': '?use-full-width=1',
  // Still passed by real sites. Must be accepted and ignored.
  '-bs': '?use-bootstrap-overrides=1',
};

export async function build(outDir = resolve(HERE, '../../dist/fixtures')) {
  await mkdir(outDir, { recursive: true });
  const written = [];
  for (const [name, { title, css }] of Object.entries(FIXTURES)) {
    for (const [suffix, flags] of Object.entries(MODES)) {
      const file = `${name}${suffix}.html`;
      await writeFile(resolve(outDir, file), page(title, css, flags));
      written.push(file);
    }
  }
  return written;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  build().then((f) => console.log(`  ${f.length} fixtures written`));
}
