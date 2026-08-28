# UCF Universal Header — Technical Notes
*Companion to `ucf-header-v2.html`. Covers the four engineering questions raised: SSO detection, zero-touch deployment, WCAG 2.2 AA, and SEO/AI visibility.*

---

## 1. Can the header know if you're signed in?

**Short answer: not by checking your Microsoft login directly — but yes, reliably, by checking a UCF-owned session signal.** These are different problems, and the distinction is the whole answer.

### Why talking to `login.microsoftonline.com` directly won't work

The header script runs on dozens of independent origins (`engineering.ucf.edu`, `library.ucf.edu`, etc.), not on `my.ucf.edu`. From the browser's point of view, any attempt to silently ask Microsoft Entra ID "is this browser logged in?" — whether via a hidden iframe or a silent OAuth `prompt=none` request — is a **cross-site, third-party cookie read**: the top-level page is `*.ucf.edu`, but the session cookie belongs to `login.microsoftonline.com`. Safari (ITP) and Firefox (ETP) already block that by default, today, for every visitor on those browsers. Chrome backed off its own third-party cookie deprecation plan in 2024–25, so it currently *would* allow it — but that's a moving target, not a foundation to build on. Relying on this would mean the feature silently fails for a large, browser-dependent slice of your audience.

### What actually works: a same-site signal, not a cross-site one

The SAML flow you pasted shows `my.ucf.edu/api/core/saml_sso` acting as the SAML Service Provider — that's almost certainly your Pathify portal consuming the Entra assertion and then establishing **its own** session. That's the lever. The trick is *not* "see Microsoft's session," it's "make UCF's own post-login session visible, same-site, everywhere on `ucf.edu`."

Two ways to get there:

- **Best case:** if Pathify's session cookie can be configured with `Domain=.ucf.edu` (rather than scoped just to `my.ucf.edu`) and `SameSite=Lax`, then `engineering.ucf.edu` calling `fetch('https://my.ucf.edu/api/session-status', {credentials:'include'})` is a **same-site** request (shared `ucf.edu` registrable domain) — unaffected by third-party cookie rules in any browser, present or future, because that restriction only targets genuinely cross-site cookies.
- **More robust / vendor-independent:** stand up a small first-party endpoint UCF controls outright (e.g. `universityheader.ucf.edu/api/session-status`) that itself holds a lightweight `.ucf.edu`-scoped cookie, set once right after Pathify login completes (a one-time redirect-through step, or a server-to-server check against Pathify's session API). This decouples the header from however Pathify implements sessions internally, and is worth doing even if option one is possible, since it gives you a stable contract to build against.

Either way, the response should be minimal — `{"signedIn": true, "firstName": "Jordan", "initials": "JK"}` or `{"signedIn": false}` — never anything sensitive (no student ID, no full session token).

### Non-negotiable guardrails

- **This is cosmetic only, never an access boundary.** It decides whether the header shows "Sign In" or an avatar — nothing it returns should ever be trusted by a protected app to actually grant access. Each downstream system (Webcourses, Workday, email) keeps doing its own real authentication.
- **Fail closed and fail fast.** The status check should have a short timeout (≈800ms) and default to the signed-out UI if it doesn't return in time. The header's core job — brand, nav, search — must never be blocked waiting on this call.
- **This is a one-way mirror, not a new exposure.** The endpoint should never reveal anything to `engineering.ucf.edu`'s JavaScript that wouldn't already be visible to a signed-in user on that page anyway.

---

## 2. Replacing the script with zero site changes

This part is genuinely straightforward, because of how the existing system is built: every site already loads
```html
<script type="text/javascript" id="ucfhb-script" src="//universityheader.ucf.edu/bar/js/university-header.js?use-1200-breakpoint=1"></script>
```
Whatever JS/CSS you deploy *at that same URL* is what every site gets, immediately, with no edits on their end. A few recommendations for that rebuild itself:

- **Encapsulate with Shadow DOM.** Instead of injecting raw markup into the host page's `<div id="ucfhb">` (today's approach, which depends on heavy CSS specificity to avoid clashing with whatever global styles the host site has), attach a shadow root and render the bar inside it. This guarantees the host page's CSS can't leak in (no surprise `a { color: red }` from some site bleeding into your nav) and your CSS can't leak out — in both directions, for free, in every current browser.
- **Self-host fonts and icons.** The prototype uses Google Fonts + Font Awesome's CDN for speed of iteration — fine for a pitch, not for production. Self-hosting Barlow Condensed/Montserrat and swapping the icon font for inline SVGs removes two external dependencies that would otherwise load on every single page view across every UCF site, and sidesteps font-blocking on networks that restrict Google domains.
- **Preserve the existing config contract.** Keep parsing `use-1200-breakpoint`, `use-bootstrap-overrides`, and the `ucfhb-script` ID convention exactly as documented today — that's what makes this a true drop-in rather than a breaking change.
- **Version and roll out gradually.** Even though no site needs to touch its markup, you're still changing what hundreds of pages render simultaneously. Stage it behind a query param or canary percentage if your CDN/edge setup supports it, and keep the old bar one config flag away from a fast rollback.

---

## 3. WCAG 2.2 AA — what's specifically relevant here

The prototype implements these; flagging them explicitly so they survive into the production build:

| Criterion | How it's addressed |
|---|---|
| 1.4.3 / 1.4.11 Contrast | Gold `#EDB80D` on black `#0A0A0A` measures ~10.8:1; white on black ~19.5:1 — both clear AA (and AAA) |
| 2.4.13 Focus Appearance, 2.4.11 Focus Not Obscured | Double-ring focus indicator (white + black) visible against black, white, or gold backgrounds; nothing else on the page should be able to sit on top of it |
| 2.5.8 Target Size (Minimum) | All icon buttons are ≥32×32px; verify this holds at the collapsed mobile breakpoint too |
| 2.1.1 / 2.1.2 Keyboard | Search and the myUCF launcher both open/close via click *or* keyboard, Escape closes either, focus returns to the trigger on close |
| 4.1.2 Name, Role, Value | `aria-expanded`, `aria-haspopup`, `aria-pressed` on every toggle; `role="search"` on the search form |
| 2.3.3 Animation from Interactions | All transitions are disabled under `prefers-reduced-motion` |
| Skip Navigation compatibility | The bar still respects the documented `<div id="ucfhb"></div>` placeholder pattern, so existing skip-links keep working |

Worth a dedicated audit pass once real copy and real backend wiring are in: screen-reader testing of the launcher grid specifically, and confirming the Shadow DOM boundary doesn't strip any ARIA relationships in older assistive tech (modern AT generally handles this correctly, but it's cheap to verify).

---

## 4. SEO and AI-engine visibility — what the header can and can't do for this

Important expectation-setting: **a header that's injected client-side, by itself, is a weak SEO signal.** Googlebot does render JavaScript, but that's not guaranteed for every crawler that matters to you, and a meaningful number of AI/answer-engine crawlers fetch raw HTML without executing scripts at all. If "every UCF property is obviously part of one trusted organization" needs to be machine-readable, it can't live *only* inside a script tag — it needs a server-rendered anchor too.

What actually moves this:

- **`Organization` schema.org JSON-LD**, ideally baked into whatever shared template/CMS skeleton your sites already use (this is a good candidate to standardize as part of the design-system/CMS rollout already on your roadmap), with each subsite's structured data pointing back to a canonical UCF `Organization` entity via `parentOrganization`/`sameAs`. This is the actual, established mechanism search engines use to understand "these are all one institution" — and it's also genuinely useful for AI engines, which lean on the same schema vocabulary when they do read structured data.
- **Real, descriptive anchor text** linking back to ucf.edu — which the header already does ("University of Central Florida," not just an icon) — helps both human orientation and crawler signal.
- **`llms.txt`: optional, low priority, not a real lever yet.** It's a real, growing convention (~10% of sites have one as of mid-2026), but Google has stated on the record it doesn't use it, and crawler logs across the industry show GPTBot/ClaudeBot/PerplexityBot rarely fetch it outside of developer-documentation contexts. It's cheap to add and harmless, but it shouldn't take budget or attention away from schema markup, sitemap hygiene, and the accessibility/performance basics already on your roadmap — those are the levers actually shown to matter right now.

---

## 5. Logo asset — resolved

Pulled the official mark straight out of `ucf-design-exploration.html` (it was embedded as a base64 PNG in that file's own header chrome) and dropped it into the prototype directly — no more placeholder. One thing worth flagging: the source file only has it as a 150×126px raster, which is sharp at header scale (it's displayed at ~40px tall) but will look soft if anyone tries to blow it up for something larger, like a hero lockup or print. Worth asking the brand team for the true vector source (AI/EPS/SVG) at some point so there's one master file instead of this PNG getting re-exported at different sizes across projects.

---

## 6. SVG vs. the current spritesheet — yes, switch

For a small set of simple, flat icons (search, chevron, bell, account, hamburger, close), SVG wins on essentially every axis that matters here:

- **Size.** Vector path data is text, and text compresses far better than already-compressed raster data — a PNG spritesheet gets little benefit from gzip/brotli (maybe 0–5%), while an SVG sprite routinely shrinks 60–80%. For a handful of small line icons, SVG will simply be smaller, often by a wide margin.
- **No retina tax.** A raster spritesheet needs 1x/2x (sometimes 3x) variants to stay sharp on modern displays, multiplying the asset weight. SVG is resolution-independent — one file, sharp everywhere.
- **Recoloring without duplication.** Hover states, focus states, a "gold" vs "white" icon variant — with a raster sprite each of those is a separate baked-in copy. With SVG (especially using `fill="currentColor"`), it's free: one shape, styled by CSS.
- **Zero requests, if you inline it.** For the small, frequently-used icon set specific to the header itself, the fastest option isn't even a sprite file — it's inlining the SVG markup directly in the JS bundle, the way the prototype already does. That's one fewer HTTP request than *any* spritesheet approach, sprite or not.

One caching nuance worth knowing, now confirmed rather than assumed: modern browsers partition the HTTP cache for privacy (Chrome, Safari, and soon Firefox), but the partition key is the visited page's **site** — `scheme://eTLD+1`, e.g. `https://ucf.edu` — not the exact subdomain. That means a shared static asset served from `universityheader.ucf.edu` and requested by a visitor on `engineering.ucf.edu` lands in the *same* cache partition as one requested from `library.ucf.edu`, because both reduce to the same `ucf.edu` site key. In plain terms: being all under one apex domain means the header's shared assets (icons, fonts, the script itself) still benefit from cross-subdomain cache reuse, even under modern partitioning. That's a real structural advantage worth knowing you have.

Two related cleanups, while in the area:
- The **logo is currently inlined as base64** directly in the markup (~17KB binary, ~23KB once base64-encoded). That's convenient for a prototype but means every visitor downloads it as part of the script/HTML payload, and it can't be cached independently — any time the script changes for an unrelated reason, the logo bytes get re-sent too. Serving it as its own small, stable, independently-cacheable file (ideally true SVG once you have the vector master) is the better long-term setup.
- **Drop the Font Awesome CDN dependency** in production (already flagged earlier, repeating because it's directly relevant here) — same reasoning as the spritesheet: a self-contained inline icon set beats a third-party font/icon request every time.

---

## 7. GA4 / Tag Manager — instrumenting the header itself

The most useful thing you can do here is treat the header as a **self-instrumenting component with its own observability**, separate from however well (or inconsistently) each individual department has its own GA4/GTM set up.

**Push a consistent `dataLayer` contract.** On every meaningful interaction, the header script should push a structured event — something like:
```js
window.dataLayer = window.dataLayer || [];
dataLayer.push({
  event: 'ucf_header_interaction',
  ucf_action: 'search_submit',   // or: nav_click, myucf_open, launcher_tile_click, sign_in_state
  ucf_scope: 'all',              // or 'site', for the search toggle specifically
  ucf_target: null               // e.g. which nav link or launcher tile, never raw search query text
});
```
Any site that already runs its own GTM container can build triggers off this without the header needing to know anything about that site's setup. Document the event/parameter contract once, centrally, so it stays consistent as more sites pick it up.

**Also run a header-owned property, independent of every site's local analytics.** Since the script is served from one origin regardless of which subdomain embeds it, it can fire its own events — via a dedicated, lightweight GTM container or direct GA4 — into a single **"UCF Universal Header" GA4 property** that the central web team controls directly. `page_location`/hostname comes along for free as a dimension. This is what actually answers "where is it being used": one dashboard, no dependency on every department's GA4 being correctly configured, giving you a genuine census of every page across the ecosystem that has the header active, broken down by subdomain and traffic volume — plus engagement on the things that matter (search scope chosen, myUCF click-through, launcher tile usage once that ships).

**One real coordination point, not just a technical one:** if any host sites run their own cookie-consent banner/CMP, the header's own tracking needs to respect that site's consent state rather than firing blind — worth a conversation with whoever owns consent management across the portfolio before this goes live, since "embedded in hundreds of independently-governed sites" makes this messier than a single-site GA4 rollout.

---

## 8. Favicon / tab icon — built, with one architectural caveat

Short version: yes, do this, and it's now built — see `favicon-kit/` in the outputs. The longer version, because the *mechanism* matters:

**The header script can't push this the way it pushes the bar.** Favicons are read from `<link rel="icon">` in `<head>`, and a meaningful number of browsers proactively request `/favicon.ico` from the site root *before or independent of* any JS-injected `<link>` tag — by the time a body-loaded script could try to inject one, the moment's often already passed. So unlike the header bar itself, this isn't a zero-touch, single-script-tag win. It needs to live in each site's own template `<head>` (a great fit for the design-system/CMS rollout already on the roadmap) or, at minimum, the same five files dropped at every site's root.

**What's in the kit**, built from the real logo extracted earlier:
- `favicon.ico` — 16/32/48px, ~0.6KB, the universal legacy fallback every browser still checks
- `favicon.svg` — vector, scales cleanly, **traced from the raster source** since no true vector master exists yet (see §5). It's clean enough at favicon scale — 16 to 48px, where it'll actually be used — but I wouldn't reach for this specific file for anything bigger until there's a real brand vector to trace from instead.
- `apple-touch-icon.png` (180×180) — iOS home-screen icon
- `icon-192.png` / `icon-512.png` + `site.webmanifest` — Android/PWA home-screen and splash icons
- `head-snippet.html` — the exact `<link>` tags to drop in

The gold "UCF" mark (no full wordmark) reads clearly even at 16×16 — a good sign this asset was always intended to work as an icon, not just a logo. `tab-preview.png` in the same folder shows what it actually looks like across a few different subdomains' tabs side by side.

---

## 9. GA4 — wired in

Added the dev/test stream (`G-7BJ5L4TMFY` / Stream ID `5251543455`) to the prototype, using the same architecture from §7: `gtag.js` loads async, `send_page_view` is off (the header reports its own interactions, it doesn't duplicate whatever page-view tracking the host site already does), and every real interaction — nav link clicks, search opened, scope changed, search submitted (query presence only, never the raw text), myUCF opened, launcher opened, launcher tile clicked — pushes a `ucf_header_interaction` event to `dataLayer` with the contract from §7. Verified end-to-end: opened devtools, drove every interaction, confirmed the `gtag/js?id=G-7BJ5L4TMFY` request fires and each dataLayer push has the right shape. Swap in the production Measurement ID at launch; everything else stays the same.

---

## 10. Mobile — tested, one real bug found and fixed, otherwise solid

Worth being precise about what "tested" means here: I hadn't actually rendered the prototype at a mobile width before this point — the earlier responses described the responsive behavior but the screenshots were all desktop. Given mobile is 45% of traffic, that gap needed closing rather than just asserting it'd be fine. So: rendered it at 360 / 375 / 390 / 412 / 430px (covering the iPhone SE up through larger Android phones) and checked for horizontal overflow programmatically, not just by eye.

**Found one real bug:** at 360–375px, the page had a few pixels of horizontal overflow. Traced it to the *mock subsite navigation* underneath the bar (the fake "Programs / Faculty / Research…" row standing in for a department site's own nav) — not the header bar itself. Fixed by letting that row wrap on narrow screens. The actual header bar measured **zero overflow at every width tested**, including with the search panel and the signed-in launcher both open.

**Also fixed while in there:** the icon set was loading from the Font Awesome CDN, which is exactly the dependency flagged as worth dropping in §6 — done now. All icons (search, bell, account, chevron, and the six launcher tile icons) are inline SVG with no external request, which also means there's no risk of icons silently failing to load on networks that block third-party font CDNs (a real consideration for some campus/dorm networks).

**Checked specifically:**
- No horizontal scroll at any tested width, bar included, with menus open or closed
- The 320px-wide signed-in launcher panel stays fully on-screen down to 360px viewports
- Touch targets (search icon, bell, avatar button) stay at-or-above the WCAG 2.5.8 24×24px minimum
- Search collapses to icon-only, scope toggle and full "University of Central Florida" text both hide under 680px — the bar stays usable, not cramped

**Not yet tested, worth doing before launch:** real iOS/Android devices and Safari/Chrome mobile specifically (this was headless Chrome at mobile viewport sizes, which catches layout bugs but not touch-specific quirks like iOS Safari's address-bar-collapse affecting viewport height, or actual tap-target behavior vs. simulated clicks).
