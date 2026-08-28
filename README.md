# UCF University Header

The universal header bar embedded across UCF web properties. Usage instructions
for site owners live at <https://universityheader.ucf.edu> (built from `site/`).
This file covers working on the header itself.

## Requirements

Node 20+. That is the whole list.

## Getting started

```bash
npm ci
cp .env.example .env    # optional; sensible defaults apply without it
npm run dev             # watch + serve on http://localhost:4321
```

`npm run dev` builds to `dist/` and serves it. The documentation page at
`/index.html` loads the header the same way a real site does, and forwards any
supported option passed to the page so you can preview it — e.g.
`/index.html?use-full-width=1`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Watch build + local server |
| `npm run build` | Production bundle to `dist/` |
| `npm run size` | Payload budget gate — fails over 9 KB gzip |
| `npm run lint` / `lint:fix` | Biome (lint + format) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest units |
| `npm run test:e2e` | Playwright, Chromium + Firefox + WebKit |
| `npm run test:visual` | Visual regression (see caveat below) |
| `npm run test:visual:docker` | Visual regression in the pinned container |
| `npm run test:a11y` | axe-core against every host fixture |
| `npm run verify` | Everything CI runs, in order |

## How it is built

One TypeScript entry point bundled by esbuild into a single IIFE, with the
stylesheet and every SVG inlined as strings. That is deliberate: the previous
version fetched `bar.css` as a second request, so the bar could not paint until
a full extra round trip completed. Inlining trades a slightly larger file for
one fewer request and no unstyled gap.

The bar renders into a **shadow root** attached to `#ucfhb`. Host page CSS
cannot reach in and the bar's CSS cannot leak out, which is what removed the
`!important` arms race, the Foundation `box-sizing` reset, and the Bootstrap 2
override stylesheet that v3 needed.

Everything that is not "make the header appear" — analytics, and later the
signed-in view — is deferred behind `requestIdleCallback` after
`DOMContentLoaded`. The critical path is: read flags, mount, wire the search
toggle. Nothing else.

### Known limitation

A host page that pads its `<body>` insets the header, because the shadow host's
containing block is outside the shadow root. There is no fix that does not
involve `100vw` (which breaks when a scrollbar is present). This is measured by
a test in `tests/e2e/isolation.spec.ts` so it stays a known quantity.

## Configuration

Build-time values are injected by esbuild `define`, read from the environment or
a local `.env`:

| Variable | Default | Purpose |
|---|---|---|
| `GA` | *(empty)* | GA4 measurement ID. Empty means analytics never loads. |
| `ROOT_URL` | `universityheader.ucf.edu` | Serving origin. Reserved for the Phase 2 session endpoint. |
| `SEARCH_URL` | `https://search.ucf.edu/` | Where the search form submits. |
| `UCFHB_SESSION` | `0` | Set to `1` to compile in the Phase 2 signed-in seam. |

> `SEARCH_URL` replaced `SEARCH_SERVICE`, which was defined in the deploy
> workflows but never used — and named something else entirely
> (`search.cm.ucf.edu`, the data API hub, not the search destination).

## Testing

The most useful tests are the host-page fixtures in `tests/fixtures/`. Each is a
page carrying global CSS chosen to break a light-DOM header — `a { color: red
!important }`, `button { all: unset }`, Foundation's `content-box` reset — and
the bar must render identically on all of them. That is asserted both by
computed geometry and by comparing every fixture against one shared screenshot.

### Visual baselines

**Baselines are only authoritative from the pinned Playwright container.** Font
rasterization differs enough between macOS and Linux that locally generated
baselines produce permanent false diffs against CI. Committed baselines are the
Linux ones; macOS baselines are gitignored and exist only as a local smoke test.

```bash
npm run test:visual:docker                      # run against committed baselines
npm run test:visual:docker -- --update-snapshots  # re-baseline after a design change
```

Per the Phase 1 plan, baselines stay loose while the design iterates and get
locked once the look is signed off.

## Deploying

Pushes to `develop` and `test` deploy to the corresponding Azure Static Web App.
Live is a manual `workflow_dispatch` against a tag. Each workflow runs
`npm ci && npm run build` explicitly and uploads `dist/`.

## Project layout

```
src/
  index.ts            entry: read flags → mount → schedule deferred work
  config.ts           script-tag and query-param parsing
  render.ts           shadow root, adoptedStyleSheets, mount
  template.ts         markup, state-driven right-hand zone
  styles/bar.css      the whole stylesheet, inlined at build
  icons/  brand/      inlined SVG
  features/           search (critical), analytics (deferred), session (Phase 2)
site/                 the universityheader.ucf.edu documentation page
tests/                unit · e2e · visual · a11y · host-page fixtures
scripts/              build, size gate, static server, containerized visuals
notes/                the Phase 1 plan and its source requirements
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
