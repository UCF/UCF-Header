/**
 * UCF universal header — entry point.
 *
 * Critical path, in order: read flags, mount the shadow root, wire the search
 * toggle. No network calls, no measurement, nothing else. Everything that is
 * not "make the header appear" is scheduled after first paint.
 */

import { readConfig } from './config';
import { initAnalytics } from './features/analytics';
import { initSearch } from './features/search';
import { mount } from './render';

/** Runs `fn` once the document is parsed and the browser is otherwise idle. */
function defer(fn: () => void): void {
  const run = () => {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(fn, { timeout: 2000 });
    else setTimeout(fn, 0);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}

function start(): void {
  const cfg = readConfig();
  const root = mount(cfg, document);
  if (!root) return;

  initSearch(root);

  defer(async () => {
    initAnalytics(root, cfg);

    if (__UCFHB_SESSION__) {
      const { createSessionProvider, SESSION_TIMEOUT_MS } = await import('./features/session');
      const provider = createSessionProvider(`${cfg.rootUrl}/api/session`);
      const session = await provider.get(AbortSignal.timeout(SESSION_TIMEOUT_MS));
      if (session.signedIn) {
        // Phase 2: swap the reserved right-hand slot's contents. The slot is
        // already sized for it, so nothing else in the bar moves.
      }
    }
  });
}

// The bar only needs <body> to exist — it does not need the document parsed.
// On the common embed pattern (script near the top of <body>) that is already
// true, so the header can be built during parse instead of after it.
if (document.body) start();
else document.addEventListener('DOMContentLoaded', start, { once: true });
