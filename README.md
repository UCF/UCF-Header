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
| `npm run bench` | v3-vs-v4 load benchmark, 20 uncached loads per variant |
| `npm run lint` / `lint:fix` | Biome (lint + format) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest units |
| `npm run test:e2e` | Playwright, Chromium + Firefox + WebKit + mobile WebKit |
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
| `GTM` | *(empty)* | GTM container ID. Empty means analytics never loads. |
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

### Performance benchmarking

`npm run bench` measures this branch against the **live production v3 header**
and reports the distribution across 20 uncached loads per variant.

This is a tool for answering a question, not a gate. It is deliberately **not
part of CI**: it takes minutes and it reports numbers to read rather than a
threshold to trip. `npm run size` is the CI performance gate.

```bash
npm run bench                                  # 20 loads, none/4g/3g profiles
npm run bench -- --runs=50 --profiles=3g       # one profile, more samples
npm run bench -- --gtm=GTM-XXXXXXX             # build v4 with a real container
npm run bench -- --flags= --refresh            # bare embed, re-fetch v3
```

v3 is downloaded from `universityheader.ucf.edu` (cached under `.bench/`; use
`--refresh` to re-fetch), its hardcoded origin rewritten to the local server,
and served from the same in-memory gzip origin as v4. Three host pages —
`control` with no header, `legacy`, and `v4` — are byte-identical apart from the
one script tag, and the page itself costs exactly one request.

The headline metric is **header painted**: the first animation frame in which
`#ucfhb` has non-zero layout height. It is version-neutral by construction. v3
cannot reach it until `bar.css` arrives, because the bar is inserted with
`#ucfhb-inner` set to `display:none` and only the stylesheet reveals it; v4
reaches it when the shadow root mounts. Neither version instruments itself.

Things the harness does deliberately, because each one would otherwise turn into
a wrong conclusion:

- **Network throttling is the point.** On loopback a round trip is free, so v3
  and v4 finish within a millisecond of each other. The `none` profile is
  reported as a floor, not as the result.
- **Analytics is not measured.** v3's gtag injection is always stripped, and v4
  builds with no container unless `--gtm` says otherwise. The header defers its
  own tags behind `requestIdleCallback`, so they cannot affect anything a
  visitor waits for; leaving a third-party request in a 20-run comparison only
  imports network variance.
- **Measurement stops when the header's assets go quiet**, not at network idle,
  so a container loading in the background never holds up or distorts a sample.
  Nor does it stop at `load`: v3 discovers its spritesheet only after `bar.css`
  parses, and on a slow link that request is still in flight when `load` fires.
- **Variants are interleaved and rotated** each iteration, so machine drift
  during the run cannot land on one version.
- **Every load is a fresh context** with the HTTP cache disabled and `no-store`
  from the server. This is the first-visit case. In production the header is
  cached across `ucf.edu` subdomains, so it is the worst case for both versions
  — and the case the extra round trips actually hit.

`--gtm=GTM-XXXXXXX` builds v4 with a real container, so a run can confirm what
GTM costs the initial page load. On current measurements the answer is
**nothing**: `load` fires at 168 ms without a container and 171 ms with one,
because `initAnalytics` runs inside `requestIdleCallback` and the container is
not fetched until after the load event has already gone. That is the flag's
purpose — to verify that claim rather than assume it. What the container does
afterwards is out of scope; the run has stopped measuring by then.

Raw per-run JSON lands in `.bench/results/`. Note that the run leaves `dist/`
holding the benchmark build; `npm run build` restores it.

### Visual baselines

**Baselines are only authoritative from the pinned Playwright container.** Font
rasterization differs enough between macOS and Linux that locally generated
baselines produce permanent false diffs against CI. Committed baselines are the
Linux ones; macOS baselines are gitignored and exist only as a local smoke test.

```bash
npm run test:visual:docker                      # run against committed baselines
npm run test:visual:docker -- --update-snapshots  # re-baseline after a design change
```

Baselines stay loose while the design iterates, and get tightened once the look
is signed off.

### Desktop and iOS

Visual regression runs as six projects. Three are desktop engines driven by
explicit `setViewportSize` across six widths (`tests/visual/bar.spec.ts`). Three
are iOS device descriptors — WebKit plus a mobile user agent, `isMobile`, touch,
and a 3x device pixel ratio — which supply their own viewport, so
`tests/visual/mobile.spec.ts` never sets one. Their widths bracket the 390px
wordmark breakpoint:

| Project | Device | Width | Wordmark |
|---|---|---|---|
| `visual-ios-se` | iPhone SE (3rd gen) | 375px | clipped |
| `visual-ios-14` | iPhone 14 | 390px | visible |
| `visual-ios-max` | iPhone 14 Pro Max | 430px | visible |

**This is emulation, not a device.** Playwright's WebKit is the same engine as
Safari but not the same product, so it will catch CSS and layout regressions
while missing anything that depends on real iOS: native form-control chrome,
momentum scrolling, the keyboard resizing the viewport, and focus zoom. Those
last ones are driven by values we can read directly, so they are asserted as
computed style and geometry in `tests/e2e/ios.spec.ts` (project `e2e-ios`)
rather than by pixel diff — the check then fails with a number instead of a
blurry image. **Anything that genuinely needs real iOS Safari needs a device
cloud or a physical device; nothing in this repo covers it.**

Two traps those assertions exist for, both found on real iPhones and neither
reproducible in emulation:

**Focus zoom.** iOS Safari zooms the page when a text field under 16px receives
focus, and does not zoom back out on blur. `.search-input` is therefore 16px at
mobile widths. Do not "fix" a recurrence with `maximum-scale=1` — the viewport
meta belongs to the host page, and disabling pinch-zoom across every UCF site
to tidy up one input is an accessibility regression.

**Do not use `:has()` for state that script toggles.** The mobile layout has to
shrink the wordmark to make room for the open field, which means styling an
ancestor of `.search` from `.search`'s state. `.inner:has(.search.is-open)`
expresses that exactly and works in every engine the test suite can drive — but
iOS Safari does not reliably re-invalidate a `:has()` ancestor when script
mutates a descendant's class inside a shadow root. It matched on first paint,
went stale on toggle, and the wordmark kept its width and squeezed the field
down to a bare caret. `initSearch` therefore mirrors the state onto `.inner` as
`.is-searching`, and the rules are plain descendant selectors. If you find
yourself reaching for `:has()` against a scripted class again, mirror the class
instead.

## Deploying

Pushes to `develop` and `test` deploy to the corresponding Azure Static Web App.
Live is a manual `workflow_dispatch` against a tag. Each workflow runs
`npm ci && npm run build` explicitly and uploads `dist/`.

> **Repository variables must be renamed alongside the GTM swap.** The workflows
> now read `GTM_ID_DEV`, `GTM_ID_TEST` and `GTM_ID_LIVE` where they previously
> read `GA_ID_*`. An unset variable is not a build error — it compiles the
> analytics seam out entirely — so a deploy that ships with no analytics at all
> looks exactly like a successful one.

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
scripts/bench/        v3-vs-v4 load benchmark
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
