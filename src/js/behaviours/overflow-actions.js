import { Toggle } from './toggle.js';

const ACTIONBAR_MORE_ICON = '<svg class="icon" viewBox="0 0 24 24"><path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/></svg>';
const OVERFLOW_RANK = { low: 1, medium: 2 };
let overflowMenuCount = 0;

/**
 * Folds lower-priority actions into a "more" menu when they don't fit.
 *
 * Mark a container with data-overflow-actions and give foldable children data-priority="low"
 * (folded first) or "medium". Containers in the same boundary (data-overflow-boundary, else the
 * nearest .table__wrapper, else the container itself) fold together, so table rows stay
 * aligned. A boundary is full when it scrolls sideways or when protected text inside it is cut
 * off: text inputs in a table, or anything marked data-overflow-protect. The script only
 * measures and sets data-overflow-level on the boundary; the stylesheet hides what that level
 * folds. The menu is built when it opens: buttons and links
 * become items that click the original, and a switch or checkbox becomes a menuitemcheckbox kept
 * in sync. Items take their text from data-label, then aria-label, then the action's own text.
 */
export class OverflowActions {
  // Shared by every instance, so content enhanced later joins its boundary's group
  static elements = new WeakMap();
  static groups = new WeakMap();

  mount(container, options = {}) {
    if (OverflowActions.elements.has(container)) return;
    if (![...container.children].some(el => el.dataset.priority in OVERFLOW_RANK)) return;

    container.setAttribute('data-overflow-actions', '');
    // A copied row brings the original's menu along; it gets a fresh one
    container.querySelector(':scope > [data-overflow-more]')?.remove();
    this._createMore(container, options);

    const selector = container.dataset.overflowBoundary;
    const boundary = options.boundary || (selector && container.closest(selector)) || container.closest('.table__wrapper') || container;
    OverflowActions.elements.set(container, { boundary });

    let group = OverflowActions.groups.get(boundary);
    if (!group) {
      group = { boundary, members: new Set(), protect: options.protect || 'input.table__control, [data-overflow-protect]' };
      OverflowActions.groups.set(boundary, group);
      new ResizeObserver(() => this._schedule(group)).observe(boundary);
    }
    group.members.add(container);
    this._schedule(group);
  }

  /** Fit on the next frame, once layout has settled, running at most once per frame. */
  _schedule(group) {
    if (group.pending) return;
    group.pending = requestAnimationFrame(() => {
      group.pending = 0;
      this._fit(group);
    });
  }

  _createMore(container, { moreClass = 'dropdown dropdown--right', triggerClass = 'btn btn--ghost btn--icon btn--sm dropdown__trigger' }) {
    const id = `overflow-menu-${++overflowMenuCount}`;
    const more = document.createElement('div');
    more.className = moreClass;
    more.setAttribute('data-overflow-more', '');
    more.innerHTML = `<button type="button" class="${triggerClass}" aria-label="More actions" aria-haspopup="menu" data-toggle data-toggle-target="#${id}" data-toggle-capture="true">${ACTIONBAR_MORE_ICON}</button>`
      + `<div class="dropdown__menu" id="${id}" role="menu" popover="manual"></div>`;
    // Capture phase, so the menu is filled before Toggle opens it
    more.addEventListener('click', (e) => {
      if (e.target.closest('.dropdown__trigger')) this._fillMenu(container, more.querySelector('[role="menu"]'));
    }, true);
    container.append(more);
  }

  /** Raise the boundary's level one priority at a time until it no longer overflows. */
  _fit(group) {
    const members = [...group.members].filter(member => member.isConnected);
    group.members = new Set(members);
    const ranks = new Set(members.flatMap(member => [...member.children].map(el => OVERFLOW_RANK[el.dataset.priority]).filter(Boolean)));
    for (const level of [0, ...[...ranks].sort()]) {
      group.boundary.dataset.overflowLevel = level;
      if (!this._overflows(group)) break;
    }
  }

  /**
   * Tables and flex rows squeeze content rather than scrolling, so a boundary also counts as
   * full when protected text inside it can no longer show in full.
   */
  _overflows({ boundary, protect }) {
    if (boundary.scrollWidth > boundary.clientWidth) return true;
    return [...boundary.querySelectorAll(protect)].some(el => el.scrollWidth > el.clientWidth + 1);
  }

  _fillMenu(container, menu) {
    const level = Number(OverflowActions.elements.get(container).boundary.dataset.overflowLevel) || 0;
    const folded = [...container.children].filter(el => OVERFLOW_RANK[el.dataset.priority] <= level);
    menu.replaceChildren(...folded.map(source => this._menuItem(source)));
  }

  _menuItem(source) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'dropdown__item';
    const icon = source.matches('a, button') && source.querySelector('svg.icon');
    if (icon) {
      const copy = icon.cloneNode(true);
      copy.classList.add('dropdown__item-icon');
      item.append(copy);
    }
    const text = document.createElement('span');
    text.className = 'dropdown__item-text';
    text.textContent = source.dataset.label || source.getAttribute('aria-label') || source.textContent.trim();
    item.append(text);

    const input = source.querySelector('input[type="checkbox"]');
    if (input) {
      item.setAttribute('role', 'menuitemcheckbox');
      item.setAttribute('aria-checked', String(input.checked));
      item.insertAdjacentHTML('beforeend', '<svg class="icon dropdown__item-check" viewBox="0 0 24 24"><path d="M5 12l5 5l10 -10"/></svg>');
      item.addEventListener('click', () => {
        input.click();
        item.setAttribute('aria-checked', String(input.checked));
      });
    } else {
      item.setAttribute('role', 'menuitem');
      const target = source.matches('a, button') ? source : source.querySelector('a, button');
      item.addEventListener('click', () => {
        Toggle.closeAll();
        target?.click();
      });
    }
    return item;
  }

  static enhanceAll(selector = '[data-overflow-actions]', root = document) {
    const instance = new OverflowActions();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}
