/**
 * Parallelogram Dashboard - Main JavaScript
 *
 * Standalone browser script for dashboard component interactivity.
 * Uses progressive enhancement - components work without JS but are enhanced when loaded.
 *
 * State lives in native and ARIA attributes (aria-expanded, aria-selected, hidden, open);
 * the stylesheet reads those, so no state classes are toggled here.
 */

// ============================================================================
// Accordion Component
// ============================================================================

class Accordion {
  constructor(options = {}) {
    this.multiple = options.multiple || false;
    this.elements = new WeakMap();
  }

  mount(element) {
    if (this.elements.has(element)) return;

    const items = element.querySelectorAll('.accordion__item');
    // <details> items toggle natively; only button triggers need wiring
    const triggers = element.querySelectorAll('button.accordion__trigger');
    const multiple = element.dataset.accordionMultiple === 'true';

    const state = {
      items: [...items],
      triggers: [...triggers],
      multiple: multiple,
    };

    triggers.forEach(trigger => {
      linkTrigger(trigger, trigger.closest('.accordion__item')?.querySelector('.accordion__content'));
      trigger.addEventListener('click', (e) => this._handleTriggerClick(e, element, state));
    });

    element.setAttribute('data-accordion-enhanced', 'true');
    this.elements.set(element, state);
  }

  _handleTriggerClick(event, element, state) {
    event.preventDefault();
    const trigger = event.currentTarget;
    const item = trigger.closest('.accordion__item');

    if (!item) return;

    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    // Close other items if multiple is not allowed
    if (!state.multiple && !isOpen) {
      state.triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
    }

    trigger.setAttribute('aria-expanded', String(!isOpen));
  }

  static enhanceAll(selector = '[data-accordion]', root = document) {
    const instance = new Accordion();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

// ============================================================================
// Collapsible Component
// ============================================================================

/**
 * Wires a .collapsible whose trigger is a <button>; <details class="collapsible"> needs no JS.
 */
class Collapsible {
  constructor() {
    this.elements = new WeakSet();
  }

  mount(element) {
    if (this.elements.has(element)) return;

    const trigger = element.querySelector(':scope > button.collapsible__trigger');
    if (!trigger) return;

    linkTrigger(trigger, element.querySelector(':scope > .collapsible__content'));
    trigger.addEventListener('click', () => {
      trigger.setAttribute('aria-expanded', String(trigger.getAttribute('aria-expanded') !== 'true'));
    });

    this.elements.add(element);
  }

  static enhanceAll(selector = '.collapsible', root = document) {
    const instance = new Collapsible();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

let generatedId = 0;

/**
 * Give an element an id if it has none, so ARIA relationships can point at it.
 */
function ensureId(element, prefix) {
  if (!element.id) {
    generatedId += 1;
    element.id = `${prefix}-${generatedId}`;
  }
  return element.id;
}

function isDisabled(element) {
  return element.disabled || element.getAttribute('aria-disabled') === 'true';
}

/**
 * Point a disclosure button at the region it controls and make sure it never submits a form.
 */
function linkTrigger(trigger, region) {
  if (!trigger.hasAttribute('type')) trigger.type = 'button';
  if (!trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');
  if (region) trigger.setAttribute('aria-controls', ensureId(region, 'disclosure'));
}

// ============================================================================
// Dropdown Submenu
// ============================================================================

/**
 * Lets keyboard and touch users open a .dropdown__submenu; pointer hover is handled in CSS.
 *
 * Click or ArrowRight on the trigger opens it and focuses the first item; ArrowLeft or Escape
 * inside it closes it and returns focus to the trigger.
 */
class Submenu {
  constructor() {
    this.elements = new WeakSet();
  }

  mount(element) {
    if (this.elements.has(element)) return;

    const trigger = element.querySelector(':scope > .dropdown__submenu-trigger');
    const content = element.querySelector(':scope > .dropdown__submenu-content');
    if (!trigger || !content) return;

    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-controls', ensureId(content, 'submenu'));
    if (!trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');

    const firstItem = () => content.querySelector('[role^="menuitem"]:not(:disabled), button:not(:disabled), a[href]');
    const open = (focus) => {
      trigger.setAttribute('aria-expanded', 'true');
      if (focus) firstItem()?.focus();
    };
    const close = () => {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    };

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (trigger.getAttribute('aria-expanded') === 'true') {
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        open(e.detail === 0);
      }
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        open(true);
      }
    });
    content.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    });
    element.addEventListener('focusout', (e) => {
      if (!element.contains(e.relatedTarget)) trigger.setAttribute('aria-expanded', 'false');
    });

    this.elements.add(element);
  }

  static enhanceAll(selector = '.dropdown__submenu', root = document) {
    const instance = new Submenu();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

// ============================================================================
// Tabs Component
// ============================================================================

class Tabs {
  constructor() {
    this.elements = new WeakMap();
  }

  mount(element) {
    if (this.elements.has(element)) return;

    const tabsList = element.querySelector('[data-tabs-list]');
    const tabsContainer = element.querySelector('[data-tabs-panels]');

    if (!tabsList || !tabsContainer) return;

    const tabs = [...tabsList.querySelectorAll('[data-tab]')];
    const panels = [...tabsContainer.querySelectorAll('[data-tab-panel]')];

    if (tabs.length === 0 || panels.length === 0) return;

    const state = {
      tabsList,
      tabsContainer,
      tabs,
      panels,
      activeTab: null,
    };

    // Setup ARIA
    tabsList.setAttribute('role', 'tablist');
    tabs.forEach(tab => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');
      const panel = panels.find(p => p.id === tab.dataset.tab);
      if (panel) {
        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', ensureId(tab, 'tab'));
      }
    });
    panels.forEach(panel => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('tabindex', '0');
    });

    // The animated variant slides one indicator under the selected tab
    if (element.classList.contains('tabs--animated')) {
      state.indicator = tabsList.querySelector('.tabs__indicator');
      if (!state.indicator) {
        state.indicator = document.createElement('span');
        state.indicator.className = 'tabs__indicator';
        state.indicator.setAttribute('aria-hidden', 'true');
        tabsList.append(state.indicator);
      }
      new ResizeObserver(() => this._moveIndicator(state)).observe(tabsList);
    }

    // Set up click handlers
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => this._handleTabClick(e, element, state));
      tab.addEventListener('keydown', (e) => this._handleKeyDown(e, element, state));
    });

    // Find and activate initial tab
    const activeTab = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs.find(t => !isDisabled(t));
    if (activeTab) {
      this._activateTab(element, activeTab.dataset.tab, state, false);
    }

    element.setAttribute('data-tabs-enhanced', 'true');
    this.elements.set(element, state);
  }

  _handleTabClick(event, element, state) {
    event.preventDefault();
    const tab = event.currentTarget;
    const panelId = tab.dataset.tab;
    if (panelId && !isDisabled(tab)) {
      this._activateTab(element, panelId, state, true);
    }
  }

  _handleKeyDown(event, element, state) {
    // Disabled tabs are skipped rather than focused
    const enabled = state.tabs.filter(tab => !isDisabled(tab));
    const currentIndex = enabled.indexOf(event.currentTarget);
    let targetIndex = -1;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        targetIndex = (currentIndex + 1) % enabled.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        targetIndex = (currentIndex - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        targetIndex = enabled.length - 1;
        break;
    }

    if (targetIndex >= 0 && enabled[targetIndex]) {
      const targetTab = enabled[targetIndex];
      targetTab.focus();
      this._activateTab(element, targetTab.dataset.tab, state, true);
    }
  }

  _activateTab(element, panelId, state, animate = true) {
    state.tabs.forEach(tab => {
      const isActive = tab.dataset.tab === panelId;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    state.panels.forEach(panel => {
      panel.hidden = panel.id !== panelId;
    });

    state.activeTab = panelId;
    this._moveIndicator(state);
  }

  _moveIndicator(state) {
    if (!state.indicator) return;
    const tab = state.tabs.find(t => t.dataset.tab === state.activeTab);
    if (!tab) return;
    state.tabsList.style.setProperty('--tabs-indicator-left', `${tab.offsetLeft}px`);
    state.tabsList.style.setProperty('--tabs-indicator-width', `${tab.offsetWidth}px`);
  }

  static enhanceAll(selector = '[data-tabs]', root = document) {
    const instance = new Tabs();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

// ============================================================================
// Segmented Control
// ============================================================================

/**
 * Keeps exactly one .segmented-control__item pressed: aria-pressed on toggle buttons, or
 * aria-checked when the items are role="radio".
 */
class SegmentedControl {
  constructor() {
    this.elements = new WeakSet();
  }

  mount(element) {
    if (this.elements.has(element)) return;

    const items = [...element.querySelectorAll('.segmented-control__item')];
    if (!items.length) return;

    const attribute = items[0].getAttribute('role') === 'radio' ? 'aria-checked' : 'aria-pressed';
    const select = (selected) => {
      items.forEach(item => item.setAttribute(attribute, String(item === selected)));
      element.dispatchEvent(new CustomEvent('segmented-control:change', { bubbles: true, detail: { item: selected } }));
    };

    items.forEach(item => {
      if (!item.hasAttribute(attribute)) item.setAttribute(attribute, 'false');
      item.addEventListener('click', () => {
        if (!isDisabled(item) && item.getAttribute(attribute) !== 'true') select(item);
      });
    });

    this.elements.add(element);
  }

  static enhanceAll(selector = '.segmented-control', root = document) {
    const instance = new SegmentedControl();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

// ============================================================================
// Toggle Component
// ============================================================================

class Toggle {
  /** Open capture-mode toggles across every instance, so opening one dropdown closes the others. */
  static open = new Map();

  constructor() {
    this.elements = new WeakMap();
  }

  mount(element) {
    if (this.elements.has(element)) return;

    const targetSelector = element.dataset.toggleTarget;
    if (!targetSelector) return;

    const target = document.querySelector(targetSelector);
    if (!target) return;

    const capture = element.dataset.toggleCapture === 'true';
    const manual = element.dataset.toggleManual === 'true';
    // Optional extra class on the target for markup that is not styled from aria-expanded
    const targetClass = element.dataset.toggleClass || '';

    // Optional backdrop shown with the target (e.g. .sidebaroverlay); clicking it closes
    const overlay = element.dataset.toggleOverlay ? document.querySelector(element.dataset.toggleOverlay) : null;

    const state = {
      target,
      targetSelector,
      capture,
      manual,
      targetClass,
      overlay,
      overlayClass: overlay ? `${overlay.classList[0]}--visible` : '',
      isOpen: element.getAttribute('aria-expanded') === 'true'
        || target.hasAttribute('open')
        || (targetClass !== '' && target.classList.contains(targetClass)),
    };

    overlay?.addEventListener('click', () => this.hide(element));

    // A [data-toggle-close] button inside the target closes it and hands focus back to the trigger
    target.querySelectorAll('[data-toggle-close]').forEach((close) => {
      close.addEventListener('click', () => {
        this.hide(element);
        element.focus();
      });
    });

    // Click handler
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle(element);
    });

    // The stylesheet reads aria-expanded on the trigger, so it must always be present
    element.setAttribute('aria-expanded', String(state.isOpen));
    if (target.id) element.setAttribute('aria-controls', target.id);

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen && !state.manual) {
        e.preventDefault();
        this.hide(element);
      }
    });

    // Outside click for capture mode
    if (capture) {
      document.addEventListener('click', (e) => {
        if (state.isOpen && !state.manual && !element.contains(e.target) && !target.contains(e.target)) {
          this.hide(element);
        }
      });
    }

    element.setAttribute('data-toggle-enhanced', 'true');
    this.elements.set(element, state);
    if (state.isOpen && capture && !manual) Toggle.open.set(element, this);
  }

  toggle(element) {
    const state = this.elements.get(element);
    if (!state) return;

    if (state.isOpen) {
      this.hide(element);
    } else {
      this.show(element);
    }
  }

  show(element) {
    const state = this.elements.get(element);
    if (state?.capture && !state.manual) {
      // The trigger's click doesn't reach the document, so other dropdowns never see it as outside
      for (const [other, owner] of Toggle.open) {
        const nested = owner.elements.get(other)?.target.contains(element) || state.target.contains(other);
        if (other !== element && !nested) owner.hide(other);
      }
    }
    this._set(element, true);
  }

  hide(element) {
    this._set(element, false);
  }

  _set(element, open) {
    const state = this.elements.get(element);
    if (!state) return;

    state.isOpen = open;
    element.setAttribute('aria-expanded', String(open));
    if (state.capture && !state.manual) {
      if (open) Toggle.open.set(element, this);
      else Toggle.open.delete(element);
    }

    if (state.targetClass) {
      state.target.classList.toggle(state.targetClass, open);
    }
    if (state.overlay) {
      state.overlay.classList.toggle(state.overlayClass, open);
    }

    // <dialog> and <details> targets carry their own native open state
    if (state.target instanceof HTMLDialogElement || state.target instanceof HTMLDetailsElement) {
      state.target.toggleAttribute('open', open);
    }

    if (state.target.hasAttribute('popover') && state.target.showPopover) {
      this._float(element, state, open);
    }
  }

  /** Show a [popover] menu in the top layer, pinned to its trigger while it is open. */
  _float(element, state, open) {
    const menu = state.target;
    if (state.reposition) {
      window.removeEventListener('scroll', state.reposition, true);
      window.removeEventListener('resize', state.reposition);
      state.reposition = null;
    }
    if (!open) {
      if (menu.matches(':popover-open')) menu.hidePopover();
      return;
    }
    if (!menu.matches(':popover-open')) menu.showPopover();
    state.reposition = () => Toggle._pin(element, menu);
    state.reposition();
    window.addEventListener('scroll', state.reposition, true);
    window.addEventListener('resize', state.reposition);
  }

  /** Place a floating menu under its trigger, flipping above or to the other side when there isn't room. */
  static _pin(trigger, menu) {
    const edge = 8;
    const t = trigger.getBoundingClientRect();
    const m = menu.getBoundingClientRect();
    const alignRight = menu.matches('.dropdown__menu--right') || Boolean(trigger.closest('.dropdown--right, .actionbar__more'));
    let left = alignRight ? t.right - m.width : t.left;
    if (left + m.width > window.innerWidth - edge) left = t.right - m.width;
    const above = t.bottom + m.height > window.innerHeight - edge && t.top - m.height > edge;
    menu.style.right = 'auto';
    menu.style.left = `${Math.max(edge, left)}px`;
    menu.style.top = `${above ? t.top - m.height - 8 : t.bottom}px`;
  }

  /** Close every open dropdown, e.g. when a modal takes over the page. */
  static closeAll() {
    for (const [element, owner] of Toggle.open) owner.hide(element);
  }

  static enhanceAll(selector = '[data-toggle]', root = document) {
    const instance = new Toggle();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

document.addEventListener('p-modal:open', () => Toggle.closeAll());

/**
 * Shows a [data-expandable] element full-screen and back again.
 *
 * A [data-expand] button inside it moves the element into a full-window <dialog> (and back on
 * the next press, Escape or the dialog closing), so its state, focus handling and top-layer
 * menus carry over. While expanded the element has data-expanded and the button aria-pressed;
 * give the button data-expand-label and data-collapse-label to swap its accessible name. The
 * element fires "expandable:change" with { expanded }.
 */
class Expandable {
  static elements = new WeakMap();

  mount(element) {
    if (Expandable.elements.has(element)) return;
    const state = { dialog: null, placeholder: null };
    Expandable.elements.set(element, state);
    element.addEventListener('click', (e) => {
      const button = e.target.closest('[data-expand]');
      if (button && button.closest('[data-expandable]') === element) this.toggle(element);
    });
  }

  toggle(element) {
    const state = Expandable.elements.get(element);
    if (state?.dialog) this.collapse(element);
    else this.expand(element);
  }

  expand(element) {
    const state = Expandable.elements.get(element);
    if (!state || state.dialog) return;
    state.placeholder = document.createComment('expandable');
    element.before(state.placeholder);
    const dialog = document.createElement('dialog');
    dialog.className = 'expandable';
    dialog.setAttribute('aria-label', element.dataset.expandableLabel || 'Full screen');
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      this.collapse(element);
    });
    dialog.append(element);
    document.body.append(dialog);
    state.dialog = dialog;
    dialog.showModal();
    this._changed(element, true);
  }

  collapse(element) {
    const state = Expandable.elements.get(element);
    if (!state?.dialog) return;
    Toggle.closeAll();
    state.placeholder.replaceWith(element);
    state.dialog.close();
    state.dialog.remove();
    state.dialog = null;
    this._changed(element, false);
  }

  _changed(element, expanded) {
    element.toggleAttribute('data-expanded', expanded);
    element.querySelectorAll('[data-expand]').forEach((button) => {
      button.setAttribute('aria-pressed', String(expanded));
      const label = expanded ? button.dataset.collapseLabel : button.dataset.expandLabel;
      if (label) {
        button.setAttribute('aria-label', label);
        if (button.hasAttribute('data-tooltip')) button.dataset.tooltip = label;
      }
    });
    element.querySelector('[data-expand]')?.focus();
    element.dispatchEvent(new CustomEvent('expandable:change', { bubbles: true, detail: { expanded } }));
  }

  static enhanceAll(selector = '[data-expandable]', root = document) {
    const instance = new Expandable();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

/**
 * A column picker for a table.
 *
 * A menu with data-table-columns="#tableId" holds items with data-column-toggle="key"; each
 * shows or hides every cell in that table marked data-column="key", and reflects it with
 * aria-checked. Choices are remembered per table in localStorage, and rows added later follow
 * them. Cells (and picker items) marked data-column-expanded only show while the table is in a
 * [data-expanded] area. A cell marked data-column-span (such as the first cell of a footer row)
 * spans whatever columns are left over.
 */
class TableColumns {
  static elements = new WeakSet();

  mount(menu) {
    if (TableColumns.elements.has(menu)) return;
    const table = document.querySelector(menu.dataset.tableColumns);
    if (!table) return;
    TableColumns.elements.add(menu);
    const key = `pd-table-columns:${table.id}`;
    let hidden = new Set();
    try {
      hidden = new Set(JSON.parse(localStorage.getItem(key)) || []);
    } catch (e) {
      // Storage can be unavailable (private mode, blocked); the picker still works for the visit
    }

    const apply = () => {
      table.querySelectorAll('[data-column]').forEach((cell) => { cell.hidden = hidden.has(cell.dataset.column); });
      menu.querySelectorAll('[data-column-toggle]').forEach((item) => {
        item.setAttribute('role', 'menuitemcheckbox');
        item.setAttribute('aria-checked', String(!hidden.has(item.dataset.columnToggle)));
      });
      TableColumns.span(table);
    };

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('[data-column-toggle]');
      if (!item) return;
      const column = item.dataset.columnToggle;
      if (hidden.has(column)) hidden.delete(column);
      else hidden.add(column);
      try {
        localStorage.setItem(key, JSON.stringify([...hidden]));
      } catch (err) {
        // Not remembered, but still applied
      }
      apply();
    });

    new MutationObserver(apply).observe(table.tBodies[0] || table, { childList: true });
    table.closest('[data-expandable]')?.addEventListener('expandable:change', () => TableColumns.span(table));
    apply();
  }

  /**
   * Sizes each [data-column-span] cell to cover the columns its row's other cells leave, so a
   * footer cell stays lined up as columns are hidden or shown. Uses computed display rather than
   * layout, which also works while the table sits in a hidden tab.
   */
  static span(table) {
    const shown = cell => getComputedStyle(cell).display !== 'none';
    const width = cells => cells.filter(shown).reduce((total, cell) => total + cell.colSpan, 0);
    const head = table.tHead?.rows[0];
    if (!head) return;
    const columns = width([...head.cells]);
    table.querySelectorAll('[data-column-span]').forEach((cell) => {
      const others = [...cell.parentElement.cells].filter(other => other !== cell);
      cell.colSpan = Math.max(1, columns - width(others));
    });
  }

  static enhanceAll(selector = '[data-table-columns]', root = document) {
    const instance = new TableColumns();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

/**
 * Click-to-sort headers that only change the view.
 *
 * In a table with data-table-sort, each .table__head--sortable sorts the rows by its column:
 * ascending, then descending, then back to the natural order. Cells sort by their control's value
 * (a select's chosen text), their data-sort-value, or their text, comparing numbers as numbers and
 * leaving blanks last. The table carries data-sorted while sorted.
 *
 * Every row keeps its natural position while the view is sorted: a row added at the end joins
 * the end, a row inserted after another (a duplicate) follows it, and a row put back keeps its
 * place. Values edited while sorted stay put until the next sort, so rows don't move under the
 * cursor. The table fires "table:sort" with { column, direction }.
 */
class TableSort {
  static elements = new WeakSet();

  static collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

  mount(table) {
    if (TableSort.elements.has(table) || !table.tBodies[0] || table.hasAttribute('data-table-reorder')) return;
    TableSort.elements.add(table);
    const body = table.tBodies[0];
    const ranks = new WeakMap();
    const state = { head: null, direction: null };

    const rerank = () => {
      const rows = [...body.rows];
      if (!state.head) {
        rows.forEach((row, i) => ranks.set(row, i));
        return;
      }
      const ranked = rows.filter(row => ranks.has(row)).map(row => ranks.get(row)).sort((a, b) => a - b);
      rows.forEach((row) => {
        if (ranks.has(row)) return;
        const before = row.previousElementSibling;
        if (!row.nextElementSibling || !before || !ranks.has(before)) {
          ranks.set(row, (ranked.at(-1) ?? 0) + 1);
        } else {
          const after = ranked.find(rank => rank > ranks.get(before));
          ranks.set(row, after === undefined ? ranks.get(before) + 1 : (ranks.get(before) + after) / 2);
        }
        ranked.push(ranks.get(row));
        ranked.sort((a, b) => a - b);
      });
    };

    const sort = (head, direction) => {
      table.querySelectorAll('.table__head--sortable[aria-sort]').forEach(other => other.removeAttribute('aria-sort'));
      state.head = direction ? head : null;
      state.direction = direction;
      if (direction) head.setAttribute('aria-sort', direction);
      table.toggleAttribute('data-sorted', !!direction);

      const order = direction === 'descending' ? -1 : 1;
      const rows = [...body.rows].sort((a, b) => {
        if (!direction) return ranks.get(a) - ranks.get(b);
        const x = TableSort.value(a.cells[head.cellIndex]);
        const y = TableSort.value(b.cells[head.cellIndex]);
        if (!x || !y) return (!x - !y) || ranks.get(a) - ranks.get(b);
        return TableSort.collator.compare(x, y) * order || ranks.get(a) - ranks.get(b);
      });
      observer.disconnect();
      body.append(...rows);
      observer.observe(body, { childList: true });
      table.dispatchEvent(new CustomEvent('table:sort', { bubbles: true, detail: { column: direction ? head : null, direction } }));
    };

    const observer = new MutationObserver(rerank);
    observer.observe(body, { childList: true });
    rerank();

    table.querySelectorAll('.table__head--sortable').forEach((head) => {
      head.tabIndex = 0;
      const next = () => {
        const current = state.head === head ? state.direction : null;
        sort(head, { null: 'ascending', ascending: 'descending', descending: null }[current]);
      };
      head.addEventListener('click', next);
      head.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        next();
      });
    });
  }

  static value(cell) {
    if (!cell) return '';
    if (cell.dataset.sortValue !== undefined) return cell.dataset.sortValue;
    const control = cell.querySelector('input, select, textarea');
    if (control?.tagName === 'SELECT') return control.selectedOptions[0]?.text.trim() ?? '';
    if (control) return control.value.trim();
    return cell.textContent.trim();
  }

  static enhanceAll(selector = '[data-table-sort]', root = document) {
    const instance = new TableSort();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

/**
 * Drag-to-reorder rows in a table with data-table-reorder.
 *
 * Each row's .table__handle cell holds a button. Drag it and the row moves into its landing
 * place as the pointer moves while the other rows slide out of the way; near the top or bottom of
 * the scrolling area the table scrolls. Releasing settles the row; Escape or a cancelled pointer
 * puts it back. With the keyboard, focus a handle and press Space to pick the row up, the up and
 * down arrows to move it, Space to drop it and Escape to cancel. The row being moved carries
 * data-dragging, moves are announced to screen readers, and the table dispatches a bubbling
 * "table:reorder" event with { row, from, to }. A reorderable table has no column sorting.
 */
class TableReorder {
  static elements = new WeakMap();

  mount(table) {
    if (TableReorder.elements.has(table) || !table.tBodies[0]) return;
    const status = document.createElement('div');
    status.className = 'sr-only';
    status.setAttribute('aria-live', 'assertive');
    table.after(status);
    const state = { table, body: table.tBodies[0], status, grabbed: null, origin: null };
    TableReorder.elements.set(table, state);
    state.body.addEventListener('pointerdown', e => this._pointerDown(e, state));
    state.body.addEventListener('keydown', e => this._keyDown(e, state));
  }

  _rowFor(target, state) {
    const handle = target.closest('.table__handle button');
    const row = handle?.closest('tr');
    return row?.parentElement === state.body ? { handle, row } : {};
  }

  _rows(state, except) {
    return [...state.body.rows].filter(row => row !== except && row.offsetParent !== null);
  }

  _name(row) {
    const cell = [...row.cells].find(c => !c.matches('.table__handle, .table__checkbox'));
    return (cell && TableSort.value(cell)) || 'Row';
  }

  _describe(row, state) {
    const rows = this._rows(state);
    return `position ${rows.indexOf(row) + 1} of ${rows.length}`;
  }

  _announce(state, message) {
    state.status.textContent = message;
  }

  _dispatch(state, row) {
    const to = [...state.body.rows].indexOf(row);
    if (to === state.origin) return;
    state.table.dispatchEvent(new CustomEvent('table:reorder', { bubbles: true, detail: { row, from: state.origin, to } }));
  }

  _restore(row, state) {
    const others = [...state.body.rows].filter(other => other !== row);
    state.body.insertBefore(row, others[state.origin] || null);
  }

  _reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** The row's box without any slide animation still running on it, so targets don't flicker. */
  _layoutRect(row) {
    const rect = row.getBoundingClientRect();
    const shift = new DOMMatrixReadOnly(getComputedStyle(row).transform).m42;
    return { top: rect.top - shift, bottom: rect.bottom - shift, height: rect.height };
  }

  /** Run a DOM move, then slide the other rows from where they were to where they now are. */
  _animate(state, row, mutate) {
    const rows = this._rows(state, row);
    const before = new Map(rows.map(other => [other, other.getBoundingClientRect().top]));
    mutate();
    if (this._reducedMotion()) return;
    for (const [other, top] of before) {
      const delta = top - other.getBoundingClientRect().top;
      if (delta) other.animate([{ transform: `translateY(${delta}px)` }, { transform: 'none' }], { duration: 150, easing: 'ease-out' });
    }
  }

  /** Drop the pointer offset and glide the row into its slot, then run done. */
  _settle(row, done) {
    const from = row.getBoundingClientRect().top;
    row.style.transform = '';
    const delta = from - row.getBoundingClientRect().top;
    if (!delta || this._reducedMotion()) {
      done();
      return;
    }
    row.animate([{ transform: `translateY(${delta}px)` }, { transform: 'none' }], { duration: 150, easing: 'ease-out' })
      .finished.then(done, done);
  }

  _dropTarget(state, row, y) {
    let best = null;
    for (const candidate of this._rows(state, row)) {
      const rect = this._layoutRect(candidate);
      const distance = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
      if (!best || distance < best.distance) best = { target: candidate, rect, distance };
    }
    if (!best) return null;
    return { target: best.target, where: (y - best.rect.top) / best.rect.height < 0.5 ? 'before' : 'after' };
  }

  /** The nearest ancestor that scrolls vertically, or the page. */
  _scroller(table) {
    for (let el = table.parentElement; el && el !== document.body; el = el.parentElement) {
      const { overflowY } = getComputedStyle(el);
      if (/(auto|scroll)/.test(overflowY) && el.scrollHeight > el.clientHeight) return el;
    }
    return document.scrollingElement;
  }

  _pointerDown(event, state) {
    const { handle, row } = this._rowFor(event.target, state);
    if (!row || event.button !== 0) return;
    event.preventDefault();
    handle.focus();

    const grabOffset = event.clientY - row.getBoundingClientRect().top;
    const scroller = this._scroller(state.table);
    let pointerY = event.clientY;
    let frame = null;
    state.origin = [...state.body.rows].indexOf(row);
    row.setAttribute('data-dragging', '');

    const follow = () => {
      row.style.transform = '';
      row.style.transform = `translateY(${pointerY - grabOffset - row.getBoundingClientRect().top}px)`;
    };

    const update = () => {
      const next = this._dropTarget(state, row, pointerY);
      const at = next && (next.where === 'before' ? row.nextElementSibling === next.target : next.target.nextElementSibling === row);
      if (next && !at) {
        this._animate(state, row, () => state.body.insertBefore(row, next.where === 'before' ? next.target : next.target.nextElementSibling));
      }
      follow();
    };

    // Scrolls while the pointer is near the top or bottom of the scrolling area
    const edgeScroll = () => {
      const page = scroller === document.scrollingElement;
      const top = page ? 0 : scroller.getBoundingClientRect().top;
      const bottom = page ? window.innerHeight : scroller.getBoundingClientRect().bottom;
      const zone = 48;
      const speed = pointerY < top + zone ? -(top + zone - pointerY) : pointerY > bottom - zone ? pointerY - (bottom - zone) : 0;
      if (speed) {
        scroller.scrollTop += Math.max(-20, Math.min(20, speed / 2));
        update();
      }
      frame = requestAnimationFrame(edgeScroll);
    };
    frame = requestAnimationFrame(edgeScroll);

    const move = (e) => {
      pointerY = e.clientY;
      update();
    };

    const finish = (commit) => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', release);
      document.removeEventListener('pointercancel', cancel);
      document.removeEventListener('keydown', escape, true);
      if (!commit) this._restore(row, state);
      this._settle(row, () => row.removeAttribute('data-dragging'));
      if (commit) {
        this._announce(state, `${this._name(row)} moved to ${this._describe(row, state)}.`);
        this._dispatch(state, row);
      }
    };
    const release = () => finish(true);
    const cancel = () => finish(false);
    const escape = (e) => {
      if (e.key !== 'Escape') return;
      // Handled here so a full-screen dialog doesn't also close
      e.preventDefault();
      e.stopPropagation();
      finish(false);
    };

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', release);
    document.addEventListener('pointercancel', cancel);
    document.addEventListener('keydown', escape, true);
  }

  _keyDown(event, state) {
    const { handle, row } = this._rowFor(event.target, state);
    if (!row) return;
    const name = this._name(row);

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (state.grabbed === row) {
        state.grabbed = null;
        handle.setAttribute('aria-pressed', 'false');
        row.removeAttribute('data-dragging');
        this._announce(state, `${name} dropped at ${this._describe(row, state)}.`);
        this._dispatch(state, row);
      } else {
        state.grabbed = row;
        state.origin = [...state.body.rows].indexOf(row);
        handle.setAttribute('aria-pressed', 'true');
        row.setAttribute('data-dragging', '');
        this._announce(state, `${name} grabbed. Use the up and down arrow keys to move it. Space drops, Escape cancels.`);
      }
      return;
    }

    if (state.grabbed !== row) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this._restore(row, state);
      state.grabbed = null;
      handle.setAttribute('aria-pressed', 'false');
      row.removeAttribute('data-dragging');
      handle.focus();
      this._announce(state, `Move cancelled. ${name} is back at ${this._describe(row, state)}.`);
      return;
    }

    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    const rows = this._rows(state);
    const up = event.key === 'ArrowUp';
    const neighbour = rows[rows.indexOf(row) + (up ? -1 : 1)];
    if (!neighbour) return;

    event.preventDefault();
    this._animate(state, row, () => state.body.insertBefore(row, up ? neighbour : neighbour.nextElementSibling));
    handle.focus();
    handle.scrollIntoView({ block: 'nearest' });
    this._announce(state, `${name} moved to ${this._describe(row, state)}.`);
  }

  static enhanceAll(selector = '[data-table-reorder]', root = document) {
    const instance = new TableReorder();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

/** Text made safe to put inside HTML markup or a quoted attribute. */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

/**
 * Pasting a block copied from a spreadsheet into an editable table.
 *
 * In a table with data-table-paste, pasting more than one cell into a .table__control opens a
 * dialog instead of filling the one field. It previews the block with a column picker above each
 * pasted column (matched by heading when the first row looks like headings, otherwise by position
 * from the column pasted into), and asks whether to update rows starting at the one pasted into
 * or add the block as new rows; lines that run past the last row can become new rows. Values a
 * select has no option for, or text in a number column, are marked and skipped. Give the
 * attribute a <template> selector (data-table-paste="#rowTemplate") to allow adding rows.
 *
 * Applying sets each control's value and fires input and change, so the page's own edit
 * handling runs, then the table fires "table:paste" with { updated, added, undo }.
 */
class TablePaste {
  static elements = new WeakSet();

  static PREVIEW_ROWS = 6;

  mount(table) {
    if (TablePaste.elements.has(table) || !table.tBodies[0]) return;
    TablePaste.elements.add(table);
    table.tBodies[0].addEventListener('paste', (event) => {
      const control = event.target.closest('.table__control');
      const text = event.clipboardData?.getData('text/plain') ?? '';
      if (!control || !/[\t\n]/.test(text.replace(/\r?\n$/, ''))) return;
      const grid = TablePaste.parse(text);
      if (grid.length < 2 && grid[0].length < 2) return;
      event.preventDefault();
      this._open(table, control, grid);
    });
  }

  /** Tab-separated text as copied from a spreadsheet, honouring quoted cells. */
  static parse(text) {
    const rows = [[]];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (quoted) {
        if (char === '"' && text[i + 1] === '"') {
          cell += '"';
          i++;
        } else if (char === '"') {
          quoted = false;
        } else {
          cell += char;
        }
      } else if (char === '"' && cell === '') {
        quoted = true;
      } else if (char === '\t') {
        rows.at(-1).push(cell);
        cell = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && text[i + 1] === '\n') i++;
        rows.at(-1).push(cell);
        cell = '';
        rows.push([]);
      } else {
        cell += char;
      }
    }
    rows.at(-1).push(cell);
    if (rows.length > 1 && rows.at(-1).every(value => value === '')) rows.pop();
    const width = Math.max(...rows.map(row => row.length));
    return rows.map(row => [...row, ...Array(width - row.length).fill('')].map(value => value.trim()));
  }

  /** The table's editable columns: header label and cell index, in order. */
  _columns(table) {
    const sample = [...table.tBodies[0].rows].find(row => row.querySelector('.table__control'));
    const head = table.tHead?.rows[0];
    if (!sample || !head) return [];
    return [...sample.cells]
      .map((cell, index) => ({ index, control: cell.querySelector('.table__control') }))
      .filter(({ control }) => control)
      .map(({ index, control }) => {
        const th = head.cells[index];
        return {
          index,
          label: th?.textContent.trim() || control.getAttribute('aria-label') || `Column ${index + 1}`,
          hidden: th ? getComputedStyle(th).display === 'none' : false,
        };
      });
  }

  /** What a pasted value becomes in a control, or null when it can't go there. */
  static convert(control, value) {
    if (value === '') return '';
    if (control.tagName === 'SELECT') {
      const wanted = value.toLowerCase();
      const option = [...control.options].find(o => o.value.toLowerCase() === wanted || o.text.trim().toLowerCase() === wanted);
      return option ? option.value : null;
    }
    const numeric = control.classList.contains('table__control--number') || /numeric|decimal/.test(control.inputMode);
    if (numeric) {
      const number = value.replace(/[^\d.-]/g, '');
      return /^-?\d*\.?\d+$/.test(number) ? number : null;
    }
    return value;
  }

  _open(table, control, grid) {
    const body = table.tBodies[0];
    const columns = this._columns(table);
    const startRow = control.closest('tr');
    const startIndex = control.closest('td').cellIndex;
    const template = table.dataset.tablePaste ? document.querySelector(table.dataset.tablePaste) : null;
    const labels = columns.map(c => c.label.toLowerCase());
    const headed = grid.length > 1 && grid[0].filter(v => labels.includes(v.toLowerCase())).length >= Math.ceil(grid[0].length / 2);
    const name = (row) => {
      const cell = [...row.cells].find(c => !c.matches('.table__handle, .table__checkbox'));
      return (cell && TableSort.value(cell)) || 'this row';
    };

    const state = { mode: 'update', headed, extend: true, map: [] };
    // By position across the columns on screen, from the one pasted into
    const mapByPosition = () => {
      const visible = columns.map((c, i) => i).filter(i => !columns[i].hidden);
      const start = Math.max(0, visible.findIndex(i => columns[i].index === startIndex));
      return grid[0].map((_, i) => visible[start + i] ?? -1);
    };
    const mapByName = () => grid[0].map(v => labels.indexOf(v.toLowerCase()));
    state.map = headed ? mapByName() : mapByPosition();

    const dialog = document.createElement('dialog');
    dialog.className = 'modal';
    dialog.setAttribute('aria-labelledby', 'tablePasteTitle');
    dialog.innerHTML = `
      <div class="modal__dialog modal__dialog--lg">
        <div class="modal__header">
          <div>
            <h2 class="modal__title" id="tablePasteTitle">Paste into table</h2>
            <p class="modal__description" data-paste-size></p>
          </div>
          <button type="button" class="modal__close" aria-label="Close" data-paste-cancel><svg class="icon" viewBox="0 0 24 24"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg></button>
        </div>
        <div class="modal__content stack stack--md">
          <div class="stack stack--xs" role="radiogroup" aria-label="How to paste">
            <label class="radio"><input type="radio" class="radio__input" name="tablePasteMode" value="update" checked><span class="radio__label">Update rows, starting at ${escapeHtml(name(startRow))}</span></label>
            <label class="radio"><input type="radio" class="radio__input" name="tablePasteMode" value="add"${template ? '' : ' disabled'}><span class="radio__label">Add as new rows at the end</span></label>
          </div>
          <div class="stack stack--xs">
            <label class="checkbox"><input type="checkbox" class="checkbox__input" data-paste-headed${headed ? ' checked' : ''}${grid.length > 1 ? '' : ' disabled'}><span class="checkbox__label">First row is headings</span></label>
            <label class="checkbox" data-paste-extend-option><input type="checkbox" class="checkbox__input" data-paste-extend checked><span class="checkbox__label" data-paste-extend-label></span></label>
          </div>
          <div class="table__wrapper"><table class="table table--compact"><thead class="table__header"></thead><tbody class="table__body"></tbody></table></div>
        </div>
        <div class="modal__footer modal__footer--between">
          <p class="text--sm text--muted" data-paste-summary aria-live="polite"></p>
          <div class="cluster cluster--sm">
            <button type="button" class="btn btn--outline" data-paste-cancel>Cancel</button>
            <button type="button" class="btn btn--primary" data-paste-apply><svg class="icon" viewBox="0 0 24 24"><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"/><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/></svg>Paste</button>
          </div>
        </div>
      </div>`;

    const $ = selector => dialog.querySelector(selector);
    const sampleControls = [...startRow.cells].map(cell => cell.querySelector('.table__control'));
    const rowsBelow = () => {
      const rows = [...body.rows].filter(row => row.offsetParent !== null);
      return rows.slice(rows.indexOf(startRow));
    };

    /** Every value that would be written: { row (or null for a new row), line, column, value }. */
    const plan = () => {
      const lines = state.headed ? grid.slice(1) : grid;
      const existing = state.mode === 'update' ? rowsBelow() : [];
      const writes = [];
      let skipped = 0;
      let added = 0;
      let dropped = 0;
      lines.forEach((line, l) => {
        const row = existing[l] || null;
        if (!row && state.mode === 'update' && !(state.extend && template)) {
          dropped++;
          return;
        }
        if (!row) added++;
        line.forEach((value, i) => {
          const target = columns[state.map[i]];
          if (!target) return;
          const control = (row || startRow).cells[target.index]?.querySelector('.table__control') || sampleControls[target.index];
          const converted = TablePaste.convert(control, value);
          if (converted === null) {
            skipped++;
            return;
          }
          writes.push({ row, line: l, index: target.index, value: converted });
        });
      });
      return { lines, existing, writes, skipped, added, dropped, extra: Math.max(0, lines.length - existing.length) };
    };

    const render = () => {
      const result = plan();
      const options = ['<option value="-1">Skip</option>']
        .concat(columns.map((c, i) => `<option value="${i}">${escapeHtml(c.label)}${c.hidden ? ' (hidden)' : ''}</option>`)).join('');
      $('thead').innerHTML = `<tr class="table__row">${grid[0].map((_, i) => `<th class="table__head"><select class="table__control" data-paste-column="${i}" aria-label="Column ${i + 1} goes into">${options}</select></th>`).join('')}</tr>`;
      dialog.querySelectorAll('[data-paste-column]').forEach((select, i) => { select.value = String(state.map[i]); });

      const shown = result.lines.slice(0, TablePaste.PREVIEW_ROWS);
      const rows = shown.map(line => `<tr class="table__row">${line.map((value, i) => {
        const target = columns[state.map[i]];
        const control = target && sampleControls[target.index];
        const invalid = control && TablePaste.convert(control, value) === null;
        const attrs = !target ? ' data-paste-skipped' : invalid ? ` data-paste-invalid title="${escapeHtml(control.tagName === 'SELECT' ? `Not one of the ${target.label} options` : `${target.label} needs a number`)}"` : '';
        return `<td class="table__cell"${attrs}>${escapeHtml(value) || '<span class="text--muted">–</span>'}</td>`;
      }).join('')}</tr>`);
      if (result.lines.length > shown.length) {
        rows.push(`<tr class="table__row"><td class="table__cell text--muted" colspan="${grid[0].length}">and ${result.lines.length - shown.length} more ${result.lines.length - shown.length === 1 ? 'row' : 'rows'}</td></tr>`);
      }
      $('tbody').innerHTML = rows.join('');

      $('[data-paste-size]').textContent = `${result.lines.length} ${result.lines.length === 1 ? 'row' : 'rows'} × ${grid[0].length} ${grid[0].length === 1 ? 'column' : 'columns'} from the clipboard`;
      $('[data-paste-extend-option]').hidden = !template || state.mode !== 'update' || result.extra === 0;
      $('[data-paste-extend-label]').textContent = `Add ${result.extra} new ${result.extra === 1 ? 'row' : 'rows'} for the lines past the last row`;

      const updatedRows = new Set(result.writes.filter(w => w.row).map(w => w.row)).size;
      const parts = [];
      if (updatedRows) parts.push(`Updates ${updatedRows} ${updatedRows === 1 ? 'row' : 'rows'}`);
      if (result.added) parts.push(`${parts.length ? 'adds' : 'Adds'} ${result.added} ${result.added === 1 ? 'row' : 'rows'}`);
      if (result.skipped) parts.push(`skips ${result.skipped} ${result.skipped === 1 ? 'value' : 'values'}`);
      if (result.dropped) parts.push(`leaves out ${result.dropped} ${result.dropped === 1 ? 'line' : 'lines'} past the last row`);
      $('[data-paste-summary]').textContent = parts.length ? `${parts.join(', ')}.` : 'Nothing to paste with these columns.';
      $('[data-paste-apply]').disabled = !result.writes.length && !result.added;
    };

    const close = () => {
      dialog.close();
      dialog.remove();
      control.focus();
    };

    const apply = () => {
      const result = plan();
      const added = [];
      const previous = [];
      const newRows = new Map();
      result.writes.forEach((write) => {
        let row = write.row;
        if (!row) {
          row = newRows.get(write.line);
          if (!row) {
            row = template.content.querySelector('tr').cloneNode(true);
            row.classList.add('table__row--new');
            body.append(row);
            init(row);
            newRows.set(write.line, row);
            added.push(row);
          }
        }
        const target = row.cells[write.index].querySelector('.table__control');
        if (row === write.row) previous.push({ control: target, value: target.value });
        target.value = write.value;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
      });
      close();
      const updated = [...new Set(result.writes.filter(w => w.row).map(w => w.row))];
      const undo = () => {
        previous.reverse().forEach(({ control: target, value }) => {
          target.value = value;
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.dispatchEvent(new Event('change', { bubbles: true }));
        });
        added.forEach(row => row.remove());
      };
      table.dispatchEvent(new CustomEvent('table:paste', { bubbles: true, detail: { updated, added, undo } }));
    };

    dialog.addEventListener('change', (e) => {
      if (e.target.name === 'tablePasteMode') state.mode = e.target.value;
      else if (e.target.matches('[data-paste-headed]')) {
        state.headed = e.target.checked;
        state.map = state.headed ? mapByName() : mapByPosition();
      } else if (e.target.matches('[data-paste-extend]')) state.extend = e.target.checked;
      else if (e.target.matches('[data-paste-column]')) state.map[Number(e.target.dataset.pasteColumn)] = Number(e.target.value);
      render();
    });
    dialog.addEventListener('click', (e) => {
      if (e.target.closest('[data-paste-cancel]') || e.target === dialog) close();
      else if (e.target.closest('[data-paste-apply]')) apply();
    });
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      close();
    });

    render();
    (table.closest('dialog[open]') || document.body).append(dialog);
    dialog.showModal();
    $('[data-paste-apply]').focus();
  }

  static enhanceAll(selector = '[data-table-paste]', root = document) {
    const instance = new TablePaste();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

/**
 * Scheduled publishing for a record.
 *
 * Inside [data-publish-schedule], the status radios (name="status" with values draft, active and
 * archived) and two optional dates decide what the record shows as: a [data-publish-at] field for
 * when it goes live and a [data-expire-at] field for when it comes down. Each date is switched on
 * by a .segmented-control with data-publish-toggle="#fieldId", whose item marked data-later
 * shows the field; on the other item ("Now", "Never") the field is hidden and disabled, so it
 * isn't submitted but keeps its value.
 *
 * The area gets data-publish-state: "draft", "scheduled" (active, going live later), "live",
 * "expired" (active, past its take-down date) or "archived". Elements marked
 * data-publish-show="scheduled live" only show in the states listed, and [data-publish-date] and
 * [data-expire-date] elements show the dates in words. The area fires "publish:change" with
 * { state, publishAt, expireAt } when the state or a date changes.
 */
class PublishSchedule {
  static elements = new WeakSet();

  static format = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  mount(area) {
    if (PublishSchedule.elements.has(area)) return;
    PublishSchedule.elements.add(area);

    const toggles = [...area.querySelectorAll('[data-publish-toggle]')];
    const fieldFor = toggle => area.querySelector(toggle.dataset.publishToggle);
    const setLater = (toggle, later) => {
      const field = fieldFor(toggle);
      toggle.querySelectorAll('.segmented-control__item').forEach((item) => {
        item.setAttribute('aria-checked', String(item.hasAttribute('data-later') === later));
      });
      if (!field) return;
      field.hidden = !later;
      field.toggleAttribute('disabled', !later);
    };

    // Start on "Later" wherever a date is already set
    toggles.forEach(toggle => setLater(toggle, !!fieldFor(toggle)?.getAttribute('value')));

    let last = '';
    const update = () => {
      const detail = PublishSchedule.state(area);
      area.dataset.publishState = detail.state;
      area.querySelectorAll('[data-publish-date]').forEach((el) => { el.textContent = detail.publishAt ? PublishSchedule.format.format(detail.publishAt) : ''; });
      area.querySelectorAll('[data-expire-date]').forEach((el) => { el.textContent = detail.expireAt ? PublishSchedule.format.format(detail.expireAt) : ''; });
      const key = `${detail.state}|${detail.publishAt}|${detail.expireAt}`;
      if (key !== last) {
        last = key;
        area.dispatchEvent(new CustomEvent('publish:change', { detail }));
      }
    };

    area.addEventListener('segmented-control:change', (e) => {
      const toggle = toggles.find(t => t.contains(e.target));
      if (!toggle) return;
      setLater(toggle, e.detail.item.hasAttribute('data-later'));
      // Let the unsaved-changes guard and anything else watching fields know
      fieldFor(toggle)?.dispatchEvent(new Event('change', { bubbles: true }));
      if (e.detail.item.hasAttribute('data-later')) fieldFor(toggle)?.focus();
    });
    area.addEventListener('change', update);
    area.addEventListener('input', update);
    update();
    // Custom date fields may load after this runs
    customElements.whenDefined?.('p-datetime').then(update);
  }

  /** What a record shows as, from its status and dates, at a given time. */
  static state(area, now = Date.now()) {
    const status = area.querySelector('input[name="status"]:checked')?.value || 'draft';
    const date = (selector) => {
      const field = area.querySelector(selector);
      const value = field && !field.hasAttribute('disabled') ? (field.value ?? field.getAttribute('value')) : '';
      const time = value ? new Date(value) : null;
      return time && !Number.isNaN(time.getTime()) ? time : null;
    };
    const publishAt = date('[data-publish-at]');
    const expireAt = date('[data-expire-at]');
    let state = status === 'active' ? 'live' : status;
    if (status === 'active' && expireAt && expireAt.getTime() <= now) state = 'expired';
    else if (status === 'active' && publishAt && publishAt.getTime() > now) state = 'scheduled';
    return { state, publishAt, expireAt };
  }

  static enhanceAll(selector = '[data-publish-schedule]', root = document) {
    const instance = new PublishSchedule();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

/**
 * Tracks unsaved edits in a [data-unsaved-guard] area.
 *
 * Each field's value is recorded when the area is enhanced; while any differs (so undoing an edit
 * makes it clean again) the area gets data-dirty, as does the .tabs__trigger of any tab panel
 * holding a changed field, and leaving the page asks first. Fields inside [data-unsaved-ignore]
 * (e.g. rows that save themselves) don't count, and fields added later start clean. Dispatch
 * "unsaved:reset" on the area after saving to take the current values as saved. The area fires
 * "unsaved:change" with { dirty } when its state flips.
 */
class UnsavedGuard {
  static dirty = new Set();

  static {
    window.addEventListener('beforeunload', (event) => {
      if (!UnsavedGuard.dirty.size) return;
      event.preventDefault();
      event.returnValue = '';
    });
  }

  constructor() {
    this.saved = new WeakMap();
  }

  mount(area) {
    if (this.saved.has(area)) return;
    this._record(area);
    const check = () => this._check(area);
    area.addEventListener('input', check);
    area.addEventListener('change', check);
    area.addEventListener('unsaved:reset', () => {
      this._record(area);
      this._check(area);
    });
  }

  /** Native fields, plus custom form fields with a name such as <p-datetime>. */
  _fields(area) {
    return [...area.querySelectorAll('input, select, textarea, [name]')]
      .filter(field => /^(INPUT|SELECT|TEXTAREA)$/.test(field.tagName) || field.localName.includes('-'))
      .filter(field => !['button', 'submit', 'reset', 'file', 'search'].includes(field.type))
      .filter(field => !field.closest('[data-unsaved-ignore]'));
  }

  /** A disabled field isn't submitted, so it counts as empty; a custom field not yet loaded reads its attribute. */
  _value(field) {
    if (field.disabled || field.hasAttribute('disabled')) return '';
    if (field.type === 'checkbox' || field.type === 'radio') return field.checked;
    return field.value ?? field.getAttribute('value') ?? '';
  }

  _record(area) {
    this.saved.set(area, new Map(this._fields(area).map(field => [field, this._value(field)])));
  }

  _check(area) {
    const saved = this.saved.get(area);
    const panels = new Set();
    let dirty = false;
    for (const field of this._fields(area)) {
      if (!saved.has(field)) saved.set(field, this._value(field));
      if (saved.get(field) === this._value(field)) continue;
      dirty = true;
      const panel = field.closest('[data-tab-panel]');
      if (panel) panels.add(panel.id);
    }

    area.querySelectorAll('.tabs__trigger[data-tab]').forEach((trigger) => {
      const changed = panels.has(trigger.dataset.tab);
      trigger.toggleAttribute('data-dirty', changed);
      if (changed) trigger.setAttribute('aria-description', 'Unsaved changes');
      else trigger.removeAttribute('aria-description');
    });

    if (dirty === area.hasAttribute('data-dirty')) return;
    area.toggleAttribute('data-dirty', dirty);
    if (dirty) UnsavedGuard.dirty.add(area);
    else UnsavedGuard.dirty.delete(area);
    area.dispatchEvent(new CustomEvent('unsaved:change', { bubbles: true, detail: { dirty } }));
  }

  static enhanceAll(selector = '[data-unsaved-guard]', root = document) {
    const instance = new UnsavedGuard();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

/**
 * Spreadsheet-style keyboard movement between the .table__control cells of a .table--editable.
 *
 * Up and down move to the same column in the next row; left and right move to the next cell
 * while a field's whole value is selected (as it is on arrival) or once the caret reaches its
 * edge, and straight away from a select. Enter moves
 * down and Shift+Enter up. Escape puts back the value the cell had when it was focused, and
 * Ctrl or Cmd+D copies the value from the cell above. Changes fire input and change events, so
 * the page's own handlers see them.
 */
class EditableTable {
  static elements = new WeakSet();

  constructor() {
    this.original = new WeakMap();
  }

  mount(table) {
    if (EditableTable.elements.has(table)) return;
    EditableTable.elements.add(table);
    table.addEventListener('focusin', (e) => {
      if (e.target.matches('.table__control')) this.original.set(e.target, e.target.value);
    });
    table.addEventListener('keydown', e => this._keyDown(e, table));
  }

  /** Every visible row's controls, as a grid of [row][column]. */
  _grid(table) {
    return [...table.querySelectorAll('.table__body > .table__row')]
      .filter(row => row.offsetParent !== null)
      // Skip controls in hidden columns
      .map(row => [...row.querySelectorAll('.table__control')].filter(control => control.getClientRects().length));
  }

  _neighbour(table, control, rows, columns) {
    const grid = this._grid(table);
    const r = grid.findIndex(cells => cells.includes(control));
    if (r === -1) return null;
    return grid[r + rows]?.[grid[r].indexOf(control) + columns] || null;
  }

  _go(target) {
    if (!target) return;
    target.focus();
    if (target.matches('input')) target.select();
  }

  _set(control, value) {
    control.value = value;
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }

  _keyDown(event, table) {
    const control = event.target.closest('.table__control');
    if (!control || event.altKey) return;
    const text = control.matches('input');
    const { selectionStart: from, selectionEnd: to, value } = control;
    // A cell arrived at by keyboard has its whole value selected, so arrows keep moving, as in a spreadsheet
    const whole = text && from === 0 && to === value.length;
    const atStart = !text || whole || (from === 0 && to === 0);
    const atEnd = !text || whole || (from === value.length && to === value.length);
    const step = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: atStart ? [0, -1] : null,
      ArrowRight: atEnd ? [0, 1] : null,
      Enter: event.shiftKey ? [-1, 0] : [1, 0],
    }[event.key];

    if (step && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      this._go(this._neighbour(table, control, ...step));
    } else if (event.key === 'Escape' && this.original.has(control) && control.value !== this.original.get(control)) {
      event.preventDefault();
      this._set(control, this.original.get(control));
      if (text) control.select();
    } else if (event.key.toLowerCase() === 'd' && (event.metaKey || event.ctrlKey)) {
      const above = this._neighbour(table, control, -1, 0);
      if (!above) return;
      event.preventDefault();
      this._set(control, above.value);
    }
  }

  static enhanceAll(selector = '.table--editable', root = document) {
    const instance = new EditableTable();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

// ============================================================================
// Chart Component
// ============================================================================

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}, parent = null) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  parent?.append(el);
  return el;
}

/** Round up to a clean axis maximum: 1, 2, 2.5 or 5 times a power of ten. */
function niceMax(value) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  return [1, 2, 2.5, 5, 10].find(step => step * power >= value) * power;
}

/**
 * Renders a data <table> inside <figure class="chart" data-chart="..."> as an SVG chart.
 *
 * Types: line, area, bar (grouped when there are several series) and stacked-bar.
 * The first column holds the x labels and every other column is a series. Cells may carry
 * data-value when their text is formatted. data-chart-format is "number", "currency" or
 * "percent". The table stays in the page as the accessible table view.
 */
class Chart {
  constructor() {
    this.elements = new WeakMap();
  }

  mount(figure) {
    if (this.elements.has(figure)) return;
    const table = figure.querySelector('table');
    if (!table) return;

    const data = this._parse(table);
    if (!data.rows.length || !data.series.length) return;

    const state = {
      figure,
      table,
      data,
      type: figure.dataset.chart || 'line',
      format: this._formatter(figure.dataset.chartFormat),
      plot: document.createElement('div'),
      tooltip: document.createElement('div'),
      index: null,
    };

    table.classList.add('chart__table');
    table.hidden = true;

    state.plot.className = 'chart__plot';
    state.plot.tabIndex = 0;
    state.plot.setAttribute('role', 'group');
    const title = figure.querySelector('.chart__title')?.textContent.trim() || 'Chart';
    state.plot.setAttribute('aria-label', `${title}. Use the arrow keys to read values.`);

    state.tooltip.className = 'chart__tooltip';
    state.tooltip.hidden = true;
    state.tooltip.setAttribute('aria-live', 'polite');

    const legend = data.series.length > 1 ? this._legend(state) : null;
    table.before(...[legend, state.plot].filter(Boolean));
    this._addTableToggle(state, legend);

    state.plot.addEventListener('keydown', (e) => this._handleKey(e, state));
    state.plot.addEventListener('focus', () => this._show(state, state.index ?? data.rows.length - 1));
    state.plot.addEventListener('blur', () => this._hide(state));
    state.plot.addEventListener('pointerleave', () => this._hide(state));

    // Render now; the observer re-renders on resize (it may not fire in a background tab)
    this._render(state);
    new ResizeObserver(() => this._render(state)).observe(state.plot);
    figure.setAttribute('data-chart-enhanced', 'true');
    this.elements.set(figure, state);
  }

  _parse(table) {
    const headers = [...table.querySelectorAll('thead th')].map(th => th.textContent.trim());
    const rows = [...table.querySelectorAll('tbody tr')].map(tr => {
      const cells = [...tr.children];
      return {
        label: cells[0]?.textContent.trim() ?? '',
        values: cells.slice(1).map(cell => {
          const raw = cell.dataset.value ?? cell.textContent.replace(/[^0-9.\-]/g, '');
          return Number.parseFloat(raw) || 0;
        }),
      };
    });
    return { series: headers.slice(1), rows };
  }

  _formatter(kind) {
    const options = {
      currency: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
      percent: { style: 'percent', maximumFractionDigits: 1 },
    }[kind] || { maximumFractionDigits: 1 };
    const full = new Intl.NumberFormat('en-US', options);
    const compact = new Intl.NumberFormat('en-US', { ...options, notation: 'compact', maximumFractionDigits: 1 });
    const scale = kind === 'percent' ? 0.01 : 1;
    return {
      full: value => full.format(value * scale),
      compact: value => compact.format(value * scale),
    };
  }

  _legend(state) {
    const legend = document.createElement('ul');
    legend.className = 'chart__legend';
    const isBar = state.type.includes('bar');
    state.data.series.forEach((name, i) => {
      const item = document.createElement('li');
      item.className = 'chart__legend-item';
      const key = document.createElement('span');
      key.className = isBar ? 'chart__key chart__key--box' : 'chart__key';
      key.style.color = `var(--chart-${i + 1})`;
      item.append(key, document.createTextNode(name));
      legend.append(item);
    });
    return legend;
  }

  _addTableToggle(state, legend) {
    const header = state.figure.querySelector('.chart__header');
    if (!header) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn--ghost btn--sm';
    button.textContent = 'Table';
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const showTable = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(showTable));
      state.table.hidden = !showTable;
      state.plot.hidden = showTable;
      if (legend) legend.hidden = showTable;
    });
    header.append(button);
  }

  _render(state) {
    const { plot, data, type, format } = state;
    const width = plot.clientWidth;
    const height = plot.clientHeight;
    if (!width || !height) return;

    const stacked = type === 'stacked-bar';
    const isBar = type.includes('bar');
    const n = data.rows.length;
    const peak = Math.max(...data.rows.map(r => (stacked ? r.values.reduce((a, b) => a + b, 0) : Math.max(...r.values))));
    const max = niceMax(peak);
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => t * max);

    const tickWidth = Math.max(...ticks.map(t => format.compact(t).length)) * 6.5 + 8;
    const endLabel = !isBar && data.series.length === 1 ? format.compact(data.rows[n - 1].values[0]).length * 6.5 + 10 : 8;
    const box = { left: tickWidth, right: width - endLabel, top: 8, bottom: height - 22 };
    const y = value => box.bottom - (value / max) * (box.bottom - box.top);
    const band = (box.right - box.left) / n;
    const x = isBar
      ? i => box.left + band * (i + 0.5)
      : i => box.left + (n === 1 ? 0 : (i * (box.right - box.left)) / (n - 1));
    state.geometry = { box, x, band, isBar };

    const root = svgEl('svg', { 'aria-hidden': 'true' });

    for (const t of ticks) {
      svgEl('line', { class: t ? 'chart__grid' : 'chart__baseline', x1: box.left, x2: box.right, y1: y(t), y2: y(t) }, root);
      svgEl('text', { class: 'chart__tick', x: box.left - 8, y: y(t), 'text-anchor': 'end', 'dominant-baseline': 'middle' }, root)
        .textContent = format.compact(t);
    }

    const labelWidth = Math.max(...data.rows.map(r => r.label.length)) * 6.5 + 12;
    const slot = (box.right - box.left) / (isBar ? n : Math.max(1, n - 1));
    const every = Math.max(1, Math.ceil(labelWidth / slot));
    data.rows.forEach((row, i) => {
      // Skip labels that would crowd their neighbours, keeping the last one and the space before it
      if (i % every !== 0 && i !== n - 1) return;
      if (i !== n - 1 && i % every === 0 && n - 1 - i < every) return;
      const anchor = isBar ? 'middle' : i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle';
      svgEl('text', { class: 'chart__tick', x: x(i), y: height - 6, 'text-anchor': anchor }, root).textContent = row.label;
    });

    if (isBar) {
      this._renderBars(state, root, y, stacked);
    } else {
      this._renderLines(state, root, y, type === 'area');
    }

    state.crosshair = svgEl('line', { class: 'chart__crosshair', y1: box.top, y2: box.bottom, visibility: 'hidden' }, root);
    state.hoverDots = data.series.map((_, s) => svgEl('circle', { class: 'chart__dot', r: 4, fill: `var(--chart-${s + 1})`, visibility: 'hidden' }, root));
    if (isBar) state.hoverDots.forEach(dot => dot.remove());

    const hit = svgEl('rect', { class: 'chart__hit', x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top }, root);
    hit.addEventListener('pointermove', (e) => {
      const bounds = plot.getBoundingClientRect();
      const px = e.clientX - bounds.left;
      const i = isBar
        ? Math.floor((px - box.left) / band)
        : Math.round(((px - box.left) / (box.right - box.left)) * (n - 1));
      this._show(state, Math.min(n - 1, Math.max(0, i)));
    });

    plot.replaceChildren(root, state.tooltip);
    if (state.index !== null && !state.tooltip.hidden) this._show(state, state.index);
  }

  _renderLines(state, root, y, area) {
    const { data, format } = state;
    const { box, x } = state.geometry;
    data.series.forEach((name, s) => {
      const color = `var(--chart-${s + 1})`;
      const points = data.rows.map((row, i) => [x(i), y(row.values[s])]);
      const line = points.map(([px, py], i) => `${i ? 'L' : 'M'}${px},${py}`).join(' ');
      if (area || data.series.length === 1) {
        svgEl('path', { class: 'chart__area', d: `${line} L${points.at(-1)[0]},${box.bottom} L${points[0][0]},${box.bottom} Z`, fill: color }, root);
      }
      svgEl('path', { class: 'chart__line', d: line, stroke: color }, root);
      const [ex, ey] = points.at(-1);
      svgEl('circle', { class: 'chart__dot', cx: ex, cy: ey, r: 4, fill: color }, root);
      if (data.series.length === 1) {
        svgEl('text', { class: 'chart__label', x: ex + 8, y: ey, 'dominant-baseline': 'middle' }, root)
          .textContent = format.compact(data.rows.at(-1).values[s]);
      }
    });
  }

  _renderBars(state, root, y, stacked) {
    const { data } = state;
    const { box, x, band } = state.geometry;
    const groups = stacked ? 1 : data.series.length;
    const gap = 2;
    const barWidth = Math.max(2, Math.min(24, (band * 0.7 - gap * (groups - 1)) / groups));
    const groupWidth = barWidth * groups + gap * (groups - 1);
    state.bars = data.rows.map(() => []);

    data.rows.forEach((row, i) => {
      let base = 0;
      row.values.forEach((value, s) => {
        if (value <= 0) return;
        const left = x(i) - groupWidth / 2 + (stacked ? 0 : s * (barWidth + gap));
        const bottom = y(base);
        const top = y(base + value);
        const isTop = !stacked || row.values.slice(s + 1).every(v => v <= 0);
        const r = isTop ? Math.min(4, barWidth / 2, bottom - top) : 0;
        const d = `M${left},${bottom} V${top + r} Q${left},${top} ${left + r},${top} H${left + barWidth - r} Q${left + barWidth},${top} ${left + barWidth},${top + r} V${bottom} Z`;
        state.bars[i].push(svgEl('path', { class: 'chart__bar', d, fill: `var(--chart-${s + 1})` }, root));
        if (stacked) base += value;
      });
    });
  }

  _show(state, index) {
    const { data, format, tooltip, geometry } = state;
    if (!geometry) return;
    state.index = index;
    const row = data.rows[index];
    const { box, x, isBar } = geometry;
    const px = x(index);

    if (isBar) {
      state.bars.flat().forEach(bar => bar.classList.remove('chart__bar--active'));
      state.bars[index].forEach(bar => bar.classList.add('chart__bar--active'));
    } else {
      state.crosshair.setAttribute('x1', px);
      state.crosshair.setAttribute('x2', px);
      state.crosshair.setAttribute('visibility', 'visible');
      const max = niceMax(Math.max(...data.rows.map(r => Math.max(...r.values))));
      state.hoverDots.forEach((dot, s) => {
        dot.setAttribute('cx', px);
        dot.setAttribute('cy', box.bottom - (row.values[s] / max) * (box.bottom - box.top));
        dot.setAttribute('visibility', 'visible');
      });
    }

    const heading = document.createElement('div');
    heading.className = 'chart__tooltip-title';
    heading.textContent = row.label;
    const rows = data.series.map((name, s) => {
      const line = document.createElement('div');
      line.className = 'chart__tooltip-row';
      const key = document.createElement('span');
      key.className = 'chart__key';
      key.style.color = `var(--chart-${s + 1})`;
      const value = document.createElement('strong');
      value.textContent = format.full(row.values[s]);
      const label = document.createElement('span');
      label.textContent = name;
      line.append(key, value, label);
      return line;
    });
    if (state.type === 'stacked-bar' && data.series.length > 1) {
      const total = document.createElement('div');
      total.className = 'chart__tooltip-row';
      const value = document.createElement('strong');
      value.textContent = format.full(row.values.reduce((a, b) => a + b, 0));
      const label = document.createElement('span');
      label.textContent = 'Total';
      total.append(document.createElement('span'), value, label);
      rows.push(total);
    }
    tooltip.replaceChildren(heading, ...rows);
    tooltip.hidden = false;

    const tipWidth = tooltip.offsetWidth;
    const left = px + 12 + tipWidth > state.plot.clientWidth ? px - 12 - tipWidth : px + 12;
    tooltip.style.left = `${Math.max(0, left)}px`;
    tooltip.style.top = `${box.top}px`;
  }

  _hide(state) {
    state.tooltip.hidden = true;
    state.crosshair?.setAttribute('visibility', 'hidden');
    state.hoverDots?.forEach(dot => dot.setAttribute('visibility', 'hidden'));
    state.bars?.flat().forEach(bar => bar.classList.remove('chart__bar--active'));
  }

  _handleKey(event, state) {
    const last = state.data.rows.length - 1;
    const current = state.index ?? last;
    const next = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: last }[event.key];
    if (event.key === 'Escape') {
      this._hide(state);
      return;
    }
    if (next === undefined) return;
    event.preventDefault();
    this._show(state, Math.min(last, Math.max(0, next)));
  }

  static enhanceAll(selector = '[data-chart]', root = document) {
    const instance = new Chart();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

// ============================================================================
// Action Bar Component
// ============================================================================

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
class OverflowActions {
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

/**
 * Folds an action bar's lower-priority segments into a "more" menu before its label is cut off,
 * using OverflowActions with action bar styling for the menu. Bars in a list (and its nested
 * lists) fold together, so a tree's columns stay aligned.
 */
class ActionBar {
  constructor() {
    this.overflow = new OverflowActions();
  }

  mount(bar) {
    let list = bar.closest('.actionbar__list');
    while (list?.parentElement?.closest('.actionbar__list')) list = list.parentElement.closest('.actionbar__list');
    this.overflow.mount(bar, {
      boundary: list || bar,
      protect: '.actionbar__label',
      moreClass: 'actionbar__segment actionbar__more dropdown',
      triggerClass: 'actionbar__trigger dropdown__trigger',
    });
  }

  static enhanceAll(selector = '.actionbar', root = document) {
    const instance = new ActionBar();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

/**
 * Behaviour for an .actionbar__list: expand and collapse, and optional reordering.
 *
 * An .actionbar__toggle with aria-controls shows or hides the child list it names.
 *
 * data-actionbar-sortable reorders items within the list; data-actionbar-sortable="tree" makes the
 * list and every .actionbar__list nested inside it one tree, so items can also move between
 * parents. Drag an .actionbar__handle: the bar under the pointer shows a line before or after it,
 * or (in a tree, over the middle of a bar) an outline for "drop inside as a child". With the
 * keyboard, focus a handle and press Space to pick the item up, the up and down arrows to move
 * it, and in a tree the right arrow to make it a child of the item above and the left arrow to
 * move it out a level; Space drops and Escape cancels. Moves are announced to screen readers and
 * the root list dispatches a bubbling "actionbar:reorder" event with
 * { item, from, to, fromParent, toParent }, where the parents are the owning <li> or null.
 */
class ActionBarList {
  constructor() {
    this.elements = new WeakMap();
  }

  mount(list) {
    if (this.elements.has(list)) return;
    list.addEventListener('click', (e) => this._toggle(e, list));

    // Lists inside a tree are driven by the tree's root
    const insideTree = list.parentElement?.closest('[data-actionbar-sortable="tree"]');
    if (!list.hasAttribute('data-actionbar-sortable') || insideTree) {
      this.elements.set(list, {});
      return;
    }

    const status = document.createElement('div');
    status.className = 'sr-only';
    status.setAttribute('aria-live', 'assertive');
    list.after(status);

    const state = { root: list, tree: list.dataset.actionbarSortable === 'tree', status, grabbed: null, origin: null };
    list.addEventListener('pointerdown', (e) => this._pointerDown(e, state));
    list.addEventListener('keydown', (e) => this._keyDown(e, state));
    this.elements.set(list, state);
  }

  _toggle(event, list) {
    const toggle = event.target.closest('.actionbar__toggle[aria-controls]');
    if (!toggle || toggle.closest('.actionbar__list') !== list) return;
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    const children = document.getElementById(toggle.getAttribute('aria-controls'));
    if (children) children.hidden = !open;
  }

  // ---------------------------------------------------------------------------
  // Structure helpers
  // ---------------------------------------------------------------------------

  /** The list item a handle belongs to, if the handle is part of this root. */
  _itemFor(handle, state) {
    if (!handle) return null;
    const item = handle.closest('li');
    const owner = item?.parentElement;
    if (!owner?.matches('.actionbar__list')) return null;
    if (state.tree ? !state.root.contains(owner) : owner !== state.root) return null;
    // A nested sortable root handles its own items
    const nearestRoot = owner.closest('[data-actionbar-sortable]');
    return nearestRoot === state.root || (state.tree && state.root.contains(nearestRoot)) ? item : null;
  }

  _bar(item) {
    return item.querySelector(':scope > .actionbar');
  }

  _name(item) {
    return this._bar(item)?.querySelector('.actionbar__label')?.textContent.trim() || 'Item';
  }

  _parentItem(item) {
    const owner = item.parentElement;
    return owner === this._rootOf(item) ? null : owner.closest('li');
  }

  _rootOf(item) {
    return item.closest('[data-actionbar-sortable="tree"]') || item.parentElement;
  }

  _childList(item) {
    return item.querySelector(':scope > .actionbar__list');
  }

  _position(item) {
    return { list: item.parentElement, index: [...item.parentElement.children].indexOf(item), parent: this._parentItem(item) };
  }

  /** Items a dragged item could land next to: visible, and not the item or its descendants. */
  _candidates(state, item) {
    const all = state.tree ? [...state.root.querySelectorAll('li')] : [...state.root.children];
    return all.filter(li => li !== item && !item.contains(li) && this._bar(li) && li.offsetParent !== null);
  }

  /** Give an item a child list (and a live toggle) so something can be dropped inside it. */
  _ensureChildList(parent) {
    let list = this._childList(parent);
    if (!list) {
      list = document.createElement('ul');
      list.className = 'actionbar__list';
      list.id = `${parent.id || 'actionbar-item'}-${Math.random().toString(36).slice(2, 8)}-children`;
      list.setAttribute('aria-label', `Under ${this._name(parent)}`);
      parent.append(list);
    }
    const toggle = this._bar(parent).querySelector('.actionbar__toggle');
    if (toggle && toggle.tagName !== 'BUTTON') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = toggle.className;
      button.setAttribute('aria-label', `Show items under ${this._name(parent)}`);
      button.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M6 9l6 6l6 -6"/></svg>';
      toggle.replaceWith(button);
    }
    const button = this._bar(parent).querySelector('button.actionbar__toggle');
    if (button) {
      button.setAttribute('aria-controls', list.id);
      button.setAttribute('aria-expanded', 'true');
    }
    list.hidden = false;
    return list;
  }

  /** Remove a nested list left empty by a move, and turn its toggle back into a spacer. */
  _pruneEmpty(list, state) {
    if (!list || list === state.root || list.children.length) return;
    const parent = list.closest('li');
    list.remove();
    const toggle = parent && this._bar(parent).querySelector('button.actionbar__toggle');
    if (toggle) {
      const spacer = document.createElement('span');
      spacer.className = toggle.className;
      spacer.setAttribute('aria-hidden', 'true');
      toggle.replaceWith(spacer);
    }
  }

  _place(item, target, where, state) {
    const oldList = item.parentElement;
    if (where === 'inside') {
      this._ensureChildList(target).append(item);
    } else if (where === 'first-inside') {
      this._ensureChildList(target).prepend(item);
    } else {
      target.parentElement.insertBefore(item, where === 'before' ? target : target.nextElementSibling);
    }
    this._pruneEmpty(oldList, state);
  }

  _dispatch(state, item) {
    const from = state.origin;
    const to = this._position(item);
    if (from.list === to.list && from.index === to.index) return;
    state.root.dispatchEvent(new CustomEvent('actionbar:reorder', {
      bubbles: true,
      detail: { item, from: from.index, to: to.index, fromParent: from.parent, toParent: to.parent },
    }));
  }

  _announce(state, message) {
    state.status.textContent = message;
  }

  _describe(item) {
    const { index, list, parent } = this._position(item);
    const where = parent ? `under ${this._name(parent)}` : 'at the top level';
    return `position ${index + 1} of ${list.children.length} ${where}`;
  }

  // ---------------------------------------------------------------------------
  // Pointer dragging
  // ---------------------------------------------------------------------------

  /**
   * The item moves to its landing place as the pointer moves, so a gap opens where it will drop
   * while the item itself (with any children) follows the pointer. Other rows slide out of the
   * way. Releasing settles the item into the gap; Escape or a cancelled pointer puts it back.
   */
  _pointerDown(event, state) {
    const handle = event.target.closest('.actionbar__handle');
    const item = this._itemFor(handle, state);
    if (!item || event.button !== 0) return;
    event.preventDefault();

    const bar = this._bar(item);
    const grabOffset = event.clientY - item.getBoundingClientRect().top;
    let pointerY = event.clientY;
    state.origin = this._position(item);
    bar.setAttribute('data-dragging', '');
    item.style.position = 'relative';
    item.style.zIndex = '2';

    const follow = () => {
      item.style.transform = '';
      const slotTop = item.getBoundingClientRect().top;
      item.style.transform = `translateY(${pointerY - grabOffset - slotTop}px)`;
    };

    const move = (e) => {
      pointerY = e.clientY;
      const next = this._dropTarget(state, item, pointerY);
      if (next && !this._isAt(item, next)) {
        this._animate(state, item, () => this._place(item, next.target, next.where, state));
      }
      follow();
    };

    const finish = (commit) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', release);
      document.removeEventListener('pointercancel', cancel);
      document.removeEventListener('keydown', escape);
      if (!commit) this._restore(item, state);
      this._settle(item, () => {
        bar.removeAttribute('data-dragging');
        item.style.position = '';
        item.style.zIndex = '';
      });
      if (commit) this._dispatch(state, item);
    };
    const release = () => finish(true);
    const cancel = () => finish(false);
    const escape = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      finish(false);
    };

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', release);
    document.addEventListener('pointercancel', cancel);
    document.addEventListener('keydown', escape);
  }

  /** Whether the item already sits where a drop target would put it. */
  _isAt(item, { target, where }) {
    if (where === 'before') return item.nextElementSibling === target;
    if (where === 'after') return target.nextElementSibling === item;
    const list = this._childList(target);
    if (!list || item.parentElement !== list) return false;
    return where === 'inside' ? !item.nextElementSibling : !item.previousElementSibling;
  }

  _reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Run a DOM move, then slide the other bars from where they were to where they now are. */
  _animate(state, item, mutate) {
    const bars = this._candidates(state, item).map(li => this._bar(li));
    const before = new Map(bars.map(bar => [bar, bar.getBoundingClientRect().top]));
    mutate();
    if (this._reducedMotion()) return;
    for (const [bar, top] of before) {
      const delta = top - bar.getBoundingClientRect().top;
      if (delta) {
        bar.animate([{ transform: `translateY(${delta}px)` }, { transform: 'none' }], { duration: 150, easing: 'ease-out' });
      }
    }
  }

  /** Drop the pointer offset and glide the item into its slot, then run done. */
  _settle(item, done) {
    const from = item.getBoundingClientRect().top;
    item.style.transform = '';
    const delta = from - item.getBoundingClientRect().top;
    if (!delta || this._reducedMotion()) {
      done();
      return;
    }
    item.animate([{ transform: `translateY(${delta}px)` }, { transform: 'none' }], { duration: 150, easing: 'ease-out' })
      .finished.then(done, done);
  }

  /** Put an item back where the current move started. */
  _restore(item, state) {
    const { list, index, parent } = state.origin;
    const oldList = item.parentElement;
    // The original list may have been removed when the move emptied it
    const home = list.isConnected ? list : this._ensureChildList(parent);
    home.insertBefore(item, [...home.children].filter(el => el !== item)[index] || null);
    if (home !== oldList) this._pruneEmpty(oldList, state);
  }

  /** A bar's box without any slide animation still running on it, so targets don't flicker. */
  _layoutRect(bar) {
    const rect = bar.getBoundingClientRect();
    const shift = new DOMMatrixReadOnly(getComputedStyle(bar).transform).m42;
    return { top: rect.top - shift, bottom: rect.bottom - shift, height: rect.height };
  }

  /** Where the dragged item would land for a pointer at clientY. */
  _dropTarget(state, item, y) {
    let best = null;
    for (const candidate of this._candidates(state, item)) {
      const rect = this._layoutRect(this._bar(candidate));
      const distance = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
      if (!best || distance < best.distance) best = { target: candidate, rect, distance };
    }
    if (!best) return null;

    const { target, rect } = best;
    const ratio = (y - rect.top) / rect.height;
    if (!state.tree) {
      return { target, where: ratio < 0.5 ? 'before' : 'after' };
    }
    if (ratio < 0.25) return { target, where: 'before' };
    if (ratio > 0.75) {
      // Below an open parent, the next visible slot is its first child
      const children = this._childList(target);
      return children && !children.hidden && children.children.length
        ? { target, where: 'first-inside' }
        : { target, where: 'after' };
    }
    return { target, where: 'inside' };
  }

  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------

  _keyDown(event, state) {
    const handle = event.target.closest('.actionbar__handle');
    const item = this._itemFor(handle, state);
    if (!item) return;
    const bar = this._bar(item);
    const name = this._name(item);

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (state.grabbed === item) {
        state.grabbed = null;
        handle.setAttribute('aria-pressed', 'false');
        bar.removeAttribute('data-dragging');
        this._announce(state, `${name} dropped at ${this._describe(item)}.`);
        this._dispatch(state, item);
      } else {
        state.grabbed = item;
        state.origin = this._position(item);
        handle.setAttribute('aria-pressed', 'true');
        bar.setAttribute('data-dragging', '');
        const levels = state.tree ? ', right arrow to nest it under the item above, left arrow to move it out a level' : '';
        this._announce(state, `${name} grabbed. Use the up and down arrow keys to move it${levels}. Space drops, Escape cancels.`);
      }
      return;
    }

    if (state.grabbed !== item) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this._restore(item, state);
      state.grabbed = null;
      handle.setAttribute('aria-pressed', 'false');
      bar.removeAttribute('data-dragging');
      handle.focus();
      this._announce(state, `Move cancelled. ${name} is back at ${this._describe(item)}.`);
      return;
    }

    const siblings = [...item.parentElement.children];
    const index = siblings.indexOf(item);
    let moved = false;

    if (event.key === 'ArrowUp' && index > 0) {
      item.parentElement.insertBefore(item, siblings[index - 1]);
      moved = true;
    } else if (event.key === 'ArrowDown' && index < siblings.length - 1) {
      item.parentElement.insertBefore(item, siblings[index + 1].nextElementSibling);
      moved = true;
    } else if (state.tree && event.key === 'ArrowRight' && index > 0) {
      this._place(item, siblings[index - 1], 'inside', state);
      moved = true;
    } else if (state.tree && event.key === 'ArrowLeft' && this._parentItem(item)) {
      this._place(item, this._parentItem(item), 'after', state);
      moved = true;
    }

    if (!moved) return;
    event.preventDefault();
    handle.focus();
    this._announce(state, `${name} moved to ${this._describe(item)}.`);
  }

  static enhanceAll(selector = '.actionbar__list', root = document) {
    const instance = new ActionBarList();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

// ============================================================================
// Toast Manager
// ============================================================================

class ToastManager {
  constructor(options = {}) {
    this.container = null;
    this.position = options.position || 'top-right';
    this.defaultDuration = options.duration || 5000;
    this._ensureContainer();
  }

  _ensureContainer() {
    this.container = document.querySelector(`.toast__container--${this.position}`);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = `toast__container toast__container--${this.position}`;
      this.container.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(this.container);
    }
    // Announce toasts as they are added; error toasts interrupt via role="alert"
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-relevant', 'additions');
  }

  /**
   * Show a toast. actions is an optional list of { label, icon, onClick } buttons; clicking one
   * runs its handler and dismisses the toast (e.g. Undo after removing something).
   */
  show({ message, title, type = 'info', duration = this.defaultDuration, progress = false, actions = [] }) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    if (type === 'error') toast.setAttribute('role', 'alert');
    if (duration > 0) toast.style.setProperty('--toast-duration', `${duration}ms`);

    const icons = {
      info: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9h.01"/><path d="M11 12h1v4h1"/>',
      success: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>',
      warning: '<path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/>',
      error: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9v4"/><path d="M12 16h.01"/>',
    };

    toast.innerHTML = `
      <svg class="icon toast__icon" viewBox="0 0 24 24">${icons[type] || icons.info}</svg>
      <div class="toast__content">
        ${title ? `<h4 class="toast__title">${title}</h4>` : ''}
        <p class="toast__description">${message}</p>
        ${actions.length ? '<div class="toast__actions"></div>' : ''}
      </div>
      <button type="button" class="toast__close" aria-label="Dismiss notification">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg>
      </button>
      ${progress && duration > 0 ? '<div class="toast__progress" aria-hidden="true"></div>' : ''}
    `;

    const actionList = toast.querySelector('.toast__actions');
    actions.forEach(({ label, icon = '', onClick }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn--outline btn--sm';
      button.innerHTML = `${icon}<span></span>`;
      button.querySelector('span').textContent = label;
      button.addEventListener('click', () => {
        onClick?.();
        this.dismiss(toast);
      });
      actionList.append(button);
    });

    // Add close handler
    const closeBtn = toast.querySelector('.toast__close');
    closeBtn?.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  }

  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    // Plays toast-slide-in's offsets in reverse, so it leaves the way it came in
    toast.style.animation = 'toast-slide-out 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }

  info(message, options = {}) {
    return this.show({ ...options, message, type: 'info' });
  }

  success(message, options = {}) {
    return this.show({ ...options, message, type: 'success' });
  }

  warning(message, options = {}) {
    return this.show({ ...options, message, type: 'warning' });
  }

  error(message, options = {}) {
    return this.show({ ...options, message, type: 'error' });
  }
}

// ============================================================================
// Demo Navigation - Floating menu to navigate between demo pages
// ============================================================================

class DemoNav {
  constructor() {
    this.isOpen = false;
    // Grouped so every demo page is one click away; component docs live behind Components
    this.sections = [
      { title: 'Start', pages: [
        { name: 'Components', href: 'index.html', icon: 'grid' },
        { name: 'Playground', href: 'playground.html', icon: 'play' },
      ] },
      { title: 'Dashboards', pages: [
        { name: 'Dashboard', href: 'dashboard.html', icon: 'home' },
        { name: 'CMS Dashboard', href: 'cms-dashboard.html', icon: 'home' },
        { name: 'CMS Dashboard (Admin)', href: 'cms-dashboard-admin.html', icon: 'settings' },
        { name: 'Analytics', href: 'analytics.html', icon: 'chart' },
      ] },
      { title: 'Content', pages: [
        { name: 'Pages', href: 'pages.html', icon: 'edit' },
        { name: 'Records List', href: 'records.html', icon: 'database' },
        { name: 'Record Form', href: 'record-form.html', icon: 'edit' },
        { name: 'Record with Tabs', href: 'record-edit-tabs.html', icon: 'edit' },
        { name: 'Nested Editing', href: 'nested-edit.html', icon: 'layers' },
        { name: 'Record Delete', href: 'record-delete.html', icon: 'trash' },
      ] },
      { title: 'Media', pages: [
        { name: 'Media Library', href: 'media.html', icon: 'photo' },
        { name: 'File Browser', href: 'components/filebrowser.html', icon: 'photo' },
        { name: 'Media Field', href: 'components/media.html', icon: 'photo' },
      ] },
      { title: 'People & settings', pages: [
        { name: 'Team', href: 'team.html', icon: 'user' },
        { name: 'Settings', href: 'settings.html', icon: 'settings' },
        { name: 'Account Settings', href: 'settings-account.html', icon: 'user' },
        { name: 'Billing', href: 'billing.html', icon: 'card' },
      ] },
      { title: 'Access', pages: [
        { name: 'Login', href: 'login.html', icon: 'login' },
        { name: 'Forgot Password', href: 'forgot-password.html', icon: 'key' },
        { name: 'Onboarding', href: 'onboarding.html', icon: 'home' },
      ] },
      { title: 'System', pages: [
        { name: 'System Check', href: 'system-check.html', icon: 'check' },
        { name: 'Fixing Issues', href: 'fixing.html', icon: 'tool' },
        { name: '403', href: '403.html', icon: 'key' },
        { name: '404', href: '404.html', icon: 'alert' },
        { name: '500', href: '500.html', icon: 'alert' },
        { name: '500 (Debug)', href: '500-debug.html', icon: 'tool' },
      ] },
    ];
    this.icons = {
      grid: '<path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/>',
      home: '<path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>',
      database: '<path d="M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0"/><path d="M4 6v6a8 3 0 0 0 16 0v-6"/><path d="M4 12v6a8 3 0 0 0 16 0v-6"/>',
      edit: '<path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"/><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z"/><path d="M16 5l3 3"/>',
      trash: '<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>',
      settings: '<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>',
      user: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>',
      login: '<path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"/><path d="M21 12h-13l3 -3"/><path d="M11 15l-3 -3"/>',
      key: '<path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l6.558 -6.558l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z"/><path d="M15 9h.01"/>',
      card: '<path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z"/><path d="M3 10l18 0"/><path d="M7 15l.01 0"/><path d="M11 15l2 0"/>',
      check: '<path d="M5 12l5 5l10 -10"/>',
      tool: '<path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5"/>',
      alert: '<path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.536a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/>',
      play: '<path d="M7 4v16l13 -8z"/>',
      chart: '<path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/>',
      layers: '<path d="M12 4l-8 4l8 4l8 -4l-8 -4"/><path d="M4 12l8 4l8 -4"/><path d="M4 16l8 4l8 -4"/>',
      photo: '<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>',
      menu: '<path d="M4 6l16 0"/><path d="M4 12l16 0"/><path d="M4 18l16 0"/>',
      close: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>',
    };
    this.init();
  }

  init() {
    this.createElements();
    this.bindEvents();
  }

  createElements() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'demonav';
    this.container.innerHTML = `
      <button class="demonav__trigger" aria-label="Demo navigation" aria-expanded="false">
        <svg class="icon demonav__icon demonav__icon--menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${this.icons.menu}</svg>
        <svg class="icon demonav__icon demonav__icon--close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${this.icons.close}</svg>
      </button>
      <div class="demonav__menu">
        <div class="demonav__header">
          <span class="demonav__title">Demo Pages</span>
        </div>
        <nav class="demonav__list">
          ${this.sections.map(section => `<p class="demonav__group">${section.title}</p>${section.pages.map(page => this.createPageLink(page)).join('')}`).join('')}
        </nav>
      </div>
    `;

    document.body.appendChild(this.container);
    this.trigger = this.container.querySelector('.demonav__trigger');
    this.menu = this.container.querySelector('.demonav__menu');

    // Mark current page
    const current = new URL(window.location.pathname.replace(/\/$/, '/index.html'), window.location.origin).href;
    const currentLink = [...this.container.querySelectorAll('a')].find(a => a.href === current);
    if (currentLink) {
      currentLink.setAttribute('aria-current', 'page');
    }
  }

  createPageLink(page) {
    return `
      <a href="${new URL(`../${page.href}`, import.meta.url).href}" class="demonav__link">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${this.icons[page.icon]}</svg>
        <span>${page.name}</span>
      </a>
    `;
  }

  bindEvents() {
    // Toggle menu
    this.trigger.addEventListener('click', () => this.toggle());

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        this.close();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.trigger.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.isOpen = false;
    this.trigger.setAttribute('aria-expanded', 'false');
  }
}

// ============================================================================
// Initialize on DOM Ready
// ============================================================================

const VENDOR = new URL('../vendor/parallelogram-js/', import.meta.url);

const WEB_COMPONENTS = {
  'p-modal': 'components/PModal.js',
  'p-datetime': 'components/PDatetime.js',
};

/**
 * The clear button in a toolbar search.
 *
 * A .toolbar__clear empties the .toolbar__input in its .toolbar__group, fires "input" so
 * anything filtering on it updates, and puts focus back in the field. CSS shows the button only
 * while the field has a value (the field needs a placeholder for that).
 */
class SearchClear {
  static {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('.toolbar__clear');
      const input = button?.closest('.toolbar__group')?.querySelector('.toolbar__input');
      if (!input) return;
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
  }
}

/**
 * Load the @parallelogram-js/core pieces that markup inside root relies on.
 *
 * The package is copied into demo/vendor by `npm run build`; nothing is fetched when a page
 * does not use these components.
 */
async function loadParallelogramJs(root) {
  const loads = Object.entries(WEB_COMPONENTS)
    .filter(([tag]) => root.querySelector(tag) && !customElements.get(tag))
    .map(([, path]) => import(new URL(path, VENDOR).href));

  if (root.querySelector('[data-modal][data-modal-target]')) {
    loads.push(import(new URL('components/Modal.js', VENDOR).href).then(({ default: Modal }) => Modal.enhanceAll()));
  }

  try {
    await Promise.all(loads);
  } catch (error) {
    console.error('Could not load @parallelogram-js/core. Run `npm run build` to copy it into demo/vendor.', error);
  }
}

/**
 * Enhance every interactive component inside root.
 *
 * Safe to call repeatedly on freshly rendered markup, e.g. from the playground preview.
 */
function init(root = document) {
  loadParallelogramJs(root);

  return {
    // Action bars and overflow actions run first so the "more" menus they create get their toggle behaviour
    actionbar: ActionBar.enhanceAll('.actionbar', root),
    overflowActions: OverflowActions.enhanceAll('[data-overflow-actions]', root),
    actionbarList: ActionBarList.enhanceAll('.actionbar__list', root),
    accordion: Accordion.enhanceAll('[data-accordion]', root),
    collapsible: Collapsible.enhanceAll('.collapsible', root),
    submenu: Submenu.enhanceAll('.dropdown__submenu', root),
    tabs: Tabs.enhanceAll('[data-tabs]', root),
    segmentedControl: SegmentedControl.enhanceAll('.segmented-control', root),
    toggle: Toggle.enhanceAll('[data-toggle]', root),
    editableTable: EditableTable.enhanceAll('.table--editable', root),
    publishSchedule: PublishSchedule.enhanceAll('[data-publish-schedule]', root),
    unsavedGuard: UnsavedGuard.enhanceAll('[data-unsaved-guard]', root),
    expandable: Expandable.enhanceAll('[data-expandable]', root),
    tableColumns: TableColumns.enhanceAll('[data-table-columns]', root),
    tableSort: TableSort.enhanceAll('[data-table-sort]', root),
    tableReorder: TableReorder.enhanceAll('[data-table-reorder]', root),
    tablePaste: TablePaste.enhanceAll('[data-table-paste]', root),
    chart: Chart.enhanceAll('[data-chart]', root),
  };
}

window.Parallelogram = { init, SearchClear, ActionBar, OverflowActions, EditableTable, UnsavedGuard, Expandable, TableColumns,
  TableSort, TableReorder, TablePaste, PublishSchedule, ActionBarList, Accordion, Collapsible, Submenu, Tabs, SegmentedControl, Toggle, Chart, ToastManager };

/**
 * Fallback for the Invoker Commands API (button commandfor/command) in browsers without it,
 * covering the dialog commands the overlay components use.
 */
function polyfillDialogCommands() {
  if ('commandForElement' in HTMLButtonElement.prototype) return;

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[commandfor][command]');
    const target = button && document.getElementById(button.getAttribute('commandfor'));
    if (!(target instanceof HTMLDialogElement)) return;

    const command = button.getAttribute('command');
    if (command === 'show-modal' && !target.open) {
      target.showModal();
    } else if (command === 'close' && target.open) {
      target.close();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  polyfillDialogCommands();
  init();

  // Create global toast manager
  window.toast = new ToastManager({ position: 'top-right' });

  // The playground preview frame opts out of the floating demo navigation
  if (document.body.dataset.demonav !== 'off') {
    window.demoNav = new DemoNav();
  }

  // Theme toggle
  window.toggleTheme = () => {
    const html = document.documentElement;
    const theme = html.getAttribute('data-theme');
    const dark = !(theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    html.setAttribute('data-theme', dark ? 'dark' : 'light');

    window.toast.info(dark ? 'Dark mode enabled' : 'Light mode enabled', {
      duration: 2000,
    });
  };

  console.log('Parallelogram Dashboard initialized');
});
