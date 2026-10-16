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
export class TableSort {
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
