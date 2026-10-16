import { TableSort } from './table-sort.js';

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
export class TableReorder {
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
