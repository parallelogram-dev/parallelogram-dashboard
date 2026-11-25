/**
 * A column picker for a table.
 *
 * A menu with data-table-columns="#tableId" holds items with data-column-toggle="key"; each
 * shows or hides every cell in that table marked data-column="key", and reflects it with
 * aria-checked. Choices are remembered per table in localStorage, and rows added later follow
 * them. Cells (and picker items) marked data-column-expanded only show while the table is in a
 * [data-expanded] area. A cell marked data-column-span (such as the first cell of a footer row)
 * spans whatever columns are left over.
 *
 * The table is looked up again whenever it is needed, so a table swapped in by LiveFilters (or
 * anything else that dispatches live-filters:update) keeps the choices.
 */
export class TableColumns {
  static elements = new WeakSet();

  mount(menu) {
    if (TableColumns.elements.has(menu)) return;
    const selector = menu.dataset.tableColumns;
    let table = document.querySelector(selector);
    if (!table) return;
    TableColumns.elements.add(menu);
    const key = `pd-table-columns:${table.id}`;
    let hidden = new Set();
    try {
      hidden = new Set(JSON.parse(localStorage.getItem(key)) || []);
    } catch (e) {
      // Storage can be unavailable (private mode, blocked); the picker still works for the visit
    }

    const observer = new MutationObserver(() => apply());
    const attach = () => {
      const current = document.querySelector(selector);
      if (!current) return false;
      table = current;
      observer.disconnect();
      observer.observe(table.tBodies[0] || table, { childList: true });
      return true;
    };

    const apply = () => {
      if (!document.contains(table) && !attach()) return;
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

    attach();
    // The event does not bubble, so it is caught on its way down
    document.addEventListener('live-filters:update', () => {
      attach();
      apply();
    }, { capture: true });
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
