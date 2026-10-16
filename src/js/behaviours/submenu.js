import { ensureId } from '../util/dom.js';

// ============================================================================
// Dropdown Submenu
// ============================================================================

/**
 * Lets keyboard and touch users open a .dropdown__submenu; pointer hover is handled in CSS.
 *
 * Click or ArrowRight on the trigger opens it and focuses the first item; ArrowLeft or Escape
 * inside it closes it and returns focus to the trigger.
 */
export class Submenu {
  constructor() {
    this.elements = new WeakSet();
  }

  mount(element) {
    if (this.elements.has(element)) return;

    const trigger = element.querySelector(':scope > .dropdown__submenu-trigger');
    const content = element.querySelector(':scope > .dropdown__submenu-content');
    if (!trigger || !content) return;

    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-controls', ensureId(content, 'submenu'));
    if (!trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');

    const firstItem = () => content.querySelector('[role^="menuitem"]:not(:disabled), button:not(:disabled), a[href]');
    const open = (focus) => {
      trigger.setAttribute('aria-expanded', 'true');
      if (focus) firstItem()?.focus();
    };
    const close = () => {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    };

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (trigger.getAttribute('aria-expanded') === 'true') {
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        open(e.detail === 0);
      }
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        open(true);
      }
    });
    content.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    });
    element.addEventListener('focusout', (e) => {
      if (!element.contains(e.relatedTarget)) trigger.setAttribute('aria-expanded', 'false');
    });

    this.elements.add(element);
  }

  static enhanceAll(selector = '.dropdown__submenu', root = document) {
    const instance = new Submenu();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}
