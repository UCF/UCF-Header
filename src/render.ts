import type { HeaderConfig } from './config';
import type { Session } from './features/session';
import css from './styles/bar.css';
import { barMarkup } from './template';

export const HOST_ID = 'ucfhb';

let sheet: CSSStyleSheet | null | undefined;

/** Construct the stylesheet once and share it across every mount. */
function adopt(root: ShadowRoot, doc: Document): void {
  if (sheet === undefined) {
    try {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
    } catch {
      sheet = null;
    }
  }

  if (sheet && 'adoptedStyleSheets' in root) {
    root.adoptedStyleSheets = [sheet];
    return;
  }

  const style = doc.createElement('style');
  style.textContent = css;
  root.appendChild(style);
}

/**
 * Finds or creates the `#ucfhb` placeholder and renders the bar into a shadow
 * root attached to it. Returns null if the bar is already mounted, so a page
 * that includes the script twice gets one header rather than two.
 */
export function mount(
  cfg: HeaderConfig,
  doc: Document = document,
  session: Session = { signedIn: false },
): ShadowRoot | null {
  let host = doc.getElementById(HOST_ID);

  if (!host) {
    host = doc.createElement('div');
    host.id = HOST_ID;
    doc.body.insertBefore(host, doc.body.firstChild);
  } else if (host.shadowRoot) {
    return null;
  }

  // Deliberately `complementary`, not `banner`: host pages have their own
  // banner landmark and a second one would compete with it.
  host.setAttribute('role', 'complementary');
  host.setAttribute('aria-label', 'University of Central Florida navbar');

  const root = host.attachShadow({ mode: 'open' });
  // Markup first: the fallback path appends a <style> child, and assigning
  // innerHTML afterwards would wipe it — leaving the bar completely unstyled on
  // browsers without adoptedStyleSheets (Safari 16.0–16.3). No paint happens
  // between these two statements, so there is no flash either way.
  root.innerHTML = barMarkup(cfg, session);
  adopt(root, doc);

  return root;
}
