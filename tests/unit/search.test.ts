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

const pointerClick = (el: Element | null) =>
  el?.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));

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

  // The visitor has been more specific than the picker can be. Two site:
  // operators return nothing.
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

  it('starts on UCF', () => {
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

  it('switches scope on click, moving the one tab stop with it', () => {
    const { root, controller } = setup();
    pointerClick(opt(root, 'site'));

    expect(controller?.scope()).toBe('site');
    expect(root.querySelector<HTMLElement>('.search')?.dataset.scope).toBe('site');
    expect(opt(root, 'site')?.getAttribute('aria-checked')).toBe('true');
    expect(opt(root, 'ucf')?.getAttribute('aria-checked')).toBe('false');
    expect(opt(root, 'site')?.tabIndex).toBe(0);
    expect(opt(root, 'ucf')?.tabIndex).toBe(-1);
  });

  // The name is what makes the mode legible: "Search cah.ucf.edu" says what
  // Enter will do better than a highlighted pill does on its own.
  it('renames the field after the thing being searched', () => {
    const { root } = setup();
    const input = root.querySelector<HTMLInputElement>('.search-input');
    const label = root.querySelector<HTMLElement>('label[for="ucfhb-q"]');

    expect(input?.placeholder).toBe('Search UCF');

    pointerClick(opt(root, 'site'));
    expect(input?.placeholder).toBe('Search cah.ucf.edu');
    expect(label?.textContent).toBe('Search cah.ucf.edu');

    pointerClick(opt(root, 'ucf'));
    expect(input?.placeholder).toBe('Search UCF');
    expect(label?.textContent).toBe('Search UCF');
  });

  // Choosing a scope mid-query should not make the visitor click back into
  // the field to keep typing.
  it('hands focus back to the field after a pointer click', () => {
    const { root, controller } = setup();
    controller?.open();
    pointerClick(opt(root, 'site'));
    expect(root.activeElement?.classList.contains('search-input')).toBe(true);
  });

  it('leaves focus on the option after a keyboard click', () => {
    const { root, controller } = setup();
    controller?.open();
    opt(root, 'site')?.focus();
    // Space and Enter on a <button> fire a click with detail 0.
    opt(root, 'site')?.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    expect(root.activeElement?.classList.contains('scope-opt')).toBe(true);
  });

  it.each(['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'])(
    '%s moves to the other scope and selects it',
    (key) => {
      const { root, controller } = setup();
      controller?.open();

      opt(root, 'ucf')?.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
      );

      expect(controller?.scope()).toBe('site');
      expect(root.activeElement).toBe(opt(root, 'site'));
    },
  );

  it('ignores keys that are not arrows, so Escape still closes the panel', () => {
    const { root, controller } = setup();
    controller?.open();
    opt(root, 'ucf')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(controller?.scope()).toBe('ucf');
    expect(root.querySelector('.search')?.classList.contains('is-open')).toBe(false);
  });

  // A click on the shelf is a click inside the panel, not an outside click.
  it('does not close the panel when a scope is chosen', () => {
    const { root, controller } = setup();
    controller?.open();
    opt(root, 'site')?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(root.querySelector('.search')?.classList.contains('is-open')).toBe(true);
  });
});

describe('submitting a scoped search', () => {
  /**
   * jsdom cannot navigate, so the submit is cancelled — but the field is read
   * synchronously during the event either way, which is the property under
   * test. The real navigation is covered in e2e.
   */
  function submit(overrides: Partial<HeaderConfig> = {}) {
    const { root, controller } = setup(overrides);
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

  it('sends the query unchanged when searching all of UCF', () => {
    expect(submit().send('financial aid')).toBe('financial aid');
  });

  it('sends the site operator when searching this site', () => {
    const { send, root } = submit();
    pointerClick(opt(root, 'site'));
    expect(send('financial aid')).toBe('site:cah.ucf.edu financial aid');
  });

  it('sends the site operator straight away under use-site-search-default', () => {
    expect(submit({ siteScopeDefault: true }).send('financial aid')).toBe(
      'site:cah.ucf.edu financial aid',
    );
  });

  /*
   * The operator is a wire-format detail, not something the visitor typed. It
   * goes in for the duration of the submit and comes straight back out, so a
   * bfcache restore shows the field the way they left it.
   */
  it('puts the field back the way the visitor left it', async () => {
    const { send, root, input } = submit();
    pointerClick(opt(root, 'site'));
    send('financial aid');

    await new Promise((r) => setTimeout(r, 0));
    expect(input.value).toBe('financial aid');
  });

  it('does not submit a bare operator for an empty field', () => {
    const { send, root } = submit();
    pointerClick(opt(root, 'site'));
    expect(send('')).toBe('');
  });
});
