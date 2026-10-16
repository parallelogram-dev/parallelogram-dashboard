import { Toggle } from './toggle.js';

/**
 * Shows a [data-expandable] element full-screen and back again.
 *
 * A [data-expand] button inside it moves the element into a full-window <dialog> (and back on
 * the next press, Escape or the dialog closing), so its state, focus handling and top-layer
 * menus carry over. While expanded the element has data-expanded and the button aria-pressed;
 * give the button data-expand-label and data-collapse-label to swap its accessible name. The
 * element fires "expandable:change" with { expanded }.
 */
export class Expandable {
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
