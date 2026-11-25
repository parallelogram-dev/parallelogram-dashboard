/**
 * A command palette: ⌘K (Ctrl+K elsewhere) opens it, typing narrows it, the arrow keys move
 * through it and Enter goes.
 *
 * The palette is a .command overlay holding a .command__dialog, a .command__input and a
 * .command__list of .command__item links or buttons in .command__group sections. Typing hides
 * items whose title (and any data-command-keywords) don't match. With data-command-source="url",
 * typing two or more characters also fetches url?q=… for JSON, shown above the palette's own
 * items as further groups:
 *
 *   { "groups": [{ "label": "Websites", "items": [{ "title": "…", "description": "…", "url": "…" }] }] }
 *
 * Anything marked [data-command-open] opens it, and [data-command-close] (such as the backdrop)
 * or Escape closes it, returning focus to where it was. Choosing an item dispatches
 * command:select on the palette with { item } before the item's own link or click runs.
 */
export class CommandPalette {
  static #mounted = new WeakSet();

  mount(palette) {
    if (CommandPalette.#mounted.has(palette)) return;
    CommandPalette.#mounted.add(palette);

    const input = palette.querySelector('.command__input');
    const list = palette.querySelector('.command__list');
    const empty = palette.querySelector('.command__empty');
    const source = palette.dataset.commandSource;
    let results = null;
    let returnFocus = null;
    let timer = null;
    let pending = null;
    let searching = false;

    const items = () => [...list.querySelectorAll('.command__item')].filter(item => !item.closest('[hidden]') && !item.hidden);
    const selected = () => list.querySelector('.command__item[aria-selected="true"]');

    const select = (item) => {
      list.querySelectorAll('.command__item[aria-selected="true"]').forEach(other => other.setAttribute('aria-selected', 'false'));
      if (!item) {
        input.removeAttribute('aria-activedescendant');
        return;
      }
      item.setAttribute('aria-selected', 'true');
      if (!item.id) item.id = `command-item-${Math.random().toString(36).slice(2, 9)}`;
      input.setAttribute('aria-activedescendant', item.id);
      item.scrollIntoView({ block: 'nearest' });
    };

    const filter = () => {
      const query = input.value.trim().toLowerCase();
      list.querySelectorAll('.command__item:not([data-command-result])').forEach((item) => {
        const text = `${item.textContent} ${item.dataset.commandKeywords ?? ''}`.toLowerCase();
        item.hidden = query !== '' && !text.includes(query);
      });
      list.querySelectorAll('.command__group').forEach((group) => {
        group.hidden = !group.querySelector('.command__item:not([hidden])');
      });
      if (empty) empty.hidden = items().length > 0 || searching;
      select(items()[0]);
    };

    const render = (groups) => {
      results?.remove();
      results = document.createElement('div');
      groups.filter(group => group.items?.length).forEach((group) => {
        const section = document.createElement('div');
        section.className = 'command__group';
        section.setAttribute('role', 'group');
        const heading = document.createElement('div');
        heading.className = 'command__group-heading';
        heading.textContent = group.label ?? '';
        section.append(heading);
        group.items.forEach((result) => {
          const link = document.createElement('a');
          link.className = 'command__item';
          link.href = result.url;
          link.setAttribute('role', 'option');
          link.setAttribute('aria-selected', 'false');
          link.dataset.commandResult = '';
          const content = document.createElement('span');
          content.className = 'command__item-content';
          const title = document.createElement('span');
          title.className = 'command__item-title';
          title.textContent = result.title ?? '';
          content.append(title);
          if (result.description) {
            const description = document.createElement('span');
            description.className = 'command__item-description';
            description.textContent = result.description;
            content.append(description);
          }
          link.append(content);
          section.append(link);
        });
        results.append(section);
      });
      list.prepend(results);
      filter();
    };

    const search = () => {
      clearTimeout(timer);
      const query = input.value.trim();
      if (!source || query.length < 2) {
        searching = false;
        render([]);
        return;
      }
      searching = true;
      filter();
      timer = setTimeout(async () => {
        pending?.abort();
        pending = new AbortController();
        try {
          const url = new URL(source, window.location.href);
          url.searchParams.set('q', query);
          const response = await fetch(url, { signal: pending.signal, headers: { Accept: 'application/json' } });
          const data = response.ok ? await response.json() : { groups: [] };
          if (input.value.trim() === query) {
            searching = false;
            render(data.groups ?? []);
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            searching = false;
            render([]);
          }
        }
      }, 200);
    };

    const open = () => {
      if (palette.hasAttribute('open')) return;
      returnFocus = document.activeElement;
      palette.setAttribute('open', '');
      palette.removeAttribute('aria-hidden');
      input.value = '';
      render([]);
      requestAnimationFrame(() => input.focus());
    };

    const close = () => {
      if (!palette.hasAttribute('open')) return;
      palette.removeAttribute('open');
      palette.setAttribute('aria-hidden', 'true');
      returnFocus?.focus?.();
    };

    const choose = (item) => {
      if (!item) return;
      palette.dispatchEvent(new CustomEvent('command:select', { bubbles: true, detail: { item } }));
      close();
      item.click();
    };

    document.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (palette.hasAttribute('open')) close();
        else open();
      }
    });
    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-command-open]')) {
        event.preventDefault();
        open();
      }
    });
    palette.addEventListener('click', (event) => {
      if (event.target.closest('[data-command-close]')) {
        close();
        return;
      }
      const item = event.target.closest('.command__item');
      if (item && event.isTrusted) {
        palette.dispatchEvent(new CustomEvent('command:select', { bubbles: true, detail: { item } }));
        close();
      }
    });
    input.addEventListener('input', () => {
      filter();
      search();
    });
    palette.addEventListener('keydown', (event) => {
      const visible = items();
      const index = visible.indexOf(selected());
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        select(visible[(index + 1) % visible.length]);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        select(visible[(index - 1 + visible.length) % visible.length]);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        choose(selected());
      } else if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        input.focus();
      }
    });

    palette.setAttribute('aria-hidden', 'true');
  }

  static enhanceAll(selector = '[data-command-palette]', root = document) {
    const instance = new CommandPalette();
    root.querySelectorAll(selector).forEach(palette => instance.mount(palette));
    return instance;
  }
}
