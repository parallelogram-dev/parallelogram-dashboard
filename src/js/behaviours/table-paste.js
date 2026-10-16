import { TableSort } from './table-sort.js';
import { escapeHtml } from '../util/dom.js';

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
export class TablePaste {
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
