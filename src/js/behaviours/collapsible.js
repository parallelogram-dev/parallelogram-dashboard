import { linkTrigger } from '../util/dom.js';

// ============================================================================
// Collapsible Component
// ============================================================================

/**
 * Wires a .collapsible whose trigger is a <button>; <details class="collapsible"> needs no JS.
 */
export class Collapsible {
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
