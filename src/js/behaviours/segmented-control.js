import { isDisabled } from '../util/dom.js';

// ============================================================================
// Segmented Control
// ============================================================================

/**
 * Keeps exactly one .segmented-control__item pressed: aria-pressed on toggle buttons, or
 * aria-checked when the items are role="radio".
 */
export class SegmentedControl {
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
