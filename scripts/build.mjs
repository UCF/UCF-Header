import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as esbuild from 'esbuild';
import { browserslistToTargets, transform } from 'lightningcss';
import { BUNDLE, buildEnv, defines, OUT_DIR, ROOT } from './config.mjs';

const watch = process.argv.includes('--watch');
const serve = process.argv.includes('--serve');
// Matches scripts/serve.mjs and playwright.config.ts so every entry point into
// the project lands on the same URL.
const PORT = Number(process.env.PORT || 4321);
const env = buildEnv();

const pkg = JSON.parse(await readFile(resolve(ROOT, 'package.json'), 'utf8'));
const targets = browserslistToTargets((await import('browserslist')).default(pkg.browserslist));

/**
 * Inlines CSS into the bundle as a string, minified and downlevelled against
 * browserslist by Lightning CSS. This is what collapses the header from two
 * network requests to one.
 */
const cssText = {
  name: 'css-text',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const { code, warnings } = transform({
        filename: args.path,
        code: await readFile(args.path),
        minify: true,
        targets,
      });
      return {
        contents: code.toString(),
        loader: 'text',
        warnings: warnings.map((w) => ({ text: w.message })),
      };
    });
  },
};

const options = {
  entryPoints: [resolve(ROOT, 'src/index.ts')],
  outfile: BUNDLE,
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['chrome109', 'firefox115', 'safari16', 'edge109'],
  sourcemap: 'linked',
  legalComments: 'none',
  define: defines(env),
  loader: { '.svg': 'text' },
  plugins: [cssText],
  banner: { js: `/*! UCF University Header v${env.version} | ucf.edu */` },
};

async function copyStatic() {
  await mkdir(OUT_DIR, { recursive: true });
  await cp(resolve(ROOT, 'site'), OUT_DIR, { recursive: true });
  await cp(resolve(ROOT, 'robots.txt'), resolve(OUT_DIR, 'robots.txt'));
  // Azure Static Web Apps reads this from the deployed artifact, not the repo
  // root — so it has to be copied in, or its headers are silently ignored.
  await cp(resolve(ROOT, 'staticwebapp.config.json'), resolve(OUT_DIR, 'staticwebapp.config.json'));
}

await rm(OUT_DIR, { recursive: true, force: true });

if (watch || serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  await copyStatic();
  if (serve) {
    // esbuild returns `hosts` (an array); the older singular `host` is gone.
    const { hosts, port } = await ctx.serve({ servedir: OUT_DIR, port: PORT });
    const host = hosts.includes('127.0.0.1') ? 'localhost' : hosts[0];

    console.log(`\n  v${env.version}  ->  http://${host}:${port}`);
    console.log(`  ga         ${env.ga || '(empty — analytics will not load)'}`);
    console.log(`  rootUrl    ${env.rootUrl}`);
    console.log(`  searchUrl  ${env.searchUrl}`);
    console.log(`  session    ${env.session ? 'compiled in' : 'compiled out'}\n`);
  }
  console.log('  watching for changes…');
} else {
  await esbuild.build(options);
  await copyStatic();
  console.log(`  built  v${env.version}  ->  ${BUNDLE.replace(`${ROOT}/`, '')}`);
}
