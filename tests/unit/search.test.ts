import { beforeEach, describe, expect, it } from 'vitest';
import type { HeaderConfig } from '../../src/config';
import { initSearch, scopedQuery, siteDomain } from '../../src/features/search';
import { barMarkup } from '../../src/template';

const cfg: HeaderConfig = {
  version: '4.0.0-test',
  rootUrl: 'universityheader.test',
  gtmId: null,
  searchUrl: 'https://search.ucf.edu/',
  wideBreakpoint: false,
  fullWidth: false,
  siteScopeDefault: false,
};

const DOMAIN = 'cah.ucf.edu';

/**
 * Renders the bar against a fixed domain. mount() reads the real
 * `window.location`, which under jsdom is a hostname these assertions should
 * not be pinned to, so the markup is built directly here instead.
 */
function setup(overrides: Partial<HeaderConfig> = {}, domain: string | null = DOMAIN) {
  document.body.innerHTML = '<div id="ucfhb"></div>';
  const host = document.getElementById('ucfhb') as HTMLElement;
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = barMarkup({ ...cfg, ...overrides }, { signedIn: false }, domain);
  return { root, controller: initSearch(root, document, domain) };
}

const opt = (root: ShadowRoot, scope: string) =>
  root.querySelector<HTMLButtonElement>(`.scope-opt[data-scope="${scope}"]`);

describe('siteDomain', () => {
  it('reports the page hostname', () => {
    expect(siteDomain({ hostname: 'www.cah.ucf.edu' })).toBe('www.cah.ucf.edu');
  });

  /*
   * `site:` is a prefix match, so trimming `www.` off `www.ucf.edu` would widen
   * the search to every subdomain of the university — the exact thing the
   * visitor narrowed away from. The hostname is used verbatim.
   */
  it('does not trim www, which would widen the scope rather than narrow it', () => {
    expect(siteDomain({ hostname: 'www.ucf.edu' })).toBe('www.ucf.edu');
  });

  it('reports nothing when there is no hostname to scope to', () => {
    expect(siteDomain({ hostname: '' })).toBeNull();
  });
});

describe('scopedQuery', () => {
  it('leaves a UCF-wide search alone', () => {
    expect(scopedQuery('financial aid', DOMAIN, 'ucf')).toBe('financial aid');
  });

  it('prefixes the site operator when scoped', () => {
    expect(scopedQuery('financial aid', DOMAIN, 'site')).toBe('site:cah.ucf.edu financial aid');
  });

  it('does nothing without a domain', () => {
    expect(scopedQuery('financial aid', null, 'site')).toBe('financial aid');
  });

  it('leaves an empty query empty rather than submitting a bare operator', () => {
    expect(scopedQuery('   ', DOMAIN, 'site')).toBe('   ');
  });

  // The visitor has been more specific than the toggle can be. Two site:
  // operators return nothing on every engine that supports one.
  it.each(['site:math.ucf.edu calculus', 'calculus site:math.ucf.edu'])(
    'does not stack onto a query that already scopes itself: %s',
    (q) => {
      expect(scopedQuery(q, DOMAIN, 'site')).toBe(q);
    },
  );
});

describe('scope picker', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('starts on UCF and offers both scopes', () => {
    const { root, controller } = setup();
    expect(controller?.scope()).toBe('ucf');
    expect(opt(root, 'ucf')?.getAttribute('aria-checked')).toBe('true');
    expect(opt(root, 'site')?.getAttribute('aria-checked')).toBe('false');
  });

  it('starts on Site when the flag asks for it', () => {
    const { root, controller } = setup({ siteScopeDefault: true });
    expect(controller?.scope()).toBe('site');
    expect(opt(root, 'site')?.getAttribute('aria-checked')).toBe('true');
  });

  it('is not offered at all when there is no domain to scope to', () => {
    const { root, controller } = setup({}, null);
    expect(root.querySelector('.scope')).toBeNull();
    expect(controller?.scope()).toBe('ucf');
  });

  it('switches scope on click', () => {
    const { root, controller } = setup();
    opt(root, 'site')?.click();

    expect(controller?.scope()).toBe('site');
    expect(root.querySelector<HTMLElement>('.search')?.dataset.scope).toBe('site');
    expect(opt(root, 'site')?.getAttribute('aria-checked')).toBe('true');
    expect(opt(root, 'ucf')?.getAttribute('aria-checked')).toBe('false');
  });

  // The name is what makes the mode legible: "Search cah.ucf.edu" says what
  // Enter will do better than a highlighted pill does on its own.
  it('renames the field after the thing being searched', () => {
    const { root } = setup();
    const input = root.querySelector<HTMLInputElement>('.search-input');
    const label = root.querySelector<HTMLElement>('label[for="ucfhb-q"]');

    expect(input?.placeholder).toBe('Search UCF');

    opt(root, 'site')?.click();
    expect(input?.placeholder).toBe('Search cah.ucf.edu');
    expect(label?.textContent).toBe('Search cah.ucf.edu');

    opt(root, 'ucf')?.click();
    expect(input?.placeholder).toBe('Search UCF');
    expect(label?.textContent).toBe('Search UCF');
  });

  it('keeps the picker out of the tab order until the panel is open', () => {
    const { root, controller } = setup();
    expect(opt(root, 'ucf')?.tabIndex).toBe(-1);

    controller?.open();
    // Roving tabindex: the group is one tab stop, on the checked option.
    expect(opt(root, 'ucf')?.tabIndex).toBe(0);
    expect(opt(root, 'site')?.tabIndex).toBe(-1);

    controller?.close();
    expect(opt(root, 'ucf')?.tabIndex).toBe(-1);
    expect(opt(root, 'site')?.tabIndex).toBe(-1);
  });

  it.each(['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'])(
    '%s moves between the two scopes and selects as it goes',
    (key) => {
      const { root, controller } = setup();
      controller?.open();

      root
        .querySelector('.scope')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

      expect(controller?.scope()).toBe('site');
      expect(opt(root, 'site')?.tabIndex).toBe(0);
    },
  );

  it('ignores keys that are not arrows, so Escape still closes the panel', () => {
    const { root, controller } = setup();
    controller?.open();
    root
      .querySelector('.scope')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(controller?.scope()).toBe('ucf');
    expect(root.querySelector('.search')?.classList.contains('is-open')).toBe(false);
  });
});

describe('submitting a scoped search', () => {
  /**
   * jsdom cannot navigate, so the submit is cancelled — but the field is read
   * synchronously during the event either way, which is the property under
   * test. The real navigation is covered in e2e.
   */
  function submit(overrides: Partial<HeaderConfig> = {}, domain: string | null = DOMAIN) {
    const { root, controller } = setup(overrides, domain);
    const input = root.querySelector<HTMLInputElement>('.search-input') as HTMLInputElement;
    const form = root.querySelector<HTMLFormElement>('.search-form') as HTMLFormElement;

    let sent: string | null = null;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sent = input.value;
    });

    return {
      root,
      input,
      controller,
      send(query: string) {
        input.value = query;
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        return sent;
      },
    };
  }

  it('sends the query unchanged in UCF scope', () => {
    const { send } = submit();
    expect(send('financial aid')).toBe('financial aid');
  });

  it('sends the site operator in Site scope', () => {
    const { send, root, controller } = submit();
    controller?.open();
    opt(root, 'site')?.click();
    expect(send('financial aid')).toBe('site:cah.ucf.edu financial aid');
  });

  /*
   * The operator is a wire-format detail, not something the visitor typed. It
   * goes in for the duration of the submit and comes straight back out, so a
   * bfcache restore shows the field the way they left it.
   */
  it('puts the field back the way the visitor left it', async () => {
    const { send, root, input, controller } = submit();
    controller?.open();
    opt(root, 'site')?.click();
    send('financial aid');

    await new Promise((r) => setTimeout(r, 0));
    expect(input.value).toBe('financial aid');
  });

  it('does not submit a bare operator for an empty field', () => {
    const { send, root, controller } = submit();
    controller?.open();
    opt(root, 'site')?.click();
    expect(send('')).toBe('');
  });
});
