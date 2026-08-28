# University Header v4.0.0 — Phase 1 Implementation Plan

Source of truth for scope: `notes/redesign.md`.
`notes/ucf-header-v2.html` is the visual reference; `notes/ucf-header-technical-notes.md` is background context only, not a requirements document.

Working assumption from the kickoff: **every file in this project is replaceable.** Nothing in
the v3 codebase is treated as load-bearing except the public contract described in §3.

---

## 0. Decisions locked

| # | Question | Decision |
|---|---|---|
| Q1 | Stacked logo vector | **SVG master will be supplied by brand.** Inlined and optimized; sets the payload budget. |
| Q2 | Style isolation | **Shadow DOM**, full isolation, no light-DOM opt-out path. |
| Q3 | Wordmark typography | **Deferred until the SVG lands.** Build against the outlined-paths assumption (§4.6). |
| Q4 | Bar height | **72px desktop / 60px below 768px.** |
| Q5 | Mobile hamburger | **Retired.** One fixed-height row at every width. |
| Q6 | Search endpoint | **New `SEARCH_URL` variable.** `SEARCH_SERVICE` is removed — it means something else entirely (§5.4). |

---

## 0.1 Implementation status

Phase 1 is built. Measured against the plan:

| | Planned | Actual |
|---|---|---|
| Requests before paint | 1 | **1** |
| Payload | ≤ 9,216 B gzip | **4,848 B gzip / 4,006 B brotli** |
| Build dependencies | ~5 | **5** (esbuild, TypeScript, Lightning CSS, Biome, browserslist) |
| Tests | — | **28 unit, 107 e2e (3 browsers), 8 axe, 111 visual baselines** |

Three things the plan got wrong, corrected below where they appear:

1. **Shadow DOM does not make `use-bootstrap-overrides` unnecessary** (§3, §4.2).
   A padded `<body>` insets the shadow *host*, whose containing block is outside
   the shadow root. The flag ends up inert anyway — but because Bootstrap 2
   support was dropped as a product decision, not because the boundary handles it.
2. **Inherited CSS properties cross the shadow boundary** (§4.2). A host page's
   `body { line-height: 3 }` reaches `:host` and everything under it that does
   not set its own value. Found by the Foundation fixture; fixed with a
   one-time reset of the inheritable text properties on `.bar`.
3. **The supplied logo contains no wordmark** (§4.6), so Q3's "already outlined,
   free" path does not apply. See §0.2.

---

## 0.2 Open item: the wordmark

The brand SVG is the stacked UCF mark alone — four paths, no type. So
"University of Central Florida" has to be set in the header itself, and the
three options in §4.6 are all still live.

**What is built today is option 3: live text in a system font stack.** It is
legible, weighs nothing, costs no request, and is trivially swappable — but it
is not the brand typeface, so it should be treated as a placeholder rather than
a decision. Moving to option 1 needs the wordmark supplied as outlined paths
(or the brand font, to outline from). Moving to option 2 needs a subsetted
woff2. Either is a change to one file plus one CSS token.

---

## 1. Scope

### 1.1 In scope

| # | Requirement | Deliverable |
|---|---|---|
| R1 | Inline SVG icons + text, no spritesheet | `src/icons/`, inlined at build |
| R2 | UCF Stacked logo replaces the Pegasus | `src/brand/ucf-stacked.svg`, inlined |
| R3 | Taller bar, stacked "University of Central Florida" wordmark | new layout, see §4.1 |
| R4 | Pop-out search → `search.ucf.edu` | `src/features/search.ts` |
| R5 | Sign-in tray replaced by one MyUCF button | `src/template.ts` |
| R6 | Modernized build, all scripts in `package.json` | §5 |
| R7 | Single-file drop-in at the existing URL | §3 |
| R8 | Fast first render; everything else deferred | §4.2, §4.3 |
| R9 | Architected for a Phase 2 signed-in view | §4.5 |
| R10 | Test suite incl. cross-browser visual regression | §7 |
| R11 | Modern browsers, no IE | §5.3 |
| R12 | Rebranded, updated documentation page | §8 |

### 1.2 Explicitly out of scope for Phase 1

SSO backend and session endpoint; the signed-in UI (avatar, launcher grid, notification bell);
favicon kit; `Organization` JSON-LD; `llms.txt`. The technical notes cover several of these —
they are Phase 2+ or belong to the CMS/design-system track, not to this artifact.

### 1.3 Deliberately *not* carried over from the prototype

The prototype is a pitch deck, not a spec. These parts of it fall outside `redesign.md` and add
weight, width, or maintenance cost for no Phase 1 benefit:

- **Search scope toggle ("All of UCF" / "This site").** R4 says the query goes to `search.ucf.edu`.
  A per-site scope needs a per-site search index that does not exist as a header-level contract.
  Cut.
- **Center nav links** (`Admissions`/`Academics`-style row). Not in `redesign.md`; today's bar has
  none; adding them is a governance question (who owns the link set?) not a redesign question.
- **Notification bell, avatar button, launcher panel, "Sign out".** Phase 2. The *layout seam*
  for them ships now (§4.5); the UI does not.
- **Google Fonts + Font Awesome CDN.** Two third-party requests on every page view across the
  whole `ucf.edu` estate. See §4.6.
- **Base64 PNG logo.** ~23KB of un-cacheable, non-scalable payload in the critical path. R2 gets
  a real vector.
- Prototype bugs noted in passing, so they do not get copied: `.search-field` carries a stray
  `margin-top:17px` that vertically misaligns the input, and `.mock-eyebrow` has a typo'd
  `color#edb80c` declaration.

---

## 2. Payload budget

Measured, current production critical path:

| Asset | raw | gzip | brotli |
|---|---|---|---|
| `bar/js/university-header.js` | 5,548 B | 1,676 B | 1,278 B |
| `bar/css/bar.css` | 10,624 B | 2,055 B | 1,709 B |
| **Total** | **16,172 B** | **3,731 B** | **2,987 B** |
| | | | **over 2 sequential requests** |

The second request is the real cost. The JS must download, parse, and execute before the browser
even learns that `bar.css` exists — so the header's paint is gated on a full second round trip,
and every site sees a brief gap where the bar is not there.

**Target for v4: one request, ≤ 9 KB gzip / ≤ 8 KB brotli, everything inlined.**

**Achieved: 4,848 B gzip / 4,006 B brotli in one request** — 53% of the gzip budget. The optimized
stacked mark accounts for 1,376 B of that. The budget stays where it is rather than being tightened
to the current figure, since the wordmark treatment (§0.2) is not settled.

That is a larger *byte* count than today but strictly fewer round trips, and it removes the
unstyled gap entirely. The stacked logo SVG is the variable — it is the one asset that could blow
the budget, so its optimized size gets checked before the design is locked (§10, Q1). A CI size
check enforces the budget on every PR (§7.5).

---

## 3. The public contract (must not break)

Hundreds of sites embed exactly this and will not be edited:

```html
<script type="text/javascript" id="ucfhb-script"
        src="//universityheader.ucf.edu/bar/js/university-header.js?use-1200-breakpoint=1"></script>
```

Preserved verbatim:

- **URL path** — build output must land at `dist/bar/js/university-header.js`.
- **Script id** `ucfhb-script` as the config carrier.
- **Query-param flags** parsed off the `src` attribute: `use-1200-breakpoint`, `use-full-width`,
  `use-bootstrap-overrides`.
- **`<div id="ucfhb">` placeholder** — used if present, created and prepended to `<body>` if not.
  Existing skip-links and host-page layout rules that reference `#ucfhb` keep working.

Contract changes, each needing a call-out in the docs page:

- `use-bootstrap-overrides` becomes a **no-op**, accepted silently — but not for the reason
  originally given here. Shadow DOM does *not* neutralise it: Bootstrap 2 pads `<body>`, which
  insets the shadow host itself, and the host element's containing block is outside the boundary.
  The flag is inert because **Bootstrap 2.x support was dropped for 4.0.0** as a product decision.
  Sites keep passing it; it just stops doing anything.
- `bar/css/*.css` are **no longer fetched** by the script. They ship unchanged for one release as
  dead files, in case a site hotlinks them, then get removed in 4.1.0.
- `university-header-full.js` (the unminified twin) is dropped in favor of a **source map**
  published alongside the minified file.

---

## 4. Architecture

### 4.1 Layout

Bar height has to grow enough for the stacked mark plus a two-line wordmark. Today's bar is 50px.
The prototype's 54px is not enough — it uses a 36px-tall mark and a single-line-per-row wordmark
that is really a horizontal lockup.

**Confirmed: 72px desktop / 60px below 768px** (Q4), with the stacked mark at ~52px and
`UNIVERSITY of / CENTRAL FLORIDA` set on two lines beside it, divider rule between.

This is a real, visible change to every UCF page's above-the-fold — it pushes host content down
22px. Worth naming explicitly to stakeholders rather than discovering post-deploy.

**Mobile behavior is simplified (Q5, confirmed).** Today the bar grows to 100px/150px and slides down from a
negative margin behind a hamburger toggle, because there are five sign-in service links and a
full search form to hide. v4 has two controls — a search icon and a MyUCF button — both of which
fit on a 360px viewport. So: **the hamburger toggle, the slide-down transition, the `.preload`
class, and the negative-margin height hacks all go away.** The bar becomes one fixed-height row at
every width. That deletes the single most fragile part of the current CSS.

Breakpoint modes retained from v3, driven by the flags rather than by separate stylesheets:
default centered container, `use-1200-breakpoint` (wider container), `use-full-width` (edge to
edge with gutters). All three live in one stylesheet as container-width variants.

### 4.2 Style isolation — Shadow DOM

**Confirmed (Q2): attach a shadow root to `#ucfhb` and render the bar inside it.**

The current CSS spends most of its bulk fighting host pages — `!important` on ~40 declarations,
a blanket `box-sizing: content-box !important` reset for Foundation, an entire opt-in stylesheet
for Bootstrap 2. A shadow root makes all of that unnecessary: host CSS cannot reach in, header CSS
cannot leak out. The stylesheet gets substantially smaller and, more importantly, *predictable*
across the long tail of sites nobody on the team has ever seen.

Adopted via `adoptedStyleSheets` with a `<style>` fallback, so the CSS is a constructed sheet
shared across the document rather than re-parsed markup.

**The risk, stated plainly:** any host site whose own CSS or JS currently reaches into the header's
internals stops working. `#ucfhb-search-field`, `#ucfhb-signon`, and friends become unreachable
from the outside. Given the number of embedding sites, some certainly do this — most likely to
force a background color or hide the search box.

Mitigations, all shipping in Phase 1:
- A sanctioned theming API: CSS custom properties pierce the shadow boundary, so
  `#ucfhb { --ucfhb-bg: #000; }` keeps working by design. Documented on the docs page.
- `part=` attributes on the handful of elements worth exposing (`bar`, `logo`, `search`, `myucf`).
- A pinned v3 URL (§9) so any site that breaks has a same-day escape hatch.

No light-DOM opt-out path is carried — maintaining two CSS architectures indefinitely costs
more than it buys, and the pinned v3 URL already covers the sites that need an out.

**Two things the boundary does not do**, both found by the fixtures rather than by reasoning:

- **Inherited properties pass straight through.** `:host` inherits from its parent like any other
  element, so a host page's `body { line-height: 3 }` reaches the bar and everything in it that
  does not set its own value. The fix is cheap — pin the inheritable text properties once on
  `.bar` — but it has to be deliberate, because nothing about "shadow DOM isolates styles"
  suggests it.
- **The host element's own box is still the host page's to lay out.** A padded `<body>` insets
  the bar, and no amount of shadow CSS changes that; the only workarounds route through `100vw`,
  which overflows whenever a scrollbar is present. Left as a measured known limitation with a
  test, rather than papered over.

### 4.3 Render timing

Two changes make the header paint sooner than it does today.

**Render as early as the DOM allows.** v3 always waits for `DOMContentLoaded`. But the header only
needs `document.body` to exist — on the common embed pattern (script near the top of `<body>`)
that is true immediately, so the bar can be built during parse instead of after it. Logic:
if `document.body` exists, render synchronously; otherwise wait for `DOMContentLoaded`. On a
slow-parsing page this moves the header's paint up by however long the rest of the document takes.

**Nothing else runs in that path.** The critical path is exactly: parse flags → build shadow root
→ adopt stylesheet → insert markup → wire the search toggle. No network calls, no measurement, no
analytics.

### 4.4 The deferred layer

Everything that is not "make the header appear" is scheduled after first paint:

```
requestIdleCallback(init, { timeout: 2000 })   // setTimeout(init, 0) fallback for Safari
```

…itself gated behind `DOMContentLoaded` if it has not fired yet. That layer owns:

- GA4 bootstrap — injecting `gtag.js` `async`, `gtag('config', …)`.
- Analytics event wiring — one delegated `click` listener on the shadow root, plus `search_submit`.
  Events follow the `ucf_header_interaction` / `ucf_action` shape from the technical notes; it is a
  reasonable contract and costs almost nothing to adopt now. Query *text* is never sent — presence
  only.
- The Phase 2 session probe (§4.5), currently compiled out.

Kept in the same file rather than split into a lazily-imported chunk: the deferred code is on the
order of 1 KB and a second request would cost more than it saves. When the Phase 2 signed-in UI
lands, *that* becomes a genuine dynamic `import()` — the split point is designed in now (§4.5) but
not paid for yet.

### 4.5 Phase 2 seam

Three things ship now so the signed-in view is additive later, not a rewrite:

1. **A reserved right-hand zone.** The MyUCF button lives in a fixed-width slot sized to also fit
   an avatar + name + chevron. Swapping in the signed-in UI later changes what is in the slot, not
   the bar's geometry — no layout shift when the session check resolves.
2. **A typed session provider interface**, implemented in Phase 1 by a stub that resolves
   "signed out" without touching the network:
   ```ts
   type Session = { signedIn: false } | { signedIn: true; firstName: string; initials: string; links: QuickLink[] };
   interface SessionProvider { get(signal: AbortSignal): Promise<Session>; }
   ```
   The real implementation is a `fetch` against a `.ucf.edu`-scoped endpoint with
   `credentials: 'include'`, a short timeout, and fail-closed-to-signed-out semantics. Phase 1
   ships the type, the call site, and the abort/timeout plumbing — behind a build-time flag that
   tree-shakes the whole thing out of the v4.0.0 bundle.
3. **Render is state-driven.** The right zone renders from a session object rather than being
   hardcoded, so the signed-in branch is a new case, not a refactor.

The backend itself, the SSO flow, and the cookie-scoping question are Phase 2 work and are not
prejudged here.

### 4.6 Typography

The prototype pulls Barlow Condensed and Montserrat from Google Fonts. That is a third-party
request on every page view across the entire estate and a render dependency for the wordmark —
not acceptable for this artifact.

Three options, in order of preference:

1. **Outline the wordmark into the logo SVG.** "UNIVERSITY OF CENTRAL FLORIDA" is fixed text that
   will not change for years. As vector paths it needs no font at all, renders identically in every
   browser, and is pixel-stable for visual regression. Accessibility and SEO are preserved with a
   `<title>` element plus visually-hidden real text inside the anchor (R4 of the technical notes'
   SEO section — descriptive anchor text — still holds). Everything else in the bar (MyUCF button,
   search placeholder) uses a system font stack.
2. **Self-hosted subset woff2**, ~2–4 KB for the glyphs actually used, served as its own cacheable
   file. One extra request, but cached across all `ucf.edu` subdomains.
3. **System stack only.** Smallest and simplest; brand fidelity suffers on the wordmark.

**Decision (Q3): deferred until the SVG master arrives, building against option 1 in the meantime.**
The distinction that matters is `<text>` vs. paths — an SVG `<text>` element still resolves a font
family at render time, so it buys nothing; outlining to `<path>` geometry removes the dependency at
every layer. Two things to check the moment the master lands:

- **Does it already contain the wordmark as outlines?** Official stacked lockups usually do, in
  which case option 1 is free — it is simply what is in the file.
- **What does it weigh optimized?** That number sets the §2 budget.

Either way, the bar's small UI text (the MyUCF label, the search placeholder) is live text and
cannot be outlined. It uses a system stack, which is what keeps the header at zero font requests
overall.

---

## 5. Toolchain

### 5.1 Out

`gulp` and its 12 plugins, `babel`, `uglify`, `sass`, `sass-lint`, `autoprefixer`, `browser-sync`,
`merge`, `compile.sh`, `config.conf`, `config.templ.conf`, `gulp-config.json`. That is ~20
dependencies and three config file formats replaced by one build script.

### 5.2 In

- **esbuild** — the whole build. Single dependency, sub-100ms builds, native TypeScript, and a
  `text` loader that inlines CSS and SVG into the bundle without ceremony. Chosen over Vite
  because this is a single IIFE library artifact, not an app; Vite's dev server and lib-mode
  conventions are overhead here, and predictable output matters more than HMR.
- **TypeScript** — types stripped at zero runtime cost. The session interface (§4.5) is the
  clearest payoff, but so is not shipping a typo to hundreds of sites.
- **Plain modern CSS** with native nesting and custom properties, no preprocessor. **Lightning CSS**
  minifies and downlevels against the browserslist target, replacing both `sass` and
  `autoprefixer`.
- **Biome** — lint + format in one fast tool, replacing ESLint (a 6.7 KB config file today),
  `.eslintignore`, `sass-lint`, and `.editorconfig` drift.
- **Vitest** for unit tests, **Playwright** for E2E, visual regression, and accessibility.

### 5.3 Browser target

`browserslist`: `defaults and fully supports es6-module` — modern evergreen browsers, no IE, per
R11. Shadow DOM, `adoptedStyleSheets`, `AbortSignal.timeout`, and native CSS nesting are all
comfortably inside that target.

### 5.4 Config injection

`compile.sh`'s `sed`-over-`@!@TOKEN@!@` substitution is replaced by esbuild `define`:

| Define | Env var | Notes |
|---|---|---|
| `__UCFHB_VERSION__` | from `package.json` | cache-busting; no longer a build timestamp |
| `__UCFHB_GA__` | `GA` | already set by all three workflows |
| `__UCFHB_ROOT_URL__` | `ROOT_URL` | already set |
| `__UCFHB_SEARCH_URL__` | `SEARCH_URL` | **new variable** — the `search.ucf.edu` destination, per-environment instead of hardcoded |
| `__UCFHB_SESSION__` | — | `false` in 4.0.0; tree-shakes the Phase 2 seam out |

Local dev reads the same names from `.env` (with `.env.example` committed).

**`SEARCH_SERVICE` is removed from this project entirely (Q6).** It is already exported by all
three workflows but wired to nothing, and the name is misleading in this context: it refers to
`search.cm.ucf.edu`, the API hub that serves queryable data, *not* to `search.ucf.edu`, the Google
Custom Search page that R4 sends users to. Conflating them would bake a wrong assumption into the
build. The three workflows each drop `SEARCH_SERVICE` and gain `SEARCH_URL`.

Worth noting for later: the v3 stylesheets still carry rules for a `#ucfhb-search-autocomplete`
element that the current script never creates — vestigial markup from a feature that was removed.
The `search.cm.ucf.edu` API hub is exactly what would back a revived autocomplete, which makes it a
natural Phase 2 candidate alongside the signed-in view. Not Phase 1 work; noted so the connection
is not lost.

### 5.5 npm scripts (R6)

```
npm run dev        # esbuild watch + static server for the docs page
npm run build      # production bundle → dist/
npm run lint       # biome check
npm run format     # biome format --write
npm run typecheck  # tsc --noEmit
npm run test       # vitest run
npm run test:e2e   # playwright test
npm run test:visual        # visual regression, containerized
npm run test:visual:update # re-baseline screenshots
npm run size       # bundle budget check
```

`prebuild: npm install` is dropped — CI should run `npm ci` explicitly rather than have it
smuggled into a build script.

---

## 6. Repository layout

```
src/
  index.ts              entry: parse config → render → schedule deferred
  config.ts             script-tag + query-param parsing
  render.ts             shadow root, adoptedStyleSheets, mount
  template.ts           markup, state-driven right zone
  styles/bar.css        single stylesheet, inlined at build
  icons/*.svg           search, close, chevron, myucf — inlined
  brand/ucf-stacked.svg the mark + outlined wordmark
  features/
    search.ts           pop-out toggle, submit → search.ucf.edu   (critical path)
    analytics.ts        GA4 + dataLayer contract                  (deferred)
    session.ts          Phase 2 provider interface + stub         (compiled out)
site/                   the universityheader.ucf.edu docs page
tests/
  unit/                 config parsing, URL building, template
  e2e/                  interaction, keyboard, focus management
  visual/               screenshot specs + baselines
  fixtures/             host pages: bare, bootstrap 2, bootstrap 5, foundation, athena
scripts/build.mjs       esbuild driver
dist/                   deploy output — bar/js/, site page, robots.txt
```

`src/scss/`, `bar/`, `gulpfile.js`, `src/compile.sh`, `.babelrc`, `.eslintrc.json`,
`.sass-lint.yml`, and the PSD/PNG spritesheets are all deleted.

---

## 7. Testing (R10)

### 7.1 Host-page fixtures

The highest-value tests, because the risk that matters is "breaks on some site nobody tested."
Each fixture is a host page with hostile-to-headers global CSS, and the same assertions run
against all of them:

`bare` · `bootstrap-2` (the reason `use-bootstrap-overrides` exists) · `bootstrap-5` ·
`foundation` (the reason for the `content-box` reset) · `athena` (UCF's own framework) ·
plus a page with aggressive resets (`* { box-sizing: border-box }`, `a { color: red }`,
`button { all: unset }`).

If Shadow DOM does its job, the header renders byte-identically on all of them — and that is
directly assertable by diffing screenshots *across fixtures*, not just across runs.

### 7.2 Unit (Vitest)

Flag parsing from every `src` permutation; search URL construction and encoding (including
Unicode and `&`/`#` in queries); template output for signed-out and, once it exists, signed-in
state; the session stub's timeout and fail-closed behavior.

### 7.3 E2E (Playwright, chromium + firefox + webkit)

Search pop-out opens on click and on Enter; focus moves into the field on open; `Escape` closes
and returns focus to the trigger; click-outside closes; submit navigates to the correct
`search.ucf.edu` URL; MyUCF is a real link with correct `href`; `aria-expanded` tracks state; full
keyboard traversal of the bar; nothing renders under `prefers-reduced-motion` with a transition.

### 7.4 Visual regression

Matrix: 6 widths (360 / 390 / 768 / 980 / 1200 / 1440) × 3 config modes (default /
`use-1200-breakpoint` / `use-full-width`) × 2 states (search closed / open) × 3 browsers.

**Baselines are generated in the pinned Playwright Docker image, and `test:visual` runs in that
container locally too.** Font rasterization differs enough between macOS and Linux CI that
host-generated baselines would produce permanent false diffs — this is the detail that usually
sinks visual regression suites, so it is set up correctly from day one. Outlining the wordmark
(§4.6) removes the largest remaining source of text-rendering variance.

Per R10, baselines stay loose during design iteration and get locked once the look is signed off.

### 7.5 Non-visual gates

- **Size budget**: `npm run size` fails CI if the gzip/brotli bundle exceeds the §2 target.
  This is what actually keeps R8 true over time.
- **Accessibility**: `@axe-core/playwright` against each fixture, both search states.
- **Request count**: assert the header issues exactly **one** network request before first paint,
  and **zero** third-party requests until after `DOMContentLoaded`. Encodes R8 as a test rather
  than an intention.

### 7.6 CI

One `test.yml` on PRs: install → lint → typecheck → unit → build → size → e2e → visual → axe.
The three existing Azure deploy workflows keep their current triggers and env vars, with
`output_location: /dist` unchanged.

---

## 8. Documentation page (R12)

`index.html` currently pulls `cdn.ucf.edu/athena-framework/latest` and documents v3 behavior. It
moves to `site/`, gets restyled to the new brand look, and is rewritten to cover:

- the unchanged embed snippet, front and center;
- the three flags, with `use-bootstrap-overrides` documented as retained-but-inert;
- **the Shadow DOM change and the supported theming API** — custom properties and `part=`
  selectors, with copy-paste examples. This is the page that has to answer "why did my override
  stop working," so it needs to answer it well;
- the live preview toggles that already exist (`?use-full-width=1` etc.), kept;
- an upgrade/rollback note pointing at the pinned v3 URL.

Athena stays as the page's framework unless the rebrand supersedes it — it is the docs page's
styling, not the header's, so it carries no payload cost.

---

## 9. Rollout

1. Merge to `develop` → auto-deploys to the DEV static web app. Iterate on look and feel here.
2. Lock the design, generate visual baselines, merge to `test` → TEST app. Circulate to
   stakeholders and a handful of volunteer host sites.
3. **Publish v3 at a pinned, permanent URL** (`/bar/js/university-header-v3.js`) *before* the live
   deploy, and document it. Any site that breaks can pin back to v3 by editing one line, without
   waiting on the central team. Cheap, and it converts a potential outage into an inconvenience.
4. Tag `v4.0.0`, run the manual LIVE workflow.
5. Watch the header's own GA4 property for error signals and search-usage drop-off in the first
   48 hours.

---

## 10. Decision detail

All six questions from the initial plan are resolved. Notes on the two that changed the shape of
the work:

**Q2 — Shadow DOM, confirmed.** The backward-compatibility risk in §4.2 is real and accepted: any
host site whose CSS or JS reaches into the header's internals will stop working. The three
mitigations ship in Phase 1 — custom properties as a sanctioned theming API, `part=` attributes,
and the pinned v3 URL. Step 3 of the rollout (§9) is therefore not optional; it is the safety net
this decision depends on.

**Q6 — `SEARCH_SERVICE` was a red herring.** It is plumbed through all three workflows and unused,
and it does not refer to the search destination at all — see §5.4. It is deleted from the project
and replaced by a purpose-named `SEARCH_URL`. The API hub it actually names is Phase 2 material.

**Q3 — the only one still carrying an assumption.** The build proceeds as if the wordmark will be
outlined paths (§4.6). If the brand master turns out to contain live text worth keeping, the
fallback is a self-hosted subset woff2 — one extra request and some screenshot variance to manage,
but no structural change to anything else in this plan.
