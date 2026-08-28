/**
 * Reads the header's configuration off the embedding `<script>` tag.
 *
 * The contract is fixed by ~hundreds of sites that will never be edited:
 * a script tag with `id="ucfhb-script"` carrying flags as query params on its
 * `src`. v3 tested those flags with a plain substring match, so a stray
 * `?use-full-width=1&cb=123` kept working; that permissiveness is preserved
 * deliberately rather than tightened into real query parsing.
 */

export interface HeaderConfig {
  /** Cache-busting version, from package.json at build time. */
  version: string;
  /** Origin the header is served from. Reserved for the Phase 2 session endpoint. */
  rootUrl: string;
  /** GA4 measurement ID, or null when none was injected. */
  gaId: string | null;
  /** Destination page for the search form's native GET submit. */
  searchUrl: string;
  /** Legacy `use-1200-breakpoint`: widen the container at >=1200px. */
  wideBreakpoint: boolean;
  /** Legacy `use-full-width`: run the bar edge to edge with gutters. */
  fullWidth: boolean;
}

const SCRIPT_ID = 'ucfhb-script';

/** True when `flag=1` appears anywhere in the script's src. Matches v3 semantics. */
function hasFlag(src: string, flag: string): boolean {
  return src.indexOf(`${flag}=1`) > -1;
}

export function readConfig(doc: Document = document): HeaderConfig {
  const script = doc.getElementById(SCRIPT_ID);
  const src = script?.getAttribute('src') ?? '';

  const fullWidth = hasFlag(src, 'use-full-width');

  return {
    version: __UCFHB_VERSION__,
    rootUrl: __UCFHB_ROOT_URL__,
    gaId: __UCFHB_GA__ || null,
    searchUrl: __UCFHB_SEARCH_URL__,
    // Full width has always implied the wider breakpoint: in v3 full-width.scss
    // imported 1200-breakpoint.scss outright, so the two never had to be combined.
    wideBreakpoint: fullWidth || hasFlag(src, 'use-1200-breakpoint'),
    fullWidth,
    // `use-bootstrap-overrides` is accepted and ignored. Bootstrap 2.x support
    // was dropped for 4.0.0, so sites still passing the flag keep working —
    // it just no longer does anything.
  };
}
