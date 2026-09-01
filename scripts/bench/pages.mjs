/**
 * The host pages under test.
 *
 * All three variants are byte-identical apart from the one script tag, and the
 * page itself costs exactly one request — its CSS is inline and it loads no
 * images or fonts. Anything else the page fetched would land in the same
 * resource timeline as the header and muddy every number in the report.
 *
 * `control` carries no header at all. It is not decoration: FCP and LCP are
 * only interpretable against the cost of the same page without a header.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { WWW_DIR } from './config.mjs';

export const VARIANTS = {
  control: { label: 'no header', src: null },
  legacy: { label: 'v3 (production)', src: '/legacy/bar/js/university-header.js' },
  v4: { label: 'v4 (this branch)', src: '/v4/bar/js/university-header.js' },
};

const page = (label, tag) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Benchmark host page — ${label}</title>
<style>
:root { --ink: #1a1a1a; --rule: #d8d5cd; }
body { margin: 0; color: var(--ink); font: 16px/1.6 system-ui, sans-serif; background: #fff; }
main { max-width: 1120px; margin: 0 auto; padding: 40px 24px 80px; }
h1 { font-size: 40px; line-height: 1.15; margin: 0 0 16px; }
h2 { font-size: 22px; margin: 40px 0 8px; }
p { margin: 0 0 16px; max-width: 68ch; }
.grid { display: grid; gap: 20px; grid-template-columns: repeat(3, 1fr); margin-top: 32px; }
.card { border: 1px solid var(--rule); padding: 20px; }
.card h3 { margin: 0 0 8px; font-size: 17px; }
</style>
</head>
<body>
${tag}
<main>
  <h1>College of Engineering and Computer Science</h1>
  <p>A representative host page. The markup below is identical across every
     benchmark variant so that the only measured difference is the header.</p>
  <h2>Announcements</h2>
  <p>Registration for the spring term opens in November. Advising appointments
     are available through the student portal, and walk-in hours run Tuesday
     and Thursday afternoons in the main office.</p>
  <div class="grid">
    <div class="card"><h3>Undergraduate</h3><p>Degree programs, transfer pathways, and advising.</p></div>
    <div class="card"><h3>Graduate</h3><p>Master's and doctoral study, funding, and assistantships.</p></div>
    <div class="card"><h3>Research</h3><p>Centers, institutes, and sponsored project support.</p></div>
  </div>
</main>
</body>
</html>`;

/**
 * @param {string} flags query string appended to the header src, e.g. `use-1200-breakpoint=1`
 * @returns {Promise<Record<string, string>>} variant name → server path
 */
export async function writePages(flags) {
  const dir = resolve(WWW_DIR, 'pages');
  await mkdir(dir, { recursive: true });

  const urls = {};
  for (const [name, { label, src }] of Object.entries(VARIANTS)) {
    // `type` and `id` are reproduced verbatim from the public embed contract —
    // v3 reads its flags off the `src` of the element with id `ucfhb-script`.
    const tag = src
      ? `<script type="text/javascript" id="ucfhb-script" src="${src}${flags ? `?${flags}` : ''}"></script>`
      : '';
    await writeFile(resolve(dir, `${name}.html`), page(label, tag));
    urls[name] = `/pages/${name}.html`;
  }
  return urls;
}
