import { linkTrigger } from '../util/dom.js';

// ============================================================================
// Accordion Component
// ============================================================================

export class Accordion {
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
