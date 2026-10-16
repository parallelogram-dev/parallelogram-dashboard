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
export class EditableTable {
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
