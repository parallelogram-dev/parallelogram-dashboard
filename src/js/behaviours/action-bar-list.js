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
export class ActionBarList {
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
