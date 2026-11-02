/**
 * Applies a filter form as it changes, so it needs no Apply button.
 *
 * A form with data-live-filters="#results" fetches its own page again with the form's query when a
 * select or checkbox changes, a date picker closes having changed, or a search is typed in (after a
 * pause), then swaps the element the attribute names for its fresh copy and keeps the address in
 * step. Only the results change, so typing is not interrupted. Should the fetch fail, or the page
 * have no such element, the form submits as usual. Keep a submit button (it can be visually hidden)
 * so Enter still works without the script.
 */
export class LiveFilters {
  constructor() {
    this.forms = new WeakSet();
  }

  mount(form) {
    if (this.forms.has(form)) return;
    this.forms.add(form);

    const selector = form.dataset.liveFilters;
    let pending = null;
    let timer = null;

    const apply = async () => {
      clearTimeout(timer);
      const url = new URL(form.action || window.location.href, window.location.href);
      url.search = new URLSearchParams(new FormData(form)).toString();
      const results = selector ? document.querySelector(selector) : null;
      if (!results) {
        window.location.assign(url);
        return;
      }

      pending?.abort();
      pending = new AbortController();
      try {
        const response = await fetch(url, { signal: pending.signal, headers: { Accept: 'text/html' } });
        const fresh = new DOMParser().parseFromString(await response.text(), 'text/html').querySelector(selector);
        if (!response.ok || !fresh) throw new Error(`Filtering returned ${response.status}`);
        results.replaceWith(fresh);
        window.history.replaceState(window.history.state, '', url);
        form.dispatchEvent(new CustomEvent('live-filters:update', { detail: { url: url.href } }));
      } catch (error) {
        if (error.name !== 'AbortError') window.location.assign(url);
      }
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      apply();
    });
    form.addEventListener('change', (event) => {
      if (event.target.localName !== 'p-datetime' && event.target.type !== 'search') apply();
    });
    form.addEventListener('input', (event) => {
      if (event.target.type !== 'search') return;
      clearTimeout(timer);
      timer = setTimeout(apply, 300);
    });
    form.addEventListener('p-datetime:close', (event) => {
      if (event.detail?.changed) apply();
    });
  }

  static enhanceAll(selector = '[data-live-filters]', root = document) {
    const instance = new LiveFilters();
    root.querySelectorAll(selector).forEach(form => instance.mount(form));
    return instance;
  }
}
