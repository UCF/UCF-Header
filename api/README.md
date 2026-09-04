# Header session API

A mock-up. It runs, it is tested, and the seams it defines are the parts meant
to survive; the mock verifier and mock profile source are meant to be replaced.

An Azure Functions app (Node 20, v4 programming model) deployed as the **managed
API of the existing Static Web App**, so it answers on the same origin the
header is already served from — `https://universityheader.ucf.edu/api/*`. That
is the URL `src/features/session.ts` has been pointed at since 4.0.0; nothing
about the header's embed contract changes.

| Route | Purpose |
| --- | --- |
| `GET /api/session` | Who is this, and what should the header draw. |
| `GET /api/health` | Which verifier and profile source are live. |
| `GET /api/dev/login?as=…&return=…` | Mint a mock session. Dev and test only. |
| `GET /api/dev/logout?return=…` | Clear it. |

---

## The two problems worth designing around

### 1. Hundreds of embedding domains

Every UCF site embeds the header, so every request to `/api/session` is
cross-origin. With `credentials: 'include'` a wildcard `Access-Control-Allow-Origin`
is illegal, and reflecting whatever `Origin` arrives is the same hole with extra
steps. So the response echoes a **specific** origin, and only after checking it
against an allowlist.

The allowlist is a suffix rule, not a list of hundreds of hostnames — new UCF
subdomains work on day one without a deploy:

```
ALLOWED_ORIGIN_SUFFIXES=.ucf.edu     # .ucf.edu subdomains and the apex
ALLOWED_ORIGINS=                     # exact origins outside ucf.edu
```

The leading dot is load-bearing. `endsWith('ucf.edu')` also matches
`evil-ucf.edu` and `notucf.edu`, both registrable by anyone; the suffix is
therefore matched as `.ucf.edu` with the apex handled separately.
[`test/cors.test.ts`](test/cors.test.ts) pins that.

Two properties fall out of everything being under one registrable domain, and
both are worth stating because they are what make this cheap:

- **The session cookie is not a third-party cookie.** `cah.ucf.edu` →
  `universityheader.ucf.edu` is cross-*origin* but same-*site*, so `SameSite=Lax`
  is sufficient and Safari's ITP and Chrome's third-party cookie restrictions do
  not apply. A cross-domain design would have needed `SameSite=None`, which
  Safari drops outright.
- **There is no preflight.** The header sends a `GET` carrying only
  `Accept: application/json`, which is CORS-safelisted, so the request is
  "simple" and skips the `OPTIONS` round trip. Adding any custom request header
  to the client would silently double this endpoint's latency. `OPTIONS` is
  still handled, for when that changes.

### 2. Speed

The request is deferred until after DOM load, but the gap between the bar
appearing and the user's name appearing is still visible. Three layers, ordered
by how often each one wins:

**Layer 1 — no request at all.** The login flow sets a small readable cookie,
`ucfhb_h`, on `.ucf.edu`. If the header does not see it, the user is signed out
and it renders that immediately without touching the network. On a public UCF
page nobody is signed in, so *the common case costs zero requests*. This is the
single biggest thing in the design.

**Layer 2 — local cache.** When the hint is present the header looks in
`localStorage` for an entry stored under that hint value, and uses it if it has
not expired. The server declares the lifetime (`ttl` in the payload, default one
hour), and the header caps it at two hours so a bad config value cannot pin a
stale name indefinitely.

The hint is what makes an hour-long cache safe. It is a truncated keyed hash of
the principal and profile, so **it changes when the session or the profile
changes** — signing out clears it, which invalidates every embedding site's
cached copy at once, without any of them being told. Rotating `HINT_SALT`
invalidates every client cache globally, which is the lever to pull if a bad
payload ever ships.

It carries no secret and grants nothing. Forging it buys an attacker a cache
key; the endpoint re-verifies the real session on every call.

**Layer 3 — the fetch.** One origin check, one session verification, one profile
lookup with a 400 ms timeout. No database on the hot path, no retries. The
profile lookup is allowed to fail: if Pathify is slow, a signed-in user gets a
signed-in header with their IdP name rather than a spinner or a signed-out bar.

HTTP caching sits underneath as `private, max-age=300` — deliberately much
shorter than the payload TTL. That layer absorbs bursts (several tabs, a back
navigation) while the header's own store, which we can actually invalidate, does
the long-lived caching. `private` keeps per-user data out of any shared cache.

> **The one thing the SSO integration must do.** Set `ucfhb_h` on `.ucf.edu` at
> login and clear it at logout. Without it, signed-in users never get the
> personalised render, because layer 1 short-circuits before the request.
> `/api/session` refreshes and clears the cookie on every call, so it self-heals
> for anyone who does reach it — but nobody reaches it without the cookie.
> [`src/functions/dev-login.ts`](src/functions/dev-login.ts) is a worked example.

---

## The mock login flow

With `UCFHB_SESSION=1` the right-hand slot renders **Login** instead of MyUCF.
It is an ordinary anchor with a real `href`, not a button with a click handler —
same reasoning as the search form: the browser performs the navigation itself,
so login works before any deferred script has run.

```
cah.ucf.edu/programs
  → GET universityheader.ucf.edu/api/dev/login?return=https://cah.ucf.edu/programs
      Set-Cookie: ucfhb_mock=…   HttpOnly   (stands in for the SSO session)
      Set-Cookie: ucfhb_h=…      readable   (the hint the header reads)
      302 → https://cah.ucf.edu/programs
  → header sees ucfhb_h, fetches /api/session, renders "Hi, Lulu"
```

The redirect is deliberate rather than answering with JSON: it is the shape a
real SSO round trip has, and it proves the cookie survives a cross-origin
navigation back to a `*.ucf.edu` site.

`?return=` is validated against the same allowlist that gates CORS. A login
endpoint that redirects wherever it is told is an open redirect, and an open
redirect on the identity domain is worth real money to a phisher — a
`universityheader.ucf.edu/api/...` link is plausible enough to click and would
land the victim anywhere. Reusing `isAllowedOrigin` keeps the two lists from
drifting apart.

**Lulu** is the fallback in `buildPayload` for a verified session that no
profile source has a record of. `/api/dev/login` with no `as` deliberately mints
a principal that is not one of the fixtures, so the default demo exercises that
path; `?as=student-1` shows a real profile instead. A verified user should never
see a signed-out bar just because Pathify has nothing on them.

Signing out is a URL visit for now (`/api/dev/logout`), because the signed-in
state is plain text rather than a control. The account menu that replaces it is
where a Sign out item belongs.

---

## Seams

Two interfaces, each with a mock implementation that is meant to be thrown away.

**`Verifier`** ([`src/auth/types.ts`](src/auth/types.ts)) turns a request into a
`Principal` or `null`. Everything downstream deals in `Principal` and never sees
a cookie or a token, so swapping identity systems is a one-line change in
[`src/auth/index.ts`](src/auth/index.ts).

- `mock` — trusts a base64 cookie. Refuses to load when `NODE_ENV=production`.
- `jwks` — validates a bearer token or JWT cookie against a remote JWKS, with
  issuer and audience checks. Wired but inert until configured. `jose` is
  imported lazily so the mock path never pays to load it.

**`ProfileSource`** ([`src/profile/types.ts`](src/profile/types.ts)) turns a
principal id into profile data. This is where Pathify lands: implement the
interface, install it in `setProfileSource`, and neither the endpoint nor the
header changes.

The payload is deliberately tiny — it is on the critical path for the
personalised render on hundreds of sites — and deliberately cosmetic. A
signed-in response means "this browser presented a valid session to us", not
"grant access". Every consumer must re-authenticate for itself.

Profile links are filtered to absolute `https:` URLs before they go out, because
they land in the DOM.

---

## Local development

Both the Functions runtime and the Static Web Apps emulator are devDependencies
of this package — nothing needs to be installed globally.

```bash
cp api/local.settings.json.example api/local.settings.json
npm ci --prefix api
npm run dev:all                     # watcher + emulator, torn down together
```

| | ports | serves |
| --- | --- | --- |
| `npm run dev` | 4321 | static only, live rebuild — no `/api` |
| `npm run dev:api` | 4280, 7071 | static + `/api`, no rebuild |
| `npm run dev:all` | all three | 4280 is the one to open |

Both `dev:api` and `dev:all` start the Functions host (7071) themselves and
attach the emulator to it with `--api-devserver-url`, rather than letting
`swa start --api-location` spawn it. That is not a style preference: the SWA
CLI hard-codes `func start --cors "*"`, and a wildcard
`Access-Control-Allow-Origin` is illegal on a credentialed request — so the
browser rejects every session response and the bar silently stays signed out.
The flag cannot be overridden from `local.settings.json` or by a second
`--cors`; the only fix is to not pass it.

`dev:all` exists because running the two by hand is subtly wrong: the watcher
*deletes* `dist/` on startup — the directory the emulator serves — so starting
them together races, and `&` leaves esbuild and `func` holding 4321 and 7071
after Ctrl-C. See [scripts/dev-all.mjs](../scripts/dev-all.mjs).

Set `UCFHB_SESSION=1` and `ROOT_URL=localhost:4321` in the repo's `.env`, or the
bar renders the 4.0.0 MyUCF button and points at the wrong origin. The dev
server prints which one it compiled:

```
session    compiled in
```

> `azure-functions-core-tools` downloads a ~1.5 GB platform binary in its
> postinstall, from a CDN that npm's cache never sees. CI installs the API with
> `npm ci --ignore-scripts`, which skips it — no CI job runs `func`.

Then, in the browser at `http://localhost:4321`:

```
/api/dev/login                → Hi, Lulu   (no profile on record)
/api/dev/login?as=student-1   → Hi, Alex   (fixture, three quick links)
/api/dev/login?as=staff-1     → Hi, Dana   (fixture, two)
/api/dev/logout               → back to signed out
/api/health                   → which verifier is live
```

Or just click **Login** in the bar, which is the same thing with `?return=`
pointing back at the page you were on.

`ALLOW_LOCALHOST=1` is what admits `http://localhost:*` to the allowlist. It
must never be set in production.

```bash
npm run api:test      # 15 tests, CORS and endpoint behaviour
npm run api:verify    # typecheck, test, build
```

## Deployment

The three existing Static Web Apps workflows now carry `api_location: "api"`.
Static Web Apps builds the Functions app itself (`npm install && npm run build`).

Runtime settings are **not** in the workflow. The CORS allowlist is the only
thing preventing an arbitrary site from reading a user's name, and widening it
should be a conscious, separately-audited act rather than a side effect of
merging a pull request:

```bash
scripts/api-settings.sh <resource-group> <swa-name> dev|test|live
```

For `live` the script requires `JWKS_URI`, `JWT_ISSUER`, `JWT_AUDIENCE` and
`HINT_SALT` in the environment, and sets `NODE_ENV=production`, which is what
makes the mock verifier refuse to load.

Set the `UCFHB_SESSION_DEV` / `_TEST` / `_LIVE` repository variables to `1` to
compile the seam into the header for that environment. It costs roughly 1 KB
gzipped (5.0 KB → 6.0 KB, against a 9 KB budget).

## Known gaps

- **Cold starts.** Static Web Apps managed functions run on Consumption, so the
  first request after idle costs 1–2 s. Layer 1 makes traffic to this endpoint
  low, which unfortunately means idling is the normal state and the cost lands
  on signed-in users. Options, in increasing order of effort: a scheduled ping;
  moving to a dedicated Function App on Flex Consumption with `alwaysReady=1`;
  or accepting it, since the header is already rendered and only the name is
  late. Worth measuring before choosing.
- **No rate limiting.** Fine while the endpoint is this cheap and reads no
  backing store; revisit when a real profile source is behind it.
- **`setProfileSource` is process-global,** which suits one source. If Pathify
  ever needs to be selected per-request, that becomes a lookup.
- **Nothing is wired to a real IdP.** The `jwks` verifier is written against
  standard claims (`oid` / `sub` / `eppn`) but has never been run against UCF's
  actual issuer.
